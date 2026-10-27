import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Bitácora global (append-only). No hereda la auditoría estándar: ES la auditoría. */
@Entity('auditoria_logs')
@Index('idx_auditoria_logs_tabla_fecha', ['tablaAfectada', 'fechaEvento'])
export class AuditoriaLogEntity {
  // BIGINT llega como string desde pg
  @PrimaryGeneratedColumn({
    name: 'id_log',
    type: 'bigint',
    generatedIdentity: 'ALWAYS',
  })
  idLog: string;

  @Index('idx_auditoria_logs_id_usuario')
  @Column({ name: 'id_usuario', type: 'int', nullable: true })
  idUsuario: number | null;

  @Column({ name: 'tabla_afectada', type: 'varchar', length: 60 })
  tablaAfectada: string;

  @Column({ type: 'varchar', length: 20 })
  accion: string;

  @Column({ name: 'valores_anteriores', type: 'text', nullable: true })
  valoresAnteriores: string | null;

  @Column({ name: 'valores_nuevos', type: 'text', nullable: true })
  valoresNuevos: string | null;

  @Column({ name: 'ip_origen', type: 'varchar', length: 45, nullable: true })
  ipOrigen: string | null;

  @Column({
    name: 'fecha_evento',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    update: false,
  })
  fechaEvento: Date;
}
