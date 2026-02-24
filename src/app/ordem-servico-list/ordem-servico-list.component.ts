import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { OrdemServicoFormComponent, OrdemServicoFormValue } from '../ordem-servico-form/ordem-servico-form.component';

@Component({
  selector: 'app-ordem-servico-list',
  standalone: true,
  imports: [CommonModule, OrdemServicoFormComponent],
  templateUrl: './ordem-servico-list.component.html',
  styleUrl: './ordem-servico-list.component.css'
})
export class OrdemServicoListComponent {
  protected readonly indicadores = signal<IndicadorOs[]>([
    { label: 'Em aberto', value: 12 },
    { label: 'Em produção', value: 8 },
    { label: 'Prontas hoje', value: 3 },
    { label: 'Atrasadas', value: 2, critical: true }
  ]);

  protected readonly rows = signal<OsRow[]>([
    {
      numero: 'OS-2026-001',
      cliente: 'Ateliê Almeida',
      item: 'Aliança + Ajuste',
      responsavel: 'Bancada 1',
      prazo: '2026-02-28',
      status: 'Em produção'
    },
    {
      numero: 'OS-2026-002',
      cliente: 'Mariana Santos',
      item: 'Somente serviço de polimento',
      responsavel: 'Bancada 2',
      prazo: '2026-03-01',
      status: 'Em aberto'
    },
    {
      numero: 'OS-2026-003',
      cliente: 'João Pereira',
      item: 'Cordão + cravação',
      responsavel: 'Bancada 3',
      prazo: '2026-02-25',
      status: 'Atrasada'
    }
  ]);
  protected readonly dialogMode = signal<'create' | 'edit'>('create');
  protected readonly dialogOpen = signal(false);
  protected readonly formInitialValue = signal<OrdemServicoFormValue | null>(null);
  protected readonly saving = signal(false);

  protected openDialog(mode: 'create' | 'edit'): void {
    if (mode === 'edit') {
      return;
    }

    this.formInitialValue.set(null);
    this.dialogMode.set(mode);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
    this.formInitialValue.set(null);
  }

  protected handleFormSubmit(value: OrdemServicoFormValue): void {
    this.saving.set(true);

    const nextRow: OsRow = {
      numero: value.number,
      cliente: value.client,
      item: value.product ? `${value.product} + ${value.service}` : value.service,
      responsavel: value.bench,
      prazo: value.dueDate,
      status: value.status
    };

    this.rows.update((current) => [nextRow, ...current]);
    this.indicadores.update((current) =>
      current.map((item) => (item.label === 'Em aberto' ? { ...item, value: item.value + 1 } : item))
    );

    this.saving.set(false);
    this.closeDialog();
  }
}

interface IndicadorOs {
  label: string;
  value: number;
  critical?: boolean;
}

interface OsRow {
  numero: string;
  cliente: string;
  item: string;
  responsavel: string;
  prazo: string;
  status: string;
}
