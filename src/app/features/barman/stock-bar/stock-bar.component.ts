import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryCardComponent } from './components/category-card/category-card.component';
import { Subject } from 'rxjs';
import { CategoryData, Product } from '../../../core/models/product.model';

export interface StockMetrics {
  totalProducts: number;
  criticalStock: number;
  stockValue: number;
  categories: number;
}

@Component({
  selector: 'app-stock-bar',
  standalone: true,
  imports: [CommonModule, CategoryCardComponent],
  templateUrl: './stock-bar.component.html',
  styleUrl: './stock-bar.component.scss'
})
export class StockBarComponent implements OnInit, OnDestroy {
  stockMetrics: StockMetrics = {
    totalProducts: 0,
    criticalStock: 0,
    stockValue: 0,
    categories: 0
  };

  categories: CategoryData[] = [];

  private destroy$ = new Subject<void>();

  private categoryDisplayInfo: { [key: string]: { icon: string; color: string } } = {
    'Bières locales': { icon: '🍺', color: 'blue' },
    'Bières importées': { icon: '🍻', color: 'darkblue' },
    'Jus locaux': { icon: '🍹', color: 'orange' },
    'Sodas & Eaux': { icon: '🥤', color: 'grey' }
  };

  constructor() {}

  ngOnInit() {
    this.loadStockData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStockData(): void {
    const mockProducts: Product[] = [
      // Bières locales
      { id: 'prod1', name: '33 Export', price: 1500, stock_quantity: 50, is_below_threshold: false, description: 'Bière blonde populaire', image_url: '', min_threshold: 5, unit: 'bouteille', category: 'Bières locales' },
      { id: 'prod2', name: 'Mutzig', price: 1500, stock_quantity: 10, is_below_threshold: false, description: 'Bière forte de référence', image_url: '', min_threshold: 5, unit: 'bouteille', category: 'Bières locales' },
      { id: 'prod3', name: 'Beaufort', price: 1500, stock_quantity: 75, is_below_threshold: false, description: 'La plus ancienne des bières', image_url: '', min_threshold: 5, unit: 'bouteille', category: 'Bières locales' },
      { id: 'prod4', name: 'Castel', price: 1500, stock_quantity: 3, is_below_threshold: true, description: 'Bière blonde légère', image_url: '', min_threshold: 5, unit: 'bouteille', category: 'Bières locales' },

      // Bières importées
      { id: 'prod5', name: 'Heineken', price: 2000, stock_quantity: 20, is_below_threshold: false, description: 'Bière importée Premium', image_url: '', min_threshold: 5, unit: 'bouteille', category: 'Bières importées' },
      { id: 'prod6', name: 'Guinness', price: 2500, stock_quantity: 4, is_below_threshold: true, description: 'Bière noire robuste', image_url: '', min_threshold: 5, unit: 'bouteille', category: 'Bières importées' },
      
      // Jus locaux
      { id: 'prod7', name: 'Jus de Bissap', price: 500, stock_quantity: 30, is_below_threshold: false, description: 'Jus de fleur d\'hibiscus', image_url: '', min_threshold: 5, unit: 'verre', category: 'Jus locaux' },
      { id: 'prod8', name: 'Jus de Tamarin', price: 500, stock_quantity: 5, is_below_threshold: false, description: 'Jus de tamarin frais', image_url: '', min_threshold: 5, unit: 'verre', category: 'Jus locaux' },
      { id: 'prod9', name: 'Jus de Gingembre', price: 1000, stock_quantity: 15, is_below_threshold: false, description: 'Jus de gingembre épicé', image_url: '', min_threshold: 5, unit: 'verre', category: 'Jus locaux' },

      // Sodas & Eaux
      { id: 'prod10', name: 'Coca-Cola', price: 600, stock_quantity: 60, is_below_threshold: false, description: 'Soda classique', image_url: '', min_threshold: 5, unit: 'bouteille', category: 'Sodas & Eaux' },
      { id: 'prod11', name: 'Fanta', price: 600, stock_quantity: 2, is_below_threshold: true, description: 'Soda à l\'orange', image_url: '', min_threshold: 5, unit: 'bouteille', category: 'Sodas & Eaux' },
      { id: 'prod12', name: 'Eau Minérale', price: 500, stock_quantity: 100, is_below_threshold: false, description: 'Eau en bouteille', image_url: '', min_threshold: 5, unit: 'bouteille', category: 'Sodas & Eaux' }
    ];

    const mockCategories: CategoryData[] = [
      { id: 'cat1', name: 'Bières locales', icon: this.categoryDisplayInfo['Bières locales'].icon, color: this.categoryDisplayInfo['Bières locales'].color, products: [] },
      { id: 'cat2', name: 'Bières importées', icon: this.categoryDisplayInfo['Bières importées'].icon, color: this.categoryDisplayInfo['Bières importées'].color, products: [] },
      { id: 'cat3', name: 'Jus locaux', icon: this.categoryDisplayInfo['Jus locaux'].icon, color: this.categoryDisplayInfo['Jus locaux'].color, products: [] },
      { id: 'cat4', name: 'Sodas & Eaux', icon: this.categoryDisplayInfo['Sodas & Eaux'].icon, color: this.categoryDisplayInfo['Sodas & Eaux'].color, products: [] }
    ];

    // Simuler l'assignation des produits aux catégories
    mockProducts.forEach(product => {
      const category = mockCategories.find(c => c.name === product.category);
      if (category) {
        category.products.push(product);
      }
    });

    this.categories = mockCategories;
    this.updateMetrics(mockProducts);
  }

  private updateMetrics(allProducts: Product[]): void {
    let totalStockValue = 0;
    let criticalStockCount = 0;

    allProducts.forEach(product => {
      totalStockValue += product.price * product.stock_quantity;
      if (product.is_below_threshold) {
        criticalStockCount++;
      }
    });

    this.stockMetrics = {
      totalProducts: allProducts.length,
      criticalStock: criticalStockCount,
      stockValue: totalStockValue,
      categories: this.categories.length
    };
  }

  onStockAdjustment(productId: string, change: number) {
    for (const category of this.categories) {
      const productIndex = category.products.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        const productToUpdate = category.products[productIndex];
        const newStockQuantity = Math.max(0, productToUpdate.stock_quantity + change);
        
        // Simuler la mise à jour
        productToUpdate.stock_quantity = newStockQuantity;
        productToUpdate.is_below_threshold = newStockQuantity <= productToUpdate.min_threshold;
        
        this.showNotification(`Stock de ${productToUpdate.name} mis à jour : ${newStockQuantity}`, productToUpdate.is_below_threshold ? 'warning' : 'success');
        this.updateMetrics(this.categories.flatMap(c => c.products));
        return;
      }
    }
  }

  private showNotification(message: string, type: 'success' | 'warning' = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}