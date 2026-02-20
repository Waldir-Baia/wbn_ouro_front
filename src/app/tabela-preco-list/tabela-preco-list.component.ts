import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CfgField } from '../core/models/cfg.model';
import { TabelaPrecoInput, TabelaPrecoStatus, TabelaPrecoViewModel } from '../core/models/tabela-preco.model';
import { TabelaPrecoDirectoryService } from '../core/services/tabela-preco-directory.service';
import { TabelaPrecoService } from '../core/services/tabela-preco.service';
import { TabelaPrecoFormComponent, TabelaPrecoFormValue } from '../tabela-preco-form/tabela-preco-form.component';

@Component({
  selector: 'app-tabela-preco-list',
  standalone: true,
  imports: [CommonModule, TabelaPrecoFormComponent],
  templateUrl: './tabela-preco-list.component.html',
  styleUrl: './tabela-preco-list.component.css'
})
export class TabelaPrecoListComponent {
  private readonly directory = inject(TabelaPrecoDirectoryService);
  private readonly tabelaPrecoService = inject(TabelaPrecoService);

  protected readonly gridColumns = signal<GridColumn[]>([]);
  protected readonly gridRows = signal<GridRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly selectedRowId = signal<string | null>(null);
  protected readonly selectedTabela = signal<TabelaPrecoViewModel | null>(null);
  protected readonly dialogMode = signal<'create' | 'edit'>('create');
  protected readonly dialogOpen = signal(false);
  protected readonly formInitialValue = signal<TabelaPrecoFormValue | null>(null);
  protected readonly saving = signal(false);

  constructor() {
    this.loadDirectory();
  }

  protected get hasRowSelection(): boolean {
    return !!this.selectedRowId();
  }

  protected get canEdit(): boolean {
    return !!this.selectedTabela();
  }

  protected openDialog(mode: 'create' | 'edit'): void {
    if (mode === 'edit') {
      if (!this.selectedRowId() || !this.selectedTabela()) {
        return;
      }
      this.formInitialValue.set(this.mapToFormValue(this.selectedTabela()!));
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
    this.selectedTabela.set(null);
    this.fetchTabelaDetails(row.id);
  }

  protected handleFormSubmit(value: TabelaPrecoFormValue): void {
    const payload = this.mapToApiPayload(value);
    const mode = this.dialogMode();
    const selected = this.selectedTabela();
    this.saving.set(true);

    const request$: Observable<void> =
      mode === 'edit' && selected
        ? this.tabelaPrecoService.updateTabelaPreco(selected.id, payload)
        : this.tabelaPrecoService.createTabelaPreco(payload).pipe(map(() => void 0));

    request$.subscribe({
      next: () => {
        this.closeDialog();
        this.loadDirectory();
        this.saving.set(false);
      },
      error: (err: unknown) => {
        console.error('Erro ao salvar tabela de preços', err);
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
    this.tabelaPrecoService.deleteTabelaPreco(numericId).subscribe({
      next: () => {
        this.selectedTabela.set(null);
        this.selectedRowId.set(null);
        this.loadDirectory();
      },
      error: (err: unknown) => {
        console.error('Erro ao excluir tabela de preços', err);
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
        this.selectedTabela.set(null);
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar tabelas de preços do CFG', err);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  private fetchTabelaDetails(rowId: string): void {
    const numericId = Number(rowId);
    if (!Number.isFinite(numericId)) {
      return;
    }
    this.tabelaPrecoService.getTabelaPreco(numericId).subscribe({
      next: (tabela) => this.selectedTabela.set(tabela),
      error: (err: unknown) => console.error('Erro ao buscar tabela selecionada', err)
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
      if (!key) {
        continue;
      }
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

  private mapToFormValue(tabela: TabelaPrecoViewModel): TabelaPrecoFormValue {
    return {
      name: tabela.nome ?? '',
      costPrice: this.toDisplayString(tabela.precoCusto),
      salePrice: this.toDisplayString(tabela.precoVenda),
      status: tabela.status ?? TabelaPrecoStatus.Ativo,
      description: tabela.descricao ?? ''
    };
  }

  private mapToApiPayload(value: TabelaPrecoFormValue): TabelaPrecoInput {
    return {
      nome: value.name,
      precoCusto: this.toNumber(value.costPrice, 0),
      precoVenda: this.toNumber(value.salePrice, 0),
      status: value.status,
      descricao: value.description || null
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
