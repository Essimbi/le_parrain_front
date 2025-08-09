// src/app/orders/orders-cash/orders-cash.component.ts

// Mettre à jour ces interfaces pour correspondre à votre backend Django
export interface Product { // Vous aurez probablement une interface Product distincte
  id: string;
  name: string;
  // Autres champs pertinents du produit si nécessaires
}

export interface OrderItem {
  product: string; // Ou Product si vous dé-sérialisez l'objet complet
  quantity: number; // Du modèle
  unit_price: number; // Du modèle
}

export interface Order {
  id: string; // Du modèle
  number_of_customers: number; // Du modèle (correspond à customerCount)
  status: 'ouverte' | 'servie' | 'fermée'; // Du modèle (vos status backend)
  total_amount: number; // Du modèle
  payment_type: 'cash' | 'mobile_money' | null; // Du modèle
  created_at: string; // Date en ISO string du backend
  closed_at: string | null; // Date en ISO string du backend
  items: OrderItem[]; // Du sérialiseur
  // Note: 'serveurName' et 'tableNumber' ne semblent pas être directement dans le sérialiseur OrderSerializer.
  // Vous devrez peut-être les récupérer via l'objet 'serveur' s'il est exposé dans le sérialiseur,
  // ou les gérer côté frontend si ces concepts sont purement frontend.
  // Pour l'exemple, nous allons les garder pour éviter les erreurs dans le HTML, mais soyez conscient de leur source.
  serveurName?: string; // Ne vient pas directement du sérialiseur OrderSerializer
  tableNumber?: number; // Ne vient pas directement du sérialiseur OrderSerializer
}

// Les métriques de caisse doivent correspondre aux réponses de vos vues Django
export interface CashMetrics {
  date: string; // Ajouté, car votre backend renvoie la date
  total_revenue: number; // Correspond à dailyTotal
  total_closed_orders: number; // Correspond à ordersServed
  // Vous devrez calculer pendingOrders, cashPayments, mobileMoneyPayments côté client ou créer de nouvelles vues backend.
  // Pour l'instant, on va estimer ou laisser les valeurs par défaut.
  // Les paiements cash/mobile money ne sont pas directement exposés par la vue GlobalDailyRevenueView.
  // Vous devrez soit modifier la vue, soit les calculer en frontend.
}

// L'interface PaymentData pour l'événement onPaymentComplete reste inchangée côté Angular.
interface PaymentData {
  orderId: string;
  paymentType: 'cash' | 'mobile_money';
  amountReceived: number;
  changeAmount: number;
}