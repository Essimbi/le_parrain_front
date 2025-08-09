import { Product } from './product.model';

export interface ReplenishmentItemBackend {
  id?: string;
  product: string;
  quantity: number;
  product_name?: string;
}

export interface ReplenishmentRequest {
  id: string; 
  organisation?: string; 
  barman?: string; 
  status: 'en_attente' | 'approuve' | 'rejete'; 
  created_at: string; 
  approved_at?: string | null; 
  requested_by: string; 
  items: ReplenishmentItemBackend[]; 
  totalQuantity?: number;
  priority?: 'normal' | 'urgent' | 'critical';
  comment?: string; 
}

export interface ReplenishmentMetrics {
  pending_requests_count: number; 
  critical_products_count: number; 
  last_approved_request_date?: string | null; 
  last_approved_request_quantity?: number | null; 
}

export interface NewReplenishmentRequestPayload {
  items: {
    product: string; 
    quantity: number;
  }[];
  comment?: string;
  priority?: 'normal' | 'urgent' | 'critical';
}

