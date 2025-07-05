import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReplenishmentFormComponent } from './components/replenishment-form/replenishment-form.component';
import { QuickReplenishModalComponent } from './components/quick-replenish-modal/quick-replenish-modal.component';

interface ReplenishmentRequest {
  id: string;
  date: Date;
  products: ReplenishmentItem[];
  totalQuantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  approvedAt?: Date;
  comment?: string;
  priority: 'normal' | 'urgent' | 'critical';
}

interface ReplenishmentItem {
  productId: string;
  productName: string;
  currentStock: number;
  requestedQuantity: number;
  category: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  price: number;
}

interface ReplenishmentMetrics {
  pendingRequests: number;
  lastDelivery: string;
  urgentProducts: number;
  nextDelivery?: string;
}

@Component({
  selector: 'app-replenishment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReplenishmentFormComponent, QuickReplenishModalComponent],
  templateUrl: './replenishment.component.html',
  styleUrl: './replenishment.component.scss'
})
export class ReplenishmentComponent implements OnInit {
  metrics: ReplenishmentMetrics = {
    pendingRequests: 2,
    lastDelivery: '29 Juin',
    urgentProducts: 6,
    nextDelivery: '8 Juillet'
  };

  requests: ReplenishmentRequest[] = [
    {
      id: 'req001',
      date: new Date('2025-07-01'),
      products: [
        { productId: 'w1', productName: 'Jack Daniel\'s', currentStock: 3, requestedQuantity: 15, category: 'Whisky' },
        { productId: 'c2', productName: 'Dom Pérignon', currentStock: 1, requestedQuantity: 5, category: 'Champagne' },
        { productId: 's4', productName: 'Gin Bombay', currentStock: 1, requestedQuantity: 8, category: 'Spiritueux' }
      ],
      totalQuantity: 28,
      status: 'pending',
      priority: 'urgent',
      comment: 'Stock critique pour le weekend'
    },
    {
      id: 'req002',
      date: new Date('2025-06-30'),
      products: [
        { productId: 'cig2', productName: 'Montecristo No.2', currentStock: 3, requestedQuantity: 12, category: 'Cigares' },
        { productId: 'w3', productName: 'Macallan 12', currentStock: 2, requestedQuantity: 8, category: 'Whisky' }
      ],
      totalQuantity: 20,
      status: 'approved',
      approvedAt: new Date('2025-07-01'),
      priority: 'normal'
    },
    {
      id: 'req003',
      date: new Date('2025-06-28'),
      products: [
        { productId: 's1', productName: 'Vodka Grey Goose', currentStock: 6, requestedQuantity: 10, category: 'Spiritueux' },
        { productId: 'c1', productName: 'Moët & Chandon', currentStock: 5, requestedQuantity: 8, category: 'Champagne' }
      ],
      totalQuantity: 18,
      status: 'delivered',
      approvedAt: new Date('2025-06-29'),
      priority: 'normal'
    }
  ];

  urgentProducts: Product[] = [
    { id: 'w1', name: 'Jack Daniel\'s', category: 'Whisky', currentStock: 3, minStock: 5, price: 12500 },
    { id: 'w3', name: 'Macallan 12', category: 'Whisky', currentStock: 2, minStock: 5, price: 25000 },
    { id: 'c2', name: 'Dom Pérignon', category: 'Champagne', currentStock: 1, minStock: 3, price: 85000 },
    { id: 's2', name: 'Rhum Diplomatico', category: 'Spiritueux', currentStock: 2, minStock: 5, price: 22000 },
    { id: 's4', name: 'Gin Bombay', category: 'Spiritueux', currentStock: 1, minStock: 5, price: 18000 },
    { id: 'cig2', name: 'Montecristo No.2', category: 'Cigares', currentStock: 3, minStock: 6, price: 12000 }
  ];

  // Modal states
  showQuickReplenishModal = false;
  showNewProductModal = false;

  ngOnInit() {
    console.log('ReplenishmentComponent initialisé');
  }

  onNewReplenishmentRequest(requestData: any) {
    const newRequest: ReplenishmentRequest = {
      id: `req${Date.now()}`,
      date: new Date(),
      products: requestData.products,
      totalQuantity: requestData.products.reduce((sum: number, item: any) => sum + item.requestedQuantity, 0),
      status: 'pending',
      priority: requestData.priority || 'normal',
      comment: requestData.comment
    };

    this.requests.unshift(newRequest);
    this.metrics.pendingRequests++;
    
    this.showNotification(`Demande de réapprovisionnement créée (${newRequest.totalQuantity} articles)`, 'success');
  }

  onQuickReplenishment(productsData: any[]) {
    const newRequest: ReplenishmentRequest = {
      id: `req${Date.now()}`,
      date: new Date(),
      products: productsData.map(item => ({
        productId: item.productId,
        productName: item.productName,
        currentStock: item.currentStock,
        requestedQuantity: item.quantity,
        category: item.category
      })),
      totalQuantity: productsData.reduce((sum, item) => sum + item.quantity, 0),
      status: 'pending',
      priority: 'urgent',
      comment: 'Demande rapide - Stock critique'
    };

    this.requests.unshift(newRequest);
    this.metrics.pendingRequests++;
    this.closeQuickReplenishModal();
    
    this.showNotification(`Demande urgente créée (${newRequest.totalQuantity} articles)`, 'success');
  }

  openQuickReplenishModal() {
    this.showQuickReplenishModal = true;
  }

  closeQuickReplenishModal() {
    this.showQuickReplenishModal = false;
  }

  openNewProductModal() {
    this.showNewProductModal = true;
  }

  closeNewProductModal() {
    this.showNewProductModal = false;
  }

  viewRequestDetails(requestId: string) {
    console.log('Voir détails demande:', requestId);
    // TODO: Implémenter modal de détails
  }

  editRequest(requestId: string) {
    console.log('Modifier demande:', requestId);
    // TODO: Implémenter édition
  }

  cancelRequest(requestId: string) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
      const index = this.requests.findIndex(req => req.id === requestId);
      if (index !== -1) {
        this.requests.splice(index, 1);
        this.metrics.pendingRequests = Math.max(0, this.metrics.pendingRequests - 1);
        this.showNotification('Demande annulée', 'warning');
      }
    }
  }

  private showNotification(message: string, type: 'success' | 'warning' | 'info' = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // TODO: Implémenter système de notifications
  }

  // Utilitaires pour le template
  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'delivered': return 'Livré';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'is-warning';
      case 'approved': return 'is-success';
      case 'rejected': return 'is-danger';
      case 'delivered': return 'is-info';
      default: return 'is-light';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'normal': return 'Normale';
      case 'urgent': return 'Urgente';
      case 'critical': return 'Critique';
      default: return priority;
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'normal': return 'is-info';
      case 'urgent': return 'is-warning';
      case 'critical': return 'is-danger';
      default: return 'is-light';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
}