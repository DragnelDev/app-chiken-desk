import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factory de guard: uso `canActivateChild: [roleGuard(['Admin'])]` en app.routes.ts
 * para que un mesero o cliente no pueda entrar al panel administrativo, tal como
 * describe el Informe Técnico (Route Guards por rol).
 */
export function roleGuard(allowedRoles: string[]): CanActivateChildFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(allowedRoles)) return true;

    router.navigate(['/login']);
    return false;
  };
}
