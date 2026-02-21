export enum OrcamentoStatus {
  EmAberto = 0,
  Aprovado = 1,
  Rejeitado = 2,
  Expirado = 3
}

export interface OrcamentoCalculoInput {
  servicoId: number;
  produtoId?: number | null;
  pesoGramas?: number | null;
}

export interface OrcamentoCalculoResultado {
  valorMateriaPrima: number;
  valorServico: number;
  valorTotal: number;
}

export interface OrcamentoInput {
  numero: string;
  cliente: string;
  clienteId?: number | null;
  servicoId?: number | null;
  produtoId?: number | null;
  pesoGramas?: number | null;
  descricao?: string | null;
  dataEmissao: string;
  dataValidade?: string | null;
  valorTotal: number;
  status: OrcamentoStatus;
  observacoes?: string | null;
}

export interface OrcamentoViewModel extends OrcamentoInput {
  id: number;
  criadoEm: string;
  atualizadoEm: string;
}
