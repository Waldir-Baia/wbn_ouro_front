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
  tabelaPreco: string;
  descricao?: string | null;
  status: MaterialStatus;
}

export interface MaterialViewModel extends MaterialInput {
  id: number;
  criadoEm: string;
  atualizadoEm: string;
}
