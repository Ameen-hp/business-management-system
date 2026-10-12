export interface ProductRequest {
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  status?: 'Active' | 'Inactive';
}

export interface ProductResponse {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  status: 'Active' | 'Inactive';
  createdOn?: string;
  updatedOn?: string;
}
