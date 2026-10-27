import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../../../core/services/reserva.service';

/** Formulario de reserva pública — POST /reservas. */
@Component({
  selector: 'app-public-reservas',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="rounded-xl2 bg-surface-light-card p-6 text-left shadow-sm dark:bg-surface-dark-card">
      <h3 class="mb-4 text-center font-semibold text-gray-900 dark:text-white">Reserva tu mesa en línea</h3>

      @if (enviado()) {
        <p class="rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
          ¡Listo, {{ nombre }}! Tu solicitud de reserva fue enviada. Te confirmaremos por teléfono.
        </p>
      } @else {
        <form (ngSubmit)="reservar()" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            [(ngModel)]="nombre"
            name="nombre"
            required
            placeholder="Nombre completo"
            class="rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white"
          />
          <input
            [(ngModel)]="telefono"
            name="telefono"
            required
            placeholder="Teléfono"
            class="rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white"
          />
          <input
            [(ngModel)]="fechaHora"
            name="fechaHora"
            type="datetime-local"
            required
            class="rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white"
          />
          <input
            [(ngModel)]="personas"
            name="personas"
            type="number"
            min="1"
            required
            placeholder="N° de personas"
            class="rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white"
          />

          @if (error()) {
            <p class="text-sm font-medium text-red-500 sm:col-span-2">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="enviando()"
            class="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60 sm:col-span-2"
          >
            {{ enviando() ? 'Enviando...' : 'Confirmar Reserva' }}
          </button>
        </form>
      }
    </div>
  `,
})
export class PublicReservasComponent {
  private readonly reservaService = inject(ReservaService);

  nombre = '';
  telefono = '';
  fechaHora = '';
  personas = 2;

  readonly enviando = signal(false);
  readonly enviado = signal(false);
  readonly error = signal<string | null>(null);

  reservar(): void {
    this.error.set(null);
    this.enviando.set(true);

    this.reservaService
      .crear({
        nombreCliente: this.nombre,
        telefono: this.telefono,
        fechaHora: this.fechaHora,
        personas: Number(this.personas),
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.enviado.set(true);
        },
        error: () => {
          this.enviando.set(false);
          this.error.set('No se pudo enviar la reserva. Intenta nuevamente o llámanos.');
        },
      });
  }
}
