import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string; // emoji simple; reemplazar por lucide-icons si el proyecto los integra
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly theme = inject(ThemeService);

  // Los items del menú vienen del panel que lo use (admin, pos, kitchen...)
  // así el mismo sidebar sirve para todos los módulos del dashboard.
  items = input.required<NavItem[]>();
  brandName = input<string>('RestoBrand');

  toggleTheme(): void {
    this.theme.toggle();
  }
}
