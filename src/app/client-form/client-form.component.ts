import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoCliente } from '../core/models/cliente.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  protected readonly tipoClienteEnum = TipoCliente;

  protected readonly form = this.fb.group({
    clientType: [TipoCliente.PessoaFisica, Validators.required],
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    document: ['', Validators.required],
    birthDate: [''],
    email: ['', [Validators.email]],
    phone: ['', Validators.required],
    address: this.fb.group({
      street: ['', Validators.required],
      number: ['', Validators.required],
      complement: [''],
      district: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required]
    }),
    marketingOptIn: [true]
  });

  @Input() initialValue: ClientFormValue | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() loading = false;
  @Output() saved = new EventEmitter<ClientFormValue>();
  @Output() cancelled = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue']) {
      if (this.initialValue) {
        this.form.reset(this.initialValue);
      } else {
        this.resetForm();
      }
    }
    if (changes['mode'] && !this.initialValue) {
      this.resetForm();
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saved.emit(this.form.getRawValue() as ClientFormValue);
  }

  protected handleCancel(): void {
    this.cancelled.emit();
  }

  private resetForm(): void {
      this.form.reset({
        clientType: TipoCliente.PessoaFisica,
      fullName: '',
      document: '',
      birthDate: '',
      email: '',
      phone: '',
      address: {
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zip: ''
      },
      marketingOptIn: true
    });
  }
}

export interface ClientFormValue {
  clientType: TipoCliente;
  fullName: string;
  document: string;
  birthDate?: string | null;
  email?: string | null;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string | null;
    district: string;
    city: string;
    state: string;
    zip: string;
  };
  marketingOptIn: boolean;
}
