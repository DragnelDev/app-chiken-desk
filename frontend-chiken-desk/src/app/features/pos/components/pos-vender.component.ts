import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CajaService,
  CategoriaService,
  PagoQrService,
  ProductoService,
  VentaService,
} from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { mensajeError } from '../../../core/utils/error';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TicketComponent } from '../../../shared/components/ticket/ticket.component';
import {
  Categoria,
  ItemCarrito,
  MetodoPago,
  PagoQr,
  Producto,
  TipoPedido,
  Venta,
  VentaCreada,
} from '../../../shared/models';

const SONDEO_MS = 3000;

@Component({
  selector: 'app-pos-vender',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe, ModalComponent, TicketComponent],
  template: `
    @if (cajaAbierta() === null) {
      <p class="text-sm text-gray-400">Cargando…</p>
    } @else if (cajaAbierta() === false) {
      <div class="card max-w-md">
        <h1 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Caja cerrada</h1>
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">Para registrar ventas primero debes abrir tu caja del turno.</p>
        <a routerLink="/pos/caja" class="btn">Ir a abrir caja</a>
      </div>
    } @else {
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        <!-- ============ Catálogo ============ -->
        <section>
          <div class="mb-4 flex flex-wrap gap-2">
            <input class="input w-56" placeholder="Buscar producto…" [(ngModel)]="busqueda" />
            <input class="input w-56" placeholder="Código de barras + Enter" [(ngModel)]="codigo" (keyup.enter)="agregarPorCodigo()" />
            <button type="button" class="btn-ghost" (click)="cargarProductos()">↻ Stock</button>
          </div>

          <div class="mb-4 flex flex-wrap gap-2">
            <button type="button" class="badge" [class]="chip(null)" (click)="categoriaSel.set(null)">Todas</button>
            @for (c of categorias(); track c.idCategoria) {
              <button type="button" class="badge" [class]="chip(c.idCategoria)" (click)="categoriaSel.set(c.idCategoria)">{{ c.nombre }}</button>
            }
          </div>

          @if (errorCatalogo()) { <p class="mb-3 text-sm text-red-500">{{ errorCatalogo() }}</p> }

          <div class="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
            @for (p of filtrados(); track p.idProducto) {
              <button
                type="button"
                class="overflow-hidden rounded-xl2 bg-surface-light-card text-left shadow-sm transition hover:shadow-md disabled:opacity-40 dark:bg-surface-dark-card"
                [disabled]="!puedeAgregar(p)"
                (click)="agregar(p)"
              >
                @if (p.imagenPrincipalUrl) {
                  <img [src]="p.imagenPrincipalUrl" [alt]="p.nombre" class="h-28 w-full object-cover" />
                } @else {
                  <div class="flex h-28 w-full items-center justify-center bg-gray-100 text-4xl dark:bg-surface-dark-border">🍗</div>
                }
                <div class="p-3">
                  <p class="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{{ p.nombre }}</p>
                  <p class="mt-1 text-sm font-bold text-brand">{{ p.precioVenta | currency: 'BOB' : 'Bs ' : '1.2-2' }}</p>
                  <p class="text-xs" [class]="p.stock <= 5 ? 'text-red-500' : 'text-gray-400'">{{ p.stock === 0 ? 'Agotado' : 'Stock: ' + p.stock }}</p>
                </div>
              </button>
            } @empty {
              <p class="col-span-full text-sm text-gray-400">No hay productos para mostrar.</p>
            }
          </div>
        </section>

        <!-- ============ Carrito ============ -->
        <aside class="card h-fit xl:sticky xl:top-0">
          <h2 class="mb-3 font-semibold text-gray-900 dark:text-white">Pedido actual</h2>

          @for (item of carrito(); track item.producto.idProducto) {
            <div class="mb-3 border-b border-gray-100 pb-3 dark:border-surface-dark-border">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.producto.nombre }}</p>
                <button type="button" class="text-xs text-gray-400 hover:text-red-500" (click)="quitar(item)">✕</button>
              </div>
              <div class="mt-1 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <button type="button" class="btn-ghost h-7 w-7 !p-0" (click)="cambiar(item, -1)">−</button>
                  <span class="w-6 text-center text-sm">{{ item.cantidad }}</span>
                  <button type="button" class="btn-ghost h-7 w-7 !p-0" [disabled]="item.cantidad >= item.producto.stock" (click)="cambiar(item, 1)">+</button>
                </div>
                <span class="text-sm font-semibold">{{ item.cantidad * item.producto.precioVenta | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span>
              </div>
              <input class="input mt-2 !py-1 text-xs" placeholder="Observación (sin mayonesa, papas extra…)" maxlength="255" [ngModel]="item.observacion" (ngModelChange)="observar(item, $event)" />
            </div>
          } @empty {
            <p class="mb-3 text-sm text-gray-400">Toca un producto para agregarlo.</p>
          }

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="label">Pedido</label>
              <select class="input" [(ngModel)]="tipoPedido">
                <option value="MESA">Mesa</option><option value="LLEVAR">Llevar</option><option value="DELIVERY">Delivery</option>
              </select>
            </div>
            <div>
              <label class="label">Pago</label>
              <select class="input" [(ngModel)]="metodoPago">
                <option value="EFECTIVO">Efectivo</option><option value="QR">QR</option><option value="TARJETA">Tarjeta</option><option value="MIXTO">Mixto</option>
              </select>
            </div>
            <div><label class="label">Cliente</label><input class="input" [(ngModel)]="clienteNombre" maxlength="150" placeholder="Opcional" /></div>
            <div><label class="label">NIT / CI</label><input class="input" [(ngModel)]="clienteNitCi" maxlength="20" placeholder="Opcional" /></div>
            <div class="col-span-2"><label class="label">Descuento (Bs)</label><input class="input" type="number" min="0" step="0.01" [(ngModel)]="descuento" /></div>
          </div>

          <div class="mt-4 space-y-1 text-sm">
            <div class="flex justify-between text-gray-500"><span>Subtotal</span><span>{{ subtotal() | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
            <div class="flex justify-between text-gray-500"><span>Descuento</span><span>-{{ descuentoValido() | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
            <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white"><span>Total</span><span>{{ total() | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span></div>
          </div>

          @if (errorVenta()) { <p class="mt-3 text-sm text-red-500">{{ errorVenta() }}</p> }
          @if (descuentoExcedido()) { <p class="mt-3 text-sm text-red-500">El descuento no puede superar el subtotal.</p> }

          <div class="mt-4 flex gap-2">
            <button type="button" class="btn-ghost" [disabled]="!carrito().length" (click)="limpiar()">Vaciar</button>
            <button type="button" class="btn flex-1" [disabled]="!carrito().length || procesando() || descuentoExcedido()" (click)="cobrar()">
              {{ procesando() ? 'Procesando…' : 'Cobrar ' + (total() | currency: 'BOB' : 'Bs ' : '1.2-2') }}
            </button>
          </div>
        </aside>
      </div>
    }

    <!-- ============ Cobro por QR ============ -->
    @if (ventaQr(); as v) {
      <app-modal titulo="Cobro por QR" ancho="max-w-sm" (cerrar)="cerrarQr()">
        <p class="mb-2 text-center text-sm text-gray-500">Ticket {{ v.numeroFacturaTicket }} · {{ v.montoTotal | currency: 'BOB' : 'Bs ' : '1.2-2' }}</p>

        @if (pagoQr(); as q) {
          @if (q.estadoPago === 'PENDIENTE' && q.qrImagenBase64) {
            <img [src]="q.qrImagenBase64" alt="Código QR de pago" class="mx-auto h-64 w-64" />
            <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">Esperando el pago… vence en <b>{{ restante() }}</b></p>
          } @else if (q.estadoPago === 'PENDIENTE') {
            <p class="my-6 text-center text-sm text-gray-500">Esperando el pago…</p>
          } @else if (q.estadoPago === 'EXPIRADO') {
            <p class="my-6 text-center text-sm font-semibold text-red-500">El QR venció.</p>
          }
        } @else {
          <p class="my-6 text-center text-sm text-amber-600">No se pudo generar el QR. Intenta de nuevo.</p>
        }

        @if (errorQr()) { <p class="mt-2 text-center text-sm text-red-500">{{ errorQr() }}</p> }

        <div class="mt-4 flex flex-wrap justify-center gap-2">
          @if (!pagoQr() || pagoQr()?.estadoPago === 'EXPIRADO') {
            <button type="button" class="btn" [disabled]="procesando()" (click)="regenerarQr(v)">{{ pagoQr() ? 'Regenerar QR' : 'Generar QR' }}</button>
          }
          @if (auth.esAdmin() && pagoQr()?.estadoPago === 'PENDIENTE') {
            <button type="button" class="btn-ghost" (click)="confirmarManual()">Confirmar manualmente (supervisor)</button>
          }
          <button type="button" class="btn-danger" [disabled]="procesando()" (click)="cancelarQr(v)">Cancelar y anular venta</button>
        </div>
      </app-modal>
    }

    <!-- ============ Ticket ============ -->
    @if (ticket(); as t) {
      <app-modal titulo="Venta registrada" ancho="max-w-md" (cerrar)="ticket.set(null)">
        <app-ticket [venta]="t" />
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="btn-ghost" (click)="imprimir()">🖨 Imprimir</button>
          <button type="button" class="btn" (click)="ticket.set(null)">Nueva venta</button>
        </div>
      </app-modal>
    }
  `,
})
export class PosVenderComponent implements OnInit, OnDestroy {
  private readonly productosApi = inject(ProductoService);
  private readonly categoriasApi = inject(CategoriaService);
  private readonly cajasApi = inject(CajaService);
  private readonly ventasApi = inject(VentaService);
  private readonly qrApi = inject(PagoQrService);
  readonly auth = inject(AuthService);

  // catálogo
  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly categoriaSel = signal<number | null>(null);
  readonly cajaAbierta = signal<boolean | null>(null);
  readonly errorCatalogo = signal<string | null>(null);
  busquedaTexto = signal('');
  codigo = '';

  // carrito
  readonly carrito = signal<ItemCarrito[]>([]);
  tipoPedido: TipoPedido = 'MESA';
  metodoPago: MetodoPago = 'EFECTIVO';
  clienteNombre = '';
  clienteNitCi = '';
  descuentoSig = signal(0);
  readonly procesando = signal(false);
  readonly errorVenta = signal<string | null>(null);

  // QR y ticket
  readonly ventaQr = signal<Venta | null>(null);
  readonly pagoQr = signal<PagoQr | null>(null);
  readonly errorQr = signal<string | null>(null);
  readonly ticket = signal<Venta | null>(null);
  private readonly ahora = signal(Date.now());
  private sondeo?: ReturnType<typeof setInterval>;
  private reloj?: ReturnType<typeof setInterval>;

  get busqueda(): string { return this.busquedaTexto(); }
  set busqueda(v: string) { this.busquedaTexto.set(v); }
  get descuento(): number { return this.descuentoSig(); }
  set descuento(v: number) { this.descuentoSig.set(Number(v) || 0); }

  readonly filtrados = computed(() => {
    const cat = this.categoriaSel();
    const q = this.busquedaTexto().trim().toLowerCase();
    return this.productos().filter(
      (p) => (cat === null || p.idCategoria === cat) && (!q || p.nombre.toLowerCase().includes(q)),
    );
  });

  readonly subtotal = computed(() =>
    Math.round(this.carrito().reduce((s, i) => s + i.cantidad * i.producto.precioVenta, 0) * 100) / 100,
  );
  readonly descuentoExcedido = computed(() => this.descuentoSig() > this.subtotal());
  readonly descuentoValido = computed(() => (this.descuentoExcedido() ? 0 : Math.max(0, this.descuentoSig())));
  readonly total = computed(() => Math.round((this.subtotal() - this.descuentoValido()) * 100) / 100);

  readonly restante = computed(() => {
    const q = this.pagoQr();
    if (!q) return '';
    const seg = Math.max(0, Math.floor((new Date(q.fechaExpiracion).getTime() - this.ahora()) / 1000));
    return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`;
  });

  ngOnInit(): void {
    this.cajasApi.actual().subscribe({
      next: (c) => this.cajaAbierta.set(!!c),
      error: () => this.cajaAbierta.set(false),
    });
    this.categoriasApi.listar().subscribe((c) => this.categorias.set(c));
    this.cargarProductos();
  }

  ngOnDestroy(): void {
    this.detenerQr();
  }

  cargarProductos(): void {
    this.productosApi.listar().subscribe({
      next: (p) => this.productos.set(p),
      error: (e) => this.errorCatalogo.set(mensajeError(e, 'No se pudo cargar el catálogo')),
    });
  }

  chip(id: number | null): string {
    return this.categoriaSel() === id
      ? 'bg-brand text-white'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-surface-dark-card dark:text-gray-300';
  }

  // ---------------------------------------------------------------- carrito
  private cantidadEnCarrito(p: Producto): number {
    return this.carrito().find((i) => i.producto.idProducto === p.idProducto)?.cantidad ?? 0;
  }

  puedeAgregar(p: Producto): boolean {
    return p.stock > this.cantidadEnCarrito(p);
  }

  agregar(p: Producto): void {
    if (!this.puedeAgregar(p)) return;
    this.errorVenta.set(null);
    this.carrito.update((items) => {
      const existe = items.find((i) => i.producto.idProducto === p.idProducto);
      return existe
        ? items.map((i) => (i === existe ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [...items, { producto: p, cantidad: 1, observacion: '' }];
    });
  }

  agregarPorCodigo(): void {
    const codigo = this.codigo.trim();
    if (!codigo) return;
    this.productosApi.porCodigoBarra(codigo).subscribe({
      next: (p) => {
        const actual = this.productos().find((x) => x.idProducto === p.idProducto) ?? p;
        this.agregar(actual);
        this.codigo = '';
        this.errorCatalogo.set(null);
      },
      error: (e) => this.errorCatalogo.set(mensajeError(e, 'Código no encontrado')),
    });
  }

  cambiar(item: ItemCarrito, delta: number): void {
    const nueva = item.cantidad + delta;
    if (nueva < 1) return this.quitar(item);
    if (nueva > item.producto.stock) return;
    this.carrito.update((items) => items.map((i) => (i === item ? { ...i, cantidad: nueva } : i)));
  }

  observar(item: ItemCarrito, texto: string): void {
    // se actualiza por referencia de producto: el input no pierde el foco al escribir
    item.observacion = texto;
  }

  quitar(item: ItemCarrito): void {
    this.carrito.update((items) => items.filter((i) => i !== item));
  }

  limpiar(): void {
    this.carrito.set([]);
    this.descuentoSig.set(0);
    this.clienteNombre = '';
    this.clienteNitCi = '';
    this.errorVenta.set(null);
  }

  // ----------------------------------------------------------------- cobro
  cobrar(): void {
    this.procesando.set(true);
    this.errorVenta.set(null);

    this.ventasApi
      .crear({
        tipoPedido: this.tipoPedido,
        metodoPago: this.metodoPago,
        clienteNombre: this.clienteNombre.trim() || undefined,
        clienteNitCi: this.clienteNitCi.trim() || undefined,
        montoDescuento: this.descuentoValido() || undefined,
        detalles: this.carrito().map((i) => ({
          idProducto: i.producto.idProducto,
          cantidad: i.cantidad,
          observacion: i.observacion.trim() || undefined,
        })),
      })
      .subscribe({
        next: (venta) => {
          this.procesando.set(false);
          this.limpiar();
          this.metodoPago = 'EFECTIVO';
          this.cargarProductos(); // refleja el stock descontado
          if (venta.metodoPago === 'QR') this.iniciarQr(venta);
          else this.ticket.set(venta);
        },
        error: (e) => {
          this.procesando.set(false);
          this.errorVenta.set(mensajeError(e, 'No se pudo registrar la venta'));
          this.cargarProductos(); // el stock pudo haber cambiado
        },
      });
  }

  // -------------------------------------------------------------------- QR
  private iniciarQr(venta: VentaCreada): void {
    this.ventaQr.set(venta);
    this.pagoQr.set(venta.pagoQr);
    this.errorQr.set(null);
    this.ahora.set(Date.now());
    this.reloj = setInterval(() => this.ahora.set(Date.now()), 1000);
    this.sondeo = setInterval(() => this.consultarQr(), SONDEO_MS);
  }

  private detenerQr(): void {
    clearInterval(this.sondeo);
    clearInterval(this.reloj);
    this.sondeo = this.reloj = undefined;
  }

  cerrarQr(): void {
    // Cerrar la ventana NO anula la venta: queda registrada con su cobro pendiente.
    this.detenerQr();
    this.ventaQr.set(null);
    this.pagoQr.set(null);
  }

  private consultarQr(): void {
    const venta = this.ventaQr();
    if (!venta || !this.pagoQr()) return;
    this.qrApi.estado(venta.idVenta).subscribe({
      next: (estado) => {
        const actual = this.pagoQr();
        // se conserva la imagen que ya tenemos: el sondeo no la trae
        this.pagoQr.set({ ...estado, qrImagenBase64: actual?.qrImagenBase64 });
        if (estado.estadoPago === 'PROCESADO') this.mostrarTicketPagado(venta);
      },
      error: () => {}, // un fallo puntual de red no debe cortar el sondeo
    });
  }

  private mostrarTicketPagado(venta: Venta): void {
    this.detenerQr();
    this.ventaQr.set(null);
    this.pagoQr.set(null);
    this.ventasApi.detalle(venta.idVenta).subscribe((v) => this.ticket.set(v));
  }

  regenerarQr(venta: Venta): void {
    this.procesando.set(true);
    this.errorQr.set(null);
    this.qrApi.generar(venta.idVenta).subscribe({
      next: (pago) => {
        this.procesando.set(false);
        this.pagoQr.set(pago);
        if (!this.sondeo) this.sondeo = setInterval(() => this.consultarQr(), SONDEO_MS);
      },
      error: (e) => {
        this.procesando.set(false);
        this.errorQr.set(mensajeError(e));
      },
    });
  }

  confirmarManual(): void {
    const pago = this.pagoQr();
    const venta = this.ventaQr();
    if (!pago || !venta) return;
    this.qrApi.confirmarManual(pago.idPagoQr).subscribe({
      next: () => this.mostrarTicketPagado(venta),
      error: (e) => this.errorQr.set(mensajeError(e)),
    });
  }

  cancelarQr(venta: Venta): void {
    if (!confirm('¿Cancelar el cobro y anular la venta? Se devuelve el stock.')) return;
    this.procesando.set(true);
    this.ventasApi.anular(venta.idVenta, 'Cobro QR cancelado por el cajero').subscribe({
      next: () => {
        this.procesando.set(false);
        this.cerrarQr();
        this.cargarProductos();
      },
      error: (e) => {
        this.procesando.set(false);
        this.errorQr.set(mensajeError(e));
      },
    });
  }

  imprimir(): void {
    window.print();
  }
}
