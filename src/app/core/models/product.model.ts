// src/app/products/models/product.model.ts

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock_quantity: number; // Matches backend's stock_quantity
  min_threshold: number;
  unit: string;
  category: string; // Product has a nested Category object
  is_below_threshold: boolean;
  category_id?: string
}

// If CashMetrics is also related to Products module, you can put it here too
export interface CashMetrics {
  date: string;
  total_revenue: number;
  total_closed_orders: number;
  cash_payments?: number;       // Optional, if backend doesn't always send
  mobile_money_payments?: number; // Optional, if backend doesn't always send
  serveurs?: string[];
}

export interface ServeurDailyRevenueResponse {
  date: string;
  total_revenue: number;
  total_closed_orders: number;
  cash_payments?: number;       // Add if your DailyRevenueView also provides these
  mobile_money_payments?: number; // Add if your DailyRevenueView also provides these
}

// For frontend display purposes, you might still use CategoryData
// but ensure its 'products' array contains the 'Product' interface from above.
export interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  products: Product[]; // References the Product interface defined above
}

export interface StockMetrics {
  totalProducts: number;
  criticalStock: number;
  stockValue: number;
  categories: number;
}