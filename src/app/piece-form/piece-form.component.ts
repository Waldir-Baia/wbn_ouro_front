import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryViewModel } from '../core/models/category.model';
import { MaterialViewModel } from '../core/models/material.model';
import { StockStatus } from '../core/models/piece.model';
import { TabelaPrecoViewModel } from '../core/models/tabela-preco.model';

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
    categoryId: [null as number | null, Validators.required],
    priceTableId: [null as number | null, Validators.required],
    rawMaterialId: [null as number | null, Validators.required],
    stone: [''],
    productionTime: ['', Validators.required],
    stock: [StockStatus.Disponivel, Validators.required],
    notes: ['']
  });

  @Input() initialValue: PieceFormValue | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() loading = false;
  @Input() categories: CategoryViewModel[] = [];
  @Input() priceTables: TabelaPrecoViewModel[] = [];
  @Input() materials: MaterialViewModel[] = [];
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
      categoryId: null,
      priceTableId: null,
      rawMaterialId: null,
      stone: '',
      productionTime: '',
      stock: StockStatus.Disponivel,
      notes: ''
    });
  }
}

export interface PieceFormValue {
  code: string;
  name: string;
  categoryId: number | null;
  priceTableId: number | null;
  rawMaterialId: number | null;
  stone?: string | null;
  productionTime: string;
  stock: StockStatus;
  notes?: string | null;
}
