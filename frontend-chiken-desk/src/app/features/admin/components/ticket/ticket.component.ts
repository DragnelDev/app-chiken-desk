import { Component } from '@angular/core';

/** Vista de Ticket — previsualización imprimible de un pago (POST /pagos). */
@Component({
  selector: 'app-ticket',
  standalone: true,
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Previsualización de Ticket</h1>

    <div class="mx-auto w-64 rounded-xl2 border border-dashed border-gray-300 bg-white p-5 font-mono text-xs text-gray-800 dark:border-surface-dark-border">
      <div class="text-center">
        <p class="font-bold">RESTOBRAND</p>
        <p>NIT: 123456789</p>
        <p>Factura #0001</p>
      </div>
      <hr class="my-2 border-dashed border-gray-300" />
      <p class="flex justify-between"><span>1x Lomo Saltado</span><span>50.00</span></p>
      <p class="flex justify-between"><span>1x Refresco</span><span>10.00</span></p>
      <hr class="my-2 border-dashed border-gray-300" />
      <p class="flex justify-between font-bold"><span>TOTAL</span><span>60.00</span></p>
    </div>

    <div class="mt-6 text-center">
      <button type="button" class="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
        Imprimir Ticket
      </button>
    </div>
  `,
})
export class TicketComponent {}
