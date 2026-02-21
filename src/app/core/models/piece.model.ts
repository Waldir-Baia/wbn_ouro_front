export interface PieceInput {
  codigoInterno: string;
  nome: string;
  categoriaId: number;
  tabelaPrecoId: number;
  materiaPrimaId: number;
  pedraPrincipal?: string | null;
  prazoProducaoDias?: number | null;
  situacaoEstoque: StockStatus;
  observacoes?: string | null;
}

export interface PieceViewModel extends PieceInput {
  id: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

export enum StockStatus {
  Disponivel = 0,
  SobDemanda = 1,
  Indisponivel = 2
}
