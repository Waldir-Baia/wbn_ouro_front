import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CfgField } from '../core/models/cfg.model';
import { PieceInput, PieceViewModel, StockStatus } from '../core/models/piece.model';
import { PieceDirectoryService } from '../core/services/piece-directory.service';
import { PieceService } from '../core/services/piece.service';
import { PieceFormComponent, PieceFormValue } from '../piece-form/piece-form.component';

@Component({
  selector: 'app-piece-list',
  standalone: true,
  imports: [CommonModule, PieceFormComponent],
  templateUrl: './piece-list.component.html',
  styleUrl: './piece-list.component.css'
})
export class PieceListComponent {
  private readonly directory = inject(PieceDirectoryService);
  private readonly pieceService = inject(PieceService);

  protected readonly gridColumns = signal<GridColumn[]>([]);
  protected readonly gridRows = signal<GridRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly selectedRowId = signal<string | null>(null);
  protected readonly selectedPiece = signal<PieceViewModel | null>(null);
  protected readonly dialogMode = signal<'create' | 'edit'>('create');
  protected readonly dialogOpen = signal(false);
  protected readonly formInitialValue = signal<PieceFormValue | null>(null);
  protected readonly saving = signal(false);

  constructor() {
    this.loadDirectory();
  }

  protected get hasRowSelection(): boolean {
    return !!this.selectedRowId();
  }

  protected get canEdit(): boolean {
    return !!this.selectedPiece();
  }

  protected openDialog(mode: 'create' | 'edit'): void {
    if (mode === 'edit') {
      if (!this.selectedRowId() || !this.selectedPiece()) {
        return;
      }
      this.formInitialValue.set(this.mapToFormValue(this.selectedPiece()!));
    } else {
      this.formInitialValue.set(null);
    }
    this.dialogMode.set(mode);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
    this.formInitialValue.set(null);
  }

  protected selectRow(row: GridRow): void {
    if (this.selectedRowId() === row.id) {
      return;
    }
    this.selectedRowId.set(row.id);
    this.selectedPiece.set(null);
    this.fetchPieceDetails(row.id);
  }

  protected handleFormSubmit(value: PieceFormValue): void {
    const payload = this.mapToApiPayload(value);
    const mode = this.dialogMode();
    const selected = this.selectedPiece();
    this.saving.set(true);

    const request$: Observable<void> =
      mode === 'edit' && selected
        ? this.pieceService.updatePiece(selected.id, payload)
        : this.pieceService.createPiece(payload).pipe(map(() => void 0));

    request$.subscribe({
      next: () => {
        this.closeDialog();
        this.loadDirectory();
        this.saving.set(false);
      },
      error: (err: unknown) => {
        console.error('Erro ao salvar peça/modelo', err);
        this.saving.set(false);
      }
    });
  }

  protected deleteSelected(): void {
    const rowId = this.selectedRowId();
    if (!rowId) {
      return;
    }
    const numericId = Number(rowId);
    if (!Number.isFinite(numericId)) {
      return;
    }
    this.loading.set(true);
    this.pieceService.deletePiece(numericId).subscribe({
      next: () => {
        this.selectedPiece.set(null);
        this.selectedRowId.set(null);
        this.loadDirectory();
      },
      error: (err: unknown) => {
        console.error('Erro ao excluir peça/modelo', err);
        this.loading.set(false);
      }
    });
  }

  protected formatCellValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    return String(value);
  }

  private loadDirectory(page = 1): void {
    this.loading.set(true);
    this.directory.load(page).subscribe({
      next: (result) => {
        this.gridColumns.set(this.mapColumns(result.fields));
        this.gridRows.set(this.mapRows(result.data, result.primaryKey));
        this.selectedRowId.set(null);
        this.selectedPiece.set(null);
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar peças do CFG', err);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  private fetchPieceDetails(rowId: string): void {
    const numericId = Number(rowId);
    if (!Number.isFinite(numericId)) {
      return;
    }
    this.pieceService.getPiece(numericId).subscribe({
      next: (piece) => this.selectedPiece.set(piece),
      error: (err: unknown) => console.error('Erro ao buscar peça selecionada', err)
    });
  }

  private mapColumns(fields: CfgField[]): GridColumn[] {
    return fields
      .filter((field) => field.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((field) => ({
        key: field.fieldKey,
        label: field.label,
        width: field.columnWidth
      }));
  }

  private mapRows(data: Array<Record<string, unknown>>, primaryKey?: string | null): GridRow[] {
    const keys = this.buildPrimaryKeyCandidates(primaryKey);
    return data.map((item, index) => ({
      id: this.resolveRowId(item, keys, index),
      data: item
    }));
  }

  private buildPrimaryKeyCandidates(primaryKey?: string | null): string[] {
    if (!primaryKey) {
      return [];
    }
    const trimmed = primaryKey.trim();
    const lastSegment = trimmed.split('.').pop() ?? trimmed;
    return Array.from(new Set([trimmed, lastSegment, trimmed.replace(/\./g, '_')]));
  }

  private resolveRowId(item: Record<string, unknown>, keys: string[], fallbackIndex: number): string {
    for (const key of keys) {
      if (!key) continue;
      const direct = item[key];
      if (direct !== undefined && direct !== null) {
        return String(direct);
      }
      const lowerKey = key.toLowerCase();
      for (const currentKey of Object.keys(item)) {
        if (currentKey.toLowerCase() === lowerKey) {
          const value = item[currentKey];
          if (value !== undefined && value !== null) {
            return String(value);
          }
        }
      }
    }
    return `row-${fallbackIndex}`;
  }

  private mapToFormValue(piece: PieceViewModel): PieceFormValue {
    return {
      code: piece.codigoInterno ?? '',
      name: piece.nome ?? '',
      collection: piece.colecao ?? '',
      category: piece.categoria ?? '',
      metal: piece.metalPrincipal ?? '',
      weight: piece.pesoEstimadoGramas != null ? String(piece.pesoEstimadoGramas) : '',
      stone: piece.pedraPrincipal ?? '',
      basePrice: piece.precoBase != null ? String(piece.precoBase) : '',
      productionTime: piece.prazoProducaoDias != null ? String(piece.prazoProducaoDias) : '',
      stock: this.resolveStock(piece.situacaoEstoque),
      notes: piece.observacoes ?? ''
    };
  }

  private mapToApiPayload(value: PieceFormValue): PieceInput {
    return {
      codigoInterno: value.code,
      nome: value.name,
      colecao: value.collection || null,
      categoria: value.category,
      metalPrincipal: value.metal,
      pesoEstimadoGramas: this.toNullableNumber(value.weight),
      pedraPrincipal: value.stone || null,
      precoBase: this.toNumber(value.basePrice, 0),
      prazoProducaoDias: this.toNullableNumber(value.productionTime),
      situacaoEstoque: value.stock,
      observacoes: value.notes || null
    };
  }

  private resolveStock(value: StockStatus | number | string | null | undefined): StockStatus {
    if (typeof value === 'number') {
      return value in StockStatus ? (value as StockStatus) : StockStatus.Disponivel;
    }
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized.includes('demanda')) {
        return StockStatus.SobDemanda;
      }
      if (normalized.includes('indispon')) {
        return StockStatus.Indisponivel;
      }
      return StockStatus.Disponivel;
    }
    return StockStatus.Disponivel;
  }

  private toNumber(value: string | number, fallback = 0): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : fallback;
    }
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private toNullableNumber(value?: string | number | null): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const numberValue = this.toNumber(value as string | number, NaN);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
}

interface GridColumn {
  key: string;
  label: string;
  width?: number;
}

interface GridRow {
  id: string;
  data: Record<string, unknown>;
}
