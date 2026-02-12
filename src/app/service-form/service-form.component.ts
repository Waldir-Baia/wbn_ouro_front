import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.css'
})
export class ServiceFormComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['ajuste', Validators.required],
    description: [''],
    duration: ['', Validators.required],
    basePrice: ['', Validators.required],
    status: ['ativo', Validators.required]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.table(this.form.value);
    alert('Serviço salvo com sucesso!');
    this.form.reset({
      category: 'ajuste',
      status: 'ativo'
    });
  }
}
