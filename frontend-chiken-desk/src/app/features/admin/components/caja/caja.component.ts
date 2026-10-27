import { Component, signal } from '@angular/core';

/** Cierre de Caja — tabla `caja_diaria` (monto_inicial, monto_final_sistema/real, diferencia). */
@Component({
  selector: 'app-caja',
  standalone: true,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Arqueo y Cierre de Caja</h1>
      <span class="text-sm text-gray-500 dark:text-gray-400">Turno: Tarde — 21/08/2026</span>
    </div>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
        <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Otros medios de pago</h2>
        <div class="mb-3 flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-300">Tarjeta débito/crédito</span>
          <span class="font-medium text-gray-900 dark:text-white">&#36;320.00</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-300">Transferencias / QR</span>
          <span class="font-medium text-gray-900 dark:text-white">&#36;140.00</span>
        </div>
      </div>

      <div class="rounded-xl2 border border-dashed border-brand bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
        <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">Resumen del arqueo</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between text-gray-600 dark:text-gray-300"><span>Fondo inicial:</span><span>&#36;100.00</span></div>
          <div class="flex justify-between text-gray-600 dark:text-gray-300"><span>Ventas del sistema:</span><span>&#36;1,005.50</span></div>
          <div class="flex justify-between text-gray-600 dark:text-gray-300"><span>Total físico + digital:</span><span>&#36;1,105.50</span></div>
          <hr class="my-2 border-gray-200 dark:border-surface-dark-border" />
          <div class="flex justify-between text-base font-bold text-green-600 dark:text-green-400">
            <span>Diferencia:</span><span>&#36;0.00 (Cuadrado)</span>
          </div>
        </div>
        <button type="button" class="mt-4 w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
          Cerrar Caja
        </button>
      </div>
    </div>
  `,
})
export class CajaComponent {}
