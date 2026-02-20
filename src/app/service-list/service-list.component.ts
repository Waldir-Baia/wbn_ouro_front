import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CfgField } from '../core/models/cfg.model';
import { ServiceInput, ServiceStatus, ServiceViewModel } from '../core/models/service.model';
import { ServiceDirectoryService } from '../core/services/service-directory.service';
import { ServiceService } from '../core/services/service.service';
import { ServiceFormComponent, ServiceFormValue } from '../service-form/service-form.component';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, ServiceFormComponent],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.css'
})
export class ServiceListComponent {
  private readonly directory = inject(ServiceDirectoryService);
  private readonly serviceApi = inject(ServiceService);

  protected readonly gridColumns = signal<GridColumn[]>([]);
  protected readonly gridRows = signal<GridRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly selectedRowId = signal<string | null>(null);
  protected readonly selectedService = signal<ServiceViewModel | null>(null);
  protected readonly dialogMode = signal<'create' | 'edit'>('create');
  protected readonly dialogOpen = signal(false);
  protected readonly formInitialValue = signal<ServiceFormValue | null>(null);
  protected readonly saving = signal(false);

  constructor() {
    this.loadDirectory();
  }

  protected get hasRowSelection(): boolean {
    return !!this.selectedRowId();
  }

  protected get canEdit(): boolean {
    return !!this.selectedService();
  }

  protected openDialog(mode: 'create' | 'edit'): void {
    if (mode === 'edit') {
      if (!this.selectedRowId() || !this.selectedService()) {
        return;
      }
      this.formInitialValue.set(this.mapToFormValue(this.selectedService()!));
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
    this.selectedService.set(null);
    this.fetchServiceDetails(row.id);
  }

  protected handleFormSubmit(value: ServiceFormValue): void {
    const payload = this.mapToApiPayload(value);
    const mode = this.dialogMode();
    const selected = this.selectedService();
    this.saving.set(true);

    const request$: Observable<void> =
      mode === 'edit' && selected
        ? this.serviceApi.updateService(selected.id, payload)
        : this.serviceApi.createService(payload).pipe(map(() => void 0));

    request$.subscribe({
      next: () => {
        this.closeDialog();
        this.loadDirectory();
        this.saving.set(false);
      },
      error: (err: unknown) => {
        console.error('Erro ao salvar serviço', err);
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
    this.serviceApi.deleteService(numericId).subscribe({
      next: () => {
        this.selectedService.set(null);
        this.selectedRowId.set(null);
        this.loadDirectory();
      },
      error: (err: unknown) => {
        console.error('Erro ao excluir serviço', err);
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
        this.selectedService.set(null);
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar serviços do CFG', err);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  private fetchServiceDetails(rowId: string): void {
    const numericId = Number(rowId);
    if (!Number.isFinite(numericId)) {
      return;
    }
    this.serviceApi.getService(numericId).subscribe({
      next: (service) => this.selectedService.set(service),
      error: (err: unknown) => console.error('Erro ao buscar serviço selecionado', err)
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

  private mapToFormValue(service: ServiceViewModel): ServiceFormValue {
    return {
      name: service.nome ?? '',
      description: service.descricao ?? '',
      duration: String(service.duracaoDias ?? ''),
      basePrice: service.precoBase != null ? String(service.precoBase) : '',
      status: service.status ?? ServiceStatus.Ativo
    };
  }

  private mapToApiPayload(value: ServiceFormValue): ServiceInput {
    return {
      nome: value.name,
      descricao: value.description || null,
      duracaoDias: this.toNumber(value.duration, 1),
      precoBase: this.toNumber(value.basePrice, 0),
      status: value.status
    };
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
