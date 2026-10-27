import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string; // emoji simple
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly theme = inject(ThemeService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Los items vienen del panel que lo use (admin, pos): el mismo sidebar sirve para ambos.
  items = input.required<NavItem[]>();
  brandName = input<string>('ChikenDesk');

  toggleTheme(): void {
    this.theme.toggle();
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
