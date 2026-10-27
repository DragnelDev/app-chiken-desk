import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Landing pública (clientes)
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },

  // Autenticación
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },

  // Panel administrativo (solo ADMIN)
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [roleGuard(['ADMIN'])],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  // Punto de venta (CAJERO y ADMIN)
  {
    path: 'pos',
    canActivate: [authGuard],
    canActivateChild: [roleGuard(['CAJERO'])],
    loadChildren: () => import('./features/pos/pos.routes').then((m) => m.POS_ROUTES),
  },

  { path: '**', redirectTo: '' },
];
