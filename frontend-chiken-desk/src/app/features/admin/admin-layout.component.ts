import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../../shared/components/sidebar/sidebar.component';

// Nav completo tomado del shell del template (index_actualizado.html),
// mapeado 1:1 a los módulos documentados en los informes de NexusRest.
const NAV_ITEMS: NavItem[] = [
  { label: 'Resumen', route: '/admin/resumen', icon: '📊' },
  { label: 'Salón y Mesas', route: '/admin/mesas', icon: '🍽️' },
  { label: 'Reservas', route: '/admin/reservas', icon: '📅' },
  { label: 'Pedidos', route: '/admin/pedidos', icon: '🍔' },
  { label: 'Cocina (KDS)', route: '/admin/cocina', icon: '🍳' },
  { label: 'Delivery', route: '/admin/delivery', icon: '🛵' },
  { label: 'Recetas', route: '/admin/recetas', icon: '📖' },
  { label: 'Inventario', route: '/admin/inventario', icon: '📦' },
  { label: 'Mermas', route: '/admin/mermas', icon: '⚠️' },
  { label: 'Facturación', route: '/admin/facturacion', icon: '🧾' },
  { label: 'Vista Ticket', route: '/admin/ticket', icon: '🖨️' },
  { label: 'Cierre de Caja', route: '/admin/caja', icon: '💰' },
  { label: 'Contabilidad', route: '/admin/contabilidad', icon: '📚' },
  { label: 'Reportes', route: '/admin/reportes', icon: '📈' },
  { label: 'Clientes y Prov.', route: '/admin/contactos', icon: '👥' },
  { label: 'Usuarios y Roles', route: '/admin/usuarios', icon: '🔐' },
  { label: 'Control de Turnos', route: '/admin/turnos', icon: '⏱️' },
  { label: 'Empleados', route: '/admin/empleados', icon: '👔' },
  { label: 'Configuración', route: '/admin/configuracion', icon: '⚙️' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-surface-light transition-colors dark:bg-surface-dark">
      <app-sidebar [items]="navItems" />
      <main class="flex-1 overflow-y-auto p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  readonly navItems = NAV_ITEMS;
}
