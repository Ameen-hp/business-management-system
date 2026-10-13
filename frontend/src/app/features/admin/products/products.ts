import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { ApiService } from '../../../core/guards/interceptors/services/api.service';
import { ProductRequest, ProductResponse } from '../../../shared/models/product.model';

type ProductStatus = 'Active' | 'Inactive';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsComponent implements OnInit {
  private apiService = inject(ApiService);

  searchTerm = '';
  categoryFilter = 'All';
  statusFilter = 'All';
  showForm = false;
  editingId: number | null = null;
  loading = false;
  saving = false;
  private cdr = inject(ChangeDetectorRef);
  categories = ['Electronics', 'Clothing', 'Office Supplies', 'Home Appliances'];

  products: ProductResponse[] = [];

  form = {
    name: '',
    sku: '',
    category: '',
    price: 0,
    description: '',
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  // Load products from backend

  // Load products from backend
  loadProducts(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.apiService.getAllProducts().subscribe({
      next: (response) => {
        console.log('Products received from backend:', response);

        this.products = Array.isArray(response) ? [...response] : [];

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading products:', error);

        this.products = [];
        this.loading = false;
        this.cdr.markForCheck();

        alert('Unable to load products. Please check the backend connection.');
      },
    });
  }

  get filteredProducts(): ProductResponse[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);

      const matchesCategory =
        this.categoryFilter === 'All' || product.category === this.categoryFilter;

      const matchesStatus = this.statusFilter === 'All' || product.status === this.statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  get activeCount(): number {
    return this.products.filter((p) => p.status === 'Active').length;
  }

  get inactiveCount(): number {
    return this.products.filter((p) => p.status === 'Inactive').length;
  }

  get totalProductValue(): number {
    return this.products.reduce((total, product) => total + Number(product.price), 0);
  }

  // Open create form
  openCreateForm(): void {
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  // Open edit form
  openEditForm(product: ProductResponse): void {
    this.editingId = product.id;

    this.form = {
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: Number(product.price),
      description: product.description ?? '',
    };

    this.showForm = true;
  }

  // Create or update product
  saveProduct(): void {
    const name = this.form.name.trim();
    const sku = this.form.sku.trim();
    const category = this.form.category;
    const description = this.form.description.trim();
    const price = Number(this.form.price);

    if (!name || !sku || !category) {
      alert('Please enter the product name, SKU, and category.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      alert('Please enter a price greater than zero.');
      return;
    }

    const duplicateSku = this.products.some(
      (product) => product.sku.toLowerCase() === sku.toLowerCase() && product.id !== this.editingId,
    );

    if (duplicateSku) {
      alert('This SKU already exists. Please use a unique SKU.');
      return;
    }

    const request: ProductRequest = {
      name,
      sku,
      category,
      price,
      description,
    };

    this.saving = true;

    if (this.editingId !== null) {
      this.apiService.updateProduct(this.editingId, request).subscribe({
        next: (updatedProduct) => {
          const index = this.products.findIndex((product) => product.id === updatedProduct.id);

          if (index !== -1) {
            this.products[index] = updatedProduct;
          } else {
            this.products.unshift(updatedProduct);
          }

          this.saving = false;
          this.closeForm();
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.saving = false;
          alert(
            error.status === 409
              ? 'This SKU already exists. Please use a unique SKU.'
              : 'Unable to update product. Please try again.',
          );
        },
      });
    } else {
      this.apiService.createProduct(request).subscribe({
        next: (createdProduct) => {
          this.products.unshift(createdProduct);
          this.saving = false;
          this.closeForm();
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.saving = false;
          alert(
            error.status === 409
              ? 'This SKU already exists. Please use a unique SKU.'
              : 'Unable to create product. Please try again.',
          );
        },
      });
    }
  }

  // Activate or deactivate product
  toggleStatus(product: ProductResponse): void {
    const newStatus: ProductStatus = product.status === 'Active' ? 'Inactive' : 'Active';

    this.apiService.updateProductStatus(product.id, newStatus).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex((item) => item.id === updatedProduct.id);

        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
      },
      error: (error) => {
        console.error('Error updating product status:', error);
        alert('Unable to update product status. Please try again.');
      },
    });
  }

  // Delete product through API, if needed
  deleteProduct(product: ProductResponse): void {
    const confirmed = confirm(`Are you sure you want to delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    this.apiService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products = this.products.filter((item) => item.id !== product.id);
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        alert('Unable to delete product. Please try again.');
      },
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.form = {
      name: '',
      sku: '',
      category: '',
      price: 0,
      description: '',
    };
  }
}
