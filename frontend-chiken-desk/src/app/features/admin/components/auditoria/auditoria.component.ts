import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditoriaService } from '../../../../core/services/api.services';
import { mensajeError } from '../../../../core/utils/error';
import { LogAuditoria, Paginado } from '../../../../shared/models';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Auditoría</h1>

    <div class="card mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <label class="label">Tabla</label>
        <select class="input" [(ngModel)]="filtro.tabla">
          <option value="">Todas</option>
          @for (t of tablas; track t) { <option [value]="t">{{ t }}</option> }
        </select>
      </div>
      <div>
        <label class="label">Acción</label>
        <select class="input" [(ngModel)]="filtro.accion">
          <option value="">Todas</option>
          @for (a of acciones; track a) { <option [value]="a">{{ a }}</option> }
        </select>
      </div>
      <div><label class="label">Desde</label><input class="input" type="date" [(ngModel)]="filtro.desde" /></div>
      <div><label class="label">Hasta</label><input class="input" type="date" [(ngModel)]="filtro.hasta" /></div>
      <div class="flex items-end"><button type="button" class="btn w-full" (click)="buscar(1)">Buscar</button></div>
    </div>

    @if (error()) {
      <p class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ error() }}</p>
    }

    <div class="card overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-surface-dark-border">
            <th class="th">Fecha</th><th class="th">Usuario</th><th class="th">Tabla</th><th class="th">Acción</th><th class="th">IP</th><th class="th">Detalle</th>
          </tr>
        </thead>
        <tbody>
          @for (l of pagina()?.data ?? []; track l.idLog) {
            <tr class="border-b border-gray-50 align-top dark:border-surface-dark-border">
              <td class="td whitespace-nowrap">{{ l.fechaEvento | date: 'dd/MM/yy HH:mm:ss' }}</td>
              <td class="td">{{ l.idUsuario ?? '—' }}</td>
              <td class="td">{{ l.tablaAfectada }}</td>
              <td class="td"><span class="badge bg-gray-100 text-gray-700 dark:bg-surface-dark-border dark:text-gray-200">{{ l.accion }}</span></td>
              <td class="td">{{ l.ipOrigen ?? '—' }}</td>
              <td class="td">
                <details>
                  <summary class="cursor-pointer text-xs text-brand">ver</summary>
                  @if (l.valoresAnteriores) { <pre class="mt-1 max-w-md overflow-x-auto text-[11px] text-gray-500">Antes: {{ l.valoresAnteriores }}</pre> }
                  @if (l.valoresNuevos) { <pre class="mt-1 max-w-md overflow-x-auto text-[11px] text-gray-500">Después: {{ l.valoresNuevos }}</pre> }
                </details>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="py-6 text-center text-gray-400">Sin eventos.</td></tr>
          }
        </tbody>
      </table>
      @if (pagina(); as p) {
        <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>{{ p.total }} evento(s)</span>
          <div class="space-x-2">
            <button type="button" class="btn-ghost" [disabled]="p.page <= 1" (click)="buscar(p.page - 1)">‹ Anterior</button>
            <button type="button" class="btn-ghost" [disabled]="p.page * p.limit >= p.total" (click)="buscar(p.page + 1)">Siguiente ›</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class AuditoriaComponent implements OnInit {
  private readonly service = inject(AuditoriaService);

  readonly pagina = signal<Paginado<LogAuditoria> | null>(null);
  readonly error = signal<string | null>(null);
  readonly tablas = ['usuarios', 'roles', 'categorias', 'productos', 'imagenes_producto', 'aperturas_caja', 'movimientos_caja', 'ventas', 'ventas_detalle', 'pagos_qr'];
  readonly acciones = ['INSERT', 'UPDATE', 'DELETE', 'ANULACION_VENTA', 'LOGIN'];
  filtro = { tabla: '', accion: '', desde: '', hasta: '' };

  ngOnInit(): void {
    this.buscar(1);
  }

  buscar(page: number): void {
    this.error.set(null);
    this.service.buscar({ ...this.filtro, page, limit: 30 }).subscribe({
      next: (p) => this.pagina.set(p),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
