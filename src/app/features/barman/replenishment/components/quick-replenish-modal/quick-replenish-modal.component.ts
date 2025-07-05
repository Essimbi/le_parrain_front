import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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

interface QuickReplenishItem {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  suggestedQuantity: number;
  quantity: number;
  selected: boolean;
}

@Component({
  selector: 'app-quick-replenish-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-replenish-modal.component.html',
  styleUrl: './quick-replenish-modal.component.scss'
})
export class QuickReplenishModalComponent implements OnInit {
  @Input() urgentProducts: Product[] = [];
  @Output() onSubmit = new EventEmitter<any[]>();
  @Output() onClose = new EventEmitter<void>();

  // Ajouter Math pour l'utiliser dans le template
  Math = Math;

  quickItems: QuickReplenishItem[] = [];
  comment = 'Demande rapide - Stock critique';

  ngOnInit() {
    this.initializeQuickItems();
  }

  private initializeQuickItems() {
    this.quickItems = this.urgentProducts.map(product => ({
      productId: product.id,
      productName: product.name,
      category: product.category,
      currentStock: product.currentStock,
      suggestedQuantity: this.calculateSuggestedQuantity(product),
      quantity: this.calculateSuggestedQuantity(product),
      selected: product.currentStock <= 2
    }));
  }

  private calculateSuggestedQuantity(product: Product): number {
    const deficit = Math.max(0, product.minStock - product.currentStock);
    return deficit + 5;
  }

  get selectedItems(): QuickReplenishItem[] {
    return this.quickItems.filter(item => item.selected);
  }

  get totalSelectedItems(): number {
    return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalSelectedProducts(): number {
    return this.selectedItems.length;
  }

  get canSubmit(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.every(item => item.quantity > 0);
  }

  // Créer des méthodes pour éviter les expressions complexes dans le template
  decreaseQuantity(item: QuickReplenishItem) {
    item.quantity = Math.max(1, item.quantity - 1);
    this.onQuantityChange(item);
  }

  increaseQuantity(item: QuickReplenishItem) {
    item.quantity++;
    this.onQuantityChange(item);
  }

  toggleSelectAll() {
    const allSelected = this.quickItems.every(item => item.selected);
    this.quickItems.forEach(item => {
      item.selected = !allSelected;
    });
  }

  onItemSelectionChange(item: QuickReplenishItem) {
    if (item.selected && item.quantity <= 0) {
      item.quantity = item.suggestedQuantity;
    }
  }

  onQuantityChange(item: QuickReplenishItem) {
    if (item.quantity <= 0) {
      item.quantity = 1;
    }

    if (item.quantity > 0 && !item.selected) {
      item.selected = true;
    }
  }

  resetToSuggested(item: QuickReplenishItem) {
    item.quantity = item.suggestedQuantity;
    item.selected = true;
  }

  submitQuickReplenishment() {
    if (!this.canSubmit) {
      alert('Veuillez sélectionner au moins un produit avec une quantité valide');
      return;
    }

    const selectedData = this.selectedItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      currentStock: item.currentStock,
      quantity: item.quantity
    }));

    this.onSubmit.emit(selectedData);
  }

  closeModal() {
    this.onClose.emit();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  getCriticalityLevel(currentStock: number): 'critical' | 'low' | 'warning' {
    if (currentStock <= 1) return 'critical';
    if (currentStock <= 3) return 'low';
    return 'warning';
  }

  getCriticalityText(currentStock: number): string {
    const level = this.getCriticalityLevel(currentStock);
    switch (level) {
      case 'critical': return 'Critique';
      case 'low': return 'Très bas';
      case 'warning': return 'Bas';
      default: return 'Normal';
    }
  }

  getCriticalityClass(currentStock: number): string {
    const level = this.getCriticalityLevel(currentStock);
    switch (level) {
      case 'critical': return 'is-danger';
      case 'low': return 'is-warning';
      case 'warning': return 'is-info';
      default: return 'is-light';
    }
  }
}