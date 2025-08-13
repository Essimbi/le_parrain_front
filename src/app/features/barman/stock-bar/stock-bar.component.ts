import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryCardComponent } from './components/category-card/category-card.component';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Product, CategoryData } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

export interface StockMetrics {
  totalProducts: number;
  criticalStock: number;
  stockValue: number;
  categories: number;
}

@Component({
  selector: 'app-stock-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  
  isLoading = true;
  
  // États pour la pagination, les filtres et la recherche
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  searchTerm = '';
  selectedCategory: string = 'all';
  showOutOfStock: boolean = false;
  
  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadStockData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStockData(): void {
    this.isLoading = true;
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.productService.getCategories()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (results: any) => {
        const productsData = results.products.data || [];
        const categoriesData = results.categories.data || [];
        
        // Créer une map pour lier les IDs de catégorie aux noms
        const categoryMap = new Map<string, string>();
        categoriesData.forEach((cat: any) => categoryMap.set(cat.id, cat.name));
        
        // Enrichir les produits avec le nom de la catégorie
        this.allProducts = productsData.map((product: any) => ({
          ...product,
          category: categoryMap.get(product.category_id) || 'Non catégorisé'
        }));

        this.categories = categoriesData.map((cat: any) => ({ ...cat, products: this.allProducts.filter(p => p.category_id === cat.id) }));
        
        this.updateMetrics(this.allProducts);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données de stock', err);
        this.isLoading = false;
        // Gérer l'erreur avec une notification, si nécessaire
      }
    });
  }

  private updateMetrics(products: Product[]): void {
    let totalStockValue = 0;
    let criticalStockCount = 0;

    products.forEach(product => {
      // S'assurer que le prix est un nombre avant l'opération
      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      totalStockValue += price * product.stock_quantity;
      if (product.stock_quantity <= product.min_threshold) {
        criticalStockCount++;
      }
    });

    this.stockMetrics = {
      totalProducts: products.length,
      criticalStock: criticalStockCount,
      stockValue: totalStockValue,
      categories: this.categories.length
    };
  }

  // Logique de filtrage unifiée et corrigée
  applyFilters(): void {
    let tempProducts = [...this.allProducts];

    // Filtrer par catégorie
    if (this.selectedCategory !== 'all') {
      tempProducts = tempProducts.filter(p => p.category === this.selectedCategory);
    }

    // Filtrer par rupture de stock
    if (this.showOutOfStock) {
      tempProducts = tempProducts.filter(p => p.stock_quantity === 0);
    }

    // Filtrer par recherche (nom ou catégorie)
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTermLower) ||
        p.category.toLowerCase().includes(searchTermLower)
      );
    }

    this.filteredProducts = tempProducts;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // Renvoie le statut de stock pour l'affichage
  getStockStatus(product: Product): string {
    if (product.stock_quantity === 0) {
      return 'En rupture';
    } else if (product.stock_quantity <= product.min_threshold) {
      return 'Stock faible';
    } else {
      return 'En stock';
    }
  }

  // Détermine la classe CSS pour le statut de stock
  getStockStatusClass(product: Product): string {
    if (product.stock_quantity === 0) {
      return 'status-low';
    } else if (product.stock_quantity <= product.min_threshold) {
      return 'status-warning';
    } else {
      return 'status-in-stock';
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