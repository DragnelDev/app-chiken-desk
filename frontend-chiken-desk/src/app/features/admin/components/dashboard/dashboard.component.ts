import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { DashboardService, ResumenDashboard } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent, DecimalPipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  // Valores de ejemplo iguales a la maqueta mientras se conecta el endpoint real;
  // se sobrescriben en ngOnInit() con la respuesta del API.
  readonly resumen = signal<ResumenDashboard>({
    ventasHoy: 2450,
    variacionVsAyer: 15,
    mesasOcupadas: 12,
    mesasTotales: 20,
    pedidosActivos: 5,
    clientesAtendidos: 84,
  });

  ngOnInit(): void {
    this.dashboardService.getResumen().subscribe({
      next: (data) => this.resumen.set(data),
      // Si el endpoint agregador aún no existe en el backend, se conservan
      // los valores de ejemplo en vez de romper la vista.
      error: () => {},
    });
  }

  get ventasFormateadas(): string {
    return this.resumen().ventasHoy.toLocaleString('es-BO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  }
}
