import { Component, signal } from '@angular/core';

type TipoAsiento = 'Ingreso' | 'Costo' | 'Gasto';
interface AsientoUI { id: string; fecha: string; glosa: string; tipo: TipoAsiento; monto: number; }

const BADGE: Record<TipoAsiento, string> = {
  Ingreso: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Costo: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Gasto: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

/** Contabilidad — tabla `gastos` + asientos derivados de pagos y compras. */
@Component({
  selector: 'app-contabilidad',
  standalone: true,
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Libro Diario y Registros Contables</h1>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
            <th class="pb-3">N° Asiento</th><th class="pb-3">Fecha</th><th class="pb-3">Glosa</th><th class="pb-3">Tipo</th><th class="pb-3">Monto</th>
          </tr>
        </thead>
        <tbody>
          @for (a of asientos(); track a.id) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="py-3 text-gray-900 dark:text-white">{{ a.id }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ a.fecha }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ a.glosa }}</td>
              <td class="py-3"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" [class]="badge(a.tipo)">{{ a.tipo }}</span></td>
              <td class="py-3 font-semibold" [class.text-green-600]="a.tipo==='Ingreso'" [class.text-red-600]="a.tipo!=='Ingreso'">
                {{ a.tipo === 'Ingreso' ? '+' : '-' }}&#36;{{ a.monto.toFixed(2) }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ContabilidadComponent {
  readonly asientos = signal<AsientoUI[]>([
    { id: '#AST-0102', fecha: '17/08/2026', glosa: 'Venta del día en mostrador', tipo: 'Ingreso', monto: 240.0 },
    { id: '#AST-0101', fecha: '16/08/2026', glosa: 'Compra de insumos a proveedor', tipo: 'Costo', monto: 380.0 },
    { id: '#AST-0100', fecha: '15/08/2026', glosa: 'Pago de alquiler del local', tipo: 'Gasto', monto: 450.0 },
  ]);

  badge(tipo: TipoAsiento): string {
    return BADGE[tipo];
  }
}
