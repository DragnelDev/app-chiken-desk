import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Venta } from '../../models';

/** Ticket de venta (80 mm). Se imprime con window.print(): solo se ve `.print-area`. */
@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    @if (venta(); as v) {
      <div class="print-area mx-auto w-[80mm] bg-white p-3 font-mono text-[12px] leading-tight text-black">
        <p class="text-center text-base font-bold">ChikenDesk</p>
        <p class="text-center">Pollería</p>
        <hr class="my-2 border-dashed border-black" />
        <p>Ticket: {{ v.numeroFacturaTicket }}</p>
        <p>Fecha: {{ v.fechaRegistro | date: 'dd/MM/yyyy HH:mm' }}</p>
        <p>Pedido: {{ v.tipoPedido }} · Pago: {{ v.metodoPago }}</p>
        @if (v.clienteNombre) { <p>Cliente: {{ v.clienteNombre }}</p> }
        @if (v.clienteNitCi) { <p>NIT/CI: {{ v.clienteNitCi }}</p> }
        @if (v.estadoVenta === 'ANULADA') { <p class="my-1 text-center font-bold">*** ANULADA ***</p> }
        <hr class="my-2 border-dashed border-black" />
        @for (d of v.detalles ?? []; track d.idDetalle) {
          <div class="mb-1">
            <div class="flex justify-between gap-2">
              <span>{{ d.cantidad }} x {{ d.producto?.nombre ?? 'Producto ' + d.idProducto }}</span>
              <span>{{ d.subtotal | currency: 'BOB' : '' : '1.2-2' }}</span>
            </div>
            @if (d.observacion) { <div class="pl-3 text-[11px]">» {{ d.observacion }}</div> }
          </div>
        }
        <hr class="my-2 border-dashed border-black" />
        <div class="flex justify-between"><span>Subtotal</span><span>{{ v.montoSubtotal | currency: 'BOB' : '' : '1.2-2' }}</span></div>
        @if (v.montoDescuento > 0) {
          <div class="flex justify-between"><span>Descuento</span><span>-{{ v.montoDescuento | currency: 'BOB' : '' : '1.2-2' }}</span></div>
        }
        <div class="flex justify-between text-sm font-bold"><span>TOTAL Bs</span><span>{{ v.montoTotal | currency: 'BOB' : '' : '1.2-2' }}</span></div>
        <hr class="my-2 border-dashed border-black" />
        <p class="text-center">¡Gracias por su compra!</p>
      </div>
    }
  `,
})
export class TicketComponent {
  venta = input.required<Venta | null>();
}
