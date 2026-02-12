import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    clientType: ['pf', Validators.required],
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    document: ['', Validators.required],
    birthDate: [''],
    email: ['', [Validators.email]],
    phone: ['', Validators.required],
    whatsappOptIn: [true],
    address: this.fb.group({
      street: ['', Validators.required],
      number: ['', Validators.required],
      complement: [''],
      district: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required]
    }),
    jewelryProfile: this.fb.group({
      category: ['aneis'],
      metal: ['ouro-amarelo'],
      size: [''],
      stone: [''],
      urgency: ['normal'],
      notes: ['']
    }),
    vipClient: [false],
    marketingOptIn: [true]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.table(this.form.value);
    alert('Cliente salvo com sucesso!');
    this.form.reset({
      clientType: 'pf',
      whatsappOptIn: true,
      jewelryProfile: {
        category: 'aneis',
        metal: 'ouro-amarelo',
        urgency: 'normal'
      },
      marketingOptIn: true
    });
  }
}
