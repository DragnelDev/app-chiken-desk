import { Component, signal } from '@angular/core';

interface FacturaUI { id: string; fecha: string; cliente: string; total: number; }

/** Facturación — historial de `pagos` con filtro por fecha y reimpresión. */
@Component({
  selector: 'app-facturacion',
  standalone: true,
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Historial de Facturación</h1>

    <div class="mb-4 flex gap-3">
      <input type="date" class="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white" />
      <button type="button" class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">Filtrar</button>
    </div>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
            <th class="pb-3">ID</th><th class="pb-3">Fecha</th><th class="pb-3">Cliente</th><th class="pb-3">Total</th><th class="pb-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (f of facturas(); track f.id) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="py-3 text-gray-900 dark:text-white">{{ f.id }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ f.fecha }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ f.cliente }}</td>
              <td class="py-3 font-medium text-gray-900 dark:text-white">&#36;{{ f.total.toFixed(2) }}</td>
              <td class="py-3">
                <button type="button" class="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-surface-dark-border dark:text-gray-300 dark:hover:bg-surface-dark-border">
                  Reimprimir
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class FacturacionComponent {
  readonly facturas = signal<FacturaUI[]>([
    { id: '#001', fecha: '21/08/2026', cliente: 'Juan P.', total: 150.0 },
    { id: '#002', fecha: '21/08/2026', cliente: 'María López', total: 60.0 },
  ]);
}
