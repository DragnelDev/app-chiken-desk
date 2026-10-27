import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

const NAV_ITEMS: NavItem[] = [
  { label: 'Resumen', route: '/admin/resumen', icon: '📊' },
  { label: 'Productos', route: '/admin/productos', icon: '🍗' },
  { label: 'Categorías', route: '/admin/categorias', icon: '🏷️' },
  { label: 'Ventas', route: '/admin/ventas', icon: '🧾' },
  { label: 'Cajas (turnos)', route: '/admin/cajas', icon: '💰' },
  { label: 'Usuarios', route: '/admin/usuarios', icon: '🔐' },
  { label: 'Auditoría', route: '/admin/auditoria', icon: '🕵️' },
  { label: 'Ir al punto de venta', route: '/pos', icon: '🛒' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-surface-light transition-colors dark:bg-surface-dark">
      <app-sidebar [items]="navItems" />
      <main class="h-screen flex-1 overflow-y-auto p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  readonly navItems = NAV_ITEMS;
}
