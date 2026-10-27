import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Configuración — datos del negocio, moneda e impuesto (personalización del sistema). */
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Configuración del Sistema</h1>

    <div class="max-w-2xl rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Datos del negocio</h2>
      <div class="mb-4">
        <label class="mb-1 block text-xs font-semibold uppercase text-gray-400">Nombre del restaurante</label>
        <input
          [(ngModel)]="nombre"
          name="nombre"
          placeholder="Ej. RestoBrand"
          class="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white"
        />
      </div>
      <div class="mb-6">
        <label class="mb-1 block text-xs font-semibold uppercase text-gray-400">Dirección</label>
        <input
          [(ngModel)]="direccion"
          name="direccion"
          placeholder="Ej. Calle Principal #123"
          class="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white"
        />
      </div>

      <hr class="mb-6 border-gray-100 dark:border-surface-dark-border" />

      <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Configuración general</h2>
      <div class="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase text-gray-400">Moneda</label>
          <select
            [(ngModel)]="moneda"
            name="moneda"
            class="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white"
          >
            <option>USD ($)</option>
            <option>BOB (Bs)</option>
            <option>EUR (€)</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase text-gray-400">Impuesto (%)</label>
          <input
            [(ngModel)]="impuesto"
            name="impuesto"
            placeholder="Ej. 13"
            class="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white"
          />
        </div>
      </div>

      <button type="button" class="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
        Guardar Cambios
      </button>
    </div>
  `,
})
export class ConfiguracionComponent {
  nombre = 'RestoBrand';
  direccion = '';
  moneda = 'USD ($)';
  impuesto = '13';
}
