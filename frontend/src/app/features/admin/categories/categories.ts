import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../core/guards/interceptors/services/api.service';
import { ProductResponse } from '../../../shared/models//product.model';

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
export class CategoriesComponent implements OnInit {
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  searchTerm = '';
  showForm = false;
  editingId: number | null = null;
  loading = false;

  // Fixed categories; product counts come from the backend.
  categories: Category[] = [];
  products: ProductResponse[] = [];
  deletingCategoryId: number | null = null;
  form = {
    name: '',
    description: '',
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.apiService.getAllProducts().subscribe({
      next: (response) => {
        console.log('Products received:', response);

        this.products = Array.isArray(response) ? response : [];

        const categoryMap = new Map<string, Category>();

        this.products.forEach((product, index) => {
          const name = product.category?.trim();

          if (!name) {
            return;
          }

          const key = name.toLowerCase();
          const existingCategory = categoryMap.get(key);

          if (existingCategory) {
            existingCategory.productCount++;
          } else {
            categoryMap.set(key, {
              id: index + 1,
              name,
              description: '',
              status: 'Active',
              productCount: 1,
              createdAt: '',
            });
          }
        });

        // Assign categories after grouping products.
        this.categories = Array.from(categoryMap.values());

        console.log('Categories displayed:', this.categories);
        console.log('Total categories:', this.categories.length);

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load products:', error);

        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // Fetch products and calculate each category's product count.

  // loadProductCounts(): void {
  //   this.loading = true;

  //   this.apiService.getAllProducts().subscribe({
  //     next: (response) => {
  //       console.log('Products received:', response);

  //       this.products = Array.isArray(response) ? response : [];

  //       this.categories = this.categories.map((category) => {
  //         const count = this.products.filter(
  //           (product) =>
  //             product.category?.trim().toLowerCase() === category.name?.trim().toLowerCase(),
  //         ).length;

  //         return {
  //           ...category,
  //           productCount: count,
  //         };
  //       });

  //       console.log('Updated categories:', this.categories);
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       console.error('Failed to load products:', error);
  //       this.loading = false;
  //     },
  //   });
  // }

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

  deleteCategory(category: Category): void {
    const categoryProducts = this.productsForCategory(category.name);

    const message =
      categoryProducts.length > 0
        ? `The category "${category.name}" contains ${categoryProducts.length} product(s).\n\n` +
          `Deleting this category will permanently delete those products.\n\n` +
          `Are you sure you want to continue?`
        : `Are you sure you want to remove the category "${category.name}"?`;

    if (!confirm(message)) {
      return;
    }

    // No products belong to this category.
    // Since categories are generated from products, there is no
    // backend category record to delete.
    if (categoryProducts.length === 0) {
      this.categories = this.categories.filter(
        (item) => item.name.toLowerCase() !== category.name.toLowerCase(),
      );
      return;
    }

    this.deletingCategoryId = category.id;

    let completedCount = 0;
    let deletedCount = 0;
    let failedCount = 0;

    const finishDeletion = (): void => {
      completedCount++;

      if (completedCount !== categoryProducts.length) {
        return;
      }

      this.deletingCategoryId = null;

      if (failedCount === 0) {
        alert(
          `Category "${category.name}" and all ${deletedCount} product(s) were deleted successfully.`,
        );
      } else {
        alert(
          `${deletedCount} product(s) deleted successfully, but ${failedCount} failed. ` +
            `The category will remain if any products still belong to it.`,
        );
      }

      // Fetch fresh products and rebuild the categories.
      this.loadCategories();
    };

    categoryProducts.forEach((product) => {
      this.apiService.deleteProduct(product.id).subscribe({
        next: () => {
          deletedCount++;
          finishDeletion();
        },
        error: (error) => {
          console.error(`Failed to delete product ${product.id}:`, error);
          failedCount++;
          finishDeletion();
        },
      });
    });
  }

  private productsForCategory(categoryName: string): ProductResponse[] {
    // This method needs the current products list.
    return this.products.filter(
      (product) => product.category.trim().toLowerCase() === categoryName.trim().toLowerCase(),
    );
  }
}
