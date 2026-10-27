import { Component } from '@angular/core';
import { SidebarComponent, NavItem } from '../../../shared/components/sidebar/sidebar.component';

const NAV_ITEMS: NavItem[] = [
  { label: 'Salón', route: '/pos/salon', icon: '🍽️' },
  { label: 'Nuevo Pedido', route: '/pos/nuevo', icon: '🧾' },
  { label: 'Cobros', route: '/pos/cobros', icon: '💳' },
];

/**
 * Toma de pedidos para Meseros/Cajeros: mapa de mesas (GET /mesas),
 * selector de platos (GET /productos) y cobro (POST /pagos).
 * Placeholder: reutiliza el mismo SidebarComponent que el panel Admin.
 */
@Component({
  selector: 'app-pos-home',
  standalone: true,
  imports: [SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-surface-light dark:bg-surface-dark">
      <app-sidebar [items]="navItems" brandName="RestoBrand" />
      <main class="flex-1 p-8 text-gray-900 dark:text-white">
        <h1 class="text-2xl font-bold">Punto de Venta — en construcción</h1>
      </main>
    </div>
  `,
})
export class PosHomeComponent {
  readonly navItems = NAV_ITEMS;
}
