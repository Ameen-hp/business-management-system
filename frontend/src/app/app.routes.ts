import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./layout/layout/layout').then((m) => m.AdminLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard,
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/admin/customers/customers').then((m) => m.CustomersComponent),
      },

      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/categories').then((m) => m.CategoriesComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/products').then((m) => m.ProductsComponent),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/admin/inventory/inventory').then((m) => m.InventoryComponent),
      },

      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/orders/orders').then((m) => m.OrdersComponent),
      },
      {
        path: 'invoices',
        loadComponent: () => import('./features/admin/invoices/invoices').then((m) => m.Invoices),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/admin/payments/payments').then((m) => m.PaymentsComponent),
      },

      {
        path: 'shipments',
        loadComponent: () =>
          import('./features/admin/shipment/shipment').then((m) => m.ShipmentsComponent),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full',
  },
];
