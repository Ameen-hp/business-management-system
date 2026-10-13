import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/guards/interceptors/services/api.service';
import { CartService } from '../../../core/guards/interceptors/services/cart.services';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  description?: string;
  status: string;
}

interface Inventory {
  productId: number;
  quantity: number;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalog.html',
})
export class CatalogComponent implements OnInit {
  private api = inject(ApiService);
  private cart = inject(CartService);

  products: Product[] = [];
  stock = new Map<number, number>();
  search = '';
  selectedCategory = '';
  loading = false;
  error = '';
  message = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.api.getAllProducts().subscribe({
      next: (data: Product[]) => {
        this.products = (Array.isArray(data) ? data : []).filter(
          (p) => p.status?.toLowerCase() === 'active',
        );
        this.loading = false;
        this.loadInventory();
      },
      error: () => {
        this.error = 'Unable to load products. Please try again.';
        this.loading = false;
      },
    });
  }

  private loadInventory(): void {
    this.api.getAllInventory().subscribe({
      next: (data: Inventory[]) => {
        this.stock.clear();
        (Array.isArray(data) ? data : []).forEach((item) => {
          this.stock.set(item.productId, item.quantity);
        });
      },
      error: () => {
        this.error = 'Unable to load stock availability.';
      },
    });
  }

  get categories(): string[] {
    return [...new Set(this.products.map((p) => p.category).filter(Boolean))];
  }

  get filteredProducts(): Product[] {
    const query = this.search.trim().toLowerCase();

    return this.products.filter((p) => {
      const matchesSearch =
        !query ||
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query);

      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  getStock(productId: number): number {
    return this.stock.get(productId) ?? 0;
  }

  addToCart(product: Product): void {
    this.message = '';

    const result = this.cart.addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      quantity: 1,
      availableStock: this.getStock(product.id),
    });

    this.message = result || `${product.name} added to cart.`;
  }
}
