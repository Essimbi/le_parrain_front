import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryData } from '../../../../../core/models/product.model';


@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss'
})
export class CategoryCardComponent {
  @Input() category!: CategoryData;
  @Output() onStockAdjustment = new EventEmitter<{productId: string, change: number}>();

  constructor() {
  }


  adjustStock(productId: string, change: number) {
    this.onStockAdjustment.emit({ productId, change });
  }

  getStockStatus(stock: number): 'low' | 'ok' {
    return stock <= 4 ? 'low' : 'ok';
  }
}