import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditBaseEntity } from '../../../common/audit-base.entity';
import { UsuarioEntity } from '../../usuarios/entities/usuario.entity';

@Entity('roles')
export class RolEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn('identity', {
    name: 'id_rol',
    generatedIdentity: 'ALWAYS',
  })
  idRol: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string | null;

  @OneToMany(() => UsuarioEntity, (usuario) => usuario.rol)
  usuarios: UsuarioEntity[];
}
