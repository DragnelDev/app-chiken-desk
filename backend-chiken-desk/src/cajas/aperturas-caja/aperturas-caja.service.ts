import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Estado, EstadoCaja, RolSistema } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { round2 } from '../../common/utils/numeric.transformer';
import { AbrirCajaDto, CerrarCajaDto, FiltroCajasDto } from './dto/caja.dto';
import { AperturaCajaEntity } from './entities/apertura-caja.entity';

export interface ResumenCaja {
  montoInicial: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasQr: number;
  /** MIXTO no desglosa montos por método: se informa aparte y no entra al efectivo esperado. */
  ventasMixto: number;
  totalVentas: number;
  cantidadVentas: number;
  ventasAnuladas: number;
  ingresos: number;
  egresos: number;
  efectivoEsperado: number;
  qrPendientes: number;
}

@Injectable()
export class AperturasCajaService {
  constructor(
    @InjectRepository(AperturaCajaEntity)
    private readonly repo: Repository<AperturaCajaEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async abrir(dto: AbrirCajaDto, user: UsuarioAutenticado): Promise<AperturaCajaEntity> {
    if (await this.cajaAbiertaDe(user.idUsuario)) {
      throw new ConflictException('Ya tienes una caja abierta. Ciérrala antes de abrir otra');
    }
    // El índice único parcial uq_aperturas_caja_abierta_por_usuario cubre la condición de carrera.
    return this.repo.save(
      this.repo.create({
        idUsuario: user.idUsuario,
        montoInicial: dto.montoInicial,
        estadoCaja: EstadoCaja.ABIERTA,
      }),
    );
  }

  cajaAbiertaDe(idUsuario: number): Promise<AperturaCajaEntity | null> {
    return this.repo.findOne({
      where: { idUsuario, estadoCaja: EstadoCaja.ABIERTA, estado: Estado.ACTIVO },
    });
  }

  /** Caja abierta del usuario + su resumen (null si no tiene). */
  async actual(user: UsuarioAutenticado) {
    const apertura = await this.cajaAbiertaDe(user.idUsuario);
    if (!apertura) return null;
    return { apertura, resumen: await this.resumen(apertura) };
  }

  async detalle(idApertura: number, user: UsuarioAutenticado) {
    const apertura = await this.findOne(idApertura);
    this.verificarAcceso(apertura, user);
    return { apertura, resumen: await this.resumen(apertura) };
  }

  async findAll(filtro: FiltroCajasDto) {
    const { page = 1, limit = 20 } = filtro;
    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.usuario', 'u')
      .where('a.estado = :e', { e: Estado.ACTIVO })
      .orderBy('a.fechaApertura', 'DESC');
    if (filtro.estadoCaja) qb.andWhere('a.estadoCaja = :ec', { ec: filtro.estadoCaja });
    if (filtro.idUsuario) qb.andWhere('a.idUsuario = :iu', { iu: filtro.idUsuario });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async cerrar(idApertura: number, dto: CerrarCajaDto, user: UsuarioAutenticado) {
    const apertura = await this.findOne(idApertura);
    this.verificarAcceso(apertura, user);
    if (apertura.estadoCaja !== EstadoCaja.ABIERTA) {
      throw new ConflictException('La caja ya está cerrada');
    }

    const resumen = await this.resumen(apertura);
    if (resumen.qrPendientes > 0) {
      throw new ConflictException(
        `Hay ${resumen.qrPendientes} pago(s) QR pendientes. Confírmalos o anula esas ventas antes de cerrar`,
      );
    }

    apertura.montoCierre = dto.montoCierre;
    apertura.montoDiferencia = round2(dto.montoCierre - resumen.efectivoEsperado);
    apertura.fechaCierre = new Date();
    apertura.estadoCaja = EstadoCaja.CERRADA;
    await this.repo.save(apertura);

    return { apertura, resumen };
  }

  async findOne(idApertura: number): Promise<AperturaCajaEntity> {
    const apertura = await this.repo.findOne({
      where: { idApertura, estado: Estado.ACTIVO },
      relations: { usuario: true },
    });
    if (!apertura) throw new NotFoundException(`Apertura de caja ${idApertura} no encontrada`);
    return apertura;
  }

  verificarAcceso(apertura: AperturaCajaEntity, user: UsuarioAutenticado): void {
    if (user.rol !== RolSistema.ADMIN && apertura.idUsuario !== user.idUsuario) {
      throw new ForbiddenException('Esta caja pertenece a otro usuario');
    }
  }

  /** Obtiene la caja abierta del usuario o falla (para vender / registrar movimientos). */
  async exigirCajaAbierta(idUsuario: number): Promise<AperturaCajaEntity> {
    const apertura = await this.cajaAbiertaDe(idUsuario);
    if (!apertura) throw new BadRequestException('No tienes una caja abierta. Abre caja primero');
    return apertura;
  }

  /**
   * Resumen del turno. Reglas:
   *  - solo ventas COMPLETADAS y activas
   *  - las ventas por QR cuentan únicamente cuando su pago está PROCESADO
   *  - efectivo esperado = monto inicial + ventas en efectivo + ingresos - egresos
   */
  async resumen(apertura: AperturaCajaEntity): Promise<ResumenCaja> {
    const id = apertura.idApertura;

    const ventas: { metodo_pago: string; cantidad: number; total: number }[] =
      await this.dataSource.query(
        `SELECT v.metodo_pago, COUNT(*)::int AS cantidad, COALESCE(SUM(v.monto_total), 0)::float AS total
           FROM ventas v
          WHERE v.id_apertura = $1 AND v.estado = 1 AND v.estado_venta = 'COMPLETADA'
            AND (v.metodo_pago <> 'QR' OR EXISTS (
                  SELECT 1 FROM pagos_qr p
                   WHERE p.id_venta = v.id_venta AND p.estado = 1 AND p.estado_pago = 'PROCESADO'))
          GROUP BY v.metodo_pago`,
        [id],
      );

    const [anuladas] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS cantidad FROM ventas
        WHERE id_apertura = $1 AND estado = 1 AND estado_venta = 'ANULADA'`,
      [id],
    );

    const movimientos: { tipo_movimiento: string; total: number }[] =
      await this.dataSource.query(
        `SELECT tipo_movimiento, COALESCE(SUM(monto), 0)::float AS total
           FROM movimientos_caja WHERE id_apertura = $1 AND estado = 1
          GROUP BY tipo_movimiento`,
        [id],
      );

    const [pendientes] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS cantidad
         FROM pagos_qr p JOIN ventas v ON v.id_venta = p.id_venta
        WHERE v.id_apertura = $1 AND v.estado = 1 AND v.estado_venta = 'COMPLETADA'
          AND p.estado = 1 AND p.estado_pago = 'PENDIENTE' AND v.metodo_pago = 'QR'`,
      [id],
    );

    const por = (m: string) => ventas.find((v) => v.metodo_pago === m)?.total ?? 0;
    const mov = (t: string) => movimientos.find((x) => x.tipo_movimiento === t)?.total ?? 0;

    const ventasEfectivo = por('EFECTIVO');
    const ingresos = mov('INGRESO');
    const egresos = mov('EGRESO');

    return {
      montoInicial: apertura.montoInicial,
      ventasEfectivo,
      ventasTarjeta: por('TARJETA'),
      ventasQr: por('QR'),
      ventasMixto: por('MIXTO'),
      totalVentas: round2(ventas.reduce((s, v) => s + v.total, 0)),
      cantidadVentas: ventas.reduce((s, v) => s + v.cantidad, 0),
      ventasAnuladas: anuladas?.cantidad ?? 0,
      ingresos,
      egresos,
      efectivoEsperado: round2(apertura.montoInicial + ventasEfectivo + ingresos - egresos),
      qrPendientes: pendientes?.cantidad ?? 0,
    };
  }
}
