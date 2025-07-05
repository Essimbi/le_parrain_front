import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  products: Product[];
}

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

  adjustStock(productId: string, change: number) {
    this.onStockAdjustment.emit({ productId, change });
  }

  getStockStatus(stock: number): 'low' | 'ok' {
    return stock <= 4 ? 'low' : 'ok';
  }
}