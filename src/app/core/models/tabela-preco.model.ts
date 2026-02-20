export enum TabelaPrecoStatus {
  Ativo = 0,
  Inativo = 1
}

export interface TabelaPrecoInput {
  nome: string;
  precoCusto: number;
  precoVenda: number;
  status: TabelaPrecoStatus;
  descricao?: string | null;
}

export interface TabelaPrecoViewModel extends TabelaPrecoInput {
  id: number;
  criadoEm: string;
  atualizadoEm: string;
}
