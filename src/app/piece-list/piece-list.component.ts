import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { PieceFormComponent } from '../piece-form/piece-form.component';

interface PieceModel {
  id: number;
  code: string;
  name: string;
  category: string;
  metal: string;
  stock: 'disponivel' | 'sob-demanda' | 'indisponivel';
  price: string;
}

@Component({
  selector: 'app-piece-list',
  standalone: true,
  imports: [CommonModule, PieceFormComponent],
  templateUrl: './piece-list.component.html',
  styleUrl: './piece-list.component.css'
})
export class PieceListComponent {
  protected readonly pieces = signal<PieceModel[]>([
    { id: 301, code: 'AN-001', name: 'Anel Solitário Aurora', category: 'Anéis', metal: 'Ouro amarelo 18k', stock: 'disponivel', price: 'R$ 5.200,00' },
    { id: 278, code: 'CD-014', name: 'Cordão Trançado Clássico', category: 'Cordões', metal: 'Ouro branco 18k', stock: 'sob-demanda', price: 'R$ 7.800,00' },
    { id: 189, code: 'PU-009', name: 'Pulseira Inspiração', category: 'Pulseiras', metal: 'Prata 925', stock: 'disponivel', price: 'R$ 1.250,00' },
    { id: 142, code: 'BR-022', name: 'Brinco Galáxia', category: 'Brincos', metal: 'Ouro rosé 18k', stock: 'indisponivel', price: 'R$ 3.450,00' }
  ]);

  protected readonly stockLabel: Record<PieceModel['stock'], string> = {
    disponivel: 'Disponível',
    'sob-demanda': 'Sob demanda',
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
