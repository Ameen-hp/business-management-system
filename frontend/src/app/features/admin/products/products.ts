import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
type ProductStatus = 'Active' | 'Inactive';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  status: ProductStatus;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsComponent {
  searchTerm = '';
  categoryFilter = 'All';
  statusFilter = 'All';
  showForm = false;
  editingId: number | null = null;

  categories = ['Electronics', 'Clothing', 'Office Supplies', 'Home Appliances'];

  products: Product[] = [
    {
      id: 1,
      name: 'Wireless Mouse',
      sku: 'ELE-001',
      category: 'Electronics',
      price: 1500,
      description: 'Wireless computer mouse',
      status: 'Active',
    },
    {
      id: 2,
      name: 'USB Keyboard',
      sku: 'ELE-002',
      category: 'Electronics',
      price: 2500,
      description: 'USB keyboard for computers',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Office Notebook',
      sku: 'OFF-001',
      category: 'Office Supplies',
      price: 350,
      description: 'A4 ruled notebook',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Cotton T-Shirt',
      sku: 'CLO-001',
      category: 'Clothing',
      price: 1200,
      description: 'Casual cotton T-shirt',
      status: 'Inactive',
    },
  ];

  form = {
    name: '',
    sku: '',
    category: '',
    price: 0,
    description: '',
  };

  get filteredProducts(): Product[] {
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
    return this.products.reduce((total, product) => total + product.price, 0);
  }

  openCreateForm(): void {
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(product: Product): void {
    this.editingId = product.id;
    this.form = {
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      description: product.description,
    };
    this.showForm = true;
  }

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

    if (this.editingId !== null) {
      const product = this.products.find((p) => p.id === this.editingId);

      if (product) {
        product.name = name;
        product.sku = sku;
        product.category = category;
        product.price = price;
        product.description = description;
      }
    } else {
      this.products.unshift({
        id: Math.max(0, ...this.products.map((p) => p.id)) + 1,
        name,
        sku,
        category,
        price,
        description,
        status: 'Active',
      });
    }

    this.closeForm();
  }

  toggleStatus(product: Product): void {
    product.status = product.status === 'Active' ? 'Inactive' : 'Active';
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
