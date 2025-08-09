import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReplenishmentFormComponent } from './components/replenishment-form/replenishment-form.component';
import { QuickReplenishModalComponent } from './components/quick-replenish-modal/quick-replenish-modal.component';
import { Subject } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

export interface ReplenishmentItem {
  product: string;
  quantity: number;
}

export interface ReplenishmentRequest {
  id: string;
  created_at: string;
  approved_at: string | null;
  items: ReplenishmentItem[];
  status: 'en_attente' | 'approuve' | 'rejete' | 'annule';
  priority: 'normal' | 'urgent';
  totalQuantity: number;
  comment?: string;
}

export interface ReplenishmentMetrics {
  pending_requests_count: number;
  critical_products_count: number;
  last_approved_request_date: string | null;
  last_approved_request_quantity: number | null;
}

@Component({
  selector: 'app-replenishment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReplenishmentFormComponent, QuickReplenishModalComponent],
  templateUrl: './replenishment.component.html',
  styleUrl: './replenishment.component.scss'
})
export class ReplenishmentComponent implements OnInit, OnDestroy {
  metrics: ReplenishmentMetrics = {
    pending_requests_count: 0,
    critical_products_count: 0,
    last_approved_request_date: null,
    last_approved_request_quantity: null,
  };

  requests: ReplenishmentRequest[] = [];
  urgentProducts: Product[] = [];
  allProducts: Product[] = [];
  categories: Category[] = [];
  nextRequestId = 6;

  // Modals state
  showQuickReplenishModal = false;
  showDetailsModal = false;
  showEditModal = false;
  selectedRequest: ReplenishmentRequest | null = null;
  editedRequest: ReplenishmentRequest | null = null;

  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.allProducts = [
      { id: 'prod1', name: '33 Export', price: 1500, stock_quantity: 50, is_below_threshold: false, min_threshold: 5, description: 'Bière blonde populaire', image_url: '', unit: 'bouteille', category: 'cat1' },
      { id: 'prod2', name: 'Mutzig', price: 1500, stock_quantity: 10, is_below_threshold: false, min_threshold: 5, description: 'Bière forte de référence', image_url: '', unit: 'bouteille', category: 'cat1' },
      { id: 'prod3', name: 'Beaufort', price: 1500, stock_quantity: 75, is_below_threshold: false, min_threshold: 5, description: 'La plus ancienne des bières', image_url: '', unit: 'bouteille', category: 'cat1' },
      { id: 'prod4', name: 'Castel', price: 1500, stock_quantity: 3, is_below_threshold: true, min_threshold: 5, description: 'Bière blonde légère', image_url: '', unit: 'bouteille', category: 'cat1' },
      { id: 'prod5', name: 'Heineken', price: 2000, stock_quantity: 20, is_below_threshold: false, min_threshold: 5, description: 'Bière importée Premium', image_url: '', unit: 'bouteille', category: 'cat2' },
      { id: 'prod6', name: 'Guinness', price: 2500, stock_quantity: 4, is_below_threshold: true, min_threshold: 5, description: 'Bière noire robuste', image_url: '', unit: 'bouteille', category: 'cat2' },
      { id: 'prod7', name: 'Jus de Bissap', price: 500, stock_quantity: 30, is_below_threshold: false, min_threshold: 5, description: 'Jus de fleur d\'hibiscus', image_url: '', unit: 'verre', category: 'cat3' },
      { id: 'prod8', name: 'Jus de Tamarin', price: 500, stock_quantity: 5, is_below_threshold: false, min_threshold: 5, description: 'Jus de tamarin frais', image_url: '', unit: 'verre', category: 'cat3' },
      { id: 'prod9', name: 'Jus de Gingembre', price: 1000, stock_quantity: 15, is_below_threshold: false, min_threshold: 5, description: 'Jus de gingembre épicé', image_url: '', unit: 'verre', category: 'cat3' },
      { id: 'prod10', name: 'Coca-Cola', price: 600, stock_quantity: 60, is_below_threshold: false, min_threshold: 5, description: 'Soda classique', image_url: '', unit: 'bouteille', category: 'cat4' },
      { id: 'prod11', name: 'Fanta', price: 600, stock_quantity: 2, is_below_threshold: true, min_threshold: 5, description: 'Soda à l\'orange', image_url: '', unit: 'bouteille', category: 'cat4' },
      { id: 'prod12', name: 'Eau Minérale', price: 500, stock_quantity: 100, is_below_threshold: false, min_threshold: 5, description: 'Eau en bouteille', image_url: '', unit: 'bouteille', category: 'cat4' }
    ];

    this.categories = [
      { id: 'cat1', name: 'Bières locales' },
      { id: 'cat2', name: 'Bières importées' },
      { id: 'cat3', name: 'Jus locaux' },
      { id: 'cat4', name: 'Sodas & Eaux' }
    ];

    this.urgentProducts = this.allProducts.filter(p => p.is_below_threshold);
    this.requests = [
      {
        id: 'req1',
        created_at: '2025-08-01T10:00:00Z',
        approved_at: '2025-08-01T14:30:00Z',
        items: [{ product: '33 Export', quantity: 100 }],
        status: 'approuve',
        totalQuantity: 100,
        priority: 'normal',
        comment: ''
      },
      {
        id: 'req2',
        created_at: '2025-08-05T09:15:00Z',
        approved_at: '2025-08-05T11:00:00Z',
        items: [{ product: 'Jus de Tamarin', quantity: 50 }, { product: 'Jus de Bissap', quantity: 50 }],
        status: 'approuve',
        totalQuantity: 100,
        priority: 'normal',
        comment: 'Besoin de jus pour le week-end'
      },
      {
        id: 'req3',
        created_at: '2025-08-08T15:00:00Z',
        approved_at: null,
        items: [{ product: 'Guinness', quantity: 20 }, { product: 'Fanta', quantity: 40 }],
        status: 'en_attente',
        totalQuantity: 60,
        priority: 'urgent',
        comment: 'Stocks de Guinness et Fanta très bas'
      },
      {
        id: 'req4',
        created_at: '2025-08-07T11:20:00Z',
        approved_at: null,
        items: [{ product: 'Castel', quantity: 15 }],
        status: 'en_attente',
        totalQuantity: 15,
        priority: 'urgent',
        comment: 'Castel en rupture imminente'
      },
      {
        id: 'req5',
        created_at: '2025-08-06T18:00:00Z',
        approved_at: '2025-08-07T09:00:00Z',
        items: [{ product: 'Heineken', quantity: 30 }],
        status: 'approuve',
        totalQuantity: 30,
        priority: 'normal',
        comment: ''
      }
    ];

    this.updateMetrics();
  }
  
  private updateMetrics(): void {
    this.metrics.pending_requests_count = this.requests.filter(r => r.status === 'en_attente').length;
    this.metrics.critical_products_count = this.urgentProducts.length;

    const approvedRequests = this.requests
        .filter(req => req.status === 'approuve' && req.approved_at)
        .sort((a, b) => new Date(b.approved_at!).getTime() - new Date(a.approved_at!).getTime());

    if (approvedRequests.length > 0) {
        this.metrics.last_approved_request_date = this.formatDate(new Date(approvedRequests[0].approved_at!));
        this.metrics.last_approved_request_quantity = approvedRequests[0].items.reduce((sum, item) => sum + item.quantity, 0);
    } else {
        this.metrics.last_approved_request_date = null;
        this.metrics.last_approved_request_quantity = null;
    }
  }

  // Fonctions pour les modals
  openDetailsModal(request: ReplenishmentRequest) {
    this.selectedRequest = request;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.selectedRequest = null;
    this.showDetailsModal = false;
  }

  openEditModal(request: ReplenishmentRequest) {
    this.editedRequest = { ...request }; // Créer une copie pour la modification
    this.showEditModal = true;
  }

  closeEditModal() {
    this.editedRequest = null;
    this.showEditModal = false;
  }
  
  onEditSubmit() {
    if (!this.editedRequest) return;

    const index = this.requests.findIndex(req => req.id === this.editedRequest!.id);
    if (index !== -1) {
      this.requests[index].priority = this.editedRequest.priority;
      this.requests[index].comment = this.editedRequest.comment;
      this.showNotification(`Demande ${this.editedRequest.id} mise à jour`, 'success');
      this.updateMetrics();
    }
    this.closeEditModal();
  }

  onNewReplenishmentRequest(requestData: any) {
    const newRequest: ReplenishmentRequest = {
      id: `req${this.nextRequestId++}`,
      created_at: new Date().toISOString(),
      approved_at: null,
      items: requestData.products.map((p: any) => ({
        product: p.productName,
        quantity: p.requestedQuantity
      })),
      status: 'en_attente',
      totalQuantity: requestData.products.reduce((sum: number, p: any) => sum + p.requestedQuantity, 0),
      priority: requestData.priority,
      comment: requestData.comment
    };
    
    this.requests.unshift(newRequest);
    this.updateMetrics();
    this.showNotification(`Demande de réapprovisionnement pour ${newRequest.totalQuantity} articles créée avec succès!`, 'success');
  }

  onQuickReplenishment(productsData: any[]) {
    const newRequest: ReplenishmentRequest = {
      id: `req${this.nextRequestId++}`,
      created_at: new Date().toISOString(),
      approved_at: null,
      items: productsData.map(item => ({
        product: item.productName,
        quantity: item.quantity
      })),
      status: 'en_attente',
      totalQuantity: productsData.reduce((sum: number, p: any) => sum + p.quantity, 0),
      priority: 'urgent',
      comment: 'Demande rapide - Stock critique'
    };
    
    this.requests.unshift(newRequest);
    this.updateMetrics();
    this.showNotification(`Demande urgente créée avec succès!`, 'success');
    this.closeQuickReplenishModal();
  }

  openQuickReplenishModal() {
    this.showQuickReplenishModal = true;
  }

  closeQuickReplenishModal() {
    this.showQuickReplenishModal = false;
  }

  cancelRequest(requestId: string) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
      const requestToCancel = this.requests.find(r => r.id === requestId);
      if (requestToCancel) {
        requestToCancel.status = 'annule';
        this.updateMetrics();
        this.showNotification('Demande annulée avec succès.', 'info');
      }
    }
  }

  private showNotification(message: string, type: 'success' | 'warning' | 'info' = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'approuve': return 'Approuvée';
      case 'rejete': return 'Rejetée';
      case 'annule': return 'Annulée';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'en_attente': return 'is-warning';
      case 'approuve': return 'is-success';
      case 'rejete': return 'is-danger';
      case 'annule': return 'is-light';
      default: return 'is-light';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'normal': return 'Normale';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'normal': return 'is-info';
      case 'urgent': return 'is-danger';
      default: return 'is-light';
    }
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  }

  formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }
}