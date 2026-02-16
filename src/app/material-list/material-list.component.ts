import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MaterialFormComponent } from '../material-form/material-form.component';

interface MaterialSummary {
  id: number;
  name: string;
  category: string;
  unit: string;
  stockQuantity: string;
  status: 'disponivel' | 'indisponivel';
  supplier?: string;
}

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, MaterialFormComponent],
  templateUrl: './material-list.component.html',
  styleUrl: './material-list.component.css'
})
export class MaterialListComponent {
  protected readonly materials = signal<MaterialSummary[]>([
    { id: 701, name: 'Ouro amarelo 18k', category: 'Metal', unit: 'g', stockQuantity: '320 g', status: 'disponivel', supplier: 'MetalLux' },
    { id: 655, name: 'Diamante lapidado 0,5ct', category: 'Pedra', unit: 'ct', stockQuantity: '7 ct', status: 'disponivel', supplier: 'Bright Stones' },
    { id: 618, name: 'Solda prateada', category: 'Insumo', unit: 'g', stockQuantity: '150 g', status: 'indisponivel', supplier: 'TecSolda' }
  ]);

  protected readonly statusLabel: Record<MaterialSummary['status'], string> = {
    disponivel: 'Disponível',
    indisponivel: 'Indisponível'
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
