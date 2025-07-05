import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';

interface Order {
  id: string;
  number: string;
  serveurName: string;
  tableNumber: number;
  customerCount: number;
  totalAmount: number;
  status: 'new' | 'preparing' | 'ready';
  createdAt: Date;
  items: OrderItem[];
}

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface CashMetrics {
  dailyTotal: number;
  ordersServed: number;
  pendingOrders: number;
  cashPayments: number;
  mobileMoneyPayments: number;
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
  imports: [CommonModule, OrderCardComponent, PaymentModalComponent], // Ajout des composants
  templateUrl: './orders-cash.component.html',
  styleUrl: './orders-cash.component.scss'
})
export class OrdersCashComponent implements OnInit, OnDestroy {
  cashMetrics: CashMetrics = {
    dailyTotal: 28750,
    ordersServed: 15,
    pendingOrders: 3,
    cashPayments: 18950,
    mobileMoneyPayments: 9800
  };

  newOrders: Order[] = [
    {
      id: '007',
      number: '#007',
      serveurName: 'Marie',
      tableNumber: 5,
      customerCount: 4,
      totalAmount: 6200,
      status: 'new',
      createdAt: new Date(Date.now() - 2 * 60000),
      items: [
        { productName: 'Whisky Jack Daniel\'s', quantity: 2, unitPrice: 2500 },
        { productName: 'Champagne Moët', quantity: 1, unitPrice: 3500 },
        { productName: 'Cigare Cohiba', quantity: 1, unitPrice: 1200 }
      ]
    },
    {
      id: '008',
      number: '#008',
      serveurName: 'Jean',
      tableNumber: 12,
      customerCount: 2,
      totalAmount: 4800,
      status: 'new',
      createdAt: new Date(Date.now() - 5 * 60000),
      items: [
        { productName: 'Vodka Grey Goose', quantity: 2, unitPrice: 2000 },
        { productName: 'Rhum Diplomatico', quantity: 1, unitPrice: 2200 }
      ]
    }
  ];

  preparingOrders: Order[] = [
    {
      id: '005',
      number: '#005',
      serveurName: 'Claire',
      tableNumber: 3,
      customerCount: 3,
      totalAmount: 7500,
      status: 'preparing',
      createdAt: new Date(Date.now() - 8 * 60000),
      items: [
        { productName: 'Whisky Chivas', quantity: 3, unitPrice: 2000 },
        { productName: 'Cognac Hennessy', quantity: 1, unitPrice: 2800 }
      ]
    },
    {
      id: '006',
      number: '#006',
      serveurName: 'Marie',
      tableNumber: 8,
      customerCount: 2,
      totalAmount: 9700,
      status: 'preparing',
      createdAt: new Date(Date.now() - 12 * 60000),
      items: [
        { productName: 'Champagne Dom Pérignon', quantity: 1, unitPrice: 8500 },
        { productName: 'Cigare Montecristo', quantity: 2, unitPrice: 1200 }
      ]
    }
  ];

  // Variables pour le modal de paiement
  showPaymentModal = false;
  selectedOrderForPayment: Order | null = null;

  private intervalId?: number;

  ngOnInit() {
    console.log('OrdersCashComponent initialisé');
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onPrepareOrder(orderId: string) {
    const orderIndex = this.newOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
      const order = { ...this.newOrders[orderIndex], status: 'preparing' as const };
      
      // Retirer de new orders
      this.newOrders.splice(orderIndex, 1);
      
      // Ajouter à preparing orders
      this.preparingOrders.push(order);
      
      this.showNotification(`Commande ${order.number} mise en préparation`, 'success');
    }
  }

  onFinishOrder(orderId: string) {
    const orderIndex = this.preparingOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      const order = this.preparingOrders[orderIndex];
      this.preparingOrders.splice(orderIndex, 1);
      
      this.showNotification(`Commande ${order.number} prête à être servie`, 'success');
    }
  }

  onProcessPayment(orderId: string) {
    const order = this.preparingOrders.find(o => o.id === orderId);
    
    if (order) {
      this.selectedOrderForPayment = order;
      this.showPaymentModal = true;
    }
  }

  onViewDetails(orderId: string) {
    console.log('Voir détails commande:', orderId);
    // TODO: Implémenter modal de détails
  }

  // Gestion du modal de paiement
  onPaymentComplete(paymentData: PaymentData) {
    const order = this.selectedOrderForPayment;
    
    if (order) {
      // Mettre à jour les métriques
      this.cashMetrics.dailyTotal += order.totalAmount;
      this.cashMetrics.ordersServed++;
      this.cashMetrics.pendingOrders = Math.max(0, this.cashMetrics.pendingOrders - 1);
      
      if (paymentData.paymentType === 'cash') {
        this.cashMetrics.cashPayments += order.totalAmount;
      } else {
        this.cashMetrics.mobileMoneyPayments += order.totalAmount;
      }
      
      // Retirer la commande des commandes en préparation
      const orderIndex = this.preparingOrders.findIndex(o => o.id === order.id);
      this.preparingOrders.splice(orderIndex, 1);
      
      this.showNotification(`Paiement confirmé pour ${order.number} (${paymentData.paymentType})`, 'success');
    }
    
    this.closePaymentModal();
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedOrderForPayment = null;
  }

  private showNotification(message: string, type: 'success' | 'info' | 'warning' = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes === 1) return 'Il y a 1 min';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return 'Il y a 1h';
    return `Il y a ${diffInHours}h`;
  }

  getCashPercentage(): number {
    return Math.round((this.cashMetrics.cashPayments / this.cashMetrics.dailyTotal) * 100);
  }

  getMobileMoneyPercentage(): number {
    return Math.round((this.cashMetrics.mobileMoneyPayments / this.cashMetrics.dailyTotal) * 100);
  }
}