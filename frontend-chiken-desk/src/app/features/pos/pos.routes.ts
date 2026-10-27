import { Routes } from '@angular/router';

export const POS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pos-layout.component').then((m) => m.PosLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./components/pos-vender.component').then((m) => m.PosVenderComponent),
      },
      {
        path: 'caja',
        loadComponent: () => import('./components/pos-caja.component').then((m) => m.PosCajaComponent),
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('../../shared/components/ventas-historial/ventas-historial.component').then(
            (m) => m.VentasHistorialComponent,
          ),
      },
    ],
  },
];
