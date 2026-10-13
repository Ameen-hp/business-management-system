import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

type UserRole = 'ADMIN' | 'CUSTOMER';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class AdminSidebar implements OnInit {
  sidebarTitle = 'Business Management System';
  sidebarDescription = '';
  footerTitle = 'Business Management System';
  footerDescription = '';

  sidebarSections: SidebarSection[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadSidebar();
  }

  private loadSidebar(): void {
    const role = sessionStorage.getItem('role')?.toUpperCase();

    if (role === 'CUSTOMER') {
      this.loadCustomerSidebar();
    } else if (role === 'ADMIN') {
      this.loadAdminSidebar();
    } else {
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
  }
  private getUserRole(): UserRole {
    const role = sessionStorage.getItem('role')?.toUpperCase();

    return role === 'CUSTOMER' ? 'CUSTOMER' : 'ADMIN';
  }

  private loadAdminSidebar(): void {
    this.sidebarTitle = 'Admin Panel';
    this.sidebarDescription = 'Manage your business';
    this.footerTitle = 'Business Management System';
    this.footerDescription = 'Admin Workspace';

    this.sidebarSections = [
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

  private loadCustomerSidebar(): void {
    this.sidebarTitle = 'Customer Portal';
    this.sidebarDescription = 'Shop and manage your orders';
    this.footerTitle = 'Business Management System';
    this.footerDescription = 'Customer Workspace';

    this.sidebarSections = [
      {
        title: 'Shopping',
        items: [
          {
            label: 'Product Catalog',
            icon: '▣',
            route: '/customer/catalog',
          },
          {
            label: 'Shopping Cart',
            icon: '🛒',
            route: '/customer/cart',
          },
          {
            label: 'Checkout',
            icon: '✓',
            route: '/customer/checkout',
          },
        ],
      },
      {
        title: 'My Account',
        items: [
          {
            label: 'My Orders',
            icon: '▤',
            route: '/customer/orders',
          },
          {
            label: 'My Invoices',
            icon: '▧',
            route: '/customer/invoices',
          },
        ],
      },
    ];
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
