import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ProductoService } from '../../../../core/services/api.services';
import { Producto } from '../../../../shared/models';

/** Menú público: GET /productos (solo lectura, sin sesión). */
@Component({
  selector: 'app-public-menu',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <section id="menu" class="mx-auto max-w-6xl px-6 py-20">
      <h2 class="mb-10 text-center text-3xl font-bold text-gray-900 dark:text-white">Nuestro menú</h2>

      @if (cargando()) {
        <p class="text-center text-sm text-gray-400">Cargando el menú…</p>
      } @else if (fallo()) {
        <p class="text-center text-sm text-gray-400">El menú no está disponible en este momento. Vuelve a intentarlo en unos minutos.</p>
      } @else {
        @for (grupo of grupos(); track grupo.categoria) {
          <h3 class="mb-4 mt-8 text-lg font-semibold text-brand">{{ grupo.categoria }}</h3>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (p of grupo.productos; track p.idProducto) {
              <article class="overflow-hidden rounded-xl2 bg-surface-light-card shadow-sm dark:bg-surface-dark-card" [class.opacity-60]="p.stock === 0">
                @if (p.imagenPrincipalUrl) {
                  <img [src]="p.imagenPrincipalUrl" [alt]="p.nombre" class="h-44 w-full object-cover" loading="lazy" />
                } @else {
                  <div class="flex h-44 w-full items-center justify-center bg-gray-100 text-5xl dark:bg-surface-dark-border">🍗</div>
                }
                <div class="p-5">
                  <h4 class="mb-1 font-semibold text-gray-900 dark:text-white">{{ p.nombre }}</h4>
                  @if (p.descripcion) { <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">{{ p.descripcion }}</p> }
                  <div class="flex items-center justify-between">
                    <span class="text-lg font-bold text-brand">{{ p.precioVenta | currency: 'BOB' : 'Bs ' : '1.2-2' }}</span>
                    @if (p.stock === 0) { <span class="text-xs font-semibold text-red-500">Agotado</span> }
                  </div>
                </div>
              </article>
            }
          </div>
        } @empty {
          <p class="text-center text-sm text-gray-400">Pronto publicaremos nuestro menú.</p>
        }
      }
    </section>
  `,
})
export class PublicMenuComponent implements OnInit {
  private readonly productosApi = inject(ProductoService);

  private readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly fallo = signal(false);

  readonly grupos = computed(() => {
    const mapa = new Map<string, Producto[]>();
    for (const p of this.productos()) {
      const clave = p.categoria?.nombre ?? 'Otros';
      mapa.set(clave, [...(mapa.get(clave) ?? []), p]);
    }
    return [...mapa].map(([categoria, productos]) => ({ categoria, productos }));
  });

  ngOnInit(): void {
    this.productosApi.listar().subscribe({
      next: (p) => {
        this.productos.set(p);
        this.cargando.set(false);
      },
      error: () => {
        this.fallo.set(true);
        this.cargando.set(false);
      },
    });
  }
}
