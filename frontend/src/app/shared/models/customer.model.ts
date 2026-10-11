export interface CustomerRequest {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password?: string;
  active?: boolean;
}

export interface CustomerResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
