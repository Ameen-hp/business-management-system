import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: string;
  iconClass: string;
  trendClass: string;
}

interface RecentOrder {
  orderNumber: string;
  customer: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Processing' | 'Pending' | 'Cancelled';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  today = new Date();

  stats: DashboardStat[] = [
    {
      title: 'Total Products',
      value: '248',
      change: '+12.5%',
      description: 'Compared with last month',
      icon: 'package',
      iconClass: 'bg-blue-50 text-blue-600',
      trendClass: 'text-emerald-600',
    },
    {
      title: 'Total Customers',
      value: '1,284',
      change: '+8.2%',
      description: 'Compared with last month',
      icon: 'users',
      iconClass: 'bg-violet-50 text-violet-600',
      trendClass: 'text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: '356',
      change: '+18.4%',
      description: 'Compared with last month',
      icon: 'shopping-cart',
      iconClass: 'bg-amber-50 text-amber-600',
      trendClass: 'text-emerald-600',
    },
    {
      title: 'Total Revenue',
      value: 'Rs 485,250',
      change: '+10.6%',
      description: 'Compared with last month',
      icon: 'wallet',
      iconClass: 'bg-emerald-50 text-emerald-600',
      trendClass: 'text-emerald-600',
    },
  ];

  // Illustrative chart data. Replace with API results later.
  salesData = [
    { month: 'Jan', sales: 35, orders: 25 },
    { month: 'Feb', sales: 48, orders: 32 },
    { month: 'Mar', sales: 40, orders: 29 },
    { month: 'Apr', sales: 62, orders: 43 },
    { month: 'May', sales: 55, orders: 39 },
    { month: 'Jun', sales: 76, orders: 54 },
    { month: 'Jul', sales: 66, orders: 46 },
    { month: 'Aug', sales: 85, orders: 61 },
    { month: 'Sep', sales: 72, orders: 52 },
    { month: 'Oct', sales: 92, orders: 68 },
    { month: 'Nov', sales: 78, orders: 57 },
    { month: 'Dec', sales: 100, orders: 74 },
  ];

  recentOrders: RecentOrder[] = [
    {
      orderNumber: 'ORD-1008',
      customer: 'Bilal Ahmed',
      date: '2026-10-09',
      amount: 12500,
      status: 'Processing',
    },
    {
      orderNumber: 'ORD-1007',
      customer: 'Fatima Noor',
      date: '2026-10-08',
      amount: 8750,
      status: 'Pending',
    },
    {
      orderNumber: 'ORD-1006',
      customer: 'Hassan Ali',
      date: '2026-10-08',
      amount: 22400,
      status: 'Completed',
    },
    {
      orderNumber: 'ORD-1005',
      customer: 'Ayesha Malik',
      date: '2026-10-07',
      amount: 5600,
      status: 'Cancelled',
    },
    {
      orderNumber: 'ORD-1004',
      customer: 'Usman Khan',
      date: '2026-10-06',
      amount: 15750,
      status: 'Completed',
    },
  ];

  inventoryAlerts = [
    {
      name: 'Wireless Mouse',
      sku: 'PRD-001',
      stock: 4,
      level: 'Critical',
    },
    {
      name: 'USB Keyboard',
      sku: 'PRD-008',
      stock: 7,
      level: 'Low Stock',
    },
    {
      name: 'Office Notebook',
      sku: 'PRD-014',
      stock: 9,
      level: 'Low Stock',
    },
  ];

  get completedOrders(): number {
    return this.recentOrders.filter((order) => order.status === 'Completed').length;
  }

  get pendingOrders(): number {
    return this.recentOrders.filter((order) => order.status === 'Pending').length;
  }

  get processingOrders(): number {
    return this.recentOrders.filter((order) => order.status === 'Processing').length;
  }

  get cancelledOrders(): number {
    return this.recentOrders.filter((order) => order.status === 'Cancelled').length;
  }

  get maxSales(): number {
    return Math.max(...this.salesData.map((item) => item.sales), 1);
  }

  get maxOrders(): number {
    return Math.max(...this.salesData.map((item) => item.orders), 1);
  }

  statusClass(status: RecentOrder['status']): string {
    const classes: Record<RecentOrder['status'], string> = {
      Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      Processing: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      Cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
    };

    return classes[status];
  }

  alertClass(level: string): string {
    return level === 'Critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700';
  }
}
