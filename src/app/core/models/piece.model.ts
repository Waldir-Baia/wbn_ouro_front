export interface PieceInput {
  codigoInterno: string;
  nome: string;
  colecao?: string | null;
  categoria: string;
  tabelaPreco: string;
  pesoEstimadoGramas?: number | null;
  pedraPrincipal?: string | null;
  precoBase: number;
  valorMaoDeObra: number;
  prazoProducaoDias?: number | null;
  situacaoEstoque: StockStatus;
  observacoes?: string | null;
}

export interface PieceViewModel extends PieceInput {
  id: number;
  criadoEm: string;
  atualizadoEm: string;
}

export enum StockStatus {
  Disponivel = 0,
  SobDemanda = 1,
  Indisponivel = 2
}
