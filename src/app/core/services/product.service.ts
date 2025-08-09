// src/app/products/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// Update this import to your new models file
import { Product, Category, CashMetrics, ServeurDailyRevenueResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProducts(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/products/`, {headers});
  }

  getCategories(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/categories/`, {headers});
  }

  updateProductStock(productId: string, newStockQuantity: number): Observable<Product> {
    const headers = this.getAuthHeaders();
    const payload = { stock_quantity: newStockQuantity };
    return this.http.patch<Product>(`${this.apiUrl}/products/${productId}/update-stock/`, payload, {headers});
  }

  createStockRequest(productId: string, quantity: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload = { product: productId, requested_quantity: quantity };
    return this.http.post(`${this.apiUrl}/stock-requests/`, payload, {headers});
  }

  getProductsBelowThreshold(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/products/stock/below-threshold`, {headers});
  }
}