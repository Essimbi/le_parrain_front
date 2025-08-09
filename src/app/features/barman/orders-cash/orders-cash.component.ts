import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';
import { Subject, takeUntil } from 'rxjs';
import { OrdersDetailsModalComponent } from './orders-details-modal/orders-details-modal.component';

export interface Product {
  id: string;
  name: string;
}

export interface OrderItem {
  product: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  number_of_customers: number;
  status: 'ouverte' | 'servie' | 'fermée';
  total_amount: number;
  payment_type: 'cash' | 'mobile_money' | null;
  created_at: string;
  createdAt?: string;
  closed_at: string | null;
  items: OrderItem[];
  serveurName?: string;
  tableNumber?: number;
}

export interface CashMetrics {
  date: string;
  total_revenue: number;
  total_closed_orders: number;
}

interface PaymentData {
  orderId: string;
  paymentType: 'cash' | 'mobile_money';
  amountReceived: number;
  changeAmount: number;
}

@Component({
  selector: 'app-orders-cash',
  standalone: true,
  imports: [CommonModule, OrderCardComponent, PaymentModalComponent, OrdersDetailsModalComponent],
  templateUrl: './orders-cash.component.html',
  styleUrl: './orders-cash.component.scss'
})
export class OrdersCashComponent implements OnInit, OnDestroy {
  cashMetrics: CashMetrics & { cashPayments: number; mobileMoneyPayments: number; pendingOrders: number; ordersServed: number } = {
    date: '2025-08-09',
    total_revenue: 350000,
    total_closed_orders: 25,
    cashPayments: 200000,
    mobileMoneyPayments: 150000,
    pendingOrders: 8,
    ordersServed: 22
  };

  newOrders: Order[] = [
    {
      id: 'order1',
      number_of_customers: 2,
      status: 'ouverte',
      total_amount: 3500,
      payment_type: null,
      created_at: '2025-08-09T18:10:00Z',
      closed_at: null,
      items: [
        { product: 'Bière Mutzig', quantity: 2, unit_price: 1500 },
        { product: 'Jus de Tamarin', quantity: 1, unit_price: 500 }
      ],
      serveurName: 'Jean',
      tableNumber: 1
    },
    {
      id: 'order2',
      number_of_customers: 3,
      status: 'ouverte',
      total_amount: 5000,
      payment_type: null,
      created_at: '2025-08-09T18:25:00Z',
      closed_at: null,
      items: [
        { product: 'Bière 33 Export', quantity: 3, unit_price: 1500 },
        { product: 'Jus de Bissap', quantity: 1, unit_price: 500 }
      ],
      serveurName: 'Aissatou',
      tableNumber: 2
    },
    {
      id: 'order5',
      number_of_customers: 4,
      status: 'ouverte',
      total_amount: 6000,
      payment_type: null,
      created_at: '2025-08-09T19:00:00Z',
      closed_at: null,
      items: [
        { product: 'Jus de Gingembre', quantity: 4, unit_price: 1000 },
        { product: 'Bière Beaufort', quantity: 1, unit_price: 2000 }
      ],
      serveurName: 'Marie',
      tableNumber: 5
    },
  ];

  preparingOrders: Order[] = [
    {
      id: 'order3',
      number_of_customers: 1,
      status: 'servie',
      total_amount: 1500,
      payment_type: null,
      created_at: '2025-08-09T18:00:00Z',
      closed_at: null,
      items: [
        { product: 'Bière Beaufort', quantity: 1, unit_price: 1500 }
      ],
      serveurName: 'Pierre',
      tableNumber: 3
    },
    {
      id: 'order4',
      number_of_customers: 4,
      status: 'servie',
      total_amount: 8000,
      payment_type: null,
      created_at: '2025-08-09T18:15:00Z',
      closed_at: null,
      items: [
        { product: 'Bière Heineken', quantity: 4, unit_price: 2000 }
      ],
      serveurName: 'Martine',
      tableNumber: 4
    },
  ];

  showPaymentModal = false;
  selectedOrderForPayment: Order | null = null;
  showDetailsModal = false;
  selectedOrderForDetails: Order | null = null;

  private destroy$ = new Subject<void>();
  public userRole: 'barman' | 'admin' | 'serveur' = 'serveur';

  constructor() {}

  ngOnInit() {
    this.loadOrdersAndMetrics();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrdersAndMetrics(): void {
    this.cashMetrics.pendingOrders = this.newOrders.length + this.preparingOrders.length;
  }

  onPrepareOrder(orderId: string) {
    if (this.userRole !== 'serveur') {
      this.showNotification('Seul un serveur peut préparer une commande.', 'warning');
      return;
    }

    const orderIndex = this.newOrders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      const order = { ...this.newOrders[orderIndex], status: 'servie' as 'servie' };
      this.newOrders.splice(orderIndex, 1);
      this.preparingOrders.push(order);
      this.cashMetrics.pendingOrders = this.newOrders.length + this.preparingOrders.length;
      this.showNotification(`Commande ${order.id} mise en préparation`, 'success');
      this.closeDetailsModal();
    }
  }

  onFinishOrder(orderId: string) {
    const order = this.preparingOrders.find(o => o.id === orderId);
    if (order) {
      this.showNotification(`Commande ${order.id} prête à être payée`, 'info');
      this.onProcessPayment(orderId);
    }
  }

  onProcessPayment(orderId: string) {
    const order = this.preparingOrders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrderForPayment = order;
      this.showPaymentModal = true;
      this.closeDetailsModal();
    }
  }

  onViewDetails(orderId: string) {
    const order = [...this.newOrders, ...this.preparingOrders].find(o => o.id === orderId);
    if (order) {
      this.selectedOrderForDetails = order;
      this.showDetailsModal = true;
    }
  }
  
  onPaymentComplete(paymentData: PaymentData) {
    const order = this.selectedOrderForPayment;
    if (order) {
      const updatedOrder: Order = { ...order, status: 'fermée', closed_at: new Date().toISOString(), payment_type: paymentData.paymentType };
      this.cashMetrics.total_revenue += updatedOrder.total_amount;
      this.cashMetrics.ordersServed++;
      if (paymentData.paymentType === 'cash') {
        this.cashMetrics.cashPayments += updatedOrder.total_amount;
      } else {
        this.cashMetrics.mobileMoneyPayments += updatedOrder.total_amount;
      }

      const orderIndex = this.preparingOrders.findIndex(o => o.id === order.id);
      if (orderIndex !== -1) {
        this.preparingOrders.splice(orderIndex, 1);
      }
      this.cashMetrics.pendingOrders = Math.max(0, this.newOrders.length + this.preparingOrders.length);

      this.showNotification(`Paiement confirmé pour ${updatedOrder.id} (${paymentData.paymentType})`, 'success');
      this.closePaymentModal();
    } else {
      this.closePaymentModal();
    }
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedOrderForPayment = null;
  }
  
  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedOrderForDetails = null;
  }

  private showNotification(message: string, type: 'success' | 'info' | 'warning' = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date('2025-08-09T23:59:00Z');
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (isNaN(diffInMinutes)) return 'Date invalide';
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes === 1) return 'Il y a 1 min';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return 'Il y a 1h';
    return `Il y a ${diffInHours}h`;
  }
}