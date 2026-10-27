import { AuditBaseEntity } from 'src/common/audit-base.entity';
import { UsuarioEntity } from 'src/seguridad/usuarios/entities/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
@Entity('roles')
export class RoleEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'jsonb', nullable: true })
  permisos: Record<string, any>;

  @OneToMany(() => UsuarioEntity, (usuario) => usuario.rol)
  usuarios: UsuarioEntity[];
}
