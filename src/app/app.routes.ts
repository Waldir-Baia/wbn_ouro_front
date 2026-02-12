import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientListComponent } from './client-list/client-list.component';
import { PieceListComponent } from './piece-list/piece-list.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'cadastro/clientes',
    component: ClientListComponent
  },
  {
    path: 'cadastro/pecas',
    component: PieceListComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
