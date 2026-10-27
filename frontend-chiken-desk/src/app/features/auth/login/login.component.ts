import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  usuario = '';
  password = '';
  readonly error = signal<string | null>(null);
  readonly cargando = signal(false);

  submit(): void {
    this.error.set(null);
    this.cargando.set(true);
    this.auth
      .login({ usuario: this.usuario, password: this.password })
      .subscribe({
        next: () => {
          this.cargando.set(false);
          this.router.navigate(['/admin/resumen']);
        },
        error: (error: HttpErrorResponse) => {
          this.cargando.set(false);
          if (error.status === 0) {
            this.error.set(
              'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
            );
          } else if (error.status === 401) {
            this.error.set('Usuario o contraseña incorrectos.');
          } else {
            this.error.set('No se pudo iniciar sesión. Inténtalo nuevamente.');
          }
        },
      });
  }
}
