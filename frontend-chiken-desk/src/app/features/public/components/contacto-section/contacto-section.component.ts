import { Component } from '@angular/core';
import { PublicReservasComponent } from '../reservas-section/reservas-section.component';

/** Contacto y Reservas — datos del local + formulario de reserva. */
@Component({
  selector: 'app-public-contacto',
  standalone: true,
  imports: [PublicReservasComponent],
  template: `
    <section id="contacto" class="mx-auto max-w-3xl px-6 py-20">
      <h2 class="mb-10 text-center text-3xl font-bold text-gray-900 dark:text-white">
        Visítanos o Haz una Reserva
      </h2>

      <div class="mb-6 grid grid-cols-1 gap-4 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-3">
        <div class="rounded-xl2 bg-surface-light-card p-5 text-center shadow-sm dark:bg-surface-dark-card">
          <p class="mb-1 text-xl">📍</p>
          <p>Av. Gastronómica #456, Esquina Principal</p>
        </div>
        <div class="rounded-xl2 bg-surface-light-card p-5 text-center shadow-sm dark:bg-surface-dark-card">
          <p class="mb-1 text-xl">📞</p>
          <p>+591 71234567 (Delivery)</p>
        </div>
        <div class="rounded-xl2 bg-surface-light-card p-5 text-center shadow-sm dark:bg-surface-dark-card">
          <p class="mb-1 text-xl">⏰</p>
          <p>Lunes a Domingo, 12:00 — 23:00</p>
        </div>
      </div>

      <app-public-reservas />

      <div class="mt-6 text-center">
        <a
          href="https://wa.me/59171234567"
          target="_blank"
          rel="noopener"
          class="inline-block rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          Pedir por WhatsApp / Delivery
        </a>
      </div>
    </section>
  `,
})
export class PublicContactoComponent {}
