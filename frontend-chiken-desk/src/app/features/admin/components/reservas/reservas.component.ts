import { Component, signal } from '@angular/core';

interface ReservaUI { cliente: string; fechaHora: string; personas: number; mesa: number; }

/** Reservas — vincula cliente_id + mesa_id (tabla `reservas` del Informe de Base de Datos). */
@Component({
  selector: 'app-reservas',
  standalone: true,
  template: `
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Reservas de Mesas</h1>
      <button type="button" class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
        + Nueva Reserva
      </button>
    </div>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
            <th class="pb-3">Cliente</th>
            <th class="pb-3">Fecha / Hora</th>
            <th class="pb-3">Personas</th>
            <th class="pb-3">Mesa</th>
          </tr>
        </thead>
        <tbody>
          @for (r of reservas(); track r.cliente + r.fechaHora) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="py-3 font-medium text-gray-900 dark:text-white">{{ r.cliente }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ r.fechaHora }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ r.personas }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">Mesa {{ r.mesa }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ReservasComponent {
  readonly reservas = signal<ReservaUI[]>([
    { cliente: 'Carlos Ruiz', fechaHora: '22/08/2026 20:00', personas: 4, mesa: 5 },
    { cliente: 'Lucía Fernández', fechaHora: '22/08/2026 21:00', personas: 2, mesa: 3 },
    { cliente: 'Grupo Martínez', fechaHora: '23/08/2026 13:30', personas: 8, mesa: 9 },
  ]);
}
