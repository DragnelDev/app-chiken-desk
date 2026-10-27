import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditBaseEntity } from '../../common/audit-base.entity';
import { EstadoVenta, MetodoPago, TipoPedido } from '../../common/enums';
import { numericTransformer } from '../../common/utils/numeric.transformer';
import { AperturaCajaEntity } from '../../cajas/aperturas-caja/entities/apertura-caja.entity';
import { PagoQrEntity } from '../../pagos-qr/entities/pago-qr.entity';
import { UsuarioEntity } from '../../seguridad/usuarios/entities/usuario.entity';
import { VentaDetalleEntity } from './venta-detalle.entity';

const dinero = {
  type: 'numeric' as const,
  precision: 12,
  scale: 2,
  transformer: numericTransformer,
};

@Entity('ventas')
export class VentaEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_venta', generatedIdentity: 'ALWAYS' })
  idVenta: number;

  @Index('idx_ventas_id_apertura')
  @Column({ name: 'id_apertura', type: 'int' })
  idApertura: number;

  @Index('idx_ventas_id_usuario')
  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario: number;

  @Column({ name: 'numero_factura_ticket', type: 'varchar', length: 30 })
  numeroFacturaTicket: string;

  @Column({ name: 'cliente_nombre', type: 'varchar', length: 150, nullable: true })
  clienteNombre: string | null;

  @Column({ name: 'cliente_nit_ci', type: 'varchar', length: 20, nullable: true })
  clienteNitCi: string | null;

  @Column({ name: 'tipo_pedido', type: 'varchar', length: 10 })
  tipoPedido: TipoPedido;

  @Column({ name: 'monto_subtotal', ...dinero })
  montoSubtotal: number;

  @Column({ name: 'monto_descuento', default: 0, ...dinero })
  montoDescuento: number;

  @Column({ name: 'monto_total', ...dinero })
  montoTotal: number;

  @Column({ name: 'metodo_pago', type: 'varchar', length: 10 })
  metodoPago: MetodoPago;

  @Column({ name: 'estado_venta', type: 'varchar', length: 10, default: EstadoVenta.COMPLETADA })
  estadoVenta: EstadoVenta;

  @ManyToOne(() => AperturaCajaEntity, { nullable: false })
  @JoinColumn({ name: 'id_apertura' })
  apertura: AperturaCajaEntity;

  @ManyToOne(() => UsuarioEntity, { nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario: UsuarioEntity;

  @OneToMany(() => VentaDetalleEntity, (d) => d.venta)
  detalles: VentaDetalleEntity[];

  @OneToMany(() => PagoQrEntity, (p) => p.venta)
  pagosQr: PagoQrEntity[];
}
