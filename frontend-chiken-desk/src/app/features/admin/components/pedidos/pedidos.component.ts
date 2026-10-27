import { Component, signal } from '@angular/core';

type EstadoPedido = 'Pendiente' | 'En Cocina' | 'Listo' | 'Servido';
interface PedidoUI {
  id: string; mesa: string; tipo: 'Salon' | 'Llevar' | 'Delivery';
  items: string; total: number; estado: EstadoPedido;
}

const ESTADO_BADGE: Record<EstadoPedido, string> = {
  Pendiente: 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300',
  'En Cocina': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Listo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Servido: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

/**
 * Pedidos — según Módulo 4 del API (POST /pedidos, GET /pedidos/cocina).
 * Formulario simplificado + tabla de comandas activas.
 */
@Component({
  selector: 'app-pedidos',
  standalone: true,
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Gestión de Pedidos</h1>

    <div class="mb-6 rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Nuevo Pedido</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input placeholder="Mesa / Cliente" class="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white" />
        <select class="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white">
          <option>Salón</option>
          <option>Llevar</option>
          <option>Delivery</option>
        </select>
        <input placeholder="Ítems (ej. 2x Lomo Saltado)" class="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white sm:col-span-2" />
      </div>
      <button type="button" class="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
        Enviar a Cocina
      </button>
    </div>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Comandas Activas</h2>
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
            <th class="pb-3">N° Pedido</th>
            <th class="pb-3">Mesa</th>
            <th class="pb-3">Tipo</th>
            <th class="pb-3">Ítems</th>
            <th class="pb-3">Total</th>
            <th class="pb-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (p of pedidos(); track p.id) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="py-3 font-medium text-gray-900 dark:text-white">{{ p.id }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ p.mesa }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ p.tipo }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ p.items }}</td>
              <td class="py-3 font-medium text-gray-900 dark:text-white">&#36;{{ p.total.toFixed(2) }}</td>
              <td class="py-3">
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold" [class]="badge(p.estado)">{{ p.estado }}</span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class PedidosComponent {
  readonly pedidos = signal<PedidoUI[]>([
    { id: '#PED-101', mesa: 'Mesa 3', tipo: 'Salon', items: '2x Lomo Saltado, 1x Refresco', total: 25.0, estado: 'En Cocina' },
    { id: '#PED-102', mesa: 'Delivery - Ana', tipo: 'Delivery', items: '1x Pollo a la Plancha', total: 18.5, estado: 'Pendiente' },
    { id: '#PED-103', mesa: 'Mesa 8', tipo: 'Salon', items: '3x Hamburguesa', total: 42.0, estado: 'Listo' },
  ]);

  badge(estado: EstadoPedido): string {
    return ESTADO_BADGE[estado];
  }
}
