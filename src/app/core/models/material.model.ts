export enum MaterialStatus {
  Disponivel = 0,
  Indisponivel = 1
}

export interface MaterialInput {
  nome: string;
  fornecedor?: string | null;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  tabelaPrecoId?: number | null;
  descricao?: string | null;
  status: MaterialStatus;
}

export interface MaterialViewModel extends MaterialInput {
  id: number;
  categoria?: string | null;
  custoPorUnidade?: number | null;
  leadTimeDias?: number | null;
  criadoEm: string;
  atualizadoEm: string;
}
