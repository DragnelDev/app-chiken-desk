import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/api.services';
import { AuthService } from '../../../../core/services/auth.service';
import { mensajeError } from '../../../../core/utils/error';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Rol, Usuario } from '../../../../shared/models';

interface FormUsuario {
  idRol: number | null;
  nombres: string;
  apellidos: string;
  ci: string;
  usuario: string;
  password: string;
}

const FORM_VACIO = (): FormUsuario => ({ idRol: null, nombres: '', apellidos: '', ci: '', usuario: '', password: '' });

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
      <button type="button" class="btn" (click)="nuevo()">+ Agregar usuario</button>
    </div>

    @if (error()) {
      <p class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ error() }}</p>
    }

    <div class="card overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-surface-dark-border">
            <th class="th">Usuario</th><th class="th">Nombre</th><th class="th">CI</th><th class="th">Rol</th><th class="th text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (u of usuarios(); track u.idUsuario) {
            <tr class="border-b border-gray-50 dark:border-surface-dark-border">
              <td class="td font-medium">{{ u.usuario }}</td>
              <td class="td">{{ u.nombres }} {{ u.apellidos }}</td>
              <td class="td">{{ u.ci }}</td>
              <td class="td">
                <span class="badge" [class]="u.rol?.nombre === 'ADMIN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">{{ u.rol?.nombre }}</span>
              </td>
              <td class="td space-x-2 text-right">
                <button type="button" class="btn-ghost" (click)="editar(u)">Editar</button>
                <button type="button" class="btn-danger" [disabled]="u.idUsuario === yo()?.idUsuario" (click)="eliminar(u)">Eliminar</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (abierto()) {
      <app-modal [titulo]="editandoId() ? 'Editar usuario' : 'Nuevo usuario'" (cerrar)="abierto.set(false)">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><label class="label">Nombres</label><input class="input" [(ngModel)]="form.nombres" maxlength="100" /></div>
          <div><label class="label">Apellidos</label><input class="input" [(ngModel)]="form.apellidos" maxlength="100" /></div>
          <div><label class="label">CI</label><input class="input" [(ngModel)]="form.ci" maxlength="20" /></div>
          <div>
            <label class="label">Rol</label>
            <select class="input" [(ngModel)]="form.idRol">
              <option [ngValue]="null" disabled>Selecciona…</option>
              @for (r of roles(); track r.idRol) { <option [ngValue]="r.idRol">{{ r.nombre }}</option> }
            </select>
          </div>
          <div><label class="label">Usuario</label><input class="input" [(ngModel)]="form.usuario" maxlength="50" autocomplete="off" /></div>
          <div>
            <label class="label">{{ editandoId() ? 'Nueva contraseña (opcional)' : 'Contraseña' }}</label>
            <input class="input" type="password" [(ngModel)]="form.password" maxlength="72" autocomplete="new-password" />
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-400">Mínimo 6 caracteres. La contraseña se guarda cifrada (bcrypt).</p>
        @if (errorForm()) { <p class="mt-3 text-sm text-red-500">{{ errorForm() }}</p> }
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="btn-ghost" (click)="abierto.set(false)">Cancelar</button>
          <button type="button" class="btn" [disabled]="!valido() || guardando()" (click)="guardar()">Guardar</button>
        </div>
      </app-modal>
    }
  `,
})
export class UsuariosComponent implements OnInit {
  private readonly service = inject(UsuarioService);
  readonly yo = inject(AuthService).currentUser;

  readonly usuarios = signal<Usuario[]>([]);
  readonly roles = signal<Rol[]>([]);
  readonly error = signal<string | null>(null);
  readonly errorForm = signal<string | null>(null);
  readonly abierto = signal(false);
  readonly guardando = signal(false);
  readonly editandoId = signal<number | null>(null);
  form: FormUsuario = FORM_VACIO();

  ngOnInit(): void {
    this.service.roles().subscribe((r) => this.roles.set(r));
    this.cargar();
  }

  cargar(): void {
    this.service.listar().subscribe({
      next: (u) => this.usuarios.set(u),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  valido(): boolean {
    const f = this.form;
    const passOk = this.editandoId() ? !f.password || f.password.length >= 6 : f.password.length >= 6;
    return !!(f.nombres.trim() && f.apellidos.trim() && f.ci.trim() && f.usuario.trim().length >= 3 && f.idRol && passOk);
  }

  nuevo(): void {
    this.form = FORM_VACIO();
    this.editandoId.set(null);
    this.errorForm.set(null);
    this.abierto.set(true);
  }

  editar(u: Usuario): void {
    this.form = { idRol: u.idRol, nombres: u.nombres, apellidos: u.apellidos, ci: u.ci, usuario: u.usuario, password: '' };
    this.editandoId.set(u.idUsuario);
    this.errorForm.set(null);
    this.abierto.set(true);
  }

  guardar(): void {
    this.guardando.set(true);
    const { password, ...resto } = this.form;
    const dto: Record<string, unknown> = {
      ...resto,
      nombres: resto.nombres.trim(), apellidos: resto.apellidos.trim(),
      ci: resto.ci.trim(), usuario: resto.usuario.trim(),
    };
    if (password) dto['password'] = password;

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

  eliminar(u: Usuario): void {
    if (!confirm(`¿Eliminar al usuario "${u.usuario}"? Perderá el acceso de inmediato.`)) return;
    this.service.eliminar(u.idUsuario).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
