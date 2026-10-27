import { Component, signal } from '@angular/core';

interface ComandaUI { mesa: string; items: string[]; minutos: number; }

/**
 * Pantalla de Cocina (KDS) — GET /pedidos/cocina + PATCH /pedidos/{id}/estado-item.
 * Fondo oscuro fijo para mejor lectura en pantallas/tablets de cocina.
 */
@Component({
  selector: 'app-cocina',
  standalone: true,
  template: `
    <div class="-m-8 min-h-screen bg-surface-dark p-8">
      <h1 class="mb-6 text-2xl font-bold text-white">Monitor de Cocina</h1>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        @for (c of comandas(); track c.mesa) {
          <div class="rounded-xl2 bg-surface-dark-card p-5">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="font-bold text-brand">{{ c.mesa }}</h3>
              <span class="text-xs text-gray-400">hace {{ c.minutos }} min</span>
            </div>
            <ul class="mb-4 space-y-1 text-sm text-gray-200">
              @for (item of c.items; track item) {
                <li>{{ item }}</li>
              }
            </ul>
            <button type="button" class="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700">
              Marcar como Listo
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class CocinaComponent {
  readonly comandas = signal<ComandaUI[]>([
    { mesa: 'Mesa 5', items: ['2x Milanesa', '1x Ensalada'], minutos: 4 },
    { mesa: 'Mesa 8', items: ['3x Hamburguesa'], minutos: 9 },
    { mesa: 'Delivery - Ana', items: ['1x Pollo a la Plancha', '1x Jugo Natural'], minutos: 2 },
  ]);
}
