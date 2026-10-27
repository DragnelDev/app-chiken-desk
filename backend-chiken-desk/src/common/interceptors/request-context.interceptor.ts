import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ContextoSolicitud, RequestContext } from '../utils/request-context';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest();
    const ctx: ContextoSolicitud = {
      usuario: req.user
        ? { idUsuario: req.user.idUsuario, usuario: req.user.usuario }
        : undefined,
      ip: typeof req.ip === 'string' ? req.ip.replace('::ffff:', '') : undefined,
    };

    // El handler se ejecuta al suscribirse: así queda dentro del contexto.
    return new Observable((subscriber) =>
      RequestContext.run(ctx, () => next.handle().subscribe(subscriber)),
    );
  }
}
