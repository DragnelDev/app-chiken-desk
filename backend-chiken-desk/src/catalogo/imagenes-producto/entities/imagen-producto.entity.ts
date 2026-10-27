import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditBaseEntity } from '../../../common/audit-base.entity';
import { ProductoEntity } from '../../productos/entities/producto.entity';

@Entity('imagenes_producto')
export class ImagenProductoEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_imagen', generatedIdentity: 'ALWAYS' })
  idImagen: number;

  @Index('idx_imagenes_producto_id_producto')
  @Column({ name: 'id_producto', type: 'int' })
  idProducto: number;

  @Column({ name: 'url_imagen', type: 'varchar', length: 500 })
  urlImagen: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal: boolean;

  @ManyToOne(() => ProductoEntity, (producto) => producto.imagenes, { nullable: false })
  @JoinColumn({ name: 'id_producto' })
  producto: ProductoEntity;
}
