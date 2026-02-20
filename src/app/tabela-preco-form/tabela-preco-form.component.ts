import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TabelaPrecoStatus } from '../core/models/tabela-preco.model';

@Component({
  selector: 'app-tabela-preco-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tabela-preco-form.component.html',
  styleUrl: './tabela-preco-form.component.css'
})
export class TabelaPrecoFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  protected readonly statusEnum = TabelaPrecoStatus;

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    costPrice: ['', [Validators.required, Validators.min(0)]],
    salePrice: ['', [Validators.required, Validators.min(0)]],
    status: [TabelaPrecoStatus.Ativo, Validators.required],
    description: ['']
  });

  @Input() initialValue: TabelaPrecoFormValue | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() loading = false;
  @Output() saved = new EventEmitter<TabelaPrecoFormValue>();
  @Output() cancelled = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue']) {
      if (this.initialValue) {
        this.form.reset(this.initialValue);
      } else {
        this.resetForm();
      }
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saved.emit(this.form.getRawValue() as TabelaPrecoFormValue);
  }

  protected handleCancel(): void {
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      costPrice: '',
      salePrice: '',
      status: TabelaPrecoStatus.Ativo,
      description: ''
    });
  }
}

export interface TabelaPrecoFormValue {
  name: string;
  costPrice: string;
  salePrice: string;
  status: TabelaPrecoStatus;
  description?: string | null;
}
