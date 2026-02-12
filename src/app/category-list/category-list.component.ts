import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { CategoryFormComponent } from '../category-form/category-form.component';

interface Category {
  id: number;
  name: string;
  type: string;
  status: 'ativo' | 'inativo';
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, CategoryFormComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent {
  protected readonly categories = signal<Category[]>([
    { id: 1, name: 'Aliança clássica', type: 'Alianças', status: 'ativo' },
    { id: 2, name: 'Anel solitário', type: 'Anéis', status: 'ativo' },
    { id: 3, name: 'Cordão trançado', type: 'Cordões', status: 'ativo' },
    { id: 4, name: 'Pulseira delicada', type: 'Pulseiras', status: 'inativo' }
  ]);

  protected readonly statusLabel: Record<Category['status'], string> = {
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
