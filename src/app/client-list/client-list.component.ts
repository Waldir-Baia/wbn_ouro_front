import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientFormComponent, ClientFormValue } from '../client-form/client-form.component';
import { CfgField } from '../core/models/cfg.model';
import { ClienteInput, ClienteViewModel, TipoCliente } from '../core/models/cliente.model';
import { ClientDirectoryService } from '../core/services/client-directory.service';
import { ClienteService } from '../core/services/cliente.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, ClientFormComponent],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent {
  private readonly clienteService = inject(ClienteService);
  private readonly clientDirectory = inject(ClientDirectoryService);

  protected readonly gridColumns = signal<GridColumn[]>([]);
  protected readonly gridRows = signal<GridRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly selectedRowId = signal<string | null>(null);
  protected readonly selectedCliente = signal<ClienteViewModel | null>(null);
  protected readonly dialogMode = signal<'create' | 'edit'>('create');
  protected readonly dialogOpen = signal(false);
  protected readonly formInitialValue = signal<ClientFormValue | null>(null);
  protected readonly saving = signal(false);

  constructor() {
    this.loadDirectory();
  }

  protected get hasRowSelection(): boolean {
    return !!this.selectedRowId();
  }

  protected get canEdit(): boolean {
    return !!this.selectedCliente();
  }

  protected openDialog(mode: 'create' | 'edit'): void {
    if (mode === 'edit') {
      if (!this.selectedRowId() || !this.selectedCliente()) {
        return;
      }
      this.formInitialValue.set(this.mapToFormValue(this.selectedCliente()!));
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
    this.selectedCliente.set(null);
    this.fetchClienteDetails(row.id);
  }

  protected handleFormSubmit(value: ClientFormValue): void {
    const payload = this.mapToApiPayload(value);
    const mode = this.dialogMode();
    const selected = this.selectedCliente();
    this.saving.set(true);

    const request$: Observable<void> =
      mode === 'edit' && selected
        ? this.clienteService.updateCliente(selected.id!, payload)
        : this.clienteService.createCliente(payload).pipe(map(() => void 0));

    request$.subscribe({
      next: () => {
        this.closeDialog();
        this.loadDirectory();
        this.saving.set(false);
      },
      error: (err: unknown) => {
        console.error('Erro ao salvar cliente', err);
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
    this.clienteService.deleteCliente(numericId).subscribe({
      next: () => {
        this.selectedCliente.set(null);
        this.selectedRowId.set(null);
        this.loadDirectory();
      },
      error: (err: unknown) => {
        console.error('Erro ao excluir cliente', err);
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
    this.clientDirectory.load(page).subscribe({
      next: (result) => {
        this.gridColumns.set(this.mapColumns(result.fields));
        this.gridRows.set(this.mapRows(result.data, result.primaryKey));
        this.selectedCliente.set(null);
        this.selectedRowId.set(null);
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar dados do CFG', err);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  private fetchClienteDetails(rowId: string): void {
    const numericId = Number(rowId);
    if (!Number.isFinite(numericId)) {
      return;
    }
    this.clienteService.getCliente(numericId).subscribe({
      next: (cliente) => this.selectedCliente.set(cliente),
      error: (err: unknown) => console.error('Erro ao buscar cliente selecionado', err)
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

  private resolveRowId(
    item: Record<string, unknown>,
    keys: string[],
    fallbackIndex: number
  ): string {
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

  private mapToFormValue(cliente: ClienteViewModel): ClientFormValue {
    return {
      clientType: this.parseTipoCliente(cliente.tipoCliente),
      fullName: cliente.nomeCompleto ?? cliente.nome ?? '',
      document: cliente.documento ?? '',
      birthDate: cliente.dataNascimento ?? '',
      email: cliente.email ?? '',
      phone: cliente.telefone ?? '',
      address: {
        street: cliente.logradouro ?? '',
        number: cliente.numero ?? '',
        complement: cliente.complemento ?? '',
        district: cliente.bairro ?? '',
        city: cliente.cidade ?? '',
        state: cliente.estado ?? '',
        zip: cliente.cep ?? ''
      },
      marketingOptIn: cliente.aceitarMarketing ?? true
    };
  }

  private mapToApiPayload(value: ClientFormValue): ClienteInput {
    return {
      tipoCliente: value.clientType,
      nomeCompleto: value.fullName,
      documento: value.document,
      dataNascimento: value.birthDate || null,
      email: value.email || null,
      telefone: value.phone,
      logradouro: value.address.street,
      numero: value.address.number,
      complemento: value.address.complement || null,
      bairro: value.address.district,
      cidade: value.address.city,
      estado: value.address.state.trim().substring(0, 2).toUpperCase(),
      cep: value.address.zip,
      aceitarMarketing: value.marketingOptIn
    };
  }

  private parseTipoCliente(tipo: TipoCliente | string | null | undefined): TipoCliente {
    if (typeof tipo === 'number') {
      return tipo === TipoCliente.PessoaJuridica ? TipoCliente.PessoaJuridica : TipoCliente.PessoaFisica;
    }
    if (typeof tipo === 'string') {
      return tipo.toLowerCase() === '1' || tipo.toLowerCase() === 'pj'
        ? TipoCliente.PessoaJuridica
        : TipoCliente.PessoaFisica;
    }
    return TipoCliente.PessoaFisica;
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
