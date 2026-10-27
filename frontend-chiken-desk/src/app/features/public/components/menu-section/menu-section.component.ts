import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductoService } from '../../../../core/services/producto.service';
import { Producto } from '../../../../shared/models';

// Menú de ejemplo mientras se conecta el backend; misma forma que Producto
// para que la migración a datos reales de GET /productos sea directa.
const MENU_EJEMPLO: Producto[] = [
  {
    id: 1,
    nombre: 'Lomo Saltado Especial',
    precioUnitario: 50,
    categoria: 'Platos Principales',
    imagenUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    disponible: true,
  },
  {
    id: 2,
    nombre: 'Pizza Artesanal de la Casa',
    precioUnitario: 45,
    categoria: 'Platos Principales',
    imagenUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80',
    disponible: true,
  },
  {
    id: 3,
    nombre: 'Cócteles y Refrescos',
    precioUnitario: 15,
    categoria: 'Bebidas',
    imagenUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80',
    disponible: true,
  },
];

/** Menú público — GET /productos con imágenes servidas desde Cloudinary. */
@Component({
  selector: 'app-public-menu',
  standalone: true,
  template: `
    <section id="menu" class="mx-auto max-w-6xl px-6 py-20">
      <h2 class="mb-10 text-center text-3xl font-bold text-gray-900 dark:text-white">Nuestro Menú Destacado</h2>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (producto of productos(); track producto.id) {
          <div class="overflow-hidden rounded-xl2 bg-surface-light-card shadow-sm dark:bg-surface-dark-card">
            <img [src]="producto.imagenUrl" [alt]="producto.nombre" class="h-44 w-full object-cover" />
            <div class="p-5">
              <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">{{ producto.categoria }}</p>
              <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">{{ producto.nombre }}</h3>
              <span class="text-lg font-bold text-brand">&#36;{{ producto.precioUnitario.toFixed(2) }}</span>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class PublicMenuComponent implements OnInit {
  private readonly productoService = inject(ProductoService);

  readonly productos = signal<Producto[]>(MENU_EJEMPLO);

  ngOnInit(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => this.productos.set(data),
      // Si el backend aún no está desplegado, se conserva el menú de ejemplo.
      error: () => {},
    });
  }
}
