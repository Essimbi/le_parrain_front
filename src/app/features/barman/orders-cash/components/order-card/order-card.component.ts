import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss'
})
export class OrderCardComponent {
  @Input() order!: Order;
  @Input() timeAgo: string = '';
  @Input() isPreparingMode: boolean = false;
  
  @Output() onPrepare = new EventEmitter<string>();
  @Output() onFinish = new EventEmitter<string>();
  @Output() onProcessPayment = new EventEmitter<string>();
  @Output() onViewDetails = new EventEmitter<string>();

  prepareOrder() {
    this.onPrepare.emit(this.order.id);
  }

  finishOrder() {
    this.onFinish.emit(this.order.id);
  }

  processPayment() {
    this.onProcessPayment.emit(this.order.id);
  }

  viewDetails() {
    this.onViewDetails.emit(this.order.id);
  }
}