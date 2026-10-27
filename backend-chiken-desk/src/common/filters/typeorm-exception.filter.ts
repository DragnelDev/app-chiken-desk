import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface PgError extends QueryFailedError {
  code?: string;
}

/** Traduce errores de PostgreSQL (UNIQUE, FK, CHECK, NOT NULL) a respuestas HTTP claras. */
@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: PgError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno de base de datos';

    switch (exception.code) {
      case '23505':
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con esos datos únicos';
        break;
      case '23503':
        status = HttpStatus.BAD_REQUEST;
        message = 'Referencia inválida o el registro está en uso';
        break;
      case '23514':
        status = HttpStatus.BAD_REQUEST;
        message = 'Los datos no cumplen una regla de validación';
        break;
      case '23502':
        status = HttpStatus.BAD_REQUEST;
        message = 'Falta un dato obligatorio';
        break;
      default:
        this.logger.error(exception.message, exception.stack);
    }

    res
      .status(status)
      .json({ statusCode: status, message, error: 'DatabaseError' });
  }
}
