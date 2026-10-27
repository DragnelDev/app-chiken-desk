import { AuditBaseEntity } from 'src/common/audit-base.entity';
import { EmpleadoEntity } from 'src/seguridad/empleados/entities/empleado.entity';
import { RoleEntity } from 'src/seguridad/roles/entities/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

@Entity('usuarios')
export class UsuarioEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  usuario: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ name: 'rol_id', type: 'int' })
  rolId: number;

  @Column({ name: 'empleado_id', type: 'int' })
  empleadoId: number;

  @ManyToOne(() => RoleEntity, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rol_id' })
  rol: RoleEntity;

  @OneToOne(() => EmpleadoEntity, (empleado) => empleado.usuario)
  @JoinColumn({ name: 'empleado_id' })
  empleado: EmpleadoEntity;
}
