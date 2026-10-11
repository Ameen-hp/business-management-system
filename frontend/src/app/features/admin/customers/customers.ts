import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/guards/interceptors/services/api.service';
import { CustomerRequest, CustomerResponse } from '../../../shared/models/customer.model';
// Keep the same properties used by your existing HTML.
interface Customer {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class CustomersComponent implements OnInit {
  searchTerm = '';
  showForm = false;
  editingId: number | null = null;
  loading = false;
  saving = false;

  customers: Customer[] = [];

  form = {
    name: '',
    email: '',
    phone: '',
    address: '',
    temporaryPassword: '',
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadCustomers();
    });
  }

  // Load real customers from Spring Boot.
  loadCustomers(): void {
    this.loading = true;

    this.apiService.getAllCustomers().subscribe({
      next: (response: CustomerResponse[]) => {
        this.customers = response.map((customer) => this.mapCustomer(customer));
        console.log('Loaded customers:', this.customers);
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        console.error('Failed to load customers:', error);
        alert('Unable to load customers. Please check the backend.');
      },
    });
  }

  // Convert backend fields into the existing HTML field names.
  private mapCustomer(customer: CustomerResponse): Customer {
    return {
      id: customer.id,
      name: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      status: customer.active ? 'Active' : 'Inactive',
    };
  }

  get filteredCustomers(): Customer[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.customers;
    }

    return this.customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.includes(term),
    );
  }

  get activeCount(): number {
    return this.customers.filter((customer) => customer.status === 'Active').length;
  }

  get inactiveCount(): number {
    return this.customers.filter((customer) => customer.status === 'Inactive').length;
  }

  openCreateForm(): void {
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(customer: Customer): void {
    this.editingId = customer.id;

    this.form = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      temporaryPassword: '',
    };

    this.showForm = true;
  }

  saveCustomer(): void {
    const name = this.form.name.trim();
    const email = this.form.email.trim().toLowerCase();
    const phone = this.form.phone.trim();
    const address = this.form.address.trim();
    const password = this.form.temporaryPassword;

    if (!name || !email || !phone || !address) {
      alert('Please fill in all required fields.');
      return;
    }

    if (this.editingId === null && password.length < 8) {
      alert('Temporary password must contain at least 8 characters.');
      return;
    }

    const duplicateEmail = this.customers.some(
      (customer) => customer.email.toLowerCase() === email && customer.id !== this.editingId,
    );

    if (duplicateEmail) {
      alert('A customer with this email already exists.');
      return;
    }

    const request: CustomerRequest = {
      fullName: name,
      email,
      phone,
      password,
      address,
    };

    if (this.editingId === null) {
      request.password = password;
    }

    this.saving = true;

    if (this.editingId !== null) {
      this.apiService.updateCustomer(this.editingId, request).subscribe({
        next: (response: CustomerResponse) => {
          this.replaceCustomer(response);
          this.finishSave('Customer updated successfully.');
        },
        error: (error: unknown) => {
          this.handleSaveError(error, 'update');
        },
      });
    } else {
      this.apiService.createCustomer(request).subscribe({
        next: (response: CustomerResponse) => {
          this.customers.unshift(this.mapCustomer(response));
          this.finishSave('Customer created successfully.');
        },
        error: (error: unknown) => {
          this.handleSaveError(error, 'create');
        },
      });
    }
  }

  // Persist customer status using the backend update endpoint.
  toggleStatus(customer: Customer): void {
    const newActiveStatus = customer.status !== 'Active';

    const request: CustomerRequest = {
      fullName: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      active: newActiveStatus,
    };

    this.apiService.updateCustomer(customer.id, request).subscribe({
      next: (response: CustomerResponse) => {
        this.replaceCustomer(response);
      },
      error: (error: unknown) => {
        console.error('Failed to update customer status:', error);
        alert('Unable to update customer status.');
      },
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  private replaceCustomer(response: CustomerResponse): void {
    const updatedCustomer = this.mapCustomer(response);

    this.customers = this.customers.map((customer) =>
      customer.id === updatedCustomer.id ? updatedCustomer : customer,
    );
  }

  private finishSave(message: string): void {
    this.saving = false;
    this.showForm = false;
    this.resetForm();
    alert(message);
  }

  private handleSaveError(error: unknown, action: string): void {
    this.saving = false;
    console.error(`Failed to ${action} customer:`, error);
    alert(`Unable to ${action} customer. Please try again.`);
  }

  private resetForm(): void {
    this.form = {
      name: '',
      email: '',
      phone: '',
      address: '',
      temporaryPassword: '',
    };
  }
}
