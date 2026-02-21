import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ClienteViewModel } from '../core/models/cliente.model';
import { OrcamentoCalculoInput, OrcamentoStatus } from '../core/models/orcamento.model';
import { PieceViewModel } from '../core/models/piece.model';
import { ServiceViewModel } from '../core/models/service.model';
import { OrcamentoService } from '../core/services/orcamento.service';

@Component({
  selector: 'app-orcamento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orcamento-form.component.html',
  styleUrl: './orcamento-form.component.css'
})
export class OrcamentoFormComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly orcamentoService = inject(OrcamentoService);
  private readonly destroy$ = new Subject<void>();

  protected readonly statusEnum = OrcamentoStatus;
  protected calculatingCost = false;

  protected readonly form = this.fb.group({
    number: ['', Validators.required],
    clientId: [null as number | null, Validators.required],
    serviceId: [null as number | null, Validators.required],
    productId: [null as number | null],
    weightGrams: [''],
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
  @Input() clients: ClienteViewModel[] = [];
  @Input() services: ServiceViewModel[] = [];
  @Input() products: PieceViewModel[] = [];
  @Output() saved = new EventEmitter<OrcamentoFormValue>();
  @Output() cancelled = new EventEmitter<void>();

  ngOnInit(): void {
    this.setupCostCalculator();
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetForm(): void {
    this.form.reset({
      number: '',
      clientId: null,
      serviceId: null,
      productId: null,
      weightGrams: '',
      issueDate: '',
      validUntil: '',
      totalValue: '',
      status: OrcamentoStatus.EmAberto,
      description: '',
      notes: ''
    });
  }

  private setupCostCalculator(): void {
    this.form.valueChanges
      .pipe(
        startWith(this.form.getRawValue()),
        debounceTime(250),
        map(() => this.buildCalculoInput()),
        distinctUntilChanged((prev, curr) => this.areCalculoInputsEqual(prev, curr)),
        switchMap((payload) => {
          if (!payload) {
            this.setCalculatedTotal(null);
            return of(null);
          }

          this.calculatingCost = true;
          return this.orcamentoService.calcularCusto(payload).pipe(
            catchError((err: unknown) => {
              console.error('Erro ao calcular custo do orçamento', err);
              return of(null);
            }),
            finalize(() => {
              this.calculatingCost = false;
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((result) => {
        this.setCalculatedTotal(result?.valorTotal ?? null);
      });
  }

  private buildCalculoInput(): OrcamentoCalculoInput | null {
    const servicoId = this.toNullableId(this.form.controls.serviceId.value);
    if (!servicoId) {
      return null;
    }

    return {
      servicoId,
      produtoId: this.toNullableId(this.form.controls.productId.value),
      pesoGramas: this.toNullableNumber(this.form.controls.weightGrams.value)
    };
  }

  private toNullableId(value: unknown): number | null {
    if (typeof value !== 'number') {
      return null;
    }
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  private areCalculoInputsEqual(prev: OrcamentoCalculoInput | null, curr: OrcamentoCalculoInput | null): boolean {
    if (!prev && !curr) {
      return true;
    }
    if (!prev || !curr) {
      return false;
    }

    return (
      prev.servicoId === curr.servicoId &&
      (prev.produtoId ?? null) === (curr.produtoId ?? null) &&
      (prev.pesoGramas ?? null) === (curr.pesoGramas ?? null)
    );
  }

  private setCalculatedTotal(total: number | null): void {
    this.form.controls.totalValue.setValue(total === null ? '' : String(total), { emitEvent: false });
  }
}

export interface OrcamentoFormValue {
  number: string;
  clientId: number | null;
  serviceId?: number | null;
  productId?: number | null;
  weightGrams?: string | null;
  issueDate: string;
  validUntil?: string | null;
  totalValue: string;
  status: OrcamentoStatus;
  description?: string | null;
  notes?: string | null;
}
