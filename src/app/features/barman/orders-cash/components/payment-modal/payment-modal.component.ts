import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order } from '../../orders-cash.component';


interface PaymentData {
  orderId: string;
  paymentType: 'cash' | 'mobile_money';
  amountReceived: number;
  changeAmount: number;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss'
})
export class PaymentModalComponent implements OnInit {
  @Input() order: Order | null = null;
  @Output() onPaymentComplete = new EventEmitter<PaymentData>();
  @Output() onClose = new EventEmitter<void>();
  
  paymentType: 'cash' | 'mobile_money' = 'cash';
  amountReceived: number = 0;
  changeAmount: number = 0;

  ngOnInit() {
    if (this.order) {
      this.amountReceived = this.order.total_amount;
      this.calculateChange();
    }
  }

  onAmountReceivedChange() {
    this.calculateChange();
  }

  private calculateChange() {
    if (this.order && this.paymentType === 'cash') {
      this.changeAmount = Math.max(0, this.amountReceived - this.order.total_amount);
    } else {
      this.changeAmount = 0;
    }
  }

  onPaymentTypeChange() {
    this.calculateChange();
  }

  confirmPayment() {
    if (!this.order) return;

    if (this.paymentType === 'cash' && this.amountReceived < this.order.total_amount) {
      alert('Le montant reçu est insuffisant !');
      return;
    }

    const paymentData: PaymentData = {
      orderId: this.order.id,
      paymentType: this.paymentType,
      amountReceived: this.amountReceived,
      changeAmount: this.changeAmount
    };

    this.onPaymentComplete.emit(paymentData);
  }

  closeModal() {
    this.onClose.emit();
  }

  // Fermer avec Escape
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}