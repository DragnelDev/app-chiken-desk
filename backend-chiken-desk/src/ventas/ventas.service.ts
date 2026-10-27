import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AperturaCajaEntity } from '../cajas/aperturas-caja/entities/apertura-caja.entity';
import { ProductoEntity } from '../catalogo/productos/entities/producto.entity';
import {
  AccionAuditoria,
  Estado,
  EstadoCaja,
  EstadoPagoQr,
  EstadoVenta,
  MetodoPago,
  RolSistema,
} from '../common/enums';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { round2 } from '../common/utils/numeric.transformer';
import { RequestContext } from '../common/utils/request-context';
import { PagoQrEntity } from '../pagos-qr/entities/pago-qr.entity';
import { PagosQrService } from '../pagos-qr/pagos-qr.service';
import { AnularVentaDto, CreateVentaDto, FiltroVentasDto } from './dto/venta.dto';
import { VentaDetalleEntity } from './entities/venta-detalle.entity';
import { VentaEntity } from './entities/venta.entity';

@Injectable()
export class VentasService {
  private readonly logger = new Logger(VentasService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly pagosQr: PagosQrService,
    private readonly auditoria: AuditoriaService,
  ) {}

  /**
   * Registra una venta de forma atómica:
   *  1. exige caja abierta del usuario
   *  2. bloquea los productos (SELECT ... FOR UPDATE) y valida stock
   *  3. toma el PRECIO desde la BD (nunca del cliente) y descuenta stock
   *  4. numera el ticket con una secuencia y guarda cabecera + detalle
   * Si el método es QR, genera el cobro QR al terminar.
   */
  async crear(dto: CreateVentaDto, user: UsuarioAutenticado) {
    const idVenta = await this.dataSource.transaction(async (manager) => {
      const apertura = await manager.findOne(AperturaCajaEntity, {
        where: { idUsuario: user.idUsuario, estadoCaja: EstadoCaja.ABIERTA, estado: Estado.ACTIVO },
      });
      if (!apertura) throw new BadRequestException('Debes abrir caja antes de vender');

      // cantidad total por producto (puede repetirse con distintas observaciones)
      const totales = new Map<number, number>();
      for (const d of dto.detalles) {
        totales.set(d.idProducto, (totales.get(d.idProducto) ?? 0) + d.cantidad);
      }

      const productos = await this.bloquearProductos(manager, [...totales.keys()]);
      const porId = new Map(productos.map((p) => [p.idProducto, p]));

      for (const [idProducto, cantidad] of totales) {
        const producto = porId.get(idProducto);
        if (!producto) throw new BadRequestException(`El producto ${idProducto} no existe o está inactivo`);
        if (producto.stock < cantidad) {
          throw new BadRequestException(
            `Stock insuficiente de "${producto.nombre}" (disponible: ${producto.stock})`,
          );
        }
      }

      const lineas = dto.detalles.map((d) => {
        const precio = porId.get(d.idProducto)!.precioVenta;
        return {
          idProducto: d.idProducto,
          cantidad: d.cantidad,
          precioUnitario: precio,
          subtotal: round2(d.cantidad * precio),
          observacion: d.observacion?.trim() || null,
        };
      });

      const montoSubtotal = round2(lineas.reduce((s, l) => s + l.subtotal, 0));
      const montoDescuento = round2(dto.montoDescuento ?? 0);
      if (montoDescuento > montoSubtotal) {
        throw new BadRequestException('El descuento no puede superar el subtotal');
      }

      for (const [idProducto, cantidad] of totales) {
        const producto = porId.get(idProducto)!;
        producto.stock -= cantidad;
        await manager.save(producto);
      }

      const venta = await manager.save(
        manager.create(VentaEntity, {
          idApertura: apertura.idApertura,
          idUsuario: user.idUsuario,
          numeroFacturaTicket: await this.siguienteTicket(manager),
          clienteNombre: dto.clienteNombre?.trim() || null,
          clienteNitCi: dto.clienteNitCi?.trim() || null,
          tipoPedido: dto.tipoPedido,
          metodoPago: dto.metodoPago,
          montoSubtotal,
          montoDescuento,
          montoTotal: round2(montoSubtotal - montoDescuento),
          estadoVenta: EstadoVenta.COMPLETADA,
        }),
      );

      await manager.save(
        lineas.map((l) => manager.create(VentaDetalleEntity, { ...l, idVenta: venta.idVenta })),
      );
      return venta.idVenta;
    });

    const venta = await this.cargar(idVenta);

    let pagoQr: PagoQrEntity | null = null;
    if (venta.metodoPago === MetodoPago.QR) {
      try {
        pagoQr = await this.pagosQr.generarParaVenta(venta);
      } catch (error) {
        // La venta ya existe: el cajero puede reintentar con POST /pagos-qr/venta/:id
        this.logger.error(`No se pudo generar el QR de la venta ${idVenta}: ${(error as Error).message}`);
      }
    }
    return { ...venta, pagoQr };
  }

  async anular(idVenta: number, dto: AnularVentaDto, user: UsuarioAutenticado) {
    let qrPagado = false;

    await this.dataSource.transaction(async (manager) => {
      const venta = await manager.findOne(VentaEntity, {
        where: { idVenta, estado: Estado.ACTIVO },
        lock: { mode: 'pessimistic_write' },
      });
      if (!venta) throw new NotFoundException(`Venta ${idVenta} no encontrada`);
      if (venta.estadoVenta === EstadoVenta.ANULADA) throw new ConflictException('La venta ya está anulada');
      if (user.rol !== RolSistema.ADMIN && venta.idUsuario !== user.idUsuario) {
        throw new ForbiddenException('Solo puedes anular tus propias ventas');
      }

      const apertura = await manager.findOneByOrFail(AperturaCajaEntity, { idApertura: venta.idApertura });
      if (apertura.estadoCaja !== EstadoCaja.ABIERTA) {
        throw new ConflictException('La caja de esta venta ya fue cerrada; no se puede anular');
      }

      // devolver stock
      const detalles = await manager.find(VentaDetalleEntity, {
        where: { idVenta, estado: Estado.ACTIVO },
      });
      const devolver = new Map<number, number>();
      for (const d of detalles) devolver.set(d.idProducto, (devolver.get(d.idProducto) ?? 0) + d.cantidad);
      const productos = await this.bloquearProductos(manager, [...devolver.keys()], false);
      for (const producto of productos) {
        producto.stock += devolver.get(producto.idProducto)!;
        await manager.save(producto);
      }

      // pagos QR: los pendientes dejan de ser cobrables
      const pagos = await manager.find(PagoQrEntity, { where: { idVenta, estado: Estado.ACTIVO } });
      for (const pago of pagos) {
        if (pago.estadoPago === EstadoPagoQr.PENDIENTE) {
          pago.estadoPago = EstadoPagoQr.EXPIRADO;
          await manager.save(pago);
        } else if (pago.estadoPago === EstadoPagoQr.PROCESADO) {
          qrPagado = true;
        }
      }

      const montoTotal = venta.montoTotal;
      venta.estadoVenta = EstadoVenta.ANULADA;
      await manager.save(venta);

      await this.auditoria.registrar(
        {
          idUsuario: user.idUsuario,
          tabla: 'ventas',
          accion: AccionAuditoria.ANULACION_VENTA,
          anteriores: { id_venta: idVenta, estado_venta: EstadoVenta.COMPLETADA, monto_total: montoTotal },
          nuevos: {
            id_venta: idVenta,
            estado_venta: EstadoVenta.ANULADA,
            motivo: dto.motivo.trim(),
            qr_pagado_requiere_devolucion: qrPagado,
          },
          ip: RequestContext.get()?.ip,
        },
        manager,
      );
    });

    const venta = await this.cargar(idVenta);
    return {
      ...venta,
      advertencia: qrPagado
        ? 'La venta tenía un pago QR ya procesado: debe devolverse al cliente manualmente.'
        : null,
    };
  }

  async findAll(filtro: FiltroVentasDto, user: UsuarioAutenticado) {
    const { page = 1, limit = 20 } = filtro;
    const qb = this.dataSource
      .getRepository(VentaEntity)
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.usuario', 'u')
      .where('v.estado = :e', { e: Estado.ACTIVO })
      .orderBy('v.idVenta', 'DESC');

    // un cajero solo ve lo suyo; el admin puede filtrar por usuario
    if (user.rol !== RolSistema.ADMIN) qb.andWhere('v.idUsuario = :me', { me: user.idUsuario });
    else if (filtro.idUsuario) qb.andWhere('v.idUsuario = :iu', { iu: filtro.idUsuario });

    if (filtro.estadoVenta) qb.andWhere('v.estadoVenta = :ev', { ev: filtro.estadoVenta });
    if (filtro.metodoPago) qb.andWhere('v.metodoPago = :mp', { mp: filtro.metodoPago });
    if (filtro.idApertura) qb.andWhere('v.idApertura = :ia', { ia: filtro.idApertura });
    if (filtro.desde) qb.andWhere('v.fechaRegistro >= :desde', { desde: `${filtro.desde} 00:00:00` });
    if (filtro.hasta) qb.andWhere('v.fechaRegistro <= :hasta', { hasta: `${filtro.hasta} 23:59:59.999` });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(idVenta: number, user: UsuarioAutenticado) {
    const venta = await this.cargar(idVenta);
    if (user.rol !== RolSistema.ADMIN && venta.idUsuario !== user.idUsuario) {
      throw new ForbiddenException('Esta venta pertenece a otro usuario');
    }
    return venta;
  }

  // ---------------------------------------------------------------- internos

  private async cargar(idVenta: number): Promise<VentaEntity> {
    const venta = await this.dataSource.getRepository(VentaEntity).findOne({
      where: { idVenta, estado: Estado.ACTIVO },
      relations: { detalles: { producto: true }, usuario: true, pagosQr: true },
      order: { detalles: { idDetalle: 'ASC' } },
    });
    if (!venta) throw new NotFoundException(`Venta ${idVenta} no encontrada`);
    return venta;
  }

  /** SELECT ... FOR UPDATE ordenado por id (evita bloqueos cruzados entre ventas simultáneas). */
  private bloquearProductos(manager: EntityManager, ids: number[], soloActivos = true) {
    return manager.find(ProductoEntity, {
      where: { idProducto: In(ids), ...(soloActivos ? { estado: Estado.ACTIVO } : {}) },
      order: { idProducto: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    });
  }

  /** Ticket correlativo: T-YYYYMMDD-000123 (la secuencia vive en PostgreSQL). */
  private async siguienteTicket(manager: EntityManager): Promise<string> {
    const [{ n }] = await manager.query(`SELECT nextval('seq_numero_ticket') AS n`);
    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
    return `T-${fecha}-${String(n).padStart(6, '0')}`;
  }
}
