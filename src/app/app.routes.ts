import { Routes } from '@angular/router';
import { BarmanLayoutComponent } from './features/barman/layout/layout.component';
import { OrdersCashComponent } from './features/barman/orders-cash/orders-cash.component';
import { StockBarComponent } from './features/barman/stock-bar/stock-bar.component';
import { ReplenishmentComponent } from './features/barman/replenishment/replenishment.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { BarmanGuard } from './core/guards/barman.guard';

export const routes: Routes = [
  {
    path: 'barman',
    component: BarmanLayoutComponent,
    canActivate: [AuthGuard, BarmanGuard],
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
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  }
];