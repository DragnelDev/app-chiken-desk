import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditBaseEntity } from '../../../common/audit-base.entity';
import { numericTransformer } from '../../../common/utils/numeric.transformer';
import { CategoriaEntity } from '../../categorias/entities/categoria.entity';
import { ImagenProductoEntity } from '../../imagenes-producto/entities/imagen-producto.entity';

@Entity('productos')
export class ProductoEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_producto', generatedIdentity: 'ALWAYS' })
  idProducto: number;

  @Index('idx_productos_id_categoria')
  @Column({ name: 'id_categoria', type: 'int' })
  idCategoria: number;

  @Column({ name: 'codigo_barra', type: 'varchar', length: 50, nullable: true })
  codigoBarra: string | null;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion: string | null;

  @Column({
    name: 'precio_venta',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  precioVenta: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'permite_cambio_guarnicion', type: 'boolean', default: false })
  permiteCambioGuarnicion: boolean;

  /** Ruta relativa de la imagen principal, ej: /uploads/productos/3f9a...webp */
  @Column({ name: 'imagen_principal_url', type: 'varchar', length: 500, nullable: true })
  imagenPrincipalUrl: string | null;

  @ManyToOne(() => CategoriaEntity, (categoria) => categoria.productos, { nullable: false })
  @JoinColumn({ name: 'id_categoria' })
  categoria: CategoriaEntity;

  @OneToMany(() => ImagenProductoEntity, (imagen) => imagen.producto)
  imagenes: ImagenProductoEntity[];
}
