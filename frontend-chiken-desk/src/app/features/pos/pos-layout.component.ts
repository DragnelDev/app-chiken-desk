import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavItem, SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-surface-light transition-colors dark:bg-surface-dark">
      <app-sidebar [items]="navItems()" />
      <main class="h-screen flex-1 overflow-y-auto p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class PosLayoutComponent {
  private readonly auth = inject(AuthService);

  readonly navItems = computed<NavItem[]>(() => [
    { label: 'Vender', route: '/pos', icon: '🛒' },
    { label: 'Mi caja', route: '/pos/caja', icon: '💰' },
    { label: 'Mis ventas', route: '/pos/ventas', icon: '🧾' },
    ...(this.auth.esAdmin() ? [{ label: 'Panel de administración', route: '/admin', icon: '📊' }] : []),
  ]);
}
