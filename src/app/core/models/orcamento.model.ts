export enum OrcamentoStatus {
  EmAberto = 0,
  Aprovado = 1,
  Rejeitado = 2,
  Expirado = 3
}

export interface OrcamentoInput {
  numero: string;
  cliente: string;
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
