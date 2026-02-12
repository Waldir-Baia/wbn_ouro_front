import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ClientFormComponent } from '../client-form/client-form.component';

interface ClientSummary {
  id: number;
  name: string;
  document: string;
  status: 'ativo' | 'inativo' | 'vip';
  lastOrder: string;
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, ClientFormComponent],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent {
  protected readonly clients = signal<ClientSummary[]>([
    { id: 101, name: 'Camila Andrade', document: '123.456.789-00', status: 'vip', lastOrder: '02/02/2026' },
    { id: 87, name: 'Atelier Moraes', document: '41.785.963/0001-25', status: 'ativo', lastOrder: '28/01/2026' },
    { id: 64, name: 'Rafael Souza', document: '987.654.321-00', status: 'ativo', lastOrder: '15/01/2026' },
    { id: 22, name: 'Joyas LTDA', document: '08.321.456/0001-90', status: 'inativo', lastOrder: '12/11/2025' }
  ]);

  protected readonly statusLabel: Record<ClientSummary['status'], string> = {
    ativo: 'Ativo',
    inativo: 'Inativo',
    vip: 'VIP'
  };

  protected readonly dialogMode = signal<'create' | 'edit'>('create');
  protected readonly dialogOpen = signal(false);

  protected openDialog(mode: 'create' | 'edit'): void {
    this.dialogMode.set(mode);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
  }
}
