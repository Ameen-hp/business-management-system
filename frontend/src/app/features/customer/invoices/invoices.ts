import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/guards/interceptors/services/api.service';
import { OrderResponse } from '../../../shared/models/order.model';

@Component({
  selector: 'app-customer-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoices.html',
})
export class CustomerInvoicesComponent implements OnInit {
  private api = inject(ApiService);

  orders: OrderResponse[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    const customerId = Number(sessionStorage.getItem('customerId'));

    if (!customerId) {
      this.error = 'Customer information is missing. Please sign in.';
      return;
    }

    this.loading = true;

    this.api.getCustomerOrders(customerId).subscribe({
      next: (data) => {
        this.orders = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load order records.';
        this.loading = false;
      },
    });
  }

  printOrder(order: OrderResponse): void {
    const rows = order.items
      .map(
        (item) =>
          `<tr>
        <td>${this.escape(item.productName)}</td>
        <td>${item.quantity}</td>
        <td>${item.unitPrice}</td>
        <td>${item.lineTotal}</td>
      </tr>`,
      )
      .join('');

    const popup = window.open('', '_blank');

    if (!popup) {
      this.error = 'Please allow pop-ups to print this order summary.';
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Order ${this.escape(order.orderNumber)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Order Summary</h1>
          <p>Order: ${this.escape(order.orderNumber)}</p>
          <p>Date: ${this.escape(order.orderDate)}</p>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <h3>Total: ${order.totalAmount}</h3>
          <p>This is an order summary, not an official invoice.</p>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    popup.document.close();
  }

  private escape(value: string): string {
    return String(value ?? '').replace(
      /[&<>"']/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[char] ?? char,
    );
  }
}
