import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      {
        path: 'resumen',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'mesas',
        loadComponent: () => import('./components/mesas/mesas.component').then((m) => m.MesasComponent),
      },
      {
        path: 'reservas',
        loadComponent: () =>
          import('./components/reservas/reservas.component').then((m) => m.ReservasComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./components/pedidos/pedidos.component').then((m) => m.PedidosComponent),
      },
      {
        path: 'cocina',
        loadComponent: () => import('./components/cocina/cocina.component').then((m) => m.CocinaComponent),
      },
      {
        path: 'delivery',
        loadComponent: () =>
          import('./components/delivery/delivery.component').then((m) => m.DeliveryComponent),
      },
      {
        path: 'recetas',
        loadComponent: () =>
          import('./components/recetas/recetas.component').then((m) => m.RecetasComponent),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./components/inventario/inventario.component').then((m) => m.InventarioComponent),
      },
      {
        path: 'mermas',
        loadComponent: () => import('./components/mermas/mermas.component').then((m) => m.MermasComponent),
      },
      {
        path: 'facturacion',
        loadComponent: () =>
          import('./components/facturacion/facturacion.component').then((m) => m.FacturacionComponent),
      },
      {
        path: 'ticket',
        loadComponent: () => import('./components/ticket/ticket.component').then((m) => m.TicketComponent),
      },
      {
        path: 'caja',
        loadComponent: () => import('./components/caja/caja.component').then((m) => m.CajaComponent),
      },
      {
        path: 'contabilidad',
        loadComponent: () =>
          import('./components/contabilidad/contabilidad.component').then((m) => m.ContabilidadComponent),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./components/reportes/reportes.component').then((m) => m.ReportesComponent),
      },
      {
        path: 'contactos',
        loadComponent: () =>
          import('./components/contactos/contactos.component').then((m) => m.ContactosComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./components/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },
      {
        path: 'turnos',
        loadComponent: () => import('./components/turnos/turnos.component').then((m) => m.TurnosComponent),
      },
      {
        path: 'empleados',
        loadComponent: () =>
          import('./components/empleados/empleados.component').then((m) => m.EmpleadosComponent),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./components/configuracion/configuracion.component').then(
            (m) => m.ConfiguracionComponent,
          ),
      },
    ],
  },
];
