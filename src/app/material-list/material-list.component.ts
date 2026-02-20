import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CfgField } from '../core/models/cfg.model';
import { MaterialInput, MaterialStatus, MaterialViewModel } from '../core/models/material.model';
import { MaterialDirectoryService } from '../core/services/material-directory.service';
import { MaterialService } from '../core/services/material.service';
import { TabelaPrecoService } from '../core/services/tabela-preco.service';
import { TabelaPrecoViewModel } from '../core/models/tabela-preco.model';
import { MaterialFormComponent, MaterialFormValue } from '../material-form/material-form.component';

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, MaterialFormComponent],
  templateUrl: './material-list.component.html',
  styleUrl: './material-list.component.css'
})
export class MaterialListComponent {
  private readonly directory = inject(MaterialDirectoryService);
  private readonly materialService = inject(MaterialService);
  private readonly tabelaPrecoService = inject(TabelaPrecoService);

  protected readonly gridColumns = signal<GridColumn[]>([]);
  protected readonly gridRows = signal<GridRow[]>([]);
  protected readonly priceTables = signal<TabelaPrecoViewModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly selectedRowId = signal<string | null>(null);
  protected readonly selectedMaterial = signal<MaterialViewModel | null>(null);
  protected readonly dialogMode = signal<'create' | 'edit'>('create');
  protected readonly dialogOpen = signal(false);
  protected readonly formInitialValue = signal<MaterialFormValue | null>(null);
  protected readonly saving = signal(false);

  constructor() {
    this.loadDirectory();
    this.loadPriceTables();
  }

  protected get hasRowSelection(): boolean {
    return !!this.selectedRowId();
  }

  protected get canEdit(): boolean {
    return !!this.selectedMaterial();
  }

  protected openDialog(mode: 'create' | 'edit'): void {
    if (mode === 'edit') {
      if (!this.selectedRowId() || !this.selectedMaterial()) {
        return;
      }
      this.formInitialValue.set(this.mapToFormValue(this.selectedMaterial()!));
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
    this.selectedMaterial.set(null);
    this.fetchMaterialDetails(row.id);
  }

  protected handleFormSubmit(value: MaterialFormValue): void {
    const payload = this.mapToApiPayload(value);
    const mode = this.dialogMode();
    const selected = this.selectedMaterial();
    this.saving.set(true);

    const request$: Observable<void> =
      mode === 'edit' && selected
        ? this.materialService.updateMaterial(selected.id, payload)
        : this.materialService.createMaterial(payload).pipe(map(() => void 0));

    request$.subscribe({
      next: () => {
        this.closeDialog();
        this.loadDirectory();
        this.saving.set(false);
      },
      error: (err: unknown) => {
        console.error('Erro ao salvar matéria-prima', err);
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
    this.materialService.deleteMaterial(numericId).subscribe({
      next: () => {
        this.selectedMaterial.set(null);
        this.selectedRowId.set(null);
        this.loadDirectory();
      },
      error: (err: unknown) => {
        console.error('Erro ao excluir matéria-prima', err);
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
        this.selectedMaterial.set(null);
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar matérias-primas do CFG', err);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  private loadPriceTables(): void {
    this.tabelaPrecoService.getAllTabelasPreco().subscribe({
      next: (items) => this.priceTables.set(items),
      error: (err: unknown) => console.error('Erro ao carregar tabelas de preço', err)
    });
  }

  private fetchMaterialDetails(rowId: string): void {
    const numericId = Number(rowId);
    if (!Number.isFinite(numericId)) {
      return;
    }
    this.materialService.getMaterial(numericId).subscribe({
      next: (material) => this.selectedMaterial.set(material),
      error: (err: unknown) => console.error('Erro ao buscar matéria-prima selecionada', err)
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

  private mapToFormValue(material: MaterialViewModel): MaterialFormValue {
    return {
      name: material.nome ?? '',
      supplier: material.fornecedor ?? '',
      unit: material.unidade ?? '',
      stockQuantity: this.toDisplayString(material.estoqueAtual),
      minStock: this.toDisplayString(material.estoqueMinimo),
      priceTableId: material.tabelaPrecoId ?? null,
      description: material.descricao ?? '',
      status: material.status ?? MaterialStatus.Disponivel
    };
  }

  private mapToApiPayload(value: MaterialFormValue): MaterialInput {
    return {
      nome: value.name,
      fornecedor: value.supplier || null,
      unidade: value.unit,
      estoqueAtual: this.toNumber(value.stockQuantity, 0),
      estoqueMinimo: this.toNumber(value.minStock, 0),
      tabelaPrecoId: value.priceTableId,
      descricao: value.description || null,
      status: value.status
    };
  }

  private toDisplayString(value?: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }

  private toNumber(value: string | number, fallback: number): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : fallback;
    }
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
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
