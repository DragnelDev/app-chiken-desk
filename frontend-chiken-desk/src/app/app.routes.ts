import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // MÓDULO 1: Landing Page pública (clientes)
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },

  // MÓDULO 2: Autenticación
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },

  // MÓDULO 3: Panel de Control Administrativo (Dashboard)
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [roleGuard(['Admin'])],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  // MÓDULO 4: Salón y toma de pedidos (Meseros / Cajeros)
  {
    path: 'pos',
    canActivate: [authGuard],
    canActivateChild: [roleGuard(['Mesero', 'Cajero', 'Admin'])],
    loadChildren: () =>
      import('./features/pos/pos.routes').then((m) => m.POS_ROUTES),
  },

  // MÓDULO 5: Pantalla de cocina (KDS)
  {
    path: 'kitchen',
    canActivate: [authGuard],
    canActivateChild: [roleGuard(['Cocinero', 'Admin'])],
    loadChildren: () => Promise.resolve([]),
  },

  { path: '**', redirectTo: '' },
];
