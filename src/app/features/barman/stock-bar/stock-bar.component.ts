import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryCardComponent } from './components/category-card/category-card.component';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'whisky' | 'champagne' | 'spiritueux' | 'cigares';
}

interface StockMetrics {
  totalProducts: number;
  criticalStock: number;
  stockValue: number;
  categories: number;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  products: Product[];
}

@Component({
  selector: 'app-stock-bar',
  standalone: true,
  imports: [CommonModule, CategoryCardComponent],
  templateUrl: './stock-bar.component.html',
  styleUrl: './stock-bar.component.scss'
})
export class StockBarComponent implements OnInit {
  stockMetrics: StockMetrics = {
    totalProducts: 47,
    criticalStock: 6,
    stockValue: 485200,
    categories: 4
  };

  categories: CategoryData[] = [
    {
      id: 'whisky',
      name: 'Whiskys & Bourbon',
      icon: '🥃',
      color: 'whisky',
      products: [
        {
          id: 'w1',
          name: 'Jack Daniel\'s',
          price: 12500,
          stock: 3,
          category: 'whisky'
        },
        {
          id: 'w2',
          name: 'Chivas Regal 18',
          price: 18000,
          stock: 8,
          category: 'whisky'
        },
        {
          id: 'w3',
          name: 'Macallan 12',
          price: 25000,
          stock: 2,
          category: 'whisky'
        },
        {
          id: 'w4',
          name: 'Jameson',
          price: 15000,
          stock: 6,
          category: 'whisky'
        }
      ]
    },
    {
      id: 'champagne',
      name: 'Champagnes & Mousseux',
      icon: '🍾',
      color: 'champagne',
      products: [
        {
          id: 'c1',
          name: 'Moët & Chandon',
          price: 35000,
          stock: 5,
          category: 'champagne'
        },
        {
          id: 'c2',
          name: 'Dom Pérignon',
          price: 85000,
          stock: 1,
          category: 'champagne'
        },
        {
          id: 'c3',
          name: 'Veuve Clicquot',
          price: 45000,
          stock: 7,
          category: 'champagne'
        },
        {
          id: 'c4',
          name: 'Cristal Roederer',
          price: 120000,
          stock: 2,
          category: 'champagne'
        }
      ]
    },
    {
      id: 'spiritueux',
      name: 'Spiritueux & Liqueurs',
      icon: '🍸',
      color: 'spiritueux',
      products: [
        {
          id: 's1',
          name: 'Vodka Grey Goose',
          price: 15000,
          stock: 6,
          category: 'spiritueux'
        },
        {
          id: 's2',
          name: 'Rhum Diplomatico',
          price: 22000,
          stock: 2,
          category: 'spiritueux'
        },
        {
          id: 's3',
          name: 'Cognac Hennessy',
          price: 28000,
          stock: 4,
          category: 'spiritueux'
        },
        {
          id: 's4',
          name: 'Gin Bombay',
          price: 18000,
          stock: 1,
          category: 'spiritueux'
        },
        {
          id: 's5',
          name: 'Tequila Patron',
          price: 24000,
          stock: 3,
          category: 'spiritueux'
        }
      ]
    },
    {
      id: 'cigares',
      name: 'Cigares Premium',
      icon: '🚬',
      color: 'cigares',
      products: [
        {
          id: 'cig1',
          name: 'Cohiba Robusto',
          price: 8500,
          stock: 12,
          category: 'cigares'
        },
        {
          id: 'cig2',
          name: 'Montecristo No.2',
          price: 12000,
          stock: 3,
          category: 'cigares'
        },
        {
          id: 'cig3',
          name: 'Romeo y Julieta',
          price: 7500,
          stock: 8,
          category: 'cigares'
        },
        {
          id: 'cig4',
          name: 'Partagas Serie D',
          price: 10000,
          stock: 5,
          category: 'cigares'
        }
      ]
    }
  ];

  ngOnInit() {
    this.updateMetrics();
  }

  onStockAdjustment(productId: string, change: number) {
    // Trouver le produit dans toutes les catégories
    for (const category of this.categories) {
      const product = category.products.find(p => p.id === productId);
      if (product) {
        const newStock = Math.max(0, product.stock + change);
        product.stock = newStock;
        
        this.updateMetrics();
        this.showNotification(
          `Stock de ${product.name} mis à jour: ${newStock}`,
          newStock <= 4 ? 'warning' : 'success'
        );
        break;
      }
    }
  }

  private updateMetrics() {
    let totalProducts = 0;
    let criticalStock = 0;
    let stockValue = 0;

    for (const category of this.categories) {
      for (const product of category.products) {
        totalProducts++;
        if (product.stock <= 4) {
          criticalStock++;
        }
        stockValue += product.price * product.stock;
      }
    }

    this.stockMetrics = {
      totalProducts,
      criticalStock,
      stockValue,
      categories: this.categories.length
    };
  }

  private showNotification(message: string, type: 'success' | 'warning' = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // TODO: Implémenter système de notifications
  }

  // Utilitaires pour le template
  getTotalProducts(): number {
    return this.stockMetrics.totalProducts;
  }

  getCriticalStockCount(): number {
    return this.stockMetrics.criticalStock;
  }

  getStockValue(): number {
    return this.stockMetrics.stockValue;
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}