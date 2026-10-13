import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../core/guards/interceptors/services/api.service';
import { OrderResponse, OrderStatus } from '../../../shared/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersComponent implements OnInit {
  private apiService = inject(ApiService);

  // Search and filters
  searchTerm = '';
  statusFilter = 'All';

  // Data
  orders: OrderResponse[] = [];
  selectedOrder: OrderResponse | null = null;

  // Loading and error states
  loading = false;
  updatingOrderId: number | null = null;
  errorMessage = '';
  successMessage = '';

  readonly orderStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Completed',
    'Cancelled',
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  // ==================== LOAD ORDERS ====================

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getAllOrders().subscribe({
      next: (response) => {
        this.orders = Array.isArray(response) ? response : [];
        console.log('Orders loaded:', this.orders);
        this.loading = false;

        // Refresh the selected order with the latest backend data.
        if (this.selectedOrder) {
          this.selectedOrder = this.orders.find((o) => o.id === this.selectedOrder?.id) ?? null;
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Failed to load orders. Please try again.';
      },
    });
  }

  // ==================== SEARCH AND FILTER ====================

  get filteredOrders(): OrderResponse[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term);

      const matchesStatus = this.statusFilter === 'All' || order.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // ==================== DASHBOARD COUNTS ====================

  get totalOrders(): number {
    return this.orders.length;
  }

  get pendingOrders(): number {
    return this.orders.filter((o) => o.status === 'Pending').length;
  }

  get processingOrders(): number {
    return this.orders.filter((o) => o.status === 'Confirmed' || o.status === 'Processing').length;
  }

  get completedOrders(): number {
    return this.orders.filter((o) => o.status === 'Completed').length;
  }

  // ==================== ORDER TOTALS ====================

  // Use the total calculated by the backend.
  getOrderTotal(order: OrderResponse): number {
    return order.totalAmount ?? 0;
  }

  getTotalItems(order: OrderResponse): number {
    return (order.items ?? []).reduce((total, item) => total + item.quantity, 0);
  }

  // ==================== ORDER DETAILS ====================

  viewOrder(order: OrderResponse): void {
    this.selectedOrder = order;
  }

  closeDetails(): void {
    this.selectedOrder = null;
  }

  // ==================== UPDATE ORDER STATUS ====================

  updateOrderStatus(order: OrderResponse, newStatus: OrderStatus): void {
    if (this.updatingOrderId !== null) {
      return;
    }

    if (order.status === newStatus) {
      return;
    }

    if (!this.isAllowedTransition(order.status, newStatus)) {
      this.errorMessage = `Order cannot move from ${order.status} to ${newStatus}.`;
      return;
    }

    if (newStatus === 'Cancelled') {
      const confirmed = confirm(
        `Are you sure you want to cancel ${order.orderNumber}? Stock will be restored.`,
      );

      if (!confirmed) {
        return;
      }
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.updatingOrderId = order.id;

    this.apiService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.orders = this.orders.map((existingOrder) =>
          existingOrder.id === updatedOrder.id ? updatedOrder : existingOrder,
        );

        if (this.selectedOrder?.id === updatedOrder.id) {
          this.selectedOrder = updatedOrder;
        }

        this.updatingOrderId = null;
        this.successMessage = `Order ${updatedOrder.orderNumber} updated to ${updatedOrder.status}.`;
      },
      error: (error) => {
        this.updatingOrderId = null;
        this.errorMessage =
          error?.error?.message || 'Failed to update order status. Please try again.';
      },
    });
  }

  // Keep frontend transitions consistent with the backend.
  private isAllowedTransition(current: OrderStatus, next: OrderStatus): boolean {
    switch (current) {
      case 'Pending':
        return next === 'Confirmed' || next === 'Cancelled';

      case 'Confirmed':
        return next === 'Processing' || next === 'Cancelled';

      case 'Processing':
        return next === 'Shipped' || next === 'Cancelled';

      case 'Shipped':
        return next === 'Completed';

      case 'Completed':
      case 'Cancelled':
        return false;

      default:
        return false;
    }
  }

  // Options available for a particular order's status dropdown.
  getAvailableStatuses(order: OrderResponse): OrderStatus[] {
    return this.orderStatuses.filter(
      (status) => status === order.status || this.isAllowedTransition(order.status, status),
    );
  }

  // ==================== STATUS STYLING ====================

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

      default:
        return '';
    }
  }
}
