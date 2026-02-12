import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  protected readonly shortcuts = [
    { title: 'Cadastrar cliente', description: 'Cadastre novos clientes e acompanhe pedidos.', icon: '👤' },
    { title: 'Abrir OS', description: 'Registre novas ordens de serviço para a bancada.', icon: '🛠️' },
    { title: 'Controle de estoque', description: 'Veja metais e pedras com baixo estoque.', icon: '📦' }
  ];
}
