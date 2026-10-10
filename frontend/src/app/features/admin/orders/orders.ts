import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';

type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';

interface OrderItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersComponent {
  searchTerm = '';
  statusFilter = 'All';
  paymentFilter = 'All';

  selectedOrder: Order | null = null;

  orders: Order[] = [
    {
      id: 1,
      orderNumber: 'ORD-1001',
      customerName: 'Ali Ahmed',
      customerEmail: 'ali@example.com',
      orderDate: '2026-10-08',
      status: 'Pending',
      paymentStatus: 'Unpaid',
      items: [
        {
          productName: 'Wireless Mouse',
          sku: 'ELE-001',
          quantity: 2,
          unitPrice: 1500,
        },
        {
          productName: 'USB Keyboard',
          sku: 'ELE-002',
          quantity: 1,
          unitPrice: 2500,
        },
      ],
    },
    {
      id: 2,
      orderNumber: 'ORD-1002',
      customerName: 'Sara Khan',
      customerEmail: 'sara@example.com',
      orderDate: '2026-10-07',
      status: 'Processing',
      paymentStatus: 'Partially Paid',
      items: [
        {
          productName: 'Office Notebook',
          sku: 'OFF-001',
          quantity: 10,
          unitPrice: 350,
        },
      ],
    },
    {
      id: 3,
      orderNumber: 'ORD-1003',
      customerName: 'Usman Malik',
      customerEmail: 'usman@example.com',
      orderDate: '2026-10-06',
      status: 'Completed',
      paymentStatus: 'Paid',
      items: [
        {
          productName: 'Cotton T-Shirt',
          sku: 'CLO-001',
          quantity: 3,
          unitPrice: 1200,
        },
      ],
    },
    {
      id: 4,
      orderNumber: 'ORD-1004',
      customerName: 'Ayesha Noor',
      customerEmail: 'ayesha@example.com',
      orderDate: '2026-10-05',
      status: 'Confirmed',
      paymentStatus: 'Unpaid',
      items: [
        {
          productName: 'Wireless Mouse',
          sku: 'ELE-001',
          quantity: 4,
          unitPrice: 1500,
        },
      ],
    },
    {
      id: 5,
      orderNumber: 'ORD-1005',
      customerName: 'Hamza Ali',
      customerEmail: 'hamza@example.com',
      orderDate: '2026-10-04',
      status: 'Cancelled',
      paymentStatus: 'Unpaid',
      items: [
        {
          productName: 'USB Keyboard',
          sku: 'ELE-002',
          quantity: 2,
          unitPrice: 2500,
        },
      ],
    },
  ];

  get filteredOrders(): Order[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term);

      const matchesStatus = this.statusFilter === 'All' || order.status === this.statusFilter;

      const matchesPayment =
        this.paymentFilter === 'All' || order.paymentStatus === this.paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }

  get totalOrders(): number {
    return this.orders.length;
  }

  get pendingOrders(): number {
    return this.orders.filter((o) => o.status === 'Pending').length;
  }

  get processingOrders(): number {
    return this.orders.filter((o) => o.status === 'Processing' || o.status === 'Confirmed').length;
  }

  get completedOrders(): number {
    return this.orders.filter((o) => o.status === 'Completed').length;
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  viewOrder(order: Order): void {
    this.selectedOrder = order;
  }

  closeDetails(): void {
    this.selectedOrder = null;
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus): void {
    if (order.status === 'Cancelled' || order.status === 'Completed') {
      alert('Completed or cancelled orders cannot be changed in this demo.');
      return;
    }

    if (newStatus === 'Cancelled') {
      const confirmed = confirm(`Are you sure you want to cancel ${order.orderNumber}?`);

      if (!confirmed) {
        return;
      }
    }

    order.status = newStatus;
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'Processing':
        return 'bg-indigo-100 text-indigo-700';
      case 'Shipped':
        return 'bg-purple-100 text-purple-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
    }
  }

  getPaymentClass(status: PaymentStatus): string {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Partially Paid':
        return 'bg-amber-100 text-amber-700';
      case 'Unpaid':
        return 'bg-red-100 text-red-700';
    }
  }
}
