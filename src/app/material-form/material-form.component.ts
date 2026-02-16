import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './material-form.component.html',
  styleUrl: './material-form.component.css'
})
export class MaterialFormComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['metal', Validators.required],
    supplier: [''],
    unit: ['g', Validators.required],
    stockQuantity: ['', Validators.required],
    minStock: ['', Validators.required],
    costPerUnit: ['', Validators.required],
    leadTime: [''],
    description: [''],
    status: ['disponivel', Validators.required]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.table(this.form.value);
    alert('Matéria-prima salva com sucesso!');
    this.form.reset({
      category: 'metal',
      unit: 'g',
      status: 'disponivel'
    });
  }
}
