import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReservaRequest {
  nombreCliente: string;
  telefono: string;
  fechaHora: string; // ISO datetime
  personas: number;
}

/**
 * ReservaService — vinculado a la tabla `reservas` (cliente_id + mesa_id) del
 * Informe de Base de Datos. El endpoint POST /reservas no está aún documentado
 * en el Swagger actual; es el candidato natural para el backend de NestJS
 * (mismo patrón que /pedidos: DTO validado con class-validator).
 */
@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly http = inject(HttpClient);

  crear(reserva: ReservaRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>('/api/v1/reservas', reserva);
  }
}
