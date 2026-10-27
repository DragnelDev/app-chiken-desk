import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditBaseEntity } from '../../../common/audit-base.entity';
import { RolEntity } from '../../roles/entities/rol.entity';

@Entity('usuarios')
export class UsuarioEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn('identity', {
    name: 'id_usuario',
    generatedIdentity: 'ALWAYS',
  })
  idUsuario: number;

  @Index('idx_usuarios_id_rol')
  @Column({ name: 'id_rol', type: 'int' })
  idRol: number;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 100 })
  apellidos: string;

  @Column({ type: 'varchar', length: 20 })
  ci: string;

  @Column({ type: 'varchar', length: 50 })
  usuario: string;

  /** select:false => nunca viaja en consultas normales ni en respuestas JSON. */
  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash: string;

  @ManyToOne(() => RolEntity, (rol) => rol.usuarios, { nullable: false })
  @JoinColumn({ name: 'id_rol' })
  rol: RolEntity;
}
