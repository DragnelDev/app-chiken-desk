import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      {
        path: 'resumen',
        loadComponent: () => import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'productos',
        loadComponent: () => import('./components/productos/productos.component').then((m) => m.ProductosComponent),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./components/categorias/categorias.component').then((m) => m.CategoriasComponent),
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('../../shared/components/ventas-historial/ventas-historial.component').then(
            (m) => m.VentasHistorialComponent,
          ),
      },
      {
        path: 'cajas',
        loadComponent: () => import('./components/cajas/cajas.component').then((m) => m.CajasComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./components/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },
      {
        path: 'auditoria',
        loadComponent: () => import('./components/auditoria/auditoria.component').then((m) => m.AuditoriaComponent),
      },
    ],
  },
];
