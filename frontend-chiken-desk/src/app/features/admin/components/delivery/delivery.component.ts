import { Component, signal } from '@angular/core';

interface DeliveryUI { id: string; cliente: string; direccion: string; estado: string; }

/** Delivery / Para llevar — filtra `pedidos` por tipoPedido = Delivery o Llevar. */
@Component({
  selector: 'app-delivery',
  standalone: true,
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Pedidos Delivery / Para Llevar</h1>

    <div class="space-y-4">
      @for (p of pedidos(); track p.id) {
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl2 bg-surface-light-card p-5 shadow-sm dark:bg-surface-dark-card">
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">{{ p.id }} — {{ p.cliente }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Dirección: {{ p.direccion }}</p>
          </div>
          <span class="text-sm font-semibold text-amber-600 dark:text-amber-400">{{ p.estado }}</span>
          <button type="button" class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
            Asignar Motorizado
          </button>
        </div>
      }
    </div>
  `,
})
export class DeliveryComponent {
  readonly pedidos = signal<DeliveryUI[]>([
    { id: 'Pedido #102', cliente: 'Ana', direccion: 'Av. Principal #45', estado: 'En preparación' },
    { id: 'Pedido #103', cliente: 'Roberto', direccion: 'Calle Sucre #210', estado: 'En camino' },
  ]);
}
