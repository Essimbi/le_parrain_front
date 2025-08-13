// src/app/orders/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CashMetrics, Order } from '../models/order.model';


@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Base API URL for your Django orders module
  private apiUrl = 'https://le-parrain.mbotchakfoundation.org/api/orders'; //

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Retrieves orders that are 'ouverte' or 'servie' (opened today)
  // Corresponds to: path('opened/', OrdersOpenedTodayView.as_view(), name='orders-opened')
  getOpenedOrders(): Observable<Order[]> {
    const headers = this.getAuthHeaders() ;
    return this.http.get<Order[]>(`${this.apiUrl}/preparing/`, {headers}); //
  }

  getServedOrders(): Observable<Order[]> {
    const headers = this.getAuthHeaders() ;
    return this.http.get<Order[]>(`${this.apiUrl}/served/`, {headers}); //
  }

  // Retrieves global daily revenue metrics (for barman/admin)
  // Corresponds to: path('barman/revenue/global/', GlobalDailyRevenueView.as_view(), name='global-daily-revenue')
  getGlobalDailyRevenue(): Observable<CashMetrics> {
    const headers = this.getAuthHeaders() ;
    return this.http.get<CashMetrics>(`${this.apiUrl}/barman/revenue/global/`, {headers}); //
  }

  // Retrieves daily revenue metrics for a specific serveur
  // Corresponds to: path('server/revenue/', DailyRevenueView.as_view(), name='orders-daily-revenue')
  getDailyRevenueForServeur(): Observable<any> { // Using 'any' as the backend response type is not strictly defined here
    const headers = this.getAuthHeaders() ;
    return this.http.get<any>(`${this.apiUrl}/server/revenue/`, {headers}); //
  }

  validedOrders(id: string): Observable<Order> {
    const headers = this.getAuthHeaders() ; 
    const endpoint = `${this.apiUrl}/${id}/validate/`;
    return this.http.put<Order>(endpoint, { status: "servie" }, {headers});
  }

  closedOrder(id: string, data: any): Observable<Order> {
    const headers = this.getAuthHeaders() ;
    const endpoint = `${this.apiUrl}/${id}/close/`;
    return this.http.put<Order>(endpoint, data, {headers});
  }

  // Updates the status of an order
  // Corresponds to:
  // - path('<uuid:pk>/update/', OrderStatusUpdateView.as_view(), name='order-update')
  // - path('<uuid:pk>/validate/', OrderValidateView.as_view(), name='order-validate')
  updateOrderStatus(orderId: string, newStatus: 'ouverte' | 'servie' | 'fermée'): Observable<Order> {
    const headers = this.getAuthHeaders() ;
    let endpoint = `${this.apiUrl}/${orderId}/update/`; // Default for 'update' action
    if (newStatus === 'servie') {
      endpoint = `${this.apiUrl}/${orderId}/validate/`; // Specific for 'validate' (barman)
    }
    return this.http.patch<Order>(endpoint, { status: newStatus }, {headers});
  }

  // Marks an order as 'fermée' (closed) after payment
  // Re-uses the OrderStatusUpdateView to set status to 'fermée' and record payment_type
  closeOrder(orderId: string, paymentType: 'cash' | 'mobile_money'): Observable<Order> {
    const headers = this.getAuthHeaders() ;
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/update/`, { //
      status: 'fermee', //
      payment_type: paymentType //
    }, {headers});
  }

  // Optional: Get a single order by ID
  // Corresponds to: No direct specific endpoint for single GET by ID provided, assuming common REST pattern
  // getOrderById(orderId: string): Observable<Order> {
  //   return this.http.get<Order>(`${this.apiUrl}/${orderId}/`); // Assuming <uuid:pk>/ is available for GET
  // }
}