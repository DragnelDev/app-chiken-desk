import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditBaseEntity } from '../../../common/audit-base.entity';
import { TipoMovimiento } from '../../../common/enums';
import { numericTransformer } from '../../../common/utils/numeric.transformer';
import { AperturaCajaEntity } from '../../aperturas-caja/entities/apertura-caja.entity';

@Entity('movimientos_caja')
export class MovimientoCajaEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_movimiento', generatedIdentity: 'ALWAYS' })
  idMovimiento: number;

  @Index('idx_movimientos_caja_id_apertura')
  @Column({ name: 'id_apertura', type: 'int' })
  idApertura: number;

  @Column({ name: 'tipo_movimiento', type: 'varchar', length: 10 })
  tipoMovimiento: TipoMovimiento;

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: numericTransformer })
  monto: number;

  @Column({ type: 'varchar', length: 255 })
  concepto: string;

  @ManyToOne(() => AperturaCajaEntity, (a) => a.movimientos, { nullable: false })
  @JoinColumn({ name: 'id_apertura' })
  apertura: AperturaCajaEntity;
}
