import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class AdminSidebar {
  sidebarTitle = 'Admin Panel';
  sidebarDescription = 'Manage your business';

  footerTitle = 'Business Management System';
  footerDescription = 'Admin Workspace';

  sidebarSections: SidebarSection[] = [
    {
      title: 'Main Menu',
      items: [
        {
          label: 'Dashboard',
          icon: '▦',
          route: '/admin/dashboard',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          label: 'Customers',
          icon: '♙',
          route: '/admin/customers',
        },
        {
          label: 'Categories',
          icon: '▤',
          route: '/admin/categories',
        },
        {
          label: 'Products',
          icon: '▣',
          route: '/admin/products',
        },
        {
          label: 'Inventory',
          icon: '▥',
          route: '/admin/inventory',
        },
      ],
    },
    {
      title: 'Transactions',
      items: [
        {
          label: 'Orders',
          icon: '▣',
          route: '/admin/orders',
        },
        {
          label: 'Invoices',
          icon: '▧',
          route: '/admin/invoices',
        },
        {
          label: 'Payments',
          icon: '＄',
          route: '/admin/payments',
        },
        {
          label: 'Shipments',
          icon: '✈',
          route: '/admin/shipments',
        },
      ],
    },
  ];
}
