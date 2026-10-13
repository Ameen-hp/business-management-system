import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../enviroment';
import { CustomerRequest, CustomerResponse } from '../../../../shared/models/customer.model';
import { ProductRequest, ProductResponse } from '../../../../shared/models/product.model';
import {
  OrderRequest,
  OrderResponse,
  OrderStatus,
  UpdateOrderStatusRequest,
} from '../../../../shared/models/order.model';
import {
  InventoryResponse,
  OpeningStockRequest,
  StockAdjustmentRequest,
  StockMovementResponse,
} from '../../../../shared/models/inventory.model';

export interface DeleteProductsResponse {
  deletedCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  private customerUrl = `${environment.apiUrl}/customers`;
  private productUrl = `${environment.apiUrl}/products`;
  private inventoryUrl = `${environment.apiUrl}/inventory`;
  private orderUrl = `${environment.apiUrl}/orders`;

  // ==================== CUSTOMER METHODS ====================

  // Create customer
  createCustomer(request: CustomerRequest): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.customerUrl, request);
  }

  // Get all customers
  getAllCustomers(): Observable<CustomerResponse[]> {
    return this.http.get<CustomerResponse[]>(this.customerUrl);
  }

  // Get customer by ID
  getCustomerById(id: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.customerUrl}/${id}`);
  }

  // Update customer
  updateCustomer(id: number, request: CustomerRequest): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.customerUrl}/${id}`, request);
  }

  // Delete customer
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.customerUrl}/${id}`);
  }

  // ==================== PRODUCT METHODS ====================

  // Create product
  createProduct(request: ProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.productUrl, request);
  }

  // Get all products
  getAllProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.productUrl);
  }

  // Get product by ID
  getProductById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.productUrl}/${id}`);
  }

  // Update product
  updateProduct(id: number, request: ProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.productUrl}/${id}`, request);
  }

  // Update product status
  updateProductStatus(id: number, status: 'Active' | 'Inactive'): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${this.productUrl}/${id}/status`, null, {
      params: { status },
    });
  }

  // Delete product
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.productUrl}/${id}`);
  }

  // Add inside your existing ApiService class

  // Delete all products belonging to a category
  deleteProductsByCategory(categoryName: string): Observable<DeleteProductsResponse> {
    const encodedCategory = encodeURIComponent(categoryName);

    return this.http.delete<DeleteProductsResponse>(
      `${this.productUrl}/category/${encodedCategory}`,
    );
  }

  // ==================== INVENTORY METHODS ====================

  // Get all inventory records
  getAllInventory(): Observable<InventoryResponse[]> {
    return this.http.get<InventoryResponse[]>(this.inventoryUrl);
  }

  // Get inventory for a specific product
  getInventoryByProductId(productId: number): Observable<InventoryResponse> {
    return this.http.get<InventoryResponse>(`${this.inventoryUrl}/${productId}`);
  }

  // Add opening stock for a product
  addOpeningStock(productId: number, request: OpeningStockRequest): Observable<InventoryResponse> {
    return this.http.post<InventoryResponse>(
      `${this.inventoryUrl}/${productId}/opening-stock`,
      request,
    );
  }

  // Add or remove stock
  adjustStock(productId: number, request: StockAdjustmentRequest): Observable<InventoryResponse> {
    return this.http.post<InventoryResponse>(
      `${this.inventoryUrl}/${productId}/adjustments`,
      request,
    );
  }

  // Get stock movement history for a product
  getStockMovements(productId: number): Observable<StockMovementResponse[]> {
    return this.http.get<StockMovementResponse[]>(`${this.inventoryUrl}/${productId}/movements`);
  }

  // ==================== ORDER METHODS ====================

  // Create a new order
  createOrder(request: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.orderUrl, request);
  }

  // Get all orders
  getAllOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(this.orderUrl);
  }

  // Get order by ID
  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.orderUrl}/${id}`);
  }

  // Get all orders for a specific customer
  getCustomerOrders(customerId: number): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.orderUrl}/customer/${customerId}`);
  }

  // Update an order's status
  updateOrderStatus(id: number, status: OrderStatus): Observable<OrderResponse> {
    const request: UpdateOrderStatusRequest = { status };

    return this.http.patch<OrderResponse>(`${this.orderUrl}/${id}/status`, request);
  }
}
