export interface OpeningStockRequest {
  quantity: number;
  unitCost: number;
  reorderLevel: number;
  reason: string;
}

export interface StockAdjustmentRequest {
  type: 'ADD' | 'REMOVE';
  quantity: number;
  reason: string;
}

export interface InventoryResponse {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  category: string;
  sellingPrice: number;
  productStatus: 'Active' | 'Inactive' | string;

  quantity: number;
  reorderLevel: number;
  unitCost: number;
  stockValue: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | string;

  createdOn: string;
  updatedOn: string;
}

export interface StockMovementResponse {
  id: number;
  productId: number;
  productName: string;
  sku: string;

  movementType: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  createdOn: string;
}
