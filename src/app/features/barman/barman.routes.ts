import { Routes } from '@angular/router';
import { BarmanLayoutComponent } from './layout/layout.component';

export const barmanRoutes: Routes = [
  {
    path: '',
    component: BarmanLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'orders-cash',
        pathMatch: 'full'
      },
      {
        path: 'orders-cash',
        loadComponent: () => import('./orders-cash/orders-cash.component').then(m => m.OrdersCashComponent)
      },
      {
        path: 'stock-bar',
        loadComponent: () => import('./stock-bar/stock-bar.component').then(m => m.StockBarComponent)
      },
      {
        path: 'replenishment',
        loadComponent: () => import('./replenishment/replenishment.component').then(m => m.ReplenishmentComponent)
      }
    ]
  }
];