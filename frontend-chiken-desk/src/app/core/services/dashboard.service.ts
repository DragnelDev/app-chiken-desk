import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Mesa, Pedido } from '../../shared/models';

export interface ResumenDashboard {
  ventasHoy: number;
  variacionVsAyer: number; // porcentaje
  mesasOcupadas: number;
  mesasTotales: number;
  pedidosActivos: number;
  clientesAtendidos: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  // GET /mesas -> Módulo 3 (Salón y Mesas)
  getMesas(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>('/api/v1/mesas');
  }

  // GET /pedidos/cocina -> Módulo 4 (Pedidos y Comandas - KDS)
  getPedidosActivos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>('/api/v1/pedidos/cocina');
  }

  // Endpoint agregador sugerido en el backend (no documentado aún en el Swagger,
  // pero es el candidato natural para alimentar las 4 tarjetas del Resumen sin
  // tener que combinar /mesas + /pedidos + /pagos en el cliente).
  getResumen(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>('/api/v1/dashboard/resumen');
  }
}
