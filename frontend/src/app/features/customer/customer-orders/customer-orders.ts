import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/guards/interceptors/services/api.service';
import { OrderResponse } from '../../../shared/models/order.model';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-orders.html',
})
export class CustomerOrdersComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  orders: OrderResponse[] = [];
  loading = false;
  error = '';
  success = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['placed']) {
        this.success = `Order ${params['placed']} was placed successfully.`;
      }
    });

    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';

    const storedCustomerId = sessionStorage.getItem('customerId');
    const customerId = Number(storedCustomerId);

    console.log('Stored customer ID:', storedCustomerId);
    console.log('Parsed customer ID:', customerId);

    if (!storedCustomerId || !Number.isInteger(customerId) || customerId <= 0) {
      this.error = 'Customer information is missing or invalid. Please sign in.';
      this.loading = false;
      return;
    }

    this.api.getCustomerOrders(customerId).subscribe({
      next: (data: OrderResponse[]) => {
        console.log('Customer orders API response:', data);

        this.orders = Array.isArray(data) ? data : [];

        console.log('Orders assigned to template:', this.orders);
        console.log('Number of orders:', this.orders.length);

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load customer orders:', err);

        this.error = 'Unable to load your orders.';
        this.loading = false;
      },
    });
  }
}
