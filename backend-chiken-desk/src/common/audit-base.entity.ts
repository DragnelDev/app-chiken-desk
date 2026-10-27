import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AuditBaseEntity {
  @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
  creadoEn: Date;

  @Column({ name: 'creado_por', type: 'int', nullable: true })
  creadoPor: number;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamp' })
  actualizadoEn: Date;

  @Column({ name: 'actualizado_por', type: 'int', nullable: true })
  actualizadoPor: number;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;
}
