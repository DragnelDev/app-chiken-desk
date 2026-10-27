import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';

/** Navbar pública fija: logo, anclas a secciones, modo claro/oscuro y acceso del personal. */
@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav
      class="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-gray-100
             bg-surface-light-card/90 px-6 py-4 backdrop-blur transition-colors
             dark:border-surface-dark-border dark:bg-surface-dark/90"
    >
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-base">🍗</div>
        <span class="text-lg font-bold text-gray-900 dark:text-white">ChikenDesk</span>
      </div>

      <ul class="hidden items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300 md:flex">
        <li><a href="#inicio" class="hover:text-brand">Inicio</a></li>
        <li><a href="#historia" class="hover:text-brand">Nosotros</a></li>
        <li><a href="#menu" class="hover:text-brand">Menú</a></li>
        <li><a href="#contacto" class="hover:text-brand">Contacto</a></li>
      </ul>

      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="theme.toggle()"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm transition-colors
                 hover:bg-gray-200 dark:bg-surface-dark-card dark:hover:bg-surface-dark-border"
          [attr.aria-label]="theme.theme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        >
          {{ theme.theme() === 'dark' ? '☀️' : '🌙' }}
        </button>
        <a routerLink="/login" class="btn">Acceso personal</a>
      </div>
    </nav>
  `,
})
export class PublicNavbarComponent {
  readonly theme = inject(ThemeService);
}
