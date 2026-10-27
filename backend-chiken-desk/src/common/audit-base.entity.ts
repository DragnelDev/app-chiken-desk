import { Column } from 'typeorm';

/**
 * Auditoría estándar de ChikenDesk para tablas de negocio.
 *  - estado: 1 = activo, 0 = borrado lógico (soft delete)
 *  - usuario_registro: lo completa AuditSubscriber (usuario del JWT, o 'sistema')
 *  - fecha_registro: la resuelve PostgreSQL con CURRENT_TIMESTAMP
 */
export abstract class AuditBaseEntity {
  @Column({ name: 'estado', type: 'int', default: 1 })
  estado: number;

  @Column({ name: 'usuario_registro', type: 'varchar', length: 50 })
  usuarioRegistro: string;

  @Column({
    name: 'fecha_registro',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    update: false,
  })
  fechaRegistro: Date;
}
