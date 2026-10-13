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
    const customerId = Number(sessionStorage.getItem('customerId'));

    if (!customerId) {
      this.error = 'Customer information is missing. Please sign in.';
      return;
    }

    this.loading = true;

    this.api.getCustomerOrders(customerId).subscribe({
      next: (data: OrderResponse[]) => {
        this.orders = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load your orders.';
        this.loading = false;
      },
    });
  }
}
