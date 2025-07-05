import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  price: number;
}

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
  @Output() onRequestSubmit = new EventEmitter<any>();

  // Form data
  selectedCategory = '';
  selectedProductId = '';
  requestedQuantity = 1;
  priority: 'normal' | 'urgent' | 'critical' = 'normal';
  comment = '';

  // Current request items
  currentRequestItems: ReplenishmentItem[] = [];

  categories = [
    { id: 'whisky', name: 'Whisky & Bourbon' },
    { id: 'champagne', name: 'Champagne & Mousseux' },
    { id: 'spiritueux', name: 'Spiritueux & Liqueurs' },
    { id: 'cigares', name: 'Cigares Premium' }
  ];

  allProducts: Product[] = [
    { id: 'w1', name: 'Jack Daniel\'s', category: 'whisky', currentStock: 3, minStock: 5, price: 12500 },
    { id: 'w2', name: 'Chivas Regal 18', category: 'whisky', currentStock: 8, minStock: 5, price: 18000 },
    { id: 'w3', name: 'Macallan 12', category: 'whisky', currentStock: 2, minStock: 5, price: 25000 },
    { id: 'c1', name: 'Moët & Chandon', category: 'champagne', currentStock: 5, minStock: 3, price: 35000 },
    { id: 'c2', name: 'Dom Pérignon', category: 'champagne', currentStock: 1, minStock: 3, price: 85000 },
    { id: 's1', name: 'Vodka Grey Goose', category: 'spiritueux', currentStock: 6, minStock: 5, price: 15000 },
    { id: 's2', name: 'Rhum Diplomatico', category: 'spiritueux', currentStock: 2, minStock: 5, price: 22000 },
    { id: 'cig1', name: 'Cohiba Robusto', category: 'cigares', currentStock: 12, minStock: 6, price: 8500 },
    { id: 'cig2', name: 'Montecristo No.2', category: 'cigares', currentStock: 3, minStock: 6, price: 12000 }
  ];

  get filteredProducts(): Product[] {
    if (!this.selectedCategory) return this.allProducts;
    return this.allProducts.filter(product => product.category === this.selectedCategory);
  }

  get selectedProduct(): Product | null {
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

    // Vérifier si le produit est déjà dans la demande
    const existingIndex = this.currentRequestItems.findIndex(item => item.productId === this.selectedProductId);

    if (existingIndex !== -1) {
      // Mettre à jour la quantité
      this.currentRequestItems[existingIndex].requestedQuantity += this.requestedQuantity;
    } else {
      // Ajouter nouveau produit
      this.currentRequestItems.push({
        productId: this.selectedProduct.id,
        productName: this.selectedProduct.name,
        currentStock: this.selectedProduct.currentStock,
        requestedQuantity: this.requestedQuantity,
        category: this.getCategoryName(this.selectedProduct.category)
      });
    }

    // Reset form
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

    // Reset form
    this.currentRequestItems = [];
    this.priority = 'normal';
    this.comment = '';
  }

  private getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  }

  // Suggestions automatiques
  getSuggestedQuantity(product: Product): number {
    const deficit = Math.max(0, product.minStock - product.currentStock);
    return deficit > 0 ? deficit + 5 : 10; // Stock minimum + buffer
  }

  useSuggestedQuantity() {
    if (this.selectedProduct) {
      this.requestedQuantity = this.getSuggestedQuantity(this.selectedProduct);
    }
  }
}