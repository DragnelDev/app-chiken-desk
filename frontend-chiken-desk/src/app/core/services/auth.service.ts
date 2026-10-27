import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginResponse, UsuarioSesion } from '../../shared/models';
import { API_URL } from '../config/api';

export interface LoginRequest {
  usuario: string;
  password: string;
}

const TOKEN_KEY = 'chikendesk-token';
const USER_KEY = 'chikendesk-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<UsuarioSesion | null>(this.leerUsuario());

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, credenciales).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
        this.currentUser.set(res.usuario);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Autenticado = hay token y todavía no venció (se lee `exp` del JWT). */
  isAuthenticated(): boolean {
    const token = this.token;
    if (!token) return false;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (exp && exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  hasRole(roles: string[]): boolean {
    const rol = this.currentUser()?.rol;
    return !!rol && (rol === 'ADMIN' || roles.includes(rol));
  }

  esAdmin(): boolean {
    return this.currentUser()?.rol === 'ADMIN';
  }

  /** Ruta de inicio según el rol. */
  rutaInicio(): string {
    return this.esAdmin() ? '/admin/resumen' : '/pos';
  }

  private leerUsuario(): UsuarioSesion | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UsuarioSesion) : null;
    } catch {
      return null;
    }
  }
}
