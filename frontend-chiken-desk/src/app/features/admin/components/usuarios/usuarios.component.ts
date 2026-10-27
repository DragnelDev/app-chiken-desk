import { Component, signal } from '@angular/core';

type Rol = 'Admin' | 'Cajero' | 'Cocinero' | 'Mesero';
interface UsuarioUI { nombre: string; rol: Rol; permisos: string; }

const BADGE: Record<Rol, string> = {
  Admin: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cajero: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Cocinero: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Mesero: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

/** Usuarios y Roles — tabla `usuarios` + `roles` (permisos JSONB), según Informe de Base de Datos. */
@Component({
  selector: 'app-usuarios',
  standalone: true,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Usuarios y Permisos</h1>
      <button type="button" class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
        + Agregar Usuario
      </button>
    </div>

    <div class="rounded-xl2 bg-surface-light-card p-6 shadow-sm dark:bg-surface-dark-card">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-surface-dark-border dark:text-gray-500">
            <th class="pb-3">Usuario</th><th class="pb-3">Rol</th><th class="pb-3">Permisos</th><th class="pb-3">Acción</th>
          </tr>
        </thead>
        <tbody>
          @for (u of usuarios(); track u.nombre) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="py-3 font-medium text-gray-900 dark:text-white">{{ u.nombre }}</td>
              <td class="py-3"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" [class]="badge(u.rol)">{{ u.rol }}</span></td>
              <td class="py-3 text-gray-600 dark:text-gray-300">{{ u.permisos }}</td>
              <td class="py-3">
                <button type="button" class="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-surface-dark-border dark:text-gray-300 dark:hover:bg-surface-dark-border">
                  Editar
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class UsuariosComponent {
  readonly usuarios = signal<UsuarioUI[]>([
    { nombre: 'Admin Principal', rol: 'Admin', permisos: 'Acceso total' },
    { nombre: 'Cajero1', rol: 'Cajero', permisos: 'Ventas, Mesas, Caja' },
    { nombre: 'Cocina1', rol: 'Cocinero', permisos: 'Pantalla de cocina (KDS)' },
    { nombre: 'Mesero1', rol: 'Mesero', permisos: 'Mesas, Pedidos' },
  ]);

  badge(rol: Rol): string {
    return BADGE[rol];
  }
}
