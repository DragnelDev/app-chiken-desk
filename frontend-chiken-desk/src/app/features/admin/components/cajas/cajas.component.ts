import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../../../core/services/api.services';
import { mensajeError } from '../../../../core/utils/error';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Apertura, CajaConResumen, Paginado } from '../../../../shared/models';

@Component({
  selector: 'app-cajas',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, ModalComponent],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Cajas (turnos)</h1>
      <select class="input w-44" [(ngModel)]="estadoCaja" (ngModelChange)="cargar(1)">
        <option value="">Todas</option><option value="ABIERTA">Abiertas</option><option value="CERRADA">Cerradas</option>
      </select>
    </div>

    @if (error()) {
      <p class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ error() }}</p>
    }

    <div class="card overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-surface-dark-border">
            <th class="th">Cajero</th><th class="th">Apertura</th><th class="th">Cierre</th>
            <th class="th text-right">Inicial</th><th class="th text-right">Contado</th><th class="th text-right">Diferencia</th>
            <th class="th">Estado</th><th class="th"></th>
          </tr>
        </thead>
        <tbody>
          @for (a of pagina()?.data ?? []; track a.idApertura) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="td font-medium">{{ a.usuario?.usuario }}</td>
              <td class="td">{{ a.fechaApertura | date: 'dd/MM HH:mm' }}</td>
              <td class="td">{{ a.fechaCierre ? (a.fechaCierre | date: 'dd/MM HH:mm') : '—' }}</td>
              <td class="td text-right">{{ a.montoInicial | currency: 'BOB' : 'Bs ' : '1.2-2' }}</td>
              <td class="td text-right">{{ a.montoCierre === null ? '—' : (a.montoCierre | currency: 'BOB' : 'Bs ' : '1.2-2') }}</td>
              <td class="td text-right" [class]="colorDiferencia(a)">{{ a.montoDiferencia === null ? '—' : (a.montoDiferencia | currency: 'BOB' : 'Bs ' : '1.2-2') }}</td>
              <td class="td"><span class="badge" [class]="a.estadoCaja === 'ABIERTA' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-surface-dark-border dark:text-gray-300'">{{ a.estadoCaja }}</span></td>
              <td class="td text-right"><button type="button" class="btn-ghost" (click)="ver(a)">Resumen</button></td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="py-6 text-center text-gray-400">Sin turnos.</td></tr>
          }
        </tbody>
      </table>
      @if (pagina(); as p) {
        <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>{{ p.total }} turno(s)</span>
          <div class="space-x-2">
            <button type="button" class="btn-ghost" [disabled]="p.page <= 1" (click)="cargar(p.page - 1)">‹ Anterior</button>
            <button type="button" class="btn-ghost" [disabled]="p.page * p.limit >= p.total" (click)="cargar(p.page + 1)">Siguiente ›</button>
          </div>
        </div>
      }
    </div>

    @if (detalle(); as d) {
      <app-modal [titulo]="'Turno #' + d.apertura.idApertura + ' · ' + d.apertura.usuario?.usuario" (cerrar)="detalle.set(null)">
        <div class="space-y-1 text-sm">
          @for (f of filas(d); track f[0]) {
            <div class="flex justify-between text-gray-600 dark:text-gray-300"><span>{{ f[0] }}</span><span>{{ f[1] | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
          }
          <hr class="my-2 border-gray-200 dark:border-surface-dark-border" />
          <div class="flex justify-between font-bold text-gray-900 dark:text-white"><span>Efectivo esperado</span><span>{{ d.resumen.efectivoEsperado | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
          @if (d.apertura.montoDiferencia !== null) {
            <div class="flex justify-between font-bold" [class]="colorDiferencia(d.apertura)"><span>Diferencia al cierre</span><span>{{ d.apertura.montoDiferencia | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
          }
          <p class="pt-2 text-xs text-gray-400">{{ d.resumen.cantidadVentas }} venta(s) · {{ d.resumen.ventasAnuladas }} anulada(s). MIXTO no entra al efectivo esperado.</p>
        </div>
      </app-modal>
    }
  `,
})
export class CajasComponent implements OnInit {
  private readonly service = inject(CajaService);

  readonly pagina = signal<Paginado<Apertura> | null>(null);
  readonly detalle = signal<CajaConResumen | null>(null);
  readonly error = signal<string | null>(null);
  estadoCaja = '';

  ngOnInit(): void {
    this.cargar(1);
  }

  cargar(page: number): void {
    this.service.historial({ estadoCaja: this.estadoCaja || undefined, page, limit: 15 }).subscribe({
      next: (p) => this.pagina.set(p),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  ver(a: Apertura): void {
    this.service.detalle(a.idApertura).subscribe({
      next: (d) => this.detalle.set({ ...d, apertura: { ...d.apertura, usuario: a.usuario ?? d.apertura.usuario } }),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  colorDiferencia(a: Apertura): string {
    if (a.montoDiferencia === null || a.montoDiferencia === 0) return 'text-gray-500';
    return a.montoDiferencia < 0 ? 'text-red-500 font-semibold' : 'text-amber-500 font-semibold';
  }

  filas(d: CajaConResumen): [string, number][] {
    const r = d.resumen;
    return [
      ['Fondo inicial', r.montoInicial], ['Ventas en efectivo', r.ventasEfectivo], ['Ventas con tarjeta', r.ventasTarjeta],
      ['Ventas por QR (cobradas)', r.ventasQr], ['Ventas MIXTO', r.ventasMixto],
      ['Ingresos de caja', r.ingresos], ['Egresos de caja', r.egresos],
    ];
  }
}
