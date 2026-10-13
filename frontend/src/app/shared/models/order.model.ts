export type OrderStatus =
  'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  customerId: number;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  items: OrderItemResponse[];
  status: OrderStatus;
  totalAmount: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
