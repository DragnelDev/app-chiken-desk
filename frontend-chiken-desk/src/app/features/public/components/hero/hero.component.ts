import { Component } from '@angular/core';

/** Hero — primera sección visible, gradiente + imagen de fondo y CTA al menú. */
@Component({
  selector: 'app-public-hero',
  standalone: true,
  template: `
    <header
      id="inicio"
      class="relative flex h-[85vh] min-h-[520px] flex-col items-center justify-center px-6 pt-16 text-center"
    >
      <div
        class="absolute inset-0 -z-10 bg-cover bg-center"
        style="background-image: linear-gradient(rgba(10,14,23,0.55), rgba(10,14,23,0.6)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80')"
      ></div>

      <span class="mb-4 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
        Cocina tradicional y contemporánea
      </span>
      <h1 class="mb-4 max-w-2xl text-4xl font-bold text-white sm:text-5xl">Sabores que Enamoran</h1>
      <p class="mb-8 max-w-xl text-white/90">
        Disfruta de la mejor comida preparada con ingredientes frescos y de la más alta calidad,
        en un ambiente pensado para tu mesa.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <a href="#menu" class="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-hover">
          Ver Menú Digital
        </a>
        <a
          href="#contacto"
          class="rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
        >
          Reservar una Mesa
        </a>
      </div>
    </header>
  `,
})
export class PublicHeroComponent {}
