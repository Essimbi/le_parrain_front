import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ReplenishmentService } from '../../../core/services/replenishment.service';

@Component({
  selector: 'app-replenishment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './replenishment.component.html',
  styleUrls: ['./replenishment.component.scss']
})
export class ReplenishmentComponent implements OnInit, OnDestroy {
  metrics: any = {
    pending_requests_count: 0,
    critical_products_count: 0,
    last_approved_request_date: null,
    last_approved_request_quantity: null,
  };

  allRequests: any[] = [];
  filteredRequests: any[] = [];
  paginatedRequests: any[] = [];
  products: Product[] = [];
  
  isLoading = true;
  
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  searchTerm = '';
  selectedStatus: 'all' | 'pending' | 'approved' | 'rejected' = 'all';

  isFormModalOpen = false;
  isDetailsModalOpen = false;
  selectedRequest: any | null = null;
  
  newRequestForm = {
    product_id: '',
    requested_quantity: 1,
    priority: 'normal',
    comment: ''
  };

  priorities = ['normal', 'urgent', 'critical'];
  
  private destroy$ = new Subject<void>();

  constructor(private replenishmentService: ReplenishmentService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitNewRequest(): void {
    if (!this.newRequestForm.product_id || this.newRequestForm.requested_quantity <= 0) {
      alert('Veuillez sélectionner un produit et entrer une quantité valide.');
      return;
    }
    
    const payload = this.newRequestForm;
    
    this.replenishmentService.createReplenishmentRequest(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Demande créée avec succès', response);
        this.closeFormModal();
        this.loadData();
        alert('Demande de réapprovisionnement créée avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la création de la demande', err);
        alert('Échec de la création de la demande.');
      }
    });
  }

  private loadData(): void {
    this.isLoading = true;
    forkJoin({
      requests: this.replenishmentService.getReplenishmentRequests(),
      products: this.replenishmentService.getUrgentProducts(),
      // metrics: this.replenishmentService.getMetrics()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (results) => {
        this.allRequests = results.requests.data;
        this.products = results.products.data;
        // this.metrics = results.metrics.data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données de réapprovisionnement', err);
        this.allRequests = [];
        this.products = [];
        this.metrics = {
          pending_requests_count: 0,
          critical_products_count: 0,
          last_approved_request_date: null,
          last_approved_request_quantity: null,
        };
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let tempRequests = [...this.allRequests];
    if (this.selectedStatus !== 'all') {
      tempRequests = tempRequests.filter(r => r.status === this.selectedStatus);
    }
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      tempRequests = tempRequests.filter(r =>
        r.id.toLowerCase().includes(searchTermLower) ||
        r.product?.name.toLowerCase().includes(searchTermLower)
      );
    }
    this.filteredRequests = tempRequests;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRequests.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRequests = this.filteredRequests.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }

  getReadableStatus(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }

  openFormModal(): void {
    this.isFormModalOpen = true;
    this.newRequestForm = { 
      product_id: '',
      requested_quantity: 1,
      priority: 'normal',
      comment: ''
    };
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
  }

  openRequestDetails(request: any): void {
    this.selectedRequest = request;
    this.isDetailsModalOpen = true;
  }
  
  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedRequest = null;
  }

  editRequest(request: any): void {
    console.log('Éditer la demande', request);
  }

  deleteRequest(id: string): void {
    console.log('Supprimer la demande', id);
  }
}