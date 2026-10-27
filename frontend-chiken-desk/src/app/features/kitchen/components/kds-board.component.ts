import { Component } from '@angular/core';

/**
 * Pantalla de cocina (KDS): tarjetas de pedidos en tiempo real con estados
 * Pendiente -> En Preparación -> Listo, consumiendo GET /pedidos/cocina y
 * PATCH /pedidos/{id}/estado-item. Placeholder de estructura.
 */
@Component({
  selector: 'app-kds-board',
  standalone: true,
  template: `
    <div
      class="flex min-h-screen items-center justify-center bg-surface-dark text-white"
    >
      <p class="text-lg">Pantalla de cocina (KDS) — en construcción.</p>
    </div>
  `,
})
export class KdsBoardComponent {}
