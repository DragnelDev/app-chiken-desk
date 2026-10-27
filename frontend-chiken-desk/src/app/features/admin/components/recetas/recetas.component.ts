import { Component, signal } from '@angular/core';

interface InsumoReceta { nombre: string; cantidad: string; costoUnit: string; subtotal: number; }

/**
 * Recetas — tabla `recetas` (N:M producto_id <-> insumo_id) para el costeo
 * y la deducción automática de stock al vender (Informe de Base de Datos, Módulo 3).
 */
@Component({
  selector: 'app-recetas',
  standalone: true,
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Fichas Técnicas y Costeo de Recetas</h1>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card lg:col-span-1">
        <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Producto</h2>
        <select class="mb-4 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white">
          <option>Lomo Saltado (1 porción)</option>
          <option>Pie de Limón Clásico</option>
        </select>
        <div class="rounded-lg border border-dashed border-brand bg-surface-light p-4 text-sm dark:bg-surface-dark">
          <p class="flex justify-between text-gray-600 dark:text-gray-300"><span>Costo insumos:</span><span>&#36;{{ costoInsumos().toFixed(2) }}</span></p>
          <hr class="my-2 border-gray-200 dark:border-surface-dark-border" />
          <p class="flex justify-between font-semibold text-green-600 dark:text-green-400">
            <span>Precio venta sugerido:</span><span>&#36;{{ precioSugerido().toFixed(2) }}</span>
          </p>
        </div>
      </div>

      <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card lg:col-span-2">
        <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Desglose de Insumos</h2>
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
              <th class="pb-3">Insumo</th><th class="pb-3">Cantidad</th><th class="pb-3">Costo Unit.</th><th class="pb-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            @for (i of insumos(); track i.nombre) {
              <tr class="border-b border-gray-50 dark:border-surface-dark-border">
                <td class="py-3 text-gray-900 dark:text-white">{{ i.nombre }}</td>
                <td class="py-3 text-gray-600 dark:text-gray-300">{{ i.cantidad }}</td>
                <td class="py-3 text-gray-600 dark:text-gray-300">{{ i.costoUnit }}</td>
                <td class="py-3 text-gray-900 dark:text-white">&#36;{{ i.subtotal.toFixed(2) }}</td>
              </tr>
            }
          </tbody>
        </table>
        <button type="button" class="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
          + Agregar Insumo
        </button>
      </div>
    </div>
  `,
})
export class RecetasComponent {
  readonly insumos = signal<InsumoReceta[]>([
    { nombre: 'Carne de res (lomo)', cantidad: '200 g', costoUnit: '$0.012/g', subtotal: 2.4 },
    { nombre: 'Papa', cantidad: '150 g', costoUnit: '$0.002/g', subtotal: 0.3 },
    { nombre: 'Cebolla y tomate', cantidad: '80 g', costoUnit: '$0.003/g', subtotal: 0.24 },
    { nombre: 'Arroz', cantidad: '100 g', costoUnit: '$0.0015/g', subtotal: 0.15 },
  ]);

  costoInsumos(): number {
    return this.insumos().reduce((acc, i) => acc + i.subtotal, 0);
  }

  precioSugerido(): number {
    return this.costoInsumos() * 2.6; // margen objetivo de ejemplo
  }
}
