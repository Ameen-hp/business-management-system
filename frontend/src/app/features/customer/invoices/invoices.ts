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
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = '';

    const storedCustomerId = sessionStorage.getItem('customerId');
    const customerId = Number(storedCustomerId);

    if (!storedCustomerId || !Number.isInteger(customerId) || customerId <= 0) {
      this.error = 'Customer information is missing. Please sign in.';
      this.loading = false;
      return;
    }

    this.api.getCustomerOrders(customerId).subscribe({
      next: (data: OrderResponse[]) => {
        console.log('Customer invoice order records:', data);

        this.orders = Array.isArray(data) ? data : [];

        this.loading = false;
      },
      error: (err) => {
        console.error('Unable to load customer invoice records:', err);

        this.error = 'Unable to load your invoice records. Please try again.';
        this.loading = false;
      },
    });
  }

  printOrder(order: OrderResponse): void {
    const popup = window.open('', '_blank');

    if (!popup) {
      this.error = 'Please allow pop-ups in your browser to print this invoice.';
      return;
    }

    const items = Array.isArray(order.items) ? order.items : [];

    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(amount) || 0);
    };

    const formattedDate = order.orderDate
      ? new Date(order.orderDate).toLocaleString('en-PK', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'Not available';

    const rows = items
      .map(
        (item) => `
          <tr>
            <td>${this.escape(item.productName)}</td>
            <td>${this.escape(item.sku)}</td>
            <td class="number">${Number(item.quantity) || 0}</td>
            <td class="number">${formatCurrency(item.unitPrice)}</td>
            <td class="number">${formatCurrency(item.lineTotal)}</td>
          </tr>
        `,
      )
      .join('');

    const totalAmount = formatCurrency(order.totalAmount);

    popup.document.open();

    popup.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">

          <title>Order ${this.escape(order.orderNumber)}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 35px;
              color: #1f2937;
              background: #ffffff;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 13px;
            }

            .invoice {
              max-width: 900px;
              margin: 0 auto;
            }

            .header {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding-bottom: 22px;
              border-bottom: 2px solid #4f46e5;
            }

            h1 {
              margin: 0 0 8px;
              color: #312e81;
              font-size: 28px;
            }

            h2 {
              margin: 0 0 12px;
              font-size: 15px;
            }

            p {
              margin: 5px 0;
              line-height: 1.5;
            }

            .muted {
              color: #6b7280;
            }

            .reference {
              text-align: right;
              overflow-wrap: anywhere;
            }

            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 25px 0;
            }

            .detail-card {
              padding: 16px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }

            .label {
              margin-bottom: 10px;
              color: #6b7280;
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            table {
              width: 100%;
              margin-top: 12px;
              border-collapse: collapse;
            }

            th, td {
              padding: 12px 10px;
              border-bottom: 1px solid #e5e7eb;
              text-align: left;
            }

            th {
              background: #f3f4f6;
              color: #374151;
              font-size: 11px;
              text-transform: uppercase;
            }

            .number {
              text-align: right;
              white-space: nowrap;
            }

            .total {
              width: 100%;
              max-width: 350px;
              margin: 25px 0 0 auto;
              padding: 18px;
              background: #f9fafb;
              border-radius: 8px;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              gap: 15px;
            }

            .amount {
              color: #4338ca;
              font-size: 21px;
              font-weight: bold;
            }

            .footer {
              margin-top: 35px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 11px;
              text-align: center;
            }

            @media print {
              body {
                padding: 0;
              }

              .invoice {
                max-width: none;
              }

              .detail-card,
              .total,
              tr {
                break-inside: avoid;
              }

              thead {
                display: table-header-group;
              }
            }

            @media screen and (max-width: 600px) {
              body {
                padding: 15px;
              }

              .header {
                flex-direction: column;
              }

              .reference {
                text-align: left;
              }

              .details {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>

        <body>
          <main class="invoice">
            <header class="header">
              <div>
                <h1>INVOICE</h1>
                <p class="muted">Business Management System</p>
                <p class="muted">Customer Order Summary</p>
              </div>

              <div class="reference">
                <p><strong>Order Reference</strong></p>
                <p>${this.escape(order.orderNumber)}</p>
                <p class="muted">Date: ${this.escape(formattedDate)}</p>
                <p>Status: ${this.escape(order.status || 'Unknown')}</p>
              </div>
            </header>

            <section class="details">
              <div class="detail-card">
                <p class="label">Billed To</p>
                <h2>${this.escape(order.customerName || 'Customer')}</h2>
                <p>${this.escape(order.customerEmail || 'No email available')}</p>
                <p>Customer ID: ${this.escape(String(order.customerId ?? ''))}</p>
              </div>

              <div class="detail-card">
                <p class="label">Order Information</p>
                <p><strong>Order Number:</strong></p>
                <p>${this.escape(order.orderNumber)}</p>
                <p><strong>Order Date:</strong></p>
                <p>${this.escape(formattedDate)}</p>
              </div>
            </section>

            <section>
              <h2>Order Items</h2>

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th class="number">Qty</th>
                    <th class="number">Unit Price</th>
                    <th class="number">Line Total</th>
                  </tr>
                </thead>

                <tbody>
                  ${
                    rows ||
                    `
                    <tr>
                      <td colspan="5">No items available for this order.</td>
                    </tr>
                  `
                  }
                </tbody>
              </table>
            </section>

            <section class="total">
              <div class="total-row">
                <span>Total Items</span>
                <strong>${items.length}</strong>
              </div>

              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 14px 0;">

              <div class="total-row">
                <strong>Order Total</strong>
                <span class="amount">${totalAmount}</span>
              </div>
            </section>

            <footer class="footer">
              <p>This document is generated from an order record.</p>
              <p>It is not an official tax invoice or proof of payment.</p>
            </footer>
          </main>

          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    popup.document.close();
  }

  private escape(value: unknown): string {
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
