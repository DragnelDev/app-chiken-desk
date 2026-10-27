import { Component } from '@angular/core';

/** Nuestra Historia — sección informativa breve sobre el restaurante. */
@Component({
  selector: 'app-public-about',
  standalone: true,
  template: `
    <section id="historia" class="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 class="mb-5 text-3xl font-bold text-gray-900 dark:text-white">Nuestra Historia</h2>
      <p class="leading-relaxed text-gray-600 dark:text-gray-300">
        Fundado con la pasión de llevar los mejores sabores a tu mesa, RestoBrand se ha convertido
        en el punto de encuentro favorito de las familias. Cada plato cuenta una historia de
        tradición, dedicación y un amor profundo por la buena gastronomía.
      </p>
    </section>
  `,
})
export class PublicAboutComponent {}
