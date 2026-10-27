import { Component, input, output } from '@angular/core';

/** Diálogo modal simple. Uso: <app-modal titulo="..." (cerrar)="..."> contenido </app-modal> */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      (click)="cerrar.emit()"
    >
      <div
        class="max-h-[90vh] w-full overflow-y-auto rounded-xl2 bg-surface-light-card p-6 shadow-xl dark:bg-surface-dark-card"
        [class]="ancho()"
        role="dialog"
        aria-modal="true"
        (click)="$event.stopPropagation()"
      >
        <div class="mb-4 flex items-start justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ titulo() }}</h2>
          <button type="button" class="text-xl leading-none text-gray-400 hover:text-gray-600" aria-label="Cerrar" (click)="cerrar.emit()">×</button>
        </div>
        <ng-content />
      </div>
    </div>
  `,
})
export class ModalComponent {
  titulo = input.required<string>();
  ancho = input<string>('max-w-lg');
  cerrar = output<void>();
}
