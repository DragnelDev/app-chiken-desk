import { Component, signal } from '@angular/core';

interface ClienteUI { nombre: string; telefono: string; pedidos: number; }

/** Clientes — tabla `clientes` (comensales frecuentes / delivery). */
@Component({
  selector: 'app-contactos',
  standalone: true,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Clientes y Proveedores</h1>
      <button type="button" class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
        + Nuevo Registro
      </button>
    </div>

    <input placeholder="Buscar por nombre o NIT/CI..." class="mb-4 w-full max-w-md rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-surface-dark-border dark:text-white" />

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
            <th class="pb-3">Nombre</th><th class="pb-3">Teléfono</th><th class="pb-3">Historial</th><th class="pb-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (c of clientes(); track c.nombre) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="py-3 font-medium text-gray-900 dark:text-white">{{ c.nombre }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ c.telefono }}</td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ c.pedidos }} pedidos</td>
              <td class="py-3">
                <button type="button" class="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-surface-dark-border dark:text-gray-300 dark:hover:bg-surface-dark-border">
                  Ver
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ContactosComponent {
  readonly clientes = signal<ClienteUI[]>([
    { nombre: 'Ana García', telefono: '71234567', pedidos: 12 },
    { nombre: 'Roberto Salas', telefono: '76543210', pedidos: 5 },
  ]);
}
