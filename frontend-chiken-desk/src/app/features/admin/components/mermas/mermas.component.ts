import { Component, signal } from '@angular/core';

/** Mermas — tabla `registro_mermas` (cantidad_perdida, motivo, usuario_id). */
@Component({
  selector: 'app-mermas',
  standalone: true,
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Registro de Mermas y Desperdicios</h1>

    <div class="mb-6 rounded-xl2 border border-red-100 bg-surface-light-card p-6 shadow-sm dark:border-red-900/30 dark:bg-surface-dark-card">
      <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Registrar nueva merma</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input placeholder="Insumo o producto" class="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-400 dark:border-surface-dark-border dark:text-white" />
        <input type="number" placeholder="Cantidad" class="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-400 dark:border-surface-dark-border dark:text-white" />
        <select class="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-400 dark:border-surface-dark-border dark:text-white">
          <option>Vencido / Caducado</option>
          <option>Falla de cocina</option>
          <option>Caída / Manipulación</option>
        </select>
        <button type="button" class="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
          Registrar Merma
        </button>
      </div>
    </div>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <p class="text-sm text-gray-500 dark:text-gray-400">Total perdido esta semana</p>
      <p class="mt-1 text-2xl font-bold text-red-500">&#36;{{ totalSemana().toFixed(2) }}</p>
    </div>
  `,
})
export class MermasComponent {
  readonly totalSemana = signal(45.0);
}
