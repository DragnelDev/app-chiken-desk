import { AuditBaseEntity } from 'src/common/audit-base.entity';
import { UsuarioEntity } from 'src/seguridad/usuarios/entities/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('empleados')
export class EmpleadoEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombres: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 50 })
  turno: string;

  @OneToOne(() => UsuarioEntity, (usuario) => usuario.empleado)
  usuario: UsuarioEntity;
}
