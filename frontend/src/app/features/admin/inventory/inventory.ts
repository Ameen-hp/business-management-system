import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../core/guards/interceptors/services/api.service';
import {
  InventoryResponse,
  OpeningStockRequest,
  StockAdjustmentRequest,
  StockMovementResponse,
} from '../../../shared/models/inventory.model';
import { ProductResponse } from '../../../shared/models/product.model';

type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type StockAction = 'Add' | 'Remove';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class InventoryComponent implements OnInit {
  private apiService = inject(ApiService);

  readonly Number = Number;

  searchTerm = '';
  stockFilter = 'All';

  inventory: InventoryResponse[] = [];
  products: ProductResponse[] = [];
  stockMovements: StockMovementResponse[] = [];

  loading = false;
  loadingProducts = false;
  loadingMovements = false;
  savingStock = false;

  errorMessage = '';
  productErrorMessage = '';
  movementErrorMessage = '';

  // Stock adjustment modal
  showStockForm = false;
  selectedItemId: number | null = null;
  stockAction: StockAction = 'Add';
  stockQuantity = 1;
  stockNote = '';

  // Opening stock modal
  showOpeningStockForm = false;
  openingProductId: number | null = null;
  openingQuantity = 1;
  openingUnitCost: number | null = null;
  openingReorderLevel = 0;
  openingReason = '';

  // Stock movement history modal
  showMovementsModal = false;
  movementProductName = '';
  movementProductId: number | null = null;

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadInventory();
    this.loadProducts();
  }

  // 1. Get all inventory records
  // 1. Get all inventory records
  loadInventory(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.apiService.getAllInventory().subscribe({
      next: (response) => {
        console.log('Inventory received from backend:', response);

        this.inventory = Array.isArray(response) ? [...response] : [];

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load inventory:', error);

        this.errorMessage = 'Unable to load inventory. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
  // Load products so the admin can create opening stock
  loadProducts(): void {
    this.loadingProducts = true;
    this.productErrorMessage = '';
    this.cdr.markForCheck();

    this.apiService.getAllProducts().subscribe({
      next: (response) => {
        this.products = Array.isArray(response) ? response : [];
        this.loadingProducts = false;
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.productErrorMessage = 'Unable to load products for opening stock.';
        this.loadingProducts = false;
      },
    });
  }

  // Products without inventory records
  get productsWithoutInventory(): ProductResponse[] {
    const inventoryProductIds = new Set(this.inventory.map((item) => item.productId));

    return this.products.filter(
      (product) => !inventoryProductIds.has(product.id) && product.status === 'Active',
    );
  }

  // 2. Get a specific product's inventory from the backend
  refreshProductInventory(productId: number): void {
    this.apiService.getInventoryByProductId(productId).subscribe({
      next: (response) => {
        this.inventory = this.inventory.map((item) =>
          item.productId === productId ? response : item,
        );
      },
      error: (error) => {
        console.error('Failed to refresh product inventory:', error);
        this.loadInventory();
      },
    });
  }

  retryMovements(): void {
    if (this.movementProductId === null) {
      return;
    }

    const productId = this.movementProductId;

    this.loadingMovements = true;
    this.movementErrorMessage = '';

    this.apiService.getStockMovements(productId).subscribe({
      next: (response) => {
        this.stockMovements = Array.isArray(response) ? response : [];
        this.loadingMovements = false;
      },
      error: (error) => {
        console.error('Failed to reload stock movements:', error);

        this.movementErrorMessage = 'Unable to load stock movement history. Please try again.';

        this.loadingMovements = false;
      },
    });
  }

  // Search and filter
  get filteredInventory(): InventoryResponse[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.inventory.filter((item) => {
      const matchesSearch =
        (item.productName ?? '').toLowerCase().includes(term) ||
        (item.sku ?? '').toLowerCase().includes(term) ||
        (item.category ?? '').toLowerCase().includes(term);

      const matchesStatus =
        this.stockFilter === 'All' || this.getStockStatus(item) === this.stockFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // Summary cards
  get totalProducts(): number {
    return this.inventory.length;
  }

  get totalUnits(): number {
    return this.inventory.reduce((total, item) => total + item.quantity, 0);
  }

  get lowStockCount(): number {
    return this.inventory.filter((item) => item.quantity > 0 && item.quantity <= item.reorderLevel)
      .length;
  }

  get outOfStockCount(): number {
    return this.inventory.filter((item) => item.quantity === 0).length;
  }

  get totalStockValue(): number {
    return this.inventory.reduce((total, item) => total + item.stockValue, 0);
  }

  getStockStatus(item: InventoryResponse): StockStatus {
    if (item.quantity === 0) {
      return 'Out of Stock';
    }

    if (item.quantity <= item.reorderLevel) {
      return 'Low Stock';
    }

    return 'In Stock';
  }

  // 3. Opening stock
  openOpeningStockForm(): void {
    this.openingProductId = null;
    this.openingQuantity = 1;
    this.openingUnitCost = null;
    this.openingReorderLevel = 0;
    this.openingReason = '';
    this.showOpeningStockForm = true;
  }

  createOpeningStock(): void {
    const productId = Number(this.openingProductId);
    const quantity = Number(this.openingQuantity);
    const unitCost = Number(this.openingUnitCost);
    const reorderLevel = Number(this.openingReorderLevel);
    const reason = this.openingReason.trim();

    if (!Number.isInteger(productId) || productId <= 0) {
      alert('Please select a product.');
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      alert('Opening quantity must be a whole number greater than zero.');
      return;
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      alert('Unit cost must be zero or greater.');
      return;
    }

    if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
      alert('Reorder level must be a whole number of zero or greater.');
      return;
    }

    if (!reason) {
      alert('Please enter a reason for the opening stock.');
      return;
    }

    const request: OpeningStockRequest = {
      quantity,
      unitCost,
      reorderLevel,
      reason,
    };

    this.savingStock = true;

    this.apiService.addOpeningStock(productId, request).subscribe({
      next: () => {
        this.savingStock = false;
        this.showOpeningStockForm = false;

        // Refresh both lists after successful creation.
        this.loadInventory();
        this.loadProducts();
      },
      error: (error) => {
        console.error('Failed to create opening stock:', error);
        this.savingStock = false;

        alert(
          error?.error?.message ||
            error?.error?.detail ||
            'Unable to create opening stock. Please try again.',
        );
      },
    });
  }

  // 4. Add or remove stock
  openStockForm(item: InventoryResponse, action: StockAction): void {
    this.selectedItemId = item.id;
    this.stockAction = action;
    this.stockQuantity = 1;
    this.stockNote = '';
    this.showStockForm = true;
  }

  updateStock(): void {
    const item = this.selectedItem;
    const quantity = Number(this.stockQuantity);
    const reason = this.stockNote.trim();

    if (!item) {
      alert('Please select a valid inventory item.');
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert('Enter a whole number greater than zero.');
      return;
    }

    if (!reason) {
      alert('Please enter a reason for this adjustment.');
      return;
    }

    if (this.stockAction === 'Remove' && quantity > item.quantity) {
      alert('You cannot remove more units than the available stock.');
      return;
    }

    const request: StockAdjustmentRequest = {
      type: this.stockAction === 'Add' ? 'ADD' : 'REMOVE',
      quantity,
      reason,
    };

    this.savingStock = true;

    this.apiService.adjustStock(item.productId, request).subscribe({
      next: () => {
        // Close the popup and reset the selected item.
        this.showStockForm = false;
        this.selectedItemId = null;
        this.stockQuantity = 1;
        this.stockNote = '';
        this.savingStock = false;

        // Reload the complete inventory from the backend.
        this.loadInventory();
      },
      error: (error) => {
        console.error('Failed to adjust stock:', error);
        this.savingStock = false;

        alert(
          error?.error?.message ||
            error?.error?.detail ||
            'Unable to update stock. Please try again.',
        );
      },
    });
  }

  closeStockForm(): void {
    if (this.savingStock) {
      return;
    }

    this.showStockForm = false;
    this.selectedItemId = null;
    this.stockQuantity = 1;
    this.stockNote = '';
  }

  get selectedItem(): InventoryResponse | undefined {
    return this.inventory.find((item) => item.id === this.selectedItemId);
  }

  // 5. Get and display stock movement history

  openMovements(item: InventoryResponse): void {
    this.movementProductId = item.productId;
    this.movementProductName = item.productName;
    this.stockMovements = [];
    this.movementErrorMessage = '';
    this.loadingMovements = true;
    this.showMovementsModal = true;

    this.cdr.markForCheck();

    this.apiService.getStockMovements(item.productId).subscribe({
      next: (response) => {
        console.log('Stock movements received:', response);

        this.stockMovements = Array.isArray(response) ? [...response] : [];
        this.loadingMovements = false;

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load stock movements:', error);

        this.movementErrorMessage = 'Unable to load stock movement history. Please try again.';
        this.loadingMovements = false;

        this.cdr.markForCheck();
      },
    });
  }

  closeMovements(): void {
    this.showMovementsModal = false;
    this.movementProductId = null;
    this.movementProductName = '';
    this.stockMovements = [];
    this.movementErrorMessage = '';
  }
}
