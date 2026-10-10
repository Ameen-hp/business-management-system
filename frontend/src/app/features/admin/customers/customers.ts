import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Customer {
  id: number;
  name: string;
  email: string;
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
export class CustomersComponent {
  searchTerm = '';
  showForm = false;
  editingId: number | null = null;

  customers: Customer[] = [
    {
      id: 1,
      name: 'Ali Ahmed',
      email: 'ali@example.com',
      phone: '03001234567',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Sara Khan',
      email: 'sara@example.com',
      phone: '03111234567',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Usman Malik',
      email: 'usman@example.com',
      phone: '03221234567',
      status: 'Inactive',
    },
  ];

  form = {
    name: '',
    email: '',
    phone: '',
    temporaryPassword: '',
  };

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
    return this.customers.filter((c) => c.status === 'Active').length;
  }

  get inactiveCount(): number {
    return this.customers.filter((c) => c.status === 'Inactive').length;
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
      temporaryPassword: '',
    };

    this.showForm = true;
  }

  saveCustomer(): void {
    const name = this.form.name.trim();
    const email = this.form.email.trim().toLowerCase();
    const phone = this.form.phone.trim();

    if (!name || !email || !phone) {
      alert('Please fill in all required fields.');
      return;
    }

    const duplicateEmail = this.customers.some(
      (customer) => customer.email.toLowerCase() === email && customer.id !== this.editingId,
    );

    if (duplicateEmail) {
      alert('A customer with this email already exists.');
      return;
    }

    if (this.editingId !== null) {
      const customer = this.customers.find((c) => c.id === this.editingId);

      if (customer) {
        customer.name = name;
        customer.email = email;
        customer.phone = phone;
      }
    } else {
      if (this.form.temporaryPassword.length < 8) {
        alert('Temporary password must contain at least 8 characters.');
        return;
      }

      this.customers.unshift({
        id: Math.max(0, ...this.customers.map((c) => c.id)) + 1,
        name,
        email,
        phone,
        status: 'Active',
      });

      alert(
        'Customer added to the current page data. ' +
          'A real login account has not been created yet.',
      );
    }

    this.showForm = false;
    this.resetForm();
  }

  toggleStatus(customer: Customer): void {
    customer.status = customer.status === 'Active' ? 'Inactive' : 'Active';
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.form = {
      name: '',
      email: '',
      phone: '',
      temporaryPassword: '',
    };
  }
}
