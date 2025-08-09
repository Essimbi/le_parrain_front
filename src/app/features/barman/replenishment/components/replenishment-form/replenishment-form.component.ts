import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Product } from '../../../../../core/models/product.model';

// Interface pour les articles de la demande de réapprovisionnement
interface ReplenishmentItem {
  productId: string;
  productName: string;
  currentStock: number;
  requestedQuantity: number;
  category: string;
}

@Component({
  selector: 'app-replenishment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './replenishment-form.component.html',
  styleUrl: './replenishment-form.component.scss'
})
export class ReplenishmentFormComponent {
  @Input() urgentProducts: Product[] = [];
  @Input() allProducts: Product[] = [];
  @Input() categories: Category[] = [];
  @Output() onRequestSubmit = new EventEmitter<any>();

  // Form data
  selectedCategory = '';
  selectedProductId = '';
  requestedQuantity = 1;
  // Correction : Ajout de 'critical' au type de la priorité
  priority: 'normal' | 'urgent' | 'critical' = 'normal';
  comment = '';

  // Current request items
  currentRequestItems: ReplenishmentItem[] = [];

  get filteredProducts(): Product[] {
    if (!this.selectedCategory) return this.allProducts;
    return this.allProducts.filter(product => product.category === this.selectedCategory);
  }

  get selectedProduct(): Product | null {
    if (!this.allProducts) return null;
    return this.allProducts.find(p => p.id === this.selectedProductId) || null;
  }

  get canAddToRequest(): boolean {
    return !!this.selectedProductId && this.requestedQuantity > 0;
  }

  get totalRequestItems(): number {
    return this.currentRequestItems.reduce((sum, item) => sum + item.requestedQuantity, 0);
  }

  addToRequest() {
    if (!this.canAddToRequest || !this.selectedProduct) return;

    const existingIndex = this.currentRequestItems.findIndex(item => item.productId === this.selectedProductId);

    if (existingIndex !== -1) {
      this.currentRequestItems[existingIndex].requestedQuantity += this.requestedQuantity;
    } else {
      this.currentRequestItems.push({
        productId: this.selectedProduct.id,
        productName: this.selectedProduct.name,
        currentStock: this.selectedProduct.stock_quantity,
        requestedQuantity: this.requestedQuantity,
        category: this.getCategoryName(this.selectedProduct.category)
      });
    }

    this.selectedProductId = '';
    this.requestedQuantity = 1;
    this.selectedCategory = '';
  }

  removeFromRequest(index: number) {
    this.currentRequestItems.splice(index, 1);
  }

  submitRequest() {
    if (this.currentRequestItems.length === 0) {
      alert('Veuillez ajouter au moins un produit à la demande');
      return;
    }

    const requestData = {
      products: this.currentRequestItems,
      priority: this.priority,
      comment: this.comment.trim()
    };

    this.onRequestSubmit.emit(requestData);

    this.currentRequestItems = [];
    this.priority = 'normal';
    this.comment = '';
  }

  private getCategoryName(categoryId: string): string {
    const category = this.categories ? this.categories.find(cat => cat.id === categoryId) : null;
    return category ? category.name : categoryId;
  }

  getSuggestedQuantity(product: Product): number {
    const deficit = Math.max(0, product.min_threshold - product.stock_quantity);
    return deficit > 0 ? deficit + 5 : 10;
  }

  useSuggestedQuantity() {
    if (this.selectedProduct) {
      this.requestedQuantity = this.getSuggestedQuantity(this.selectedProduct);
    }
  }
}