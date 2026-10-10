import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ShipmentStatus =
  | 'Preparing'
  | 'Ready to Dispatch'
  | 'Dispatched'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Delivery Failed'
  | 'Returned';

interface Shipment {
  id: number;
  shipmentNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
  courier: string;
  trackingNumber: string;
  shipmentDate: string;
  expectedDelivery: string;
  packageCount: number;
  weight: number;
  status: ShipmentStatus;
  notes: string;
}

interface OrderOption {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
}

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipment.html',
  styleUrl: './shipment.css',
})
export class ShipmentsComponent {
  searchTerm = '';
  statusFilter = 'All';
  selectedShipment: Shipment | null = null;
  showForm = false;

  shipmentStatuses: ShipmentStatus[] = [
    'Preparing',
    'Ready to Dispatch',
    'Dispatched',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Delivery Failed',
    'Returned',
  ];

  couriers = ['TCS', 'Leopards Courier', 'M&P', 'Pakistan Post', 'Own Delivery'];

  // Demo orders that are available to create shipments for.
  availableOrders: OrderOption[] = [
    {
      orderNumber: 'ORD-1006',
      customerName: 'Bilal Ahmed',
      customerEmail: 'bilal@example.com',
      deliveryAddress: 'Gulshan-e-Iqbal, Karachi',
    },
    {
      orderNumber: 'ORD-1007',
      customerName: 'Fatima Noor',
      customerEmail: 'fatima@example.com',
      deliveryAddress: 'Johar Town, Lahore',
    },
    {
      orderNumber: 'ORD-1008',
      customerName: 'Hassan Ali',
      customerEmail: 'hassan@example.com',
      deliveryAddress: 'Blue Area, Islamabad',
    },
  ];

  shipments: Shipment[] = [
    {
      id: 1,
      shipmentNumber: 'SHP-1001',
      orderNumber: 'ORD-1001',
      customerName: 'Ali Ahmed',
      customerEmail: 'ali@example.com',
      deliveryAddress: 'DHA Phase 5, Karachi',
      courier: 'TCS',
      trackingNumber: 'TCS-784512',
      shipmentDate: '2026-10-08',
      expectedDelivery: '2026-10-11',
      packageCount: 1,
      weight: 1.5,
      status: 'In Transit',
      notes: 'Handle package carefully.',
    },
    {
      id: 2,
      shipmentNumber: 'SHP-1002',
      orderNumber: 'ORD-1002',
      customerName: 'Sara Khan',
      customerEmail: 'sara@example.com',
      deliveryAddress: 'Johar Town, Lahore',
      courier: 'Leopards Courier',
      trackingNumber: 'LEO-452781',
      shipmentDate: '2026-10-07',
      expectedDelivery: '2026-10-10',
      packageCount: 1,
      weight: 2,
      status: 'Out for Delivery',
      notes: '',
    },
    {
      id: 3,
      shipmentNumber: 'SHP-1003',
      orderNumber: 'ORD-1003',
      customerName: 'Usman Malik',
      customerEmail: 'usman@example.com',
      deliveryAddress: 'Blue Area, Islamabad',
      courier: 'M&P',
      trackingNumber: 'MP-963258',
      shipmentDate: '2026-10-05',
      expectedDelivery: '2026-10-08',
      packageCount: 2,
      weight: 3.2,
      status: 'Delivered',
      notes: 'Delivered to customer.',
    },
    {
      id: 4,
      shipmentNumber: 'SHP-1004',
      orderNumber: 'ORD-1004',
      customerName: 'Ayesha Noor',
      customerEmail: 'ayesha@example.com',
      deliveryAddress: 'Model Town, Lahore',
      courier: 'Own Delivery',
      trackingNumber: '',
      shipmentDate: '2026-10-09',
      expectedDelivery: '2026-10-12',
      packageCount: 1,
      weight: 1,
      status: 'Preparing',
      notes: '',
    },
  ];

  form = {
    orderNumber: '',
    courier: 'TCS',
    trackingNumber: '',
    deliveryAddress: '',
    shipmentDate: '2026-10-09',
    expectedDelivery: '',
    packageCount: 1,
    weight: 1,
    notes: '',
  };

  get filteredShipments(): Shipment[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.shipments.filter((shipment) => {
      const matchesSearch =
        !term ||
        shipment.shipmentNumber.toLowerCase().includes(term) ||
        shipment.orderNumber.toLowerCase().includes(term) ||
        shipment.customerName.toLowerCase().includes(term) ||
        shipment.trackingNumber.toLowerCase().includes(term);

      const matchesStatus = this.statusFilter === 'All' || shipment.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get totalShipments(): number {
    return this.shipments.length;
  }

  get preparingCount(): number {
    return this.shipments.filter((s) => ['Preparing', 'Ready to Dispatch'].includes(s.status))
      .length;
  }

  get inTransitCount(): number {
    return this.shipments.filter((s) =>
      ['Dispatched', 'In Transit', 'Out for Delivery'].includes(s.status),
    ).length;
  }

  get deliveredCount(): number {
    return this.shipments.filter((s) => s.status === 'Delivered').length;
  }

  get remainingOrders(): OrderOption[] {
    const usedOrderNumbers = new Set(this.shipments.map((s) => s.orderNumber));

    return this.availableOrders.filter((order) => !usedOrderNumbers.has(order.orderNumber));
  }

  openCreateForm(): void {
    this.form = {
      orderNumber: '',
      courier: 'TCS',
      trackingNumber: '',
      deliveryAddress: '',
      shipmentDate: '2026-10-09',
      expectedDelivery: '',
      packageCount: 1,
      weight: 1,
      notes: '',
    };

    this.showForm = true;
  }

  onOrderSelected(): void {
    const order = this.availableOrders.find((item) => item.orderNumber === this.form.orderNumber);

    if (order) {
      this.form.deliveryAddress = order.deliveryAddress;
    }
  }

  createShipment(): void {
    const order = this.availableOrders.find((item) => item.orderNumber === this.form.orderNumber);

    if (!order) {
      alert('Please select an order.');
      return;
    }

    if (!this.form.deliveryAddress.trim()) {
      alert('Please enter the delivery address.');
      return;
    }

    if (!this.form.shipmentDate || !this.form.expectedDelivery) {
      alert('Please enter both shipment and expected delivery dates.');
      return;
    }

    if (this.form.expectedDelivery < this.form.shipmentDate) {
      alert('Expected delivery cannot be earlier than the shipment date.');
      return;
    }

    if (this.form.packageCount < 1 || this.form.weight <= 0) {
      alert('Package count and weight must be greater than zero.');
      return;
    }

    const nextId = Math.max(0, ...this.shipments.map((s) => s.id)) + 1;

    const shipment: Shipment = {
      id: nextId,
      shipmentNumber: `SHP-${1000 + nextId}`,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      deliveryAddress: this.form.deliveryAddress.trim(),
      courier: this.form.courier,
      trackingNumber: this.form.trackingNumber.trim(),
      shipmentDate: this.form.shipmentDate,
      expectedDelivery: this.form.expectedDelivery,
      packageCount: this.form.packageCount,
      weight: this.form.weight,
      status: 'Preparing',
      notes: this.form.notes.trim(),
    };

    this.shipments = [shipment, ...this.shipments];
    this.showForm = false;
    alert(`Shipment ${shipment.shipmentNumber} created successfully.`);
  }

  viewShipment(shipment: Shipment): void {
    this.selectedShipment = shipment;
  }

  closeDetails(): void {
    this.selectedShipment = null;
  }

  updateStatus(shipment: Shipment, newStatus: ShipmentStatus): void {
    shipment.status = newStatus;

    // Keep the open details modal in sync with the updated shipment.
    if (this.selectedShipment?.id === shipment.id) {
      this.selectedShipment = { ...shipment };
    }
  }

  statusClass(status: ShipmentStatus): string {
    const classes: Record<ShipmentStatus, string> = {
      Preparing: 'bg-amber-100 text-amber-800',
      'Ready to Dispatch': 'bg-orange-100 text-orange-800',
      Dispatched: 'bg-blue-100 text-blue-800',
      'In Transit': 'bg-indigo-100 text-indigo-800',
      'Out for Delivery': 'bg-violet-100 text-violet-800',
      Delivered: 'bg-emerald-100 text-emerald-800',
      'Delivery Failed': 'bg-red-100 text-red-800',
      Returned: 'bg-slate-200 text-slate-700',
    };

    return classes[status];
  }
}
