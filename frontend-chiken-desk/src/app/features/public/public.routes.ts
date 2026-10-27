import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/landing.component').then((m) => m.LandingComponent),
  },
];
