import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, timingSafeEqual } from 'node:crypto';
import { Repository } from 'typeorm';
import {
  Estado,
  EstadoPagoQr,
  EstadoVenta,
  MetodoPago,
  RolSistema,
} from '../common/enums';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { VentaEntity } from '../ventas/entities/venta.entity';
import { ConfirmarQrWebhookDto } from './dto/pago-qr.dto';
import { PagoQrEntity } from './entities/pago-qr.entity';
import { QrProvider } from './providers/qr.provider';

@Injectable()
export class PagosQrService {
  private readonly logger = new Logger(PagosQrService.name);

  constructor(
    @InjectRepository(PagoQrEntity)
    private readonly repo: Repository<PagoQrEntity>,
    @InjectRepository(VentaEntity)
    private readonly ventasRepo: Repository<VentaEntity>,
    private readonly provider: QrProvider,
    private readonly config: ConfigService,
  ) {}

  /** Genera (o reutiliza el vigente) el QR de una venta ya registrada. */
  async generarParaVenta(
    venta: Pick<VentaEntity, 'idVenta' | 'montoTotal' | 'numeroFacturaTicket'>,
  ): Promise<PagoQrEntity> {
    const ultimo = await this.ultimoPago(venta.idVenta, true);
    if (ultimo) {
      await this.expirarSiCorresponde(ultimo);
      if (ultimo.estadoPago === EstadoPagoQr.PROCESADO) {
        throw new ConflictException('La venta ya fue pagada por QR');
      }
      if (ultimo.estadoPago === EstadoPagoQr.PENDIENTE) return ultimo; // sigue vigente
    }

    const minutos = Number(this.config.get('QR_EXPIRA_MINUTOS', 10));
    const expiraEn = new Date(Date.now() + minutos * 60_000);
    const cobro = await this.provider.crearCobro({
      monto: venta.montoTotal,
      referencia: venta.numeroFacturaTicket,
      expiraEn,
    });

    return this.repo.save(
      this.repo.create({
        idVenta: venta.idVenta,
        transaccionId: cobro.transaccionId,
        qrImagenBase64: cobro.qrImagenBase64,
        monto: venta.montoTotal,
        estadoPago: EstadoPagoQr.PENDIENTE,
        fechaExpiracion: expiraEn,
        datosRespuestaJson: cobro.datos,
      }),
    );
  }

  async generar(
    idVenta: number,
    user: UsuarioAutenticado,
  ): Promise<PagoQrEntity> {
    const venta = await this.ventaAccesible(idVenta, user);
    if (venta.estadoVenta !== EstadoVenta.COMPLETADA) {
      throw new ConflictException('La venta está anulada');
    }
    if (venta.metodoPago !== MetodoPago.QR) {
      throw new BadRequestException('La venta no es de método de pago QR');
    }
    return this.generarParaVenta(venta);
  }

  /** Último pago de la venta. Marca como EXPIRADO si venció (expiración perezosa). */
  async consultar(idVenta: number, user: UsuarioAutenticado, conQr: boolean) {
    await this.ventaAccesible(idVenta, user);
    const pago = await this.ultimoPago(idVenta, conQr);
    if (!pago) throw new NotFoundException('La venta no tiene pagos QR');
    await this.expirarSiCorresponde(pago);
    return pago;
  }

  /** Confirmación enviada por el banco. Protegida con secreto compartido. */
  async confirmarWebhook(dto: ConfirmarQrWebhookDto, secretoRecibido?: string) {
    this.validarSecreto(secretoRecibido);
    const pago = await this.repo.findOne({
      where: { transaccionId: dto.transaccionId, estado: Estado.ACTIVO },
    });
    if (!pago) throw new NotFoundException('Transacción desconocida');
    if (Math.abs(pago.monto - dto.monto) > 0.001) {
      throw new BadRequestException(
        'El monto confirmado no coincide con el cobro',
      );
    }
    return this.marcarProcesado(pago, dto.datos ?? { origen: 'WEBHOOK' });
  }

  /** Confirmación manual de un supervisor (modo sandbox o contingencia). */
  async confirmarManual(idPagoQr: number, user: UsuarioAutenticado) {
    if (this.config.get('QR_CONFIRMACION_MANUAL') !== 'true') {
      throw new ForbiddenException('La confirmación manual está deshabilitada');
    }
    const pago = await this.repo.findOne({
      where: { idPagoQr, estado: Estado.ACTIVO },
    });
    if (!pago) throw new NotFoundException(`Pago QR ${idPagoQr} no encontrado`);
    return this.marcarProcesado(pago, {
      origen: 'MANUAL',
      confirmadoPor: user.usuario,
    });
  }

  // ---------------------------------------------------------------- internos

  private async marcarProcesado(
    pago: PagoQrEntity,
    datos: Record<string, unknown>,
  ) {
    if (pago.estadoPago === EstadoPagoQr.PROCESADO) return pago; // idempotente

    const venta = await this.ventasRepo.findOne({
      where: { idVenta: pago.idVenta },
    });
    if (!venta || venta.estadoVenta !== EstadoVenta.COMPLETADA) {
      this.logger.warn(
        `Pago QR ${pago.transaccionId} recibido para una venta anulada: requiere devolución manual`,
      );
      throw new ConflictException(
        'La venta fue anulada; el pago debe devolverse manualmente',
      );
    }

    // Si pagaron justo después de vencer, el dinero ya entró: se acepta.
    pago.estadoPago = EstadoPagoQr.PROCESADO;
    pago.fechaConfirmacion = new Date();
    pago.datosRespuestaJson = {
      ...(pago.datosRespuestaJson ?? {}),
      confirmacion: datos,
    };
    return this.repo.save(pago);
  }

  private async expirarSiCorresponde(pago: PagoQrEntity): Promise<void> {
    if (
      pago.estadoPago === EstadoPagoQr.PENDIENTE &&
      pago.fechaExpiracion.getTime() < Date.now()
    ) {
      pago.estadoPago = EstadoPagoQr.EXPIRADO;
      await this.repo.save(pago);
    }
  }

  private ultimoPago(
    idVenta: number,
    conQr: boolean,
  ): Promise<PagoQrEntity | null> {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.idVenta = :idVenta', { idVenta })
      .andWhere('p.estado = :e', { e: Estado.ACTIVO })
      .orderBy('p.idPagoQr', 'DESC')
      .limit(1);
    if (conQr) qb.addSelect('p.qrImagenBase64');
    return qb.getOne();
  }

  private async ventaAccesible(
    idVenta: number,
    user: UsuarioAutenticado,
  ): Promise<VentaEntity> {
    const venta = await this.ventasRepo.findOne({
      where: { idVenta, estado: Estado.ACTIVO },
    });
    if (!venta) throw new NotFoundException(`Venta ${idVenta} no encontrada`);
    if (user.rol !== RolSistema.ADMIN && venta.idUsuario !== user.idUsuario) {
      throw new ForbiddenException('Esta venta pertenece a otro usuario');
    }
    return venta;
  }

  private validarSecreto(recibido?: string): void {
    const esperado = this.config.get<string>('QR_WEBHOOK_SECRET');
    if (!esperado)
      throw new ServiceUnavailableException('Webhook QR no configurado');
    const hash = (v: string) => createHash('sha256').update(v).digest();
    if (!recibido || !timingSafeEqual(hash(recibido), hash(esperado))) {
      throw new UnauthorizedException('Secreto de webhook inválido');
    }
  }
}
