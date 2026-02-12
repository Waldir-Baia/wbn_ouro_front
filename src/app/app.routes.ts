import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientListComponent } from './client-list/client-list.component';
import { PieceListComponent } from './piece-list/piece-list.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ServiceListComponent } from './service-list/service-list.component';

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
    path: 'cadastro/categorias',
    component: CategoryListComponent
  },
  {
    path: 'cadastro/servicos',
    component: ServiceListComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
