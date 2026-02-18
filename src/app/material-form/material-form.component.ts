import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialStatus } from '../core/models/material.model';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './material-form.component.html',
  styleUrl: './material-form.component.css'
})
export class MaterialFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  protected readonly statusEnum = MaterialStatus;

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
    status: [MaterialStatus.Disponivel, Validators.required]
  });

  @Input() initialValue: MaterialFormValue | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() loading = false;
  @Output() saved = new EventEmitter<MaterialFormValue>();
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

    this.saved.emit(this.form.getRawValue() as MaterialFormValue);
  }

  protected handleCancel(): void {
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      category: 'metal',
      supplier: '',
      unit: 'g',
      stockQuantity: '',
      minStock: '',
      costPerUnit: '',
      leadTime: '',
      description: '',
      status: MaterialStatus.Disponivel
    });
  }
}

export interface MaterialFormValue {
  name: string;
  category: string;
  supplier?: string | null;
  unit: string;
  stockQuantity: string;
  minStock: string;
  costPerUnit: string;
  leadTime?: string | null;
  description?: string | null;
  status: MaterialStatus;
}
