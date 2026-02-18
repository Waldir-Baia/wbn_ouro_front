export enum MaterialStatus {
  Disponivel = 0,
  Indisponivel = 1
}

export interface MaterialInput {
  nome: string;
  categoria: string;
  fornecedor?: string | null;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  custoPorUnidade: number;
  leadTimeDias?: number | null;
  descricao?: string | null;
  status: MaterialStatus;
}

export interface MaterialViewModel extends MaterialInput {
  id: number;
  criadoEm: string;
  atualizadoEm: string;
}
