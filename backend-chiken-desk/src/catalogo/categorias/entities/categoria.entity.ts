import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditBaseEntity } from '../../../common/audit-base.entity';
import { ProductoEntity } from '../../productos/entities/producto.entity';

@Entity('categorias')
export class CategoriaEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn('identity', {
    name: 'id_categoria',
    generatedIdentity: 'ALWAYS',
  })
  idCategoria: number;

  @Column({ type: 'varchar', length: 80 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;

  @OneToMany(() => ProductoEntity, (producto) => producto.categoria)
  productos: ProductoEntity[];
}
