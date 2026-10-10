import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type PaymentStatus = 'Pending Verification' | 'Verified' | 'Rejected';
type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Other';

interface Payment {
  id: number;
  reference: string;
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  transactionReference: string;
  status: PaymentStatus;
  note: string;
}

interface InvoiceBalance {
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  total: number;
  amountPaid: number;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class PaymentsComponent {
  searchTerm = '';
  statusFilter = 'All';
  showForm = false;

  // Demo invoice balances. In production, fetch these from the backend.
  invoiceBalances: InvoiceBalance[] = [
    {
      invoiceNumber: 'INV-1001',
      orderNumber: 'ORD-1001',
      customerName: 'Ali Ahmed',
      total: 5500,
      amountPaid: 0,
    },
    {
      invoiceNumber: 'INV-1002',
      orderNumber: 'ORD-1002',
      customerName: 'Sara Khan',
      total: 3500,
      amountPaid: 1500,
    },
    {
      invoiceNumber: 'INV-1003',
      orderNumber: 'ORD-1003',
      customerName: 'Usman Malik',
      total: 3600,
      amountPaid: 3600,
    },
    {
      invoiceNumber: 'INV-1004',
      orderNumber: 'ORD-1004',
      customerName: 'Ayesha Noor',
      total: 6000,
      amountPaid: 0,
    },
  ];

  payments: Payment[] = [
    {
      id: 1,
      reference: 'PAY-1001',
      invoiceNumber: 'INV-1002',
      orderNumber: 'ORD-1002',
      customerName: 'Sara Khan',
      paymentDate: '2026-10-08',
      amount: 1500,
      method: 'Bank Transfer',
      transactionReference: 'BANK-TRX-102',
      status: 'Verified',
      note: 'Part payment',
    },
    {
      id: 2,
      reference: 'PAY-1002',
      invoiceNumber: 'INV-1001',
      orderNumber: 'ORD-1001',
      customerName: 'Ali Ahmed',
      paymentDate: '2026-10-09',
      amount: 2000,
      method: 'Cash',
      transactionReference: '',
      status: 'Pending Verification',
      note: 'Cash payment reported by customer',
    },
    {
      id: 3,
      reference: 'PAY-1003',
      invoiceNumber: 'INV-1004',
      orderNumber: 'ORD-1004',
      customerName: 'Ayesha Noor',
      paymentDate: '2026-10-07',
      amount: 500,
      method: 'Bank Transfer',
      transactionReference: 'BANK-TRX-103',
      status: 'Rejected',
      note: 'Could not verify the transaction',
    },
  ];

  form = {
    invoiceNumber: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    method: 'Bank Transfer' as PaymentMethod,
    transactionReference: '',
    note: '',
  };

  get filteredPayments(): Payment[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.payments.filter((payment) => {
      const matchesSearch =
        payment.reference.toLowerCase().includes(term) ||
        payment.invoiceNumber.toLowerCase().includes(term) ||
        payment.orderNumber.toLowerCase().includes(term) ||
        payment.customerName.toLowerCase().includes(term) ||
        payment.transactionReference.toLowerCase().includes(term);

      const matchesStatus = this.statusFilter === 'All' || payment.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get totalVerifiedPayments(): number {
    return this.payments
      .filter((payment) => payment.status === 'Verified')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  get pendingPaymentsCount(): number {
    return this.payments.filter((payment) => payment.status === 'Pending Verification').length;
  }

  get verifiedPaymentsCount(): number {
    return this.payments.filter((payment) => payment.status === 'Verified').length;
  }

  get rejectedPaymentsCount(): number {
    return this.payments.filter((payment) => payment.status === 'Rejected').length;
  }

  get selectedInvoice(): InvoiceBalance | undefined {
    return this.invoiceBalances.find(
      (invoice) => invoice.invoiceNumber === this.form.invoiceNumber,
    );
  }

  get remainingBalance(): number {
    const invoice = this.selectedInvoice;
    return invoice ? Math.max(0, invoice.total - invoice.amountPaid) : 0;
  }

  openForm(): void {
    this.form = {
      invoiceNumber: '',
      paymentDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      method: 'Bank Transfer',
      transactionReference: '',
      note: '',
    };

    this.showForm = true;
  }

  recordPayment(): void {
    const invoice = this.selectedInvoice;
    const amount = Number(this.form.amount);

    if (!invoice) {
      alert('Please select an invoice.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Enter a payment amount greater than zero.');
      return;
    }

    if (!this.form.paymentDate) {
      alert('Please select a payment date.');
      return;
    }

    if (amount > this.remainingBalance) {
      alert('The payment amount cannot exceed the invoice balance.');
      return;
    }

    if (this.form.method === 'Bank Transfer' && !this.form.transactionReference.trim()) {
      alert('Enter the bank transaction reference.');
      return;
    }

    const id = Math.max(0, ...this.payments.map((p) => p.id)) + 1;

    this.payments.unshift({
      id,
      reference: `PAY-${1000 + id}`,
      invoiceNumber: invoice.invoiceNumber,
      orderNumber: invoice.orderNumber,
      customerName: invoice.customerName,
      paymentDate: this.form.paymentDate,
      amount,
      method: this.form.method,
      transactionReference: this.form.transactionReference.trim(),
      status: 'Pending Verification',
      note: this.form.note.trim(),
    });

    // The payment does not change the invoice balance until verified.
    this.closeForm();
  }

  verifyPayment(payment: Payment): void {
    if (payment.status !== 'Pending Verification') {
      return;
    }

    const invoice = this.invoiceBalances.find(
      (item) => item.invoiceNumber === payment.invoiceNumber,
    );

    if (!invoice) {
      alert('Invoice not found.');
      return;
    }

    const otherVerifiedPayments = this.payments
      .filter((p) => p.invoiceNumber === payment.invoiceNumber && p.status === 'Verified')
      .reduce((total, p) => total + p.amount, 0);

    if (otherVerifiedPayments + payment.amount > invoice.total) {
      alert('This payment would exceed the invoice total.');
      return;
    }

    const confirmed = confirm(`Verify payment ${payment.reference} for Rs. ${payment.amount}?`);

    if (!confirmed) {
      return;
    }

    payment.status = 'Verified';
    invoice.amountPaid = otherVerifiedPayments + payment.amount;
  }

  rejectPayment(payment: Payment): void {
    if (payment.status !== 'Pending Verification') {
      return;
    }

    const confirmed = confirm(`Reject payment ${payment.reference}?`);

    if (confirmed) {
      payment.status = 'Rejected';
    }
  }

  closeForm(): void {
    this.showForm = false;
  }

  getStatusClass(status: PaymentStatus): string {
    switch (status) {
      case 'Pending Verification':
        return 'bg-amber-100 text-amber-700';
      case 'Verified':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
    }
  }
}
