import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-piece-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './piece-form.component.html',
  styleUrl: './piece-form.component.css'
})
export class PieceFormComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    code: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(3)]],
    collection: [''],
    category: ['aneis', Validators.required],
    metal: ['ouro-amarelo', Validators.required],
    weight: [''],
    stone: [''],
    basePrice: ['', Validators.required],
    productionTime: ['', Validators.required],
    stock: ['disponivel', Validators.required],
    notes: ['']
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.table(this.form.value);
    alert('Peça salva com sucesso!');
    this.form.reset({
      category: 'aneis',
      metal: 'ouro-amarelo',
      stock: 'disponivel'
    });
  }
}
