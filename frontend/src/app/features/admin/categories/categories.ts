import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Category {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  productCount: number;
  createdAt: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class CategoriesComponent {
  searchTerm = '';
  showForm = false;
  editingId: number | null = null;

  categories: Category[] = [
    {
      id: 1,
      name: 'Electronics',
      description: 'Phones and electronic accessories',
      status: 'Active',
      productCount: 12,
      createdAt: '2026-10-01',
    },
    {
      id: 2,
      name: 'Clothing',
      description: 'Clothes and apparel',
      status: 'Active',
      productCount: 24,
      createdAt: '2026-10-02',
    },
    {
      id: 3,
      name: 'Office Supplies',
      description: 'Stationery and office products',
      status: 'Active',
      productCount: 8,
      createdAt: '2026-10-03',
    },
    {
      id: 4,
      name: 'Home Appliances',
      description: 'Products for home use',
      status: 'Inactive',
      productCount: 5,
      createdAt: '2026-10-04',
    },
  ];

  form = {
    name: '',
    description: '',
  };

  get filteredCategories(): Category[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.categories;
    }

    return this.categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term),
    );
  }

  get activeCount(): number {
    return this.categories.filter((c) => c.status === 'Active').length;
  }

  get inactiveCount(): number {
    return this.categories.filter((c) => c.status === 'Inactive').length;
  }

  get totalProducts(): number {
    return this.categories.reduce((total, category) => total + category.productCount, 0);
  }

  openCreateForm(): void {
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(category: Category): void {
    this.editingId = category.id;

    this.form = {
      name: category.name,
      description: category.description,
    };

    this.showForm = true;
  }

  saveCategory(): void {
    const name = this.form.name.trim();
    const description = this.form.description.trim();

    if (!name) {
      alert('Please enter a category name.');
      return;
    }

    const duplicate = this.categories.some(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase() && category.id !== this.editingId,
    );

    if (duplicate) {
      alert('A category with this name already exists.');
      return;
    }

    if (this.editingId !== null) {
      const category = this.categories.find((c) => c.id === this.editingId);

      if (category) {
        category.name = name;
        category.description = description;
      }
    } else {
      this.categories.unshift({
        id: Math.max(0, ...this.categories.map((c) => c.id)) + 1,
        name,
        description,
        status: 'Active',
        productCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }

    this.closeForm();
  }

  toggleStatus(category: Category): void {
    category.status = category.status === 'Active' ? 'Inactive' : 'Active';
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.form = {
      name: '',
      description: '',
    };
  }
}
