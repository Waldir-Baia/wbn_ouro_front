import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ServiceFormComponent } from '../service-form/service-form.component';

interface ServiceSummary {
  id: number;
  name: string;
  category: string;
  duration: string;
  status: 'ativo' | 'inativo';
  basePrice: string;
}

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, ServiceFormComponent],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.css'
})
export class ServiceListComponent {
  protected readonly services = signal<ServiceSummary[]>([
    { id: 501, name: 'Polimento completo', category: 'Limpeza', duration: '3 dias', status: 'ativo', basePrice: 'R$ 250,00' },
    { id: 492, name: 'Ajuste de anel', category: 'Ajustes', duration: '2 dias', status: 'ativo', basePrice: 'R$ 180,00' },
    { id: 476, name: 'Solda de cordão', category: 'Manutenção', duration: '4 dias', status: 'inativo', basePrice: 'R$ 320,00' }
  ]);

  protected readonly statusLabel: Record<ServiceSummary['status'], string> = {
    ativo: 'Ativo',
    inativo: 'Inativo'
  };

  protected readonly dialogOpen = signal(false);
  protected readonly dialogMode = signal<'create' | 'edit'>('create');

  protected openDialog(mode: 'create' | 'edit'): void {
    this.dialogMode.set(mode);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
  }
}
