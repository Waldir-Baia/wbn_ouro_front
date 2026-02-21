import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClienteViewModel } from '../core/models/cliente.model';
import { CfgField } from '../core/models/cfg.model';
import { OrcamentoInput, OrcamentoStatus, OrcamentoViewModel } from '../core/models/orcamento.model';
import { PieceViewModel } from '../core/models/piece.model';
import { ServiceViewModel } from '../core/models/service.model';
import { ClienteService } from '../core/services/cliente.service';
import { OrcamentoDirectoryService } from '../core/services/orcamento-directory.service';
import { OrcamentoService } from '../core/services/orcamento.service';
import { PieceService } from '../core/services/piece.service';
import { ServiceService } from '../core/services/service.service';
import { OrcamentoFormComponent, OrcamentoFormValue } from '../orcamento-form/orcamento-form.component';

@Component({
  selector: 'app-orcamento-list',
  standalone: true,
  imports: [CommonModule, OrcamentoFormComponent],
  templateUrl: './orcamento-list.component.html',
  styleUrl: './orcamento-list.component.css'
})
export class OrcamentoListComponent {
  private readonly directory = inject(OrcamentoDirectoryService);
  private readonly orcamentoService = inject(OrcamentoService);
  private readonly clienteService = inject(ClienteService);
  private readonly serviceService = inject(ServiceService);
  private readonly pieceService = inject(PieceService);

  protected readonly gridColumns = signal<GridColumn[]>([]);
  protected readonly gridRows = signal<GridRow[]>([]);
  protected readonly clients = signal<ClienteViewModel[]>([]);
  protected readonly services = signal<ServiceViewModel[]>([]);
  protected readonly products = signal<PieceViewModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly selectedRowId = signal<string | null>(null);
  protected readonly selectedOrcamento = signal<OrcamentoViewModel | null>(null);
  protected readonly dialogMode = signal<'create' | 'edit'>('create');
  protected readonly dialogOpen = signal(false);
  protected readonly formInitialValue = signal<OrcamentoFormValue | null>(null);
  protected readonly saving = signal(false);

  constructor() {
    this.loadDirectory();
    this.loadClientOptions();
    this.loadServiceOptions();
    this.loadProductOptions();
  }

  protected get hasRowSelection(): boolean {
    return !!this.selectedRowId();
  }

  protected get canEdit(): boolean {
    return !!this.selectedOrcamento();
  }

  protected openDialog(mode: 'create' | 'edit'): void {
    if (mode === 'edit') {
      if (!this.selectedRowId() || !this.selectedOrcamento()) {
        return;
      }
      this.formInitialValue.set(this.mapToFormValue(this.selectedOrcamento()!));
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
    this.selectedOrcamento.set(null);
    this.fetchOrcamentoDetails(row.id);
  }

  protected handleFormSubmit(value: OrcamentoFormValue): void {
    const payload = this.mapToApiPayload(value);
    const mode = this.dialogMode();
    const selected = this.selectedOrcamento();
    this.saving.set(true);

    const request$: Observable<void> =
      mode === 'edit' && selected
        ? this.orcamentoService.updateOrcamento(selected.id, payload)
        : this.orcamentoService.createOrcamento(payload).pipe(map(() => void 0));

    request$.subscribe({
      next: () => {
        this.closeDialog();
        this.loadDirectory();
        this.saving.set(false);
      },
      error: (err: unknown) => {
        console.error('Erro ao salvar orçamento', err);
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
    this.orcamentoService.deleteOrcamento(numericId).subscribe({
      next: () => {
        this.selectedOrcamento.set(null);
        this.selectedRowId.set(null);
        this.loadDirectory();
      },
      error: (err: unknown) => {
        console.error('Erro ao excluir orçamento', err);
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
        this.selectedOrcamento.set(null);
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar orçamentos do CFG', err);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  private fetchOrcamentoDetails(rowId: string): void {
    const numericId = Number(rowId);
    if (!Number.isFinite(numericId)) {
      return;
    }
    this.orcamentoService.getOrcamento(numericId).subscribe({
      next: (orcamento) => this.selectedOrcamento.set(orcamento),
      error: (err: unknown) => console.error('Erro ao buscar orçamento selecionado', err)
    });
  }

  private loadClientOptions(): void {
    this.clienteService.getClientes().subscribe({
      next: (items) => this.clients.set(items),
      error: (err: unknown) => console.error('Erro ao carregar clientes para orçamento', err)
    });
  }

  private loadServiceOptions(): void {
    this.serviceService.getServices().subscribe({
      next: (items) => this.services.set(items),
      error: (err: unknown) => console.error('Erro ao carregar serviços para orçamento', err)
    });
  }

  private loadProductOptions(): void {
    this.pieceService.getProdutos().subscribe({
      next: (items) => this.products.set(items),
      error: (err: unknown) => console.error('Erro ao carregar produtos para orçamento', err)
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

  private mapToFormValue(orcamento: OrcamentoViewModel): OrcamentoFormValue {
    return {
      number: orcamento.numero ?? '',
      clientId: this.resolveClientId(orcamento),
      serviceId: orcamento.servicoId ?? null,
      productId: orcamento.produtoId ?? null,
      weightGrams: this.toDisplayString(orcamento.pesoGramas),
      issueDate: orcamento.dataEmissao ?? '',
      validUntil: orcamento.dataValidade ?? '',
      totalValue: this.toDisplayString(orcamento.valorTotal),
      status: orcamento.status ?? OrcamentoStatus.EmAberto,
      description: orcamento.descricao ?? '',
      notes: orcamento.observacoes ?? ''
    };
  }

  private mapToApiPayload(value: OrcamentoFormValue): OrcamentoInput {
    const selectedClientId = this.toNullableId(value.clientId);
    const selectedClient = this.clients().find((client) => client.id === selectedClientId);
    const selectedClientName = selectedClient?.nomeCompleto || selectedClient?.nome || '';

    return {
      numero: value.number,
      cliente: selectedClientName,
      clienteId: selectedClientId,
      servicoId: this.toNullableId(value.serviceId ?? null),
      produtoId: this.toNullableId(value.productId ?? null),
      pesoGramas: this.toNullableNumber(value.weightGrams),
      descricao: value.description || null,
      dataEmissao: value.issueDate,
      dataValidade: value.validUntil || null,
      valorTotal: this.toNumber(value.totalValue, 0),
      status: value.status,
      observacoes: value.notes || null
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

  private toNullableId(value: number | null): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
  }

  private toNullableNumber(value?: string | number | null): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = this.toNumber(value, NaN);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private resolveClientId(orcamento: OrcamentoViewModel): number | null {
    if (typeof orcamento.clienteId === 'number' && orcamento.clienteId > 0) {
      return orcamento.clienteId;
    }

    const nomeCliente = (orcamento.cliente ?? '').trim().toLowerCase();
    if (!nomeCliente) {
      return null;
    }

    const matchedClient = this.clients().find((client) => {
      const nomeCompleto = client.nomeCompleto?.trim().toLowerCase();
      const nome = client.nome?.trim().toLowerCase();
      return nomeCompleto === nomeCliente || nome === nomeCliente;
    });

    return matchedClient?.id ?? null;
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
