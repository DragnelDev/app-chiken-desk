import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../../core/services/api.services';
import { mensajeError } from '../../../core/utils/error';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CajaConResumen, MovimientoCaja, TipoMovimiento } from '../../../shared/models';

@Component({
  selector: 'app-pos-caja',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, ModalComponent],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Mi caja</h1>

    @if (error()) {
      <p class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ error() }}</p>
    }

    @if (cargando()) {
      <p class="text-sm text-gray-400">Cargando…</p>
    } @else if (!caja()) {
      <!-- Sin caja abierta -->
      <div class="card max-w-md">
        <h2 class="mb-1 font-semibold text-gray-900 dark:text-white">Abrir caja</h2>
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">Ingresa el efectivo con el que inicias tu turno. Sin caja abierta no puedes vender.</p>
        <label class="label">Monto inicial (Bs)</label>
        <input class="input mb-4" type="number" min="0" step="0.01" [(ngModel)]="montoInicial" />
        <button type="button" class="btn w-full" [disabled]="montoInicial === null || montoInicial < 0 || procesando()" (click)="abrir()">Abrir caja</button>
      </div>
    } @else if (caja(); as c) {
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section class="card">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-semibold text-gray-900 dark:text-white">Turno abierto</h2>
            <span class="text-xs text-gray-400">desde {{ c.apertura.fechaApertura | date: 'dd/MM HH:mm' }}</span>
          </div>
          <div class="space-y-1 text-sm">
            @for (f of filas(c); track f[0]) {
              <div class="flex justify-between text-gray-600 dark:text-gray-300"><span>{{ f[0] }}</span><span>{{ f[1] | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
            }
            <hr class="my-2 border-gray-200 dark:border-surface-dark-border" />
            <div class="flex justify-between text-base font-bold text-gray-900 dark:text-white"><span>Efectivo esperado en caja</span><span>{{ c.resumen.efectivoEsperado | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
            <p class="pt-1 text-xs text-gray-400">{{ c.resumen.cantidadVentas }} venta(s) · {{ c.resumen.ventasAnuladas }} anulada(s)</p>
            @if (c.resumen.qrPendientes > 0) {
              <p class="rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Hay {{ c.resumen.qrPendientes }} cobro(s) QR pendientes: confírmalos o anula esas ventas antes de cerrar.</p>
            }
          </div>
          <button type="button" class="btn mt-4 w-full" (click)="cierreAbierto.set(true)">Cerrar caja</button>
        </section>

        <section class="card">
          <h2 class="mb-3 font-semibold text-gray-900 dark:text-white">Ingresos y egresos</h2>
          <div class="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
            <select class="input" [(ngModel)]="mov.tipo"><option value="EGRESO">Egreso</option><option value="INGRESO">Ingreso</option></select>
            <input class="input" type="number" min="0.01" step="0.01" placeholder="Monto" [(ngModel)]="mov.monto" />
            <input class="input sm:col-span-2" placeholder="Concepto (ej: compra de gas)" [(ngModel)]="mov.concepto" maxlength="255" />
          </div>
          <button type="button" class="btn-ghost mb-4" [disabled]="!movValido() || procesando()" (click)="registrarMovimiento()">+ Registrar</button>

          @for (m of movimientos(); track m.idMovimiento) {
            <div class="flex items-center justify-between border-b border-gray-50 py-2 text-sm dark:border-surface-dark-border">
              <div>
                <p class="text-gray-800 dark:text-gray-100">{{ m.concepto }}</p>
                <p class="text-xs text-gray-400">{{ m.fechaRegistro | date: 'HH:mm' }} · {{ m.usuarioRegistro }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span [class]="m.tipoMovimiento === 'INGRESO' ? 'font-semibold text-green-600' : 'font-semibold text-red-500'">{{ m.tipoMovimiento === 'INGRESO' ? '+' : '-' }}{{ m.monto | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span>
                <button type="button" class="text-xs text-gray-400 hover:text-red-500" title="Anular" (click)="anularMovimiento(m)">✕</button>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-gray-400">Sin movimientos en este turno.</p>
          }
        </section>
      </div>
    }

    <!-- Cierre -->
    @if (cierreAbierto() && caja(); as c) {
      <app-modal titulo="Cerrar caja" ancho="max-w-sm" (cerrar)="cierreAbierto.set(false)">
        <p class="mb-3 text-sm text-gray-500">Cuenta el efectivo físico e ingrésalo. El sistema calcula la diferencia contra lo esperado ({{ c.resumen.efectivoEsperado | currency: 'BOB' : 'Bs ' : '1.2-2' }}).</p>
        <label class="label">Efectivo contado (Bs)</label>
        <input class="input mb-3" type="number" min="0" step="0.01" [(ngModel)]="montoCierre" />
        @if (errorCierre()) { <p class="mb-3 text-sm text-red-500">{{ errorCierre() }}</p> }
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-ghost" (click)="cierreAbierto.set(false)">Cancelar</button>
          <button type="button" class="btn" [disabled]="montoCierre === null || montoCierre < 0 || procesando()" (click)="cerrar(c)">Confirmar cierre</button>
        </div>
      </app-modal>
    }

    @if (resultado(); as r) {
      <app-modal titulo="Caja cerrada" ancho="max-w-sm" (cerrar)="resultado.set(null)">
        <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <div class="flex justify-between"><span>Esperado</span><span>{{ r.resumen.efectivoEsperado | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
          <div class="flex justify-between"><span>Contado</span><span>{{ r.apertura.montoCierre | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
          <hr class="my-2 border-gray-200 dark:border-surface-dark-border" />
          <div class="flex justify-between text-base font-bold" [class]="(r.apertura.montoDiferencia ?? 0) === 0 ? 'text-green-600' : (r.apertura.montoDiferencia ?? 0) < 0 ? 'text-red-500' : 'text-amber-500'">
            <span>Diferencia</span>
            <span>{{ r.apertura.montoDiferencia | currency: 'BOB' : 'Bs ' : '1.2-2' }} {{ (r.apertura.montoDiferencia ?? 0) === 0 ? '(cuadrada)' : (r.apertura.montoDiferencia ?? 0) < 0 ? '(faltante)' : '(sobrante)' }}</span>
          </div>
        </div>
        <button type="button" class="btn mt-4 w-full" (click)="resultado.set(null)">Entendido</button>
      </app-modal>
    }
  `,
})
export class PosCajaComponent implements OnInit {
  private readonly service = inject(CajaService);

  readonly caja = signal<CajaConResumen | null>(null);
  readonly movimientos = signal<MovimientoCaja[]>([]);
  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorCierre = signal<string | null>(null);
  readonly cierreAbierto = signal(false);
  readonly resultado = signal<CajaConResumen | null>(null);

  montoInicial: number | null = 0;
  montoCierre: number | null = null;
  mov: { tipo: TipoMovimiento; monto: number | null; concepto: string } = { tipo: 'EGRESO', monto: null, concepto: '' };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.actual().subscribe({
      next: (c) => {
        this.caja.set(c);
        this.cargando.set(false);
        if (c) this.service.movimientos(c.apertura.idApertura).subscribe((m) => this.movimientos.set(m));
        else this.movimientos.set([]);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(mensajeError(e));
      },
    });
  }

  filas(c: CajaConResumen): [string, number][] {
    const r = c.resumen;
    return [
      ['Fondo inicial', r.montoInicial], ['Ventas en efectivo', r.ventasEfectivo], ['Ventas con tarjeta', r.ventasTarjeta],
      ['Ventas por QR (cobradas)', r.ventasQr], ['Ventas MIXTO (no entra al efectivo)', r.ventasMixto],
      ['Ingresos de caja', r.ingresos], ['Egresos de caja', r.egresos],
    ];
  }

  abrir(): void {
    this.procesando.set(true);
    this.error.set(null);
    this.service.abrir(Number(this.montoInicial)).subscribe({
      next: () => { this.procesando.set(false); this.cargar(); },
      error: (e) => { this.procesando.set(false); this.error.set(mensajeError(e)); },
    });
  }

  movValido(): boolean {
    return (this.mov.monto ?? 0) > 0 && this.mov.concepto.trim().length > 0;
  }

  registrarMovimiento(): void {
    this.procesando.set(true);
    this.error.set(null);
    this.service
      .registrarMovimiento({ tipoMovimiento: this.mov.tipo, monto: Number(this.mov.monto), concepto: this.mov.concepto.trim() })
      .subscribe({
        next: () => {
          this.procesando.set(false);
          this.mov = { tipo: 'EGRESO', monto: null, concepto: '' };
          this.cargar();
        },
        error: (e) => { this.procesando.set(false); this.error.set(mensajeError(e)); },
      });
  }

  anularMovimiento(m: MovimientoCaja): void {
    if (!confirm(`¿Anular el movimiento "${m.concepto}"?`)) return;
    this.service.anularMovimiento(m.idMovimiento).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  cerrar(c: CajaConResumen): void {
    this.procesando.set(true);
    this.errorCierre.set(null);
    this.service.cerrar(c.apertura.idApertura, Number(this.montoCierre)).subscribe({
      next: (res) => {
        this.procesando.set(false);
        this.cierreAbierto.set(false);
        this.resultado.set(res);
        this.montoCierre = null;
        this.cargar();
      },
      error: (e) => { this.procesando.set(false); this.errorCierre.set(mensajeError(e)); },
    });
  }
}
