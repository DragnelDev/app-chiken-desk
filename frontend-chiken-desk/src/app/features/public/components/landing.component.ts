import { Component } from '@angular/core';
import { PublicNavbarComponent } from './navbar/navbar.component';
import { PublicHeroComponent } from './hero/hero.component';
import { PublicAboutComponent } from './about/about.component';
import { PublicMenuComponent } from './menu-section/menu-section.component';
import { PublicContactoComponent } from './contacto-section/contacto-section.component';
import { PublicFooterComponent } from './footer/footer.component';

/** Landing pública de ChikenDesk: Hero, Nosotros, Menú (GET /productos) y Contacto. */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    PublicNavbarComponent,
    PublicHeroComponent,
    PublicAboutComponent,
    PublicMenuComponent,
    PublicContactoComponent,
    PublicFooterComponent,
  ],
  template: `
    <div class="min-h-screen bg-surface-light text-gray-900 transition-colors dark:bg-surface-dark dark:text-white">
      <app-public-navbar />
      <app-public-hero />
      <app-public-about />
      <app-public-menu />
      <app-public-contacto />
      <app-public-footer />
    </div>
  `,
})
export class LandingComponent {}
