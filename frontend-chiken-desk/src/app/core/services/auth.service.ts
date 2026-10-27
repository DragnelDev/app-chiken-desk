import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    usuario: string;
    rol: string; // Admin | Cajero | Cocinero | Mesero
    empleadoId: number;
  };
}

const TOKEN_KEY = 'nexusrest-token';
const USER_KEY = 'nexusrest-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/auth';

  readonly currentUser = signal<LoginResponse['usuario'] | null>(this.readStoredUser());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
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

  isAuthenticated(): boolean {
    return !!this.token;
  }

  hasRole(roles: string[]): boolean {
    const rol = this.currentUser()?.rol;
    return !!rol && roles.includes(rol);
  }

  private readStoredUser(): LoginResponse['usuario'] | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
