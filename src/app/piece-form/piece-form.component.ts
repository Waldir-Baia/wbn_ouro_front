import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockStatus } from '../core/models/piece.model';

@Component({
  selector: 'app-piece-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './piece-form.component.html',
  styleUrl: './piece-form.component.css'
})
export class PieceFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  protected readonly stockStatusEnum = StockStatus;

  protected readonly form = this.fb.group({
    code: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(3)]],
    collection: [''],
    category: ['aneis', Validators.required],
    priceTable: ['', Validators.required],
    weight: [''],
    stone: [''],
    basePrice: ['', Validators.required],
    laborValue: ['', [Validators.required, Validators.min(0)]],
    productionTime: ['', Validators.required],
    stock: [StockStatus.Disponivel, Validators.required],
    notes: ['']
  });

  @Input() initialValue: PieceFormValue | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() loading = false;
  @Output() saved = new EventEmitter<PieceFormValue>();
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

    this.saved.emit(this.form.getRawValue() as PieceFormValue);
  }

  protected handleCancel(): void {
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.form.reset({
      code: '',
      name: '',
      collection: '',
      category: 'aneis',
      priceTable: '',
      weight: '',
      stone: '',
      basePrice: '',
      laborValue: '',
      productionTime: '',
      stock: StockStatus.Disponivel,
      notes: ''
    });
  }
}

export interface PieceFormValue {
  code: string;
  name: string;
  collection?: string | null;
  category: string;
  priceTable: string;
  weight?: string | null;
  stone?: string | null;
  basePrice: string;
  laborValue: string;
  productionTime: string;
  stock: StockStatus;
  notes?: string | null;
}
