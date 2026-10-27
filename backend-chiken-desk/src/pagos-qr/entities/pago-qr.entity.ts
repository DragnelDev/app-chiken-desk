import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditBaseEntity } from '../../common/audit-base.entity';
import { EstadoPagoQr } from '../../common/enums';
import { numericTransformer } from '../../common/utils/numeric.transformer';
import { VentaEntity } from '../../ventas/entities/venta.entity';

@Entity('pagos_qr')
export class PagoQrEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_pago_qr', generatedIdentity: 'ALWAYS' })
  idPagoQr: number;

  @Index('idx_pagos_qr_id_venta')
  @Column({ name: 'id_venta', type: 'int' })
  idVenta: number;

  @Column({ name: 'transaccion_id', type: 'varchar', length: 100 })
  transaccionId: string;

  /** Data URL (data:image/png;base64,...). select:false: no viaja en consultas de sondeo. */
  @Column({ name: 'qr_imagen_base64', type: 'text', nullable: true, select: false })
  qrImagenBase64: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer })
  monto: number;

  @Column({ name: 'estado_pago', type: 'varchar', length: 10, default: EstadoPagoQr.PENDIENTE })
  estadoPago: EstadoPagoQr;

  @Column({ name: 'fecha_expiracion', type: 'timestamp' })
  fechaExpiracion: Date;

  @Column({ name: 'fecha_confirmacion', type: 'timestamp', nullable: true })
  fechaConfirmacion: Date | null;

  @Column({ name: 'datos_respuesta_json', type: 'jsonb', nullable: true })
  datosRespuestaJson: Record<string, unknown> | null;

  @ManyToOne(() => VentaEntity, (venta) => venta.pagosQr, { nullable: false })
  @JoinColumn({ name: 'id_venta' })
  venta: VentaEntity;
}
