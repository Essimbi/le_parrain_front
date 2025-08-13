import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';
import { Subject, takeUntil, forkJoin, interval, switchMap, startWith } from 'rxjs';
import { OrdersDetailsModalComponent } from './orders-details-modal/orders-details-modal.component';
import { OrderService } from '../../../core/services/order.service';

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
  mobile_money_payments?: number;
  cash_payments?: number;
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
    date: '',
    total_revenue: 0,
    total_closed_orders: 0,
    cashPayments: 0,
    mobileMoneyPayments: 0,
    pendingOrders: 0,
    ordersServed: 0
  };

  newOrders: Order[] = [];
  preparingOrders: Order[] = [];
  isLoading = true;
  activeTab: 'new' | 'preparing' = 'new';
  
  showPaymentModal = false;
  selectedOrderForPayment: Order | null = null;
  showDetailsModal = false;
  selectedOrderForDetails: Order | null = null;

  private destroy$ = new Subject<void>();
  public userRole: 'barman' | 'admin' | 'serveur' = 'serveur';

  constructor(public orderService: OrderService) {}

  ngOnInit() {
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadInitialData(): void {
    forkJoin({
      metrics: this.orderService.getGlobalDailyRevenue(),
      newOrders: this.orderService.getOpenedOrders(),
      preparingOrders: this.orderService.getServedOrders()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (results: any) => {
        this.updateData(results);
        this.isLoading = false;
        this.startAutoRefresh();
      },
      error: (err) => {
        console.error('Error loading initial data', err);
        this.isLoading = false;
        this.showNotification('Échec du chargement initial des commandes et métriques.', 'warning');
      }
    });
  }

  private startAutoRefresh(): void {
    interval(5000)
      .pipe(
        switchMap(() => {
          return forkJoin({
            metrics: this.orderService.getGlobalDailyRevenue(),
            newOrders: this.orderService.getOpenedOrders(),
            preparingOrders: this.orderService.getServedOrders()
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (results: any) => {
          this.updateData(results);
        },
        error: (err) => {
          console.error('Error during auto-refresh', err);
          this.showNotification('Échec du rafraîchissement des données.', 'warning');
        }
      });
  }

  private updateData(results: any): void {
    this.cashMetrics = {
      ...this.cashMetrics,
      ...results.metrics,
      total_revenue: results.metrics.total_revenue || 0,
      ordersServed: results.metrics.total_closed_orders || 0,
      mobileMoneyPayments: results.metrics.mobile_money_payments || 0,
      cashPayments: results.metrics.cash_payments || 0,
    };
    this.newOrders = results.newOrders.data;
    this.preparingOrders = results.preparingOrders.data;
    this.cashMetrics.pendingOrders = this.newOrders.length + this.preparingOrders.length;
  }

  setActiveTab(tab: 'new' | 'preparing'): void {
    this.activeTab = tab;
  }

  onPrepareOrder(orderId: string) {
    if (this.userRole !== 'serveur') {
      this.showNotification('Seul un serveur peut préparer une commande.', 'warning');
      return;
    }

    this.orderService.validedOrders(orderId).subscribe({
      next: (validatedOrder) => {
        const orderIndex = this.newOrders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          this.newOrders.splice(orderIndex, 1);
          this.preparingOrders.push(validatedOrder);
          this.cashMetrics.pendingOrders = this.newOrders.length + this.preparingOrders.length;
          // this.showNotification(`Commande ${validatedOrder.id} mise en préparation`, 'success');
          this.closeDetailsModal();
        }
      },
      error: (err) => {
        console.error('Error validating order', err);
        this.showNotification('Échec de la préparation de la commande.', 'warning');
      }
    });
  }

  onFinishOrder(orderId: string) {
    const order = this.preparingOrders.find(o => o.id === orderId);
    if (order) {
      // this.showNotification(`Commande ${order.id} prête à être payée`, 'info');
      this.onProcessPayment(orderId);
    }
  }

  onProcessPayment(orderId: string) {
    const order = this.preparingOrders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrderForPayment = order;
      this.showPaymentModal = true;
      // console.log(order)
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
      // Préparation des données pour l'appel API
      const data = {
        status: 'fermée',
        payment_type: paymentData.paymentType
      };

      // Utilisation du service pour valider le paiement via l'API
      this.orderService.closedOrder(order.id, data).subscribe({
        next: (closedOrder) => {
          // Mise à jour de l'interface après une validation réussie
          const orderIndex = this.preparingOrders.findIndex(o => o.id === closedOrder.id);
          if (orderIndex !== -1) {
            this.preparingOrders.splice(orderIndex, 1);
          }

          // Mise à jour des métriques de la caisse
          this.cashMetrics.total_revenue += closedOrder.total_amount;
          this.cashMetrics.ordersServed++;
          if (closedOrder.payment_type === 'cash') {
            this.cashMetrics.cashPayments += closedOrder.total_amount;
          } else {
            this.cashMetrics.mobileMoneyPayments += closedOrder.total_amount;
          }
          this.cashMetrics.pendingOrders = Math.max(0, this.newOrders.length + this.preparingOrders.length);

          // this.showNotification(`Paiement confirmé pour ${closedOrder.id} (${closedOrder.payment_type})`, 'success');
          this.closePaymentModal();
        },
        error: (err) => {
          console.error('Error closing order:', err);
          this.showNotification('Échec de la confirmation du paiement.', 'warning');
        }
      });
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
    const now = new Date();
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