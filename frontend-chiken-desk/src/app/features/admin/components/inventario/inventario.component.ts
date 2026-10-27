import { Component, signal } from '@angular/core';

type EstadoStock = 'Crítico' | 'Reordenar' | 'Normal';
interface InsumoUI { codigo: string; nombre: string; categoria: string; stock: string; minimo: string; estado: EstadoStock; }

const BADGE: Record<EstadoStock, string> = {
  Crítico: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Reordenar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

/** Inventario — tabla `insumos` (stock_actual / stock_minimo) del Informe de Base de Datos. */
@Component({
  selector: 'app-inventario',
  standalone: true,
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Control de Inventario</h1>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Stock actual de insumos</h2>
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
            <th class="pb-3">Código</th><th class="pb-3">Insumo</th><th class="pb-3">Categoría</th>
            <th class="pb-3">Stock</th><th class="pb-3">Mínimo</th><th class="pb-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (i of insumos(); track i.codigo) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="py-3 text-gray-500 dark:text-gray-400">{{ i.codigo }}</td>
              <td class="py-3 font-medium text-gray-900 dark:text-white">{{ i.nombre }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ i.categoria }}</td>
              <td class="py-3 font-semibold text-gray-900 dark:text-white">{{ i.stock }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ i.minimo }}</td>
              <td class="py-3"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" [class]="badge(i.estado)">{{ i.estado }}</span></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class InventarioComponent {
  readonly insumos = signal<InsumoUI[]>([
    { codigo: 'INS-001', nombre: 'Carne de res', categoria: 'Refrigerados', stock: '4.0 kg', minimo: '10.0 kg', estado: 'Crítico' },
    { codigo: 'INS-002', nombre: 'Papa', categoria: 'Verduras', stock: '18.0 kg', minimo: '15.0 kg', estado: 'Reordenar' },
    { codigo: 'INS-003', nombre: 'Arroz', categoria: 'Secos', stock: '40.0 kg', minimo: '10.0 kg', estado: 'Normal' },
  ]);

  badge(estado: EstadoStock): string {
    return BADGE[estado];
  }
}
