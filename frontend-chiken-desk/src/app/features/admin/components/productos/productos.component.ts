import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaService, ProductoService } from '../../../../core/services/api.services';
import { mensajeError } from '../../../../core/utils/error';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Categoria, ImagenProducto, Producto } from '../../../../shared/models';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

interface FormProducto {
  idCategoria: number | null;
  codigoBarra: string;
  nombre: string;
  descripcion: string;
  precioVenta: number | null;
  stock: number;
  permiteCambioGuarnicion: boolean;
}

const FORM_VACIO = (): FormProducto => ({
  idCategoria: null, codigoBarra: '', nombre: '', descripcion: '',
  precioVenta: null, stock: 0, permiteCambioGuarnicion: false,
});

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, ModalComponent],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
      <div class="flex gap-2">
        <input class="input w-56" placeholder="Buscar por nombre…" [(ngModel)]="busqueda" (ngModelChange)="cargar()" />
        <button type="button" class="btn" (click)="nuevo()">+ Nuevo producto</button>
      </div>
    </div>

    @if (error()) {
      <p class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ error() }}</p>
    }

    <div class="card overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-surface-dark-border">
            <th class="th">Imagen</th><th class="th">Producto</th><th class="th">Categoría</th>
            <th class="th text-right">Precio</th><th class="th text-right">Stock</th><th class="th text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (p of productos(); track p.idProducto) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="td">
                @if (p.imagenPrincipalUrl) {
                  <img [src]="p.imagenPrincipalUrl" [alt]="p.nombre" class="h-12 w-12 rounded-lg object-cover" />
                } @else {
                  <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xl dark:bg-surface-dark-border">🍗</div>
                }
              </td>
              <td class="td">
                <p class="font-medium">{{ p.nombre }}</p>
                @if (p.codigoBarra) { <p class="text-xs text-gray-400">{{ p.codigoBarra }}</p> }
              </td>
              <td class="td">{{ p.categoria?.nombre }}</td>
              <td class="td text-right">{{ p.precioVenta | currency: 'BOB' : 'Bs ' : '1.2-2' }}</td>
              <td class="td text-right">
                <span class="badge" [class]="p.stock <= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'">{{ p.stock }}</span>
              </td>
              <td class="td space-x-1 text-right">
                <button type="button" class="btn-ghost" (click)="abrirStock(p)">± Stock</button>
                <button type="button" class="btn-ghost" (click)="editar(p)">Editar</button>
                <button type="button" class="btn-danger" (click)="eliminar(p)">Eliminar</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="py-6 text-center text-gray-400">No hay productos.</td></tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Crear / editar -->
    @if (abierto()) {
      <app-modal [titulo]="editandoId() ? 'Editar producto' : 'Nuevo producto'" ancho="max-w-2xl" (cerrar)="cerrarForm()">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="label">Nombre</label>
            <input class="input" [(ngModel)]="form.nombre" maxlength="120" />
          </div>
          <div>
            <label class="label">Categoría</label>
            <select class="input" [(ngModel)]="form.idCategoria">
              <option [ngValue]="null" disabled>Selecciona…</option>
              @for (c of categorias(); track c.idCategoria) { <option [ngValue]="c.idCategoria">{{ c.nombre }}</option> }
            </select>
          </div>
          <div>
            <label class="label">Código de barra (opcional)</label>
            <input class="input" [(ngModel)]="form.codigoBarra" maxlength="50" />
          </div>
          <div>
            <label class="label">Precio de venta (Bs)</label>
            <input class="input" type="number" min="0" step="0.01" [(ngModel)]="form.precioVenta" />
          </div>
          <div>
            <label class="label">{{ editandoId() ? 'Stock (usa "± Stock" para ajustar)' : 'Stock inicial' }}</label>
            <input class="input" type="number" min="0" step="1" [(ngModel)]="form.stock" [disabled]="!!editandoId()" />
          </div>
          <div class="sm:col-span-2">
            <label class="label">Descripción</label>
            <input class="input" [(ngModel)]="form.descripcion" maxlength="500" />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 sm:col-span-2">
            <input type="checkbox" [(ngModel)]="form.permiteCambioGuarnicion" /> Permite cambio de guarnición
          </label>

          <!-- Imágenes -->
          <div class="sm:col-span-2">
            <label class="label">Imagen {{ editandoId() ? '(se sube al instante)' : '(se sube al guardar)' }}</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" class="text-sm text-gray-500" (change)="elegirArchivo($event)" />
            @if (editandoId() && archivo()) {
              <button type="button" class="btn-ghost ml-2" [disabled]="subiendo()" (click)="subirAhora()">{{ subiendo() ? 'Subiendo…' : 'Subir' }}</button>
            }
            @if (errorImagen()) { <p class="mt-1 text-sm text-red-500">{{ errorImagen() }}</p> }
            @if (archivo(); as a) { <p class="mt-1 text-xs text-gray-400">{{ a.name }} · {{ (a.size / 1024).toFixed(0) }} KB</p> }

            @if (imagenes().length) {
              <div class="mt-3 flex flex-wrap gap-3">
                @for (img of imagenes(); track img.idImagen) {
                  <div class="w-24 text-center">
                    <img [src]="img.urlImagen" alt="" class="h-24 w-24 rounded-lg object-cover" [class.ring-2]="img.esPrincipal" [class.ring-brand]="img.esPrincipal" />
                    <div class="mt-1 flex justify-center gap-1 text-[11px]">
                      @if (img.esPrincipal) { <span class="font-semibold text-brand">Principal</span> }
                      @else { <button type="button" class="text-blue-500 hover:underline" (click)="hacerPrincipal(img)">Principal</button> }
                      <button type="button" class="text-red-500 hover:underline" (click)="quitarImagen(img)">Quitar</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        @if (errorForm()) { <p class="mt-3 text-sm text-red-500">{{ errorForm() }}</p> }
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="btn-ghost" (click)="cerrarForm()">Cerrar</button>
          <button type="button" class="btn" [disabled]="!valido() || guardando()" (click)="guardar()">{{ guardando() ? 'Guardando…' : 'Guardar' }}</button>
        </div>
      </app-modal>
    }

    <!-- Ajuste de stock -->
    @if (stockDe(); as p) {
      <app-modal [titulo]="'Ajustar stock · ' + p.nombre" ancho="max-w-sm" (cerrar)="stockDe.set(null)">
        <p class="mb-3 text-sm text-gray-500">Stock actual: <b>{{ p.stock }}</b>. Usa un número positivo para reponer y negativo para descontar (merma).</p>
        <input class="input mb-3" type="number" step="1" [(ngModel)]="deltaStock" />
        @if (errorForm()) { <p class="mb-3 text-sm text-red-500">{{ errorForm() }}</p> }
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-ghost" (click)="stockDe.set(null)">Cancelar</button>
          <button type="button" class="btn" [disabled]="!deltaStock || guardando()" (click)="aplicarStock(p)">Aplicar</button>
        </div>
      </app-modal>
    }
  `,
})
export class ProductosComponent implements OnInit {
  private readonly productosApi = inject(ProductoService);
  private readonly categoriasApi = inject(CategoriaService);

  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly imagenes = signal<ImagenProducto[]>([]);
  readonly error = signal<string | null>(null);
  readonly errorForm = signal<string | null>(null);
  readonly errorImagen = signal<string | null>(null);
  readonly abierto = signal(false);
  readonly guardando = signal(false);
  readonly subiendo = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly archivo = signal<File | null>(null);
  readonly stockDe = signal<Producto | null>(null);

  busqueda = '';
  deltaStock = 0;
  form: FormProducto = FORM_VACIO();

  ngOnInit(): void {
    this.categoriasApi.listar().subscribe((c) => this.categorias.set(c));
    this.cargar();
  }

  cargar(): void {
    this.productosApi.listar({ q: this.busqueda.trim() || undefined }).subscribe({
      next: (p) => this.productos.set(p),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  valido(): boolean {
    return !!this.form.nombre.trim() && this.form.idCategoria !== null && (this.form.precioVenta ?? -1) >= 0;
  }

  nuevo(): void {
    this.form = FORM_VACIO();
    this.reiniciarModal(null);
  }

  editar(p: Producto): void {
    this.form = {
      idCategoria: p.idCategoria, codigoBarra: p.codigoBarra ?? '', nombre: p.nombre,
      descripcion: p.descripcion ?? '', precioVenta: p.precioVenta, stock: p.stock,
      permiteCambioGuarnicion: p.permiteCambioGuarnicion,
    };
    this.reiniciarModal(p.idProducto);
    this.cargarImagenes(p.idProducto);
  }

  private reiniciarModal(id: number | null): void {
    this.editandoId.set(id);
    this.errorForm.set(null);
    this.errorImagen.set(null);
    this.archivo.set(null);
    this.imagenes.set([]);
    this.abierto.set(true);
  }

  cerrarForm(): void {
    this.abierto.set(false);
    this.cargar(); // refleja cambios de imágenes hechos con el modal abierto
  }

  elegirArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.errorImagen.set(null);
    if (archivo && !TIPOS_PERMITIDOS.includes(archivo.type)) {
      this.errorImagen.set('Solo se permiten imágenes JPG, PNG o WEBP.');
      input.value = '';
      this.archivo.set(null);
      return;
    }
    if (archivo && archivo.size > MAX_BYTES) {
      this.errorImagen.set('La imagen supera los 2 MB.');
      input.value = '';
      this.archivo.set(null);
      return;
    }
    this.archivo.set(archivo);
  }

  guardar(): void {
    this.guardando.set(true);
    this.errorForm.set(null);
    const base = {
      idCategoria: this.form.idCategoria!,
      codigoBarra: this.form.codigoBarra.trim() || undefined,
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim() || undefined,
      precioVenta: Number(this.form.precioVenta),
      permiteCambioGuarnicion: this.form.permiteCambioGuarnicion,
    };
    const id = this.editandoId();
    const peticion = id
      ? this.productosApi.actualizar(id, base)
      : this.productosApi.crear({ ...base, stock: Number(this.form.stock) || 0 });

    peticion.subscribe({
      next: (producto) => {
        // Producto nuevo con imagen elegida: se sube recién ahora que ya tiene id.
        const archivo = this.archivo();
        if (!id && archivo) {
          this.productosApi.subirImagen(producto.idProducto, archivo, true).subscribe({
            next: () => this.terminarGuardado(),
            error: (e) => {
              this.guardando.set(false);
              this.errorForm.set('El producto se creó, pero la imagen falló: ' + mensajeError(e));
              this.cargar();
            },
          });
        } else {
          this.terminarGuardado();
        }
      },
      error: (e) => {
        this.guardando.set(false);
        this.errorForm.set(mensajeError(e));
      },
    });
  }

  private terminarGuardado(): void {
    this.guardando.set(false);
    this.abierto.set(false);
    this.cargar();
  }

  // ----- imágenes (producto ya existente)
  private cargarImagenes(idProducto: number): void {
    this.productosApi.listarImagenes(idProducto).subscribe((i) => this.imagenes.set(i));
  }

  subirAhora(): void {
    const id = this.editandoId();
    const archivo = this.archivo();
    if (!id || !archivo) return;
    this.subiendo.set(true);
    this.errorImagen.set(null);
    this.productosApi.subirImagen(id, archivo).subscribe({
      next: () => {
        this.subiendo.set(false);
        this.archivo.set(null);
        this.cargarImagenes(id);
      },
      error: (e) => {
        this.subiendo.set(false);
        this.errorImagen.set(mensajeError(e, 'No se pudo subir la imagen'));
      },
    });
  }

  hacerPrincipal(img: ImagenProducto): void {
    this.productosApi.marcarImagenPrincipal(img.idImagen).subscribe({
      next: () => this.cargarImagenes(img.idProducto),
      error: (e) => this.errorImagen.set(mensajeError(e)),
    });
  }

  quitarImagen(img: ImagenProducto): void {
    if (!confirm('¿Quitar esta imagen?')) return;
    this.productosApi.eliminarImagen(img.idImagen).subscribe({
      next: () => this.cargarImagenes(img.idProducto),
      error: (e) => this.errorImagen.set(mensajeError(e)),
    });
  }

  // ----- stock y borrado
  abrirStock(p: Producto): void {
    this.deltaStock = 0;
    this.errorForm.set(null);
    this.stockDe.set(p);
  }

  aplicarStock(p: Producto): void {
    this.guardando.set(true);
    this.productosApi.ajustarStock(p.idProducto, Number(this.deltaStock)).subscribe({
      next: () => {
        this.guardando.set(false);
        this.stockDe.set(null);
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        this.errorForm.set(mensajeError(e));
      },
    });
  }

  eliminar(p: Producto): void {
    if (!confirm(`¿Eliminar "${p.nombre}"? Dejará de aparecer en el menú y el POS.`)) return;
    this.productosApi.eliminar(p.idProducto).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
