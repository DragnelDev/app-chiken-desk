import { Component, signal } from '@angular/core';

interface LineaPL { concepto: string; monto: number; total?: boolean; positivo?: boolean; }

/** Reportes — Estado de Resultados (P&L) agregando ventas, costos y gastos. */
@Component({
  selector: 'app-reportes',
  standalone: true,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Estado de Resultados (P&amp;L)</h1>
      <span class="text-sm text-gray-500 dark:text-gray-400">Periodo: Agosto 2026</span>
    </div>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      @for (l of lineas(); track l.concepto) {
        <div
          class="flex justify-between border-b border-gray-50 py-3 text-sm last:border-0 dark:border-surface-dark-border"
          [class.font-bold]="l.total"
          [class.bg-green-50]="l.concepto.includes('Neta')"
          [class.dark:bg-green-900]="l.concepto.includes('Neta')"
        >
          <span class="text-gray-700 dark:text-gray-200">{{ l.concepto }}</span>
          <span [class.text-green-600]="l.positivo" [class.text-red-500]="!l.positivo && !l.total" [class.dark:text-green-400]="l.positivo">
            {{ l.positivo ? '' : (l.monto < 0 ? '' : '-') }}&#36;{{ (l.monto < 0 ? l.monto * -1 : l.monto).toFixed(2) }}
          </span>
        </div>
      }
    </div>
  `,
})
export class ReportesComponent {
  readonly lineas = signal<LineaPL[]>([
    { concepto: 'Ingresos Operativos Totales', monto: 12450, total: true, positivo: true },
    { concepto: '(-) Costo de Materia Prima e Insumos', monto: -4100 },
    { concepto: '(-) Mano de Obra Directa', monto: -1000 },
    { concepto: '(=) Utilidad Bruta', monto: 7350, total: true, positivo: true },
    { concepto: '(-) Alquiler y Servicios', monto: -1800 },
    { concepto: '(-) Mermas y Pérdidas', monto: -180 },
    { concepto: '(-) Marketing y Publicidad', monto: -520 },
    { concepto: '(=) Utilidad Neta del Ejercicio', monto: 4850, total: true, positivo: true },
  ]);
}
