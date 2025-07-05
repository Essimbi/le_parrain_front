import { Routes } from '@angular/router';
import { BarmanLayoutComponent } from './features/barman/layout/layout.component';
import { OrdersCashComponent } from './features/barman/orders-cash/orders-cash.component';
import { StockBarComponent } from './features/barman/stock-bar/stock-bar.component';
import { ReplenishmentComponent } from './features/barman/replenishment/replenishment.component';

export const routes: Routes = [
  {
    path: 'barman',
    component: BarmanLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'orders-cash',
        pathMatch: 'full'
      },
      {
        path: 'orders-cash',
        component: OrdersCashComponent
      },
      {
        path: 'stock-bar',
        component: StockBarComponent
      },
      {
        path: 'replenishment',  // ← Nouvelle route
        component: ReplenishmentComponent
      }
    ]
  },
  {
    path: '',
    redirectTo: '/barman',
    pathMatch: 'full'
  }
];