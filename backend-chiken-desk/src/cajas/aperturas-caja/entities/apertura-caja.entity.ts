import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditBaseEntity } from '../../../common/audit-base.entity';
import { EstadoCaja } from '../../../common/enums';
import { numericTransformer } from '../../../common/utils/numeric.transformer';
import { UsuarioEntity } from '../../../seguridad/usuarios/entities/usuario.entity';
import { MovimientoCajaEntity } from '../../movimientos-caja/entities/movimiento-caja.entity';

@Entity('aperturas_caja')
export class AperturaCajaEntity extends AuditBaseEntity {
  @PrimaryGeneratedColumn('identity', {
    name: 'id_apertura',
    generatedIdentity: 'ALWAYS',
  })
  idApertura: number;

  @Index('idx_aperturas_caja_id_usuario')
  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario: number;

  @Column({
    name: 'monto_inicial',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  montoInicial: number;

  @Column({
    name: 'monto_cierre',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  montoCierre: number | null;

  /** Contado - esperado en efectivo. Negativo = faltante, positivo = sobrante. */
  @Column({
    name: 'monto_diferencia',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  montoDiferencia: number | null;

  @Column({
    name: 'fecha_apertura',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    update: false,
  })
  fechaApertura: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamp', nullable: true })
  fechaCierre: Date | null;

  @Column({
    name: 'estado_caja',
    type: 'varchar',
    length: 10,
    default: EstadoCaja.ABIERTA,
  })
  estadoCaja: EstadoCaja;

  @ManyToOne(() => UsuarioEntity, { nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario: UsuarioEntity;

  @OneToMany(() => MovimientoCajaEntity, (m) => m.apertura)
  movimientos: MovimientoCajaEntity[];
}
