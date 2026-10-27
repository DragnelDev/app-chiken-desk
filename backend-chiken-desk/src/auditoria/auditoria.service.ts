import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AccionAuditoria } from '../common/enums';
import { AuditoriaLogEntity } from './entities/auditoria-log.entity';
import { FiltroAuditoriaDto } from './dto/filtro-auditoria.dto';

export interface DatosLog {
  idUsuario?: number | null;
  tabla: string;
  accion: AccionAuditoria;
  anteriores?: unknown;
  nuevos?: unknown;
  ip?: string | null;
}

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(AuditoriaLogEntity)
    private readonly repo: Repository<AuditoriaLogEntity>,
  ) {}

  /**
   * Registra un evento. Si recibe `manager`, el log participa en la misma
   * transacción (si la operación hace rollback, el log también).
   * Un fallo al auditar nunca debe romper la operación de negocio.
   */
  async registrar(datos: DatosLog, manager?: EntityManager): Promise<void> {
    try {
      const repo = manager
        ? manager.getRepository(AuditoriaLogEntity)
        : this.repo;
      await repo.insert({
        idUsuario: datos.idUsuario ?? null,
        tablaAfectada: datos.tabla,
        accion: datos.accion,
        valoresAnteriores:
          datos.anteriores === undefined
            ? null
            : JSON.stringify(datos.anteriores),
        valoresNuevos:
          datos.nuevos === undefined ? null : JSON.stringify(datos.nuevos),
        ipOrigen: datos.ip ? datos.ip.slice(0, 45) : null,
      });
    } catch (error) {
      this.logger.error(
        `No se pudo registrar auditoría: ${(error as Error).message}`,
      );
    }
  }

  async buscar(filtro: FiltroAuditoriaDto) {
    const { page = 1, limit = 50 } = filtro;
    const qb = this.repo
      .createQueryBuilder('l')
      .orderBy('l.fechaEvento', 'DESC');

    if (filtro.tabla)
      qb.andWhere('l.tablaAfectada = :tabla', { tabla: filtro.tabla });
    if (filtro.accion)
      qb.andWhere('l.accion = :accion', { accion: filtro.accion });
    if (filtro.idUsuario)
      qb.andWhere('l.idUsuario = :u', { u: filtro.idUsuario });
    if (filtro.desde)
      qb.andWhere('l.fechaEvento >= :desde', {
        desde: `${filtro.desde} 00:00:00`,
      });
    if (filtro.hasta)
      qb.andWhere('l.fechaEvento <= :hasta', {
        hasta: `${filtro.hasta} 23:59:59.999`,
      });

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }
}
