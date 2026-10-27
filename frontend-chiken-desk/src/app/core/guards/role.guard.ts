import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Uso: `canActivateChild: [roleGuard(['CAJERO'])]`. ADMIN siempre pasa.
 * Si el usuario no tiene el rol, vuelve a su pantalla de inicio (no al login).
 */
export function roleGuard(rolesPermitidos: string[]): CanActivateChildFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.hasRole(rolesPermitidos)) return true;
    return router.createUrlTree([auth.isAuthenticated() ? auth.rutaInicio() : '/login']);
  };
}
