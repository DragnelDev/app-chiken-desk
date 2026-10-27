import { AsyncLocalStorage } from 'node:async_hooks';

export interface ContextoSolicitud {
  usuario?: { idUsuario: number; usuario: string };
  ip?: string;
}

const storage = new AsyncLocalStorage<ContextoSolicitud>();

/**
 * Contexto por solicitud (usuario + IP). Lo usa AuditSubscriber para completar
 * `usuario_registro` y registrar quién hizo cada cambio sin pasar parámetros.
 */
export const RequestContext = {
  run: <T>(ctx: ContextoSolicitud, fn: () => T): T => storage.run(ctx, fn),
  get: (): ContextoSolicitud | undefined => storage.getStore(),
};
