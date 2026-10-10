import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type StockAction = 'Add' | 'Remove';

interface InventoryItem {
  id: number;
  productName: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class InventoryComponent {
  searchTerm = '';
  stockFilter = 'All';
  showStockForm = false;
  selectedItemId: number | null = null;
  stockAction: StockAction = 'Add';
  stockQuantity = 1;
  stockNote = '';

  inventory: InventoryItem[] = [
    {
      id: 1,
      productName: 'Wireless Mouse',
      sku: 'ELE-001',
      category: 'Electronics',
      quantity: 50,
      reorderLevel: 10,
      unitCost: 900,
    },
    {
      id: 2,
      productName: 'USB Keyboard',
      sku: 'ELE-002',
      category: 'Electronics',
      quantity: 7,
      reorderLevel: 10,
      unitCost: 1600,
    },
    {
      id: 3,
      productName: 'Office Notebook',
      sku: 'OFF-001',
      category: 'Office Supplies',
      quantity: 0,
      reorderLevel: 20,
      unitCost: 200,
    },
    {
      id: 4,
      productName: 'Cotton T-Shirt',
      sku: 'CLO-001',
      category: 'Clothing',
      quantity: 35,
      reorderLevel: 8,
      unitCost: 700,
    },
  ];

  get filteredInventory(): InventoryItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.inventory.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term);

      const matchesStatus =
        this.stockFilter === 'All' || this.getStockStatus(item) === this.stockFilter;

      return matchesSearch && matchesStatus;
    });
  }

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
    return this.inventory.reduce((total, item) => total + item.quantity * item.unitCost, 0);
  }

  getStockStatus(item: InventoryItem): StockStatus {
    if (item.quantity === 0) {
      return 'Out of Stock';
    }

    if (item.quantity <= item.reorderLevel) {
      return 'Low Stock';
    }

    return 'In Stock';
  }

  openStockForm(item: InventoryItem, action: StockAction): void {
    this.selectedItemId = item.id;
    this.stockAction = action;
    this.stockQuantity = 1;
    this.stockNote = '';
    this.showStockForm = true;
  }

  updateStock(): void {
    const item = this.inventory.find((stockItem) => stockItem.id === this.selectedItemId);

    const quantity = Number(this.stockQuantity);

    if (!item) {
      alert('Please select a valid inventory item.');
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert('Enter a whole number greater than zero.');
      return;
    }

    if (this.stockAction === 'Remove' && quantity > item.quantity) {
      alert('You cannot remove more units than the available stock.');
      return;
    }

    if (this.stockAction === 'Add') {
      item.quantity += quantity;
    } else {
      item.quantity -= quantity;
    }

    // In a real application, save this adjustment to the backend
    // together with the user, date, and reason for an audit trail.
    this.closeStockForm();
  }

  closeStockForm(): void {
    this.showStockForm = false;
    this.selectedItemId = null;
    this.stockQuantity = 1;
    this.stockNote = '';
  }

  get selectedItem(): InventoryItem | undefined {
    return this.inventory.find((item) => item.id === this.selectedItemId);
  }
}
