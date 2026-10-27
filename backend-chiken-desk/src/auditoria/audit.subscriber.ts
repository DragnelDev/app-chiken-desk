import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  EntityMetadata,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { AccionAuditoria } from '../common/enums';
import { RequestContext } from '../common/utils/request-context';
import { AuditoriaLogEntity } from './entities/auditoria-log.entity';

/** Columnas que nunca deben quedar en la bitácora. */
const SENSIBLES = new Set(['password_hash', 'qr_imagen_base64']);

/**
 * Subscriber global de TypeORM:
 *  1. beforeInsert: completa `usuario_registro` con el usuario del JWT ('sistema' si no hay).
 *  2. afterInsert / afterUpdate: escribe en auditoria_logs (INSERT, UPDATE o DELETE
 *     cuando `estado` pasa de 1 a 0 = borrado lógico).
 *
 * IMPORTANTE: se dispara con repository.save(); `repository.update()` no trae el
 * estado anterior, por eso los servicios usan save().
 */
@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(@InjectDataSource() dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  beforeInsert(event: InsertEvent<any>): void {
    const columna = event.metadata.findColumnWithPropertyName('usuarioRegistro');
    if (columna && event.entity && !event.entity.usuarioRegistro) {
      event.entity.usuarioRegistro =
        RequestContext.get()?.usuario?.usuario?.slice(0, 50) ?? 'sistema';
    }
  }

  async afterInsert(event: InsertEvent<any>): Promise<void> {
    if (this.omitir(event.metadata) || !event.entity) return;
    await this.escribir(
      event.manager,
      event.metadata,
      AccionAuditoria.INSERT,
      null,
      this.valores(event.metadata, event.entity),
    );
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    if (this.omitir(event.metadata) || !event.entity || !event.databaseEntity) return;

    const cambiadas = event.updatedColumns.filter(
      (c) => c.databaseName !== 'fecha_registro',
    );
    if (!cambiadas.length) return;

    // La anulación de ventas se registra explícitamente (con motivo) en VentasService.
    if (
      event.metadata.tableName === 'ventas' &&
      cambiadas.some((c) => c.databaseName === 'estado_venta')
    ) {
      return;
    }

    const antes: Record<string, unknown> = {};
    const despues: Record<string, unknown> = {};
    for (const col of event.metadata.primaryColumns) {
      antes[col.databaseName] = despues[col.databaseName] =
        col.getEntityValue(event.databaseEntity);
    }
    for (const col of cambiadas) {
      if (SENSIBLES.has(col.databaseName)) {
        antes[col.databaseName] = despues[col.databaseName] = '[oculto]';
        continue;
      }
      antes[col.databaseName] = col.getEntityValue(event.databaseEntity);
      despues[col.databaseName] = col.getEntityValue({
        ...event.databaseEntity,
        ...event.entity,
      });
    }

    const pasoABorrado =
      cambiadas.some((c) => c.databaseName === 'estado') &&
      Number(despues['estado']) === 0 &&
      Number(antes['estado']) === 1;

    await this.escribir(
      event.manager,
      event.metadata,
      pasoABorrado ? AccionAuditoria.DELETE : AccionAuditoria.UPDATE,
      antes,
      despues,
    );
  }

  private omitir(metadata: EntityMetadata): boolean {
    return metadata.tableName === 'auditoria_logs';
  }

  private valores(metadata: EntityMetadata, entidad: any): Record<string, unknown> {
    const salida: Record<string, unknown> = {};
    for (const col of metadata.columns) {
      salida[col.databaseName] = SENSIBLES.has(col.databaseName)
        ? '[oculto]'
        : col.getEntityValue(entidad);
    }
    return salida;
  }

  private async escribir(
    manager: EntityManager,
    metadata: EntityMetadata,
    accion: AccionAuditoria,
    anteriores: unknown,
    nuevos: unknown,
  ): Promise<void> {
    const ctx = RequestContext.get();
    await manager.getRepository(AuditoriaLogEntity).insert({
      idUsuario: ctx?.usuario?.idUsuario ?? null,
      tablaAfectada: metadata.tableName,
      accion,
      valoresAnteriores: anteriores ? JSON.stringify(anteriores) : null,
      valoresNuevos: nuevos ? JSON.stringify(nuevos) : null,
      ipOrigen: ctx?.ip ? ctx.ip.slice(0, 45) : null,
    });
  }
}
