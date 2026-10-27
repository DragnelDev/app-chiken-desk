import { Component } from '@angular/core';

@Component({
  selector: 'app-public-about',
  standalone: true,
  template: `
    <section id="historia" class="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 class="mb-5 text-3xl font-bold text-gray-900 dark:text-white">Nuestra historia</h2>
      <p class="leading-relaxed text-gray-600 dark:text-gray-300">
        Somos una pollería de barrio con una receta simple: pollo fresco, marinado con cuidado y cocinado
        a la brasa hasta quedar dorado. Cada pedido se prepara al momento, para que llegue a tu mesa
        como debe ser: caliente, jugoso y con mucho sabor.
      </p>
    </section>
  `,
})
export class PublicAboutComponent {}
