import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/guards/interceptors/services/cart.services';
import { ApiService } from '../../../core/guards/interceptors/services/api.service';
import { OrderRequest, OrderResponse } from '../../../shared/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
})
export class CheckoutComponent {
  private cart = inject(CartService);
  private api = inject(ApiService);
  private router = inject(Router);

  loading = false;
  error = '';

  get items() {
    return this.cart.getItems();
  }

  get total(): number {
    return this.cart.getTotal();
  }

  placeOrder(): void {
    this.error = '';

    if (this.items.length === 0) {
      this.error = 'Your cart is empty.';
      return;
    }

    // Temporary development approach until customer authentication is connected.
    const customerId = Number(sessionStorage.getItem('customerId'));

    if (!customerId) {
      this.error = 'Customer ID is missing. Please sign in again.';
      return;
    }

    const request: OrderRequest = {
      customerId,
      items: this.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    this.loading = true;

    this.api.createOrder(request).subscribe({
      next: (order: OrderResponse) => {
        this.cart.clear();
        this.loading = false;

        this.router.navigate(['/customer/orders'], {
          queryParams: { placed: order.orderNumber },
        });
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message || 'Unable to place your order. Please check stock and try again.';
      },
    });
  }
}
