import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../../core/guards/interceptors/services/cart.services';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
})
export class CartComponent {
  private cart = inject(CartService);

  get items(): CartItem[] {
    return this.cart.getItems();
  }

  get total(): number {
    return this.cart.getTotal();
  }

  updateQuantity(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cart.updateQuantity(item.productId, Number(input.value));
  }

  removeItem(productId: number): void {
    this.cart.removeItem(productId);
  }
}
