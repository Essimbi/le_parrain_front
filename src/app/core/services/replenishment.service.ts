// src/app/replenishment/services/replenishment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewReplenishmentRequestPayload, ReplenishmentMetrics, ReplenishmentRequest } from '../models/replinishment.model';
import { Product } from '../models/product.model';


@Injectable({
  providedIn: 'root'
})
export class ReplenishmentService {
  private replenishmentApiUrl = 'https://le-parrain.mbotchakfoundation.org/api/products/stock-requests'; // Endpoint pour StockRequest
  private productsApiUrl = 'https://le-parrain.mbotchakfoundation.org/api/products'; // Endpoint pour Product (pour les produits urgents)

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }


  // Récupère toutes les demandes de réapprovisionnement (StockRequestListCreateView)
  getReplenishmentRequests(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.replenishmentApiUrl}/`, {headers});
  }

  // Crée une nouvelle demande de réapprovisionnement (StockRequestListCreateView)
  createReplenishmentRequest(payload: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.replenishmentApiUrl}/`, payload, {headers});
  }

  
  cancelReplenishmentRequest(requestId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.replenishmentApiUrl}/${requestId}/`, {headers});
    // Si l'annulation est un changement de statut à 'rejete' (nécessite un endpoint PATCH générique pour StockRequest):
    // return this.http.patch(`${this.replenishmentApiUrl}/${requestId}/`, { status: 'rejete' });
  }

  // Récupère les produits en stock critique (ProductBelowThresholdView)
  getUrgentProducts(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.productsApiUrl}/products/low-stock/`, {headers});
  }

  // Future API: Récupérer les métriques de réapprovisionnement (nécessitera une nouvelle vue API dans Django)
  // Pour l'instant, ces métriques seront calculées côté frontend ou attendront une API dédiée.
  getReplenishmentMetrics(): Observable<ReplenishmentMetrics> {
    const headers = this.getAuthHeaders();
    return this.http.get<ReplenishmentMetrics>(`${this.productsApiUrl}/stock-requests/metrics/`, {headers});
  }

  getMetrics(): Observable<{ data: any }> {
    // Cet endpoint est un exemple, vous devrez peut-être le modifier
    return this.http.get<{ data: any }>(`${this.replenishmentApiUrl}/metrics`, { headers: this.getAuthHeaders() });
  }
}