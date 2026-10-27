import { Routes } from '@angular/router';

export const POS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/pos-home.component').then((m) => m.PosHomeComponent),
  },
];
