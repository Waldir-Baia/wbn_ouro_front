import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrcamentoStatus } from '../core/models/orcamento.model';

@Component({
  selector: 'app-orcamento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orcamento-form.component.html',
  styleUrl: './orcamento-form.component.css'
})
export class OrcamentoFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  protected readonly statusEnum = OrcamentoStatus;

  protected readonly form = this.fb.group({
    number: ['', Validators.required],
    client: ['', [Validators.required, Validators.minLength(3)]],
    issueDate: ['', Validators.required],
    validUntil: [''],
    totalValue: ['', Validators.required],
    status: [OrcamentoStatus.EmAberto, Validators.required],
    description: [''],
    notes: ['']
  });

  @Input() initialValue: OrcamentoFormValue | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() loading = false;
  @Output() saved = new EventEmitter<OrcamentoFormValue>();
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

    this.saved.emit(this.form.getRawValue() as OrcamentoFormValue);
  }

  protected handleCancel(): void {
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.form.reset({
      number: '',
      client: '',
      issueDate: '',
      validUntil: '',
      totalValue: '',
      status: OrcamentoStatus.EmAberto,
      description: '',
      notes: ''
    });
  }
}

export interface OrcamentoFormValue {
  number: string;
  client: string;
  issueDate: string;
  validUntil?: string | null;
  totalValue: string;
  status: OrcamentoStatus;
  description?: string | null;
  notes?: string | null;
}
