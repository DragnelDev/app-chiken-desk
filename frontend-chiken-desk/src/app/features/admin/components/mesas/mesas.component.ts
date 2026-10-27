import { Component, signal } from '@angular/core';

type EstadoMesa = 'Libre' | 'Ocupada' | 'Reservada';
interface MesaUI { numero: number; capacidad: number; estado: EstadoMesa; }

const ESTADO_CLASES: Record<EstadoMesa, string> = {
  Libre: 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400',
  Ocupada: 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400',
  Reservada: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
};

/**
 * Salón y Mesas — consume GET /mesas para el mapa y PATCH /mesas/{id}/estado
 * al hacer clic en una mesa para cambiar su estado (Libre/Ocupada/Reservada).
 */
@Component({
  selector: 'app-mesas',
  standalone: true,
  template: `
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Salón y Mesas</h1>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ ocupadas() }} / {{ mesas().length }} mesas ocupadas
      </span>
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      @for (mesa of mesas(); track mesa.numero) {
        <button
          type="button"
          (click)="ciclarEstado(mesa)"
          class="flex flex-col items-center justify-center gap-1 rounded-xl2 border-2 p-6 text-sm font-semibold
                 transition-transform hover:scale-[1.03]"
          [class]="estadoClase(mesa.estado)"
        >
          <span class="text-base">Mesa {{ mesa.numero }}</span>
          <span class="text-xs font-normal">{{ mesa.capacidad }} pers.</span>
          <span class="mt-1 rounded-full bg-white/60 px-2 py-0.5 text-xs dark:bg-black/20">{{ mesa.estado }}</span>
        </button>
      }
    </div>
  `,
})
export class MesasComponent {
  readonly mesas = signal<MesaUI[]>([
    { numero: 1, capacidad: 2, estado: 'Libre' },
    { numero: 2, capacidad: 4, estado: 'Ocupada' },
    { numero: 3, capacidad: 2, estado: 'Libre' },
    { numero: 4, capacidad: 6, estado: 'Reservada' },
    { numero: 5, capacidad: 4, estado: 'Ocupada' },
    { numero: 6, capacidad: 2, estado: 'Libre' },
    { numero: 7, capacidad: 4, estado: 'Libre' },
    { numero: 8, capacidad: 4, estado: 'Ocupada' },
    { numero: 9, capacidad: 8, estado: 'Libre' },
    { numero: 10, capacidad: 2, estado: 'Reservada' },
  ]);

  get ocupadas(): () => number {
    return () => this.mesas().filter((m) => m.estado === 'Ocupada').length;
  }

  estadoClase(estado: EstadoMesa): string {
    return ESTADO_CLASES[estado];
  }

  ciclarEstado(mesa: MesaUI): void {
    const orden: EstadoMesa[] = ['Libre', 'Ocupada', 'Reservada'];
    const siguiente = orden[(orden.indexOf(mesa.estado) + 1) % orden.length];
    this.mesas.update((lista) =>
      lista.map((m) => (m.numero === mesa.numero ? { ...m, estado: siguiente } : m)),
    );
  }
}
