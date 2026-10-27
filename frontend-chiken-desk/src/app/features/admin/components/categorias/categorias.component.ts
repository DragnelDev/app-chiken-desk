import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../../../core/services/api.services';
import { mensajeError } from '../../../../core/utils/error';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Categoria } from '../../../../shared/models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Categorías</h1>
      <button type="button" class="btn" (click)="nueva()">+ Nueva categoría</button>
    </div>

    @if (error()) {
      <p class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ error() }}</p>
    }

    <div class="card">
      <table class="w-full text-left text-sm">
        <thead><tr class="border-b border-gray-100 dark:border-surface-dark-border"><th class="th">Nombre</th><th class="th">Descripción</th><th class="th text-right">Acciones</th></tr></thead>
        <tbody>
          @for (c of categorias(); track c.idCategoria) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="td font-medium">{{ c.nombre }}</td>
              <td class="td text-gray-500">{{ c.descripcion }}</td>
              <td class="td space-x-2 text-right">
                <button type="button" class="btn-ghost" (click)="editar(c)">Editar</button>
                <button type="button" class="btn-danger" (click)="eliminar(c)">Eliminar</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="3" class="py-6 text-center text-gray-400">No hay categorías.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (abierto()) {
      <app-modal [titulo]="editandoId() ? 'Editar categoría' : 'Nueva categoría'" (cerrar)="abierto.set(false)">
        <label class="label">Nombre</label>
        <input class="input mb-3" [(ngModel)]="form.nombre" maxlength="80" />
        <label class="label">Descripción</label>
        <input class="input mb-4" [(ngModel)]="form.descripcion" maxlength="255" />
        @if (errorForm()) { <p class="mb-3 text-sm text-red-500">{{ errorForm() }}</p> }
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-ghost" (click)="abierto.set(false)">Cancelar</button>
          <button type="button" class="btn" [disabled]="!form.nombre.trim() || guardando()" (click)="guardar()">Guardar</button>
        </div>
      </app-modal>
    }
  `,
})
export class CategoriasComponent implements OnInit {
  private readonly service = inject(CategoriaService);

  readonly categorias = signal<Categoria[]>([]);
  readonly error = signal<string | null>(null);
  readonly abierto = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly guardando = signal(false);
  readonly errorForm = signal<string | null>(null);
  form = { nombre: '', descripcion: '' };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.listar().subscribe({
      next: (c) => this.categorias.set(c),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  nueva(): void {
    this.form = { nombre: '', descripcion: '' };
    this.editandoId.set(null);
    this.errorForm.set(null);
    this.abierto.set(true);
  }

  editar(c: Categoria): void {
    this.form = { nombre: c.nombre, descripcion: c.descripcion ?? '' };
    this.editandoId.set(c.idCategoria);
    this.errorForm.set(null);
    this.abierto.set(true);
  }

  guardar(): void {
    this.guardando.set(true);
    const dto = { nombre: this.form.nombre.trim(), descripcion: this.form.descripcion.trim() || undefined };
    const id = this.editandoId();
    (id ? this.service.actualizar(id, dto) : this.service.crear(dto)).subscribe({
      next: () => {
        this.guardando.set(false);
        this.abierto.set(false);
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        this.errorForm.set(mensajeError(e));
      },
    });
  }

  eliminar(c: Categoria): void {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    this.error.set(null);
    this.service.eliminar(c.idCategoria).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
