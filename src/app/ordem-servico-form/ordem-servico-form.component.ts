import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export enum OrdemServicoPrioridade {
  Baixa = 'baixa',
  Normal = 'normal',
  Alta = 'alta',
  Urgente = 'urgente'
}

export enum OrdemServicoStatus {
  EmAberto = 'Em aberto',
  EmProducao = 'Em producao',
  AguardandoPeca = 'Aguardando peca',
  Finalizada = 'Finalizada'
}

@Component({
  selector: 'app-ordem-servico-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ordem-servico-form.component.html',
  styleUrl: './ordem-servico-form.component.css'
})
export class OrdemServicoFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  protected readonly prioridadeEnum = OrdemServicoPrioridade;
  protected readonly statusEnum = OrdemServicoStatus;

  protected readonly form = this.fb.group({
    number: ['', Validators.required],
    client: ['', [Validators.required, Validators.minLength(3)]],
    budgetNumber: [''],
    service: ['', [Validators.required, Validators.minLength(3)]],
    product: [''],
    bench: ['', Validators.required],
    entryDate: ['', Validators.required],
    dueDate: ['', Validators.required],
    priority: [OrdemServicoPrioridade.Normal, Validators.required],
    status: [OrdemServicoStatus.EmAberto, Validators.required],
    details: [''],
    notes: ['']
  });

  @Input() initialValue: OrdemServicoFormValue | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() loading = false;
  @Output() saved = new EventEmitter<OrdemServicoFormValue>();
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

    this.saved.emit(this.form.getRawValue() as OrdemServicoFormValue);
  }

  protected handleCancel(): void {
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.form.reset({
      number: '',
      client: '',
      budgetNumber: '',
      service: '',
      product: '',
      bench: '',
      entryDate: '',
      dueDate: '',
      priority: OrdemServicoPrioridade.Normal,
      status: OrdemServicoStatus.EmAberto,
      details: '',
      notes: ''
    });
  }
}

export interface OrdemServicoFormValue {
  number: string;
  client: string;
  budgetNumber?: string | null;
  service: string;
  product?: string | null;
  bench: string;
  entryDate: string;
  dueDate: string;
  priority: OrdemServicoPrioridade;
  status: OrdemServicoStatus;
  details?: string | null;
  notes?: string | null;
}
