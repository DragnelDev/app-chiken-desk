import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DashboardService } from '../../../../core/services/api.services';
import { mensajeError } from '../../../../core/utils/error';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ResumenDashboard } from '../../../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent, CurrencyPipe],
  template: `
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Panel de control</h1>
      <button type="button" class="btn-ghost" (click)="cargar()">↻ Actualizar</button>
    </div>

    @if (error()) {
      <p class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ error() }}</p>
    }

    @if (resumen(); as r) {
      <div class="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <app-stat-card label="Ventas de hoy" [value]="(r.ventasHoy | currency: 'BOB' : 'Bs ' : '1.2-2') ?? ''" [hint]="variacion()" hintColor="brand" />
        <app-stat-card label="Tickets hoy" [value]="r.cantidadVentasHoy.toString()" [hint]="'Promedio ' + (r.ticketPromedioHoy | currency: 'BOB' : 'Bs ' : '1.2-2')" hintColor="blue" />
        <app-stat-card label="Cajas abiertas" [value]="r.cajasAbiertas.toString()" hint="Turnos en curso" hintColor="violet" />
        <app-stat-card label="Stock bajo" [value]="r.productosStockBajo.toString()" hint="Productos con 5 o menos" hintColor="amber" />
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section class="card">
          <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Ventas de hoy por método de pago</h2>
          @for (m of r.ventasPorMetodoHoy; track m.metodoPago) {
            <div class="flex items-center justify-between border-b border-gray-50 py-2 text-sm dark:border-surface-dark-border">
              <span class="text-gray-600 dark:text-gray-300">{{ m.metodoPago }} ({{ m.cantidad }})</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ m.total | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span>
            </div>
          } @empty {
            <p class="text-sm text-gray-400">Todavía no hay ventas hoy.</p>
          }
        </section>

        <section class="card">
          <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Más vendidos (7 días)</h2>
          @for (p of r.topProductos7Dias; track p.idProducto; let i = $index) {
            <div class="flex items-center justify-between border-b border-gray-50 py-2 text-sm dark:border-surface-dark-border">
              <span class="text-gray-600 dark:text-gray-300">{{ i + 1 }}. {{ p.nombre }}</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ p.unidades }} u. · {{ p.total | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span>
            </div>
          } @empty {
            <p class="text-sm text-gray-400">Sin datos en los últimos 7 días.</p>
          }
        </section>
      </div>
    } @else if (!error()) {
      <p class="text-sm text-gray-400">Cargando…</p>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly service = inject(DashboardService);

  readonly resumen = signal<ResumenDashboard | null>(null);
  readonly error = signal<string | null>(null);

  readonly variacion = computed(() => {
    const v = this.resumen()?.variacionVsAyer;
    if (v === null || v === undefined) return 'Sin ventas ayer para comparar';
    return `${v >= 0 ? '↑' : '↓'} ${Math.abs(v)}% vs ayer`;
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.error.set(null);
    this.service.resumen().subscribe({
      next: (r) => this.resumen.set(r),
      error: (e) => this.error.set(mensajeError(e, 'No se pudo cargar el resumen')),
    });
  }
}
