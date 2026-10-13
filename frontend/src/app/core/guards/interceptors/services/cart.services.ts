import { Injectable } from '@angular/core';

export interface CartItem {
  productId: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  availableStock: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = [];

  getItems(): CartItem[] {
    return this.items.map((item) => ({ ...item }));
  }

  addItem(product: CartItem): string {
    const existing = this.items.find((item) => item.productId === product.productId);

    if (product.availableStock <= 0) {
      return 'This product is out of stock.';
    }

    if (existing) {
      if (existing.quantity >= existing.availableStock) {
        return 'You cannot add more than the available stock.';
      }
      existing.quantity++;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }

    return '';
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.items.find((i) => i.productId === productId);
    if (!item) return;

    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    item.quantity = Math.min(quantity, item.availableStock);
  }

  removeItem(productId: number): void {
    this.items = this.items.filter((i) => i.productId !== productId);
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  clear(): void {
    this.items = [];
  }

  getCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
}
