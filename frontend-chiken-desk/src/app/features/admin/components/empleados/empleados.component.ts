import { Component, signal } from '@angular/core';

interface EmpleadoUI { nombre: string; rol: string; turno: string; activo: boolean; }

/** Empleados — tabla `empleados` (nombres, teléfonos, turnos). */
@Component({
  selector: 'app-empleados',
  standalone: true,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Personal del Restaurante</h1>
      <button type="button" class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
        + Registrar Empleado
      </button>
    </div>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
            <th class="pb-3">Nombre</th><th class="pb-3">Rol</th><th class="pb-3">Turno</th><th class="pb-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (e of empleados(); track e.nombre) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="py-3 font-medium text-gray-900 dark:text-white">{{ e.nombre }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ e.rol }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ e.turno }}</td>
              <td class="py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  [class]="e.activo ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700/40 dark:text-gray-400'"
                >
                  {{ e.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class EmpleadosComponent {
  readonly empleados = signal<EmpleadoUI[]>([
    { nombre: 'Juan Pérez', rol: 'Cajero', turno: 'Mañana', activo: true },
    { nombre: 'María Gómez', rol: 'Mesera', turno: 'Tarde', activo: true },
    { nombre: 'Luis Fernández', rol: 'Cocinero', turno: 'Mañana', activo: false },
  ]);
}
