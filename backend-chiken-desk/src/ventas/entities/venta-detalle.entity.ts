import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditBaseEntity } from '../../common/audit-base.entity';
import { numericTransformer } from '../../common/utils/numeric.transformer';
import { ProductoEntity } from '../../catalogo/productos/entities/producto.entity';
import { VentaEntity } from './venta.entity';

@Entity('ventas_detalle')
export class VentaDetalleEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_detalle', generatedIdentity: 'ALWAYS' })
  idDetalle: number;

  @Index('idx_ventas_detalle_id_venta')
  @Column({ name: 'id_venta', type: 'int' })
  idVenta: number;

  @Index('idx_ventas_detalle_id_producto')
  @Column({ name: 'id_producto', type: 'int' })
  idProducto: number;

  @Column({ type: 'int' })
  cantidad: number;

  /** Precio congelado al momento de vender (no cambia si el producto sube de precio). */
  @Column({
    name: 'precio_unitario',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  precioUnitario: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer })
  subtotal: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacion: string | null;

  @ManyToOne(() => VentaEntity, (v) => v.detalles, { nullable: false })
  @JoinColumn({ name: 'id_venta' })
  venta: VentaEntity;

  @ManyToOne(() => ProductoEntity, { nullable: false })
  @JoinColumn({ name: 'id_producto' })
  producto: ProductoEntity;
}
