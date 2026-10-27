import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { mensajeError } from '../../../core/utils/error';
import { Paginado, Venta } from '../../models';
import { ModalComponent } from '../modal/modal.component';
import { TicketComponent } from '../ticket/ticket.component';

/** Historial de ventas. El backend limita al CAJERO a sus propias ventas; el ADMIN ve todas. */
@Component({
  selector: 'app-ventas-historial',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, ModalComponent, TicketComponent],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">{{ auth.esAdmin() ? 'Ventas' : 'Mis ventas' }}</h1>

    <div class="card mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div><label class="label">Desde</label><input class="input" type="date" [(ngModel)]="filtro.desde" /></div>
      <div><label class="label">Hasta</label><input class="input" type="date" [(ngModel)]="filtro.hasta" /></div>
      <div>
        <label class="label">Estado</label>
        <select class="input" [(ngModel)]="filtro.estadoVenta">
          <option value="">Todos</option><option value="COMPLETADA">Completadas</option><option value="ANULADA">Anuladas</option>
        </select>
      </div>
      <div>
        <label class="label">Pago</label>
        <select class="input" [(ngModel)]="filtro.metodoPago">
          <option value="">Todos</option><option value="EFECTIVO">Efectivo</option><option value="QR">QR</option><option value="TARJETA">Tarjeta</option><option value="MIXTO">Mixto</option>
        </select>
      </div>
      <div class="flex items-end"><button type="button" class="btn w-full" (click)="cargar(1)">Filtrar</button></div>
    </div>

    @if (error()) {
      <p class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ error() }}</p>
    }

    <div class="card overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-surface-dark-border">
            <th class="th">Ticket</th><th class="th">Fecha</th><th class="th">Cajero</th><th class="th">Pedido</th>
            <th class="th">Pago</th><th class="th text-right">Total</th><th class="th">Estado</th><th class="th"></th>
          </tr>
        </thead>
        <tbody>
          @for (v of pagina()?.data ?? []; track v.idVenta) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="td font-medium">{{ v.numeroFacturaTicket }}</td>
              <td class="td whitespace-nowrap">{{ v.fechaRegistro | date: 'dd/MM HH:mm' }}</td>
              <td class="td">{{ v.usuario?.usuario }}</td>
              <td class="td">{{ v.tipoPedido }}</td>
              <td class="td">{{ v.metodoPago }}</td>
              <td class="td text-right" [class.line-through]="v.estadoVenta === 'ANULADA'">{{ v.montoTotal | currency: 'BOB' : 'Bs ' : '1.2-2' }}</td>
              <td class="td"><span class="badge" [class]="v.estadoVenta === 'COMPLETADA' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">{{ v.estadoVenta }}</span></td>
              <td class="td text-right"><button type="button" class="btn-ghost" (click)="ver(v)">Ver</button></td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="py-6 text-center text-gray-400">Sin ventas para los filtros elegidos.</td></tr>
          }
        </tbody>
      </table>
      @if (pagina(); as p) {
        <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>{{ p.total }} venta(s)</span>
          <div class="space-x-2">
            <button type="button" class="btn-ghost" [disabled]="p.page <= 1" (click)="cargar(p.page - 1)">‹ Anterior</button>
            <button type="button" class="btn-ghost" [disabled]="p.page * p.limit >= p.total" (click)="cargar(p.page + 1)">Siguiente ›</button>
          </div>
        </div>
      }
    </div>

    @if (seleccionada(); as v) {
      <app-modal [titulo]="'Venta ' + v.numeroFacturaTicket" ancho="max-w-md" (cerrar)="cerrarDetalle()">
        <app-ticket [venta]="v" />
        @if (aviso()) { <p class="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">{{ aviso() }}</p> }
        @if (errorAnular()) { <p class="mt-3 text-sm text-red-500">{{ errorAnular() }}</p> }

        @if (anulando()) {
          <label class="label mt-4">Motivo de la anulación</label>
          <input class="input" [(ngModel)]="motivo" maxlength="255" placeholder="Ej: error de digitación" />
          <div class="mt-3 flex justify-end gap-2">
            <button type="button" class="btn-ghost" (click)="anulando.set(false)">Cancelar</button>
            <button type="button" class="btn" [disabled]="motivo.trim().length < 5 || procesando()" (click)="confirmarAnulacion(v)">Confirmar anulación</button>
          </div>
        } @else {
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="btn-ghost" (click)="imprimir()">🖨 Imprimir</button>
            @if (v.estadoVenta === 'COMPLETADA') { <button type="button" class="btn-danger" (click)="anulando.set(true)">Anular venta</button> }
          </div>
        }
      </app-modal>
    }
  `,
})
export class VentasHistorialComponent implements OnInit {
  private readonly service = inject(VentaService);
  readonly auth = inject(AuthService);

  readonly pagina = signal<Paginado<Venta> | null>(null);
  readonly seleccionada = signal<Venta | null>(null);
  readonly error = signal<string | null>(null);
  readonly errorAnular = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly anulando = signal(false);
  readonly procesando = signal(false);
  filtro = { desde: '', hasta: '', estadoVenta: '', metodoPago: '' };
  motivo = '';
  private paginaActual = 1;

  ngOnInit(): void {
    this.cargar(1);
  }

  cargar(page: number): void {
    this.paginaActual = page;
    this.error.set(null);
    this.service.listar({ ...this.filtro, page, limit: 15 }).subscribe({
      next: (p) => this.pagina.set(p),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  ver(v: Venta): void {
    this.resetAnulacion();
    this.service.detalle(v.idVenta).subscribe({
      next: (completa) => this.seleccionada.set(completa),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  cerrarDetalle(): void {
    this.seleccionada.set(null);
    this.resetAnulacion();
  }

  private resetAnulacion(): void {
    this.anulando.set(false);
    this.motivo = '';
    this.errorAnular.set(null);
    this.aviso.set(null);
  }

  confirmarAnulacion(v: Venta): void {
    this.procesando.set(true);
    this.errorAnular.set(null);
    this.service.anular(v.idVenta, this.motivo.trim()).subscribe({
      next: (res) => {
        this.procesando.set(false);
        this.anulando.set(false);
        this.aviso.set(res.advertencia);
        this.service.detalle(v.idVenta).subscribe((c) => this.seleccionada.set(c));
        this.cargar(this.paginaActual);
      },
      error: (e) => {
        this.procesando.set(false);
        this.errorAnular.set(mensajeError(e));
      },
    });
  }

  imprimir(): void {
    window.print();
  }
}
