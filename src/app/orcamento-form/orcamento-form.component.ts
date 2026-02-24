import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ClienteViewModel } from '../core/models/cliente.model';
import { OrcamentoCalculoInput, OrcamentoCalculoProdutoResultado, OrcamentoStatus } from '../core/models/orcamento.model';
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
  protected productDialogOpen = false;
  protected productSearch = '';

  protected readonly form = this.fb.group({
    number: ['', Validators.required],
    clientId: [null as number | null, Validators.required],
    serviceId: [null as number | null, Validators.required],
    productSelections: [[] as OrcamentoProdutoSelecao[]],
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
        this.form.reset({
          ...this.initialValue,
          productSelections: this.normalizeProductSelections(this.initialValue.productSelections)
        });
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
    this.closeProductDialog();
    this.cancelled.emit();
  }

  protected openProductDialog(): void {
    this.productSearch = '';
    this.productDialogOpen = true;
  }

  protected closeProductDialog(): void {
    this.productSearch = '';
    this.productDialogOpen = false;
  }

  protected updateProductSearch(value: string): void {
    this.productSearch = value.trim().toLowerCase();
  }

  protected addSelectedProduct(productId: number): void {
    const current = this.form.controls.productSelections.value ?? [];
    if (current.some((item) => item.productId === productId)) {
      return;
    }

    this.form.controls.productSelections.setValue([
      ...current,
      { productId, weightGrams: null, quantity: 1 }
    ]);
    this.closeProductDialog();
  }

  protected removeSelectedProduct(productId: number): void {
    const current = this.form.controls.productSelections.value ?? [];
    this.form.controls.productSelections.setValue(
      current.filter((item) => item.productId !== productId)
    );
  }

  protected updateSelectedProductWeight(productId: number, value: string): void {
    const current = this.form.controls.productSelections.value ?? [];
    this.form.controls.productSelections.setValue(
      current.map((item) =>
        item.productId === productId
          ? { ...item, weightGrams: this.toNullableNumber(value) }
          : item
      )
    );
  }

  protected updateSelectedProductQuantity(productId: number, value: string): void {
    const current = this.form.controls.productSelections.value ?? [];
    this.form.controls.productSelections.setValue(
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: this.toNullablePositiveNumber(value) ?? 1 }
          : item
      )
    );
  }

  protected get selectedProducts(): SelectedProductView[] {
    const items = this.form.controls.productSelections.value ?? [];
    const selected: SelectedProductView[] = [];

    for (const item of items) {
      const product = this.products.find((candidate) => candidate.id === item.productId);
      if (!product) {
        continue;
      }

      selected.push({
        id: product.id,
        nome: product.nome,
        weightGrams: item.weightGrams ?? null,
        quantity: item.quantity ?? 1
      });
    }

    return selected;
  }

  protected get availableProducts(): PieceViewModel[] {
    const selectedIds = new Set(
      (this.form.controls.productSelections.value ?? []).map((item) => item.productId)
    );
    return this.products.filter((product) => !selectedIds.has(product.id));
  }

  protected get filteredAvailableProducts(): PieceViewModel[] {
    const term = this.productSearch;
    if (!term) {
      return this.availableProducts;
    }

    return this.availableProducts.filter((product) => {
      const nome = (product.nome ?? '').toLowerCase();
      const codigo = String(product.id ?? '').toLowerCase();
      return nome.includes(term) || codigo.includes(term);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetForm(): void {
    this.closeProductDialog();
    this.form.reset({
      number: '',
      clientId: null,
      serviceId: null,
      productSelections: [],
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
        this.syncCalculatedProducts(result?.produtos ?? null);
      });
  }

  private buildCalculoInput(): OrcamentoCalculoInput | null {
    const servicoId = this.toNullableId(this.form.controls.serviceId.value);
    if (!servicoId) {
      return null;
    }

    return {
      servicoId,
      produtos: this.getCalculoProdutos()
    };
  }

  private getCalculoProdutos(): Array<{ produtoId: number; pesoGramas: number; quantidade: number }> {
    const items = this.normalizeProductSelections(this.form.controls.productSelections.value ?? []);
    const produtos: Array<{ produtoId: number; pesoGramas: number; quantidade: number }> = [];

    for (const item of items) {
      const pesoGramas = item.weightGrams ?? null;
      if (pesoGramas === null || pesoGramas <= 0) {
        continue;
      }

      produtos.push({
        produtoId: item.productId,
        pesoGramas,
        quantidade: item.quantity ?? 1
      });
    }

    return produtos;
  }

  private normalizeProductSelections(items: OrcamentoProdutoSelecao[] | null | undefined): OrcamentoProdutoSelecao[] {
    if (!Array.isArray(items)) {
      return [];
    }

    const unique = new Map<number, OrcamentoProdutoSelecao>();
    for (const item of items) {
      const productId = this.toNullableId(item.productId);
      if (!productId) {
        continue;
      }

      unique.set(productId, {
        productId,
        weightGrams: this.toNullableNumber(item.weightGrams ?? null),
        quantity: this.toNullablePositiveNumber(item.quantity ?? 1) ?? 1,
        unitPrice: this.toNullableNumber(item.unitPrice ?? null),
        totalItem: this.toNullableNumber(item.totalItem ?? null),
        note: item.note?.trim() || null
      });
    }

    return Array.from(unique.values());
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

  private toNullablePositiveNumber(value: unknown): number | null {
    const parsed = this.toNullableNumber(value);
    if (parsed === null || parsed <= 0) {
      return null;
    }
    return parsed;
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
      this.areCalculoProductsEqual(prev.produtos, curr.produtos)
    );
  }

  private areCalculoProductsEqual(
    prev: OrcamentoCalculoInput['produtos'] | null | undefined,
    curr: OrcamentoCalculoInput['produtos'] | null | undefined
  ): boolean {
    const prevItems = prev ?? [];
    const currItems = curr ?? [];

    if (prevItems.length !== currItems.length) {
      return false;
    }

    for (let i = 0; i < prevItems.length; i += 1) {
      const a = prevItems[i];
      const b = currItems[i];
      if (
        a.produtoId !== b.produtoId ||
        (a.pesoGramas ?? null) !== (b.pesoGramas ?? null) ||
        (a.quantidade ?? null) !== (b.quantidade ?? null)
      ) {
        return false;
      }
    }

    return true;
  }

  private setCalculatedTotal(total: number | null): void {
    this.form.controls.totalValue.setValue(total === null ? '' : String(total), { emitEvent: false });
  }

  private syncCalculatedProducts(produtos: OrcamentoCalculoProdutoResultado[] | null | undefined): void {
    const current = this.normalizeProductSelections(this.form.controls.productSelections.value ?? []);
    if (current.length === 0) {
      return;
    }

    const calculatedById = new Map<number, OrcamentoCalculoProdutoResultado>();
    for (const produto of produtos ?? []) {
      if (typeof produto.produtoId === 'number' && produto.produtoId > 0) {
        calculatedById.set(produto.produtoId, produto);
      }
    }

    const updated = current.map((item) => {
      const quantity = this.toNullablePositiveNumber(item.quantity ?? 1) ?? 1;
      const calculated = calculatedById.get(item.productId);
      if (!calculated) {
        return {
          ...item,
          quantity,
          unitPrice: null,
          totalItem: null
        };
      }

      const totalItem = this.toNullableNumber(calculated.valorItem ?? null);
      const unitPriceFromTotal =
        totalItem !== null && quantity > 0 ? Number((totalItem / quantity).toFixed(2)) : null;

      return {
        ...item,
        quantity,
        unitPrice: unitPriceFromTotal ?? this.toNullableNumber(calculated.custoUnitarioMateriaPrima ?? null),
        totalItem
      };
    });

    this.form.controls.productSelections.setValue(updated, { emitEvent: false });
  }
}

export interface OrcamentoFormValue {
  number: string;
  clientId: number | null;
  serviceId?: number | null;
  productSelections: OrcamentoProdutoSelecao[];
  issueDate: string;
  validUntil?: string | null;
  totalValue: string;
  status: OrcamentoStatus;
  description?: string | null;
  notes?: string | null;
}

export interface OrcamentoProdutoSelecao {
  productId: number;
  weightGrams?: number | null;
  quantity?: number | null;
  unitPrice?: number | null;
  totalItem?: number | null;
  note?: string | null;
}

interface SelectedProductView {
  id: number;
  nome: string;
  weightGrams: number | null;
  quantity: number;
}
