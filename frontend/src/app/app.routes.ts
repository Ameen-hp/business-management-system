import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },

  // Shared layout for Admin and Customer
  {
    path: '',
    loadComponent: () => import('./layout/layout/layout').then((m) => m.AdminLayout),
    children: [
      // Admin pages
      {
        path: 'admin',
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
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
            loadComponent: () =>
              import('./features/admin/invoices/invoices').then((m) => m.Invoices),
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

      // Customer pages — same layout and sidebar component
      {
        path: 'customer',
        children: [
          {
            path: '',
            redirectTo: 'catalog',
            pathMatch: 'full',
          },
          {
            path: 'catalog',
            loadComponent: () =>
              import('./features/customer/catalog/catalog').then((m) => m.CatalogComponent),
          },
          {
            path: 'cart',
            loadComponent: () =>
              import('./features/customer/cart/cart').then((m) => m.CartComponent),
          },
          {
            path: 'checkout',
            loadComponent: () =>
              import('./features/customer/checkout/checkout').then((m) => m.CheckoutComponent),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/customer/customer-orders/customer-orders').then(
                (m) => m.CustomerOrdersComponent,
              ),
          },
          {
            path: 'invoices',
            loadComponent: () =>
              import('./features/customer/invoices/invoices').then(
                (m) => m.CustomerInvoicesComponent,
              ),
          },
        ],
      },
    ],
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
