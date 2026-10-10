import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type InvoiceStatus = 'Issued' | 'Partially Paid' | 'Paid' | 'Overdue';

interface InvoiceItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  amountPaid: number;
  status: InvoiceStatus;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class Invoices {
  searchTerm = '';
  statusFilter = 'All';
  selectedInvoice: Invoice | null = null;

  invoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: 'INV-1001',
      orderNumber: 'ORD-1001',
      customerName: 'Ali Ahmed',
      customerEmail: 'ali@example.com',
      invoiceDate: '2026-10-08',
      dueDate: '2026-10-18',
      amountPaid: 0,
      status: 'Issued',
      items: [
        { productName: 'Wireless Mouse', sku: 'ELE-001', quantity: 2, unitPrice: 1500 },
        { productName: 'USB Keyboard', sku: 'ELE-002', quantity: 1, unitPrice: 2500 },
      ],
    },
    {
      id: 2,
      invoiceNumber: 'INV-1002',
      orderNumber: 'ORD-1002',
      customerName: 'Sara Khan',
      customerEmail: 'sara@example.com',
      invoiceDate: '2026-10-07',
      dueDate: '2026-10-20',
      amountPaid: 1500,
      status: 'Partially Paid',
      items: [{ productName: 'Office Notebook', sku: 'OFF-001', quantity: 10, unitPrice: 350 }],
    },
    {
      id: 3,
      invoiceNumber: 'INV-1003',
      orderNumber: 'ORD-1003',
      customerName: 'Usman Malik',
      customerEmail: 'usman@example.com',
      invoiceDate: '2026-10-01',
      dueDate: '2026-10-05',
      amountPaid: 3600,
      status: 'Paid',
      items: [{ productName: 'Cotton T-Shirt', sku: 'CLO-001', quantity: 3, unitPrice: 1200 }],
    },
    {
      id: 4,
      invoiceNumber: 'INV-1004',
      orderNumber: 'ORD-1004',
      customerName: 'Ayesha Noor',
      customerEmail: 'ayesha@example.com',
      invoiceDate: '2026-09-20',
      dueDate: '2026-09-30',
      amountPaid: 0,
      status: 'Overdue',
      items: [{ productName: 'Wireless Mouse', sku: 'ELE-001', quantity: 4, unitPrice: 1500 }],
    },
  ];

  get filteredInvoices(): Invoice[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.orderNumber.toLowerCase().includes(term) ||
        invoice.customerName.toLowerCase().includes(term) ||
        invoice.customerEmail.toLowerCase().includes(term);

      const matchesStatus = this.statusFilter === 'All' || invoice.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  getInvoiceTotal(invoice: Invoice): number {
    return invoice.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  }

  getBalance(invoice: Invoice): number {
    return Math.max(0, this.getInvoiceTotal(invoice) - invoice.amountPaid);
  }

  get totalInvoiced(): number {
    return this.invoices.reduce((total, invoice) => total + this.getInvoiceTotal(invoice), 0);
  }

  get totalOutstanding(): number {
    return this.invoices.reduce((total, invoice) => total + this.getBalance(invoice), 0);
  }

  get paidInvoicesCount(): number {
    return this.invoices.filter((invoice) => invoice.status === 'Paid').length;
  }

  get overdueInvoicesCount(): number {
    return this.invoices.filter((invoice) => invoice.status === 'Overdue').length;
  }

  viewInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
  }

  closeInvoice(): void {
    this.selectedInvoice = null;
  }

  printInvoice(): void {
    window.print();
  }

  getStatusClass(status: InvoiceStatus): string {
    switch (status) {
      case 'Issued':
        return 'bg-blue-100 text-blue-700';
      case 'Partially Paid':
        return 'bg-amber-100 text-amber-700';
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Overdue':
        return 'bg-red-100 text-red-700';
    }
  }
}
