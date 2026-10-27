import { Component, signal } from '@angular/core';

interface TurnoUI { empleado: string; entrada: string; salida: string; horas: string; }

/** Control de Turnos — asistencia del personal, ligada a `empleados`. */
@Component({
  selector: 'app-turnos',
  standalone: true,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Control de Asistencia</h1>
      <div class="flex gap-2">
        <button type="button" class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">Registrar Entrada</button>
        <button type="button" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-surface-dark-border dark:text-gray-300 dark:hover:bg-surface-dark-border">Registrar Salida</button>
      </div>
    </div>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
            <th class="pb-3">Empleado</th><th class="pb-3">Entrada</th><th class="pb-3">Salida</th><th class="pb-3">Total Horas</th>
          </tr>
        </thead>
        <tbody>
          @for (t of turnos(); track t.empleado) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="py-3 font-medium text-gray-900 dark:text-white">{{ t.empleado }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ t.entrada }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ t.salida }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ t.horas }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TurnosComponent {
  readonly turnos = signal<TurnoUI[]>([
    { empleado: 'Juan Pérez', entrada: '08:00', salida: '16:00', horas: '8h' },
    { empleado: 'María Gómez', entrada: '12:00', salida: '20:00', horas: '8h' },
  ]);
}
