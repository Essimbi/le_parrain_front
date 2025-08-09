import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderItem } from '../orders-cash.component';

@Component({
  selector: 'app-order-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-details-modal.component.html',
  styleUrls: ['./orders-details-modal.component.scss']
})
export class OrdersDetailsModalComponent {
  @Input() order: Order | null = null;
  @Input() userRole: 'barman' | 'admin' | 'serveur' = 'barman';
  @Output() close = new EventEmitter<void>();
  @Output() prepareOrder = new EventEmitter<string>();
  @Output() finishOrder = new EventEmitter<string>();
  @Output() processPayment = new EventEmitter<string>();

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

  onClose() {
    this.close.emit();
  }

  onPrepare() {
    if (this.order) {
      this.prepareOrder.emit(this.order.id);
    }
  }

  onFinish() {
    if (this.order) {
      this.finishOrder.emit(this.order.id);
    }
  }

  onPay() {
    if (this.order) {
      this.processPayment.emit(this.order.id);
    }
  }
}