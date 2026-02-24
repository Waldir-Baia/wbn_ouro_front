export enum OrcamentoStatus {
  EmAberto = 0,
  Aprovado = 1,
  Rejeitado = 2,
  Expirado = 3
}

export interface OrcamentoCalculoProdutoInput {
  produtoId: number;
  pesoGramas?: number | null;
  quantidade?: number | null;
}

export interface OrcamentoCalculoInput {
  servicoId: number;
  produtos: OrcamentoCalculoProdutoInput[];
}

export interface OrcamentoCalculoProdutoResultado {
  produtoId: number;
  produtoNome?: string | null;
  materiaPrimaId?: number | null;
  materiaPrimaNome?: string | null;
  custoUnitarioMateriaPrima?: number | null;
  pesoGramas?: number | null;
  quantidade?: number | null;
  valorItem?: number | null;
}

export interface OrcamentoCalculoResultado {
  valorMateriais: number;
  valorServico: number;
  valorTotal: number;
  produtos?: OrcamentoCalculoProdutoResultado[] | null;
}

export interface OrcamentoProdutoInput {
  produtoId: number;
  pesoGramas?: number | null;
  quantidade?: number | null;
  valorItem?: number | null;
  custoUnitarioMateriaPrima?: number | null;
}

export interface OrcamentoItemInput {
  pecaModeloId: number;
  pesoGramas?: number | null;
  quantidade?: number | null;
  valorUnitario?: number | null;
  valorTotalItem?: number | null;
  observacao?: string | null;
}

export interface OrcamentoInput {
  numero: string;
  clienteId?: number | null;
  servicoId?: number | null;
  descricao?: string | null;
  dataEmissao: string;
  dataValidade?: string | null;
  valorTotal: number;
  status: OrcamentoStatus;
  observacoes?: string | null;
  itens?: OrcamentoItemInput[] | null;

  // Backward compatibility with older endpoints/reads
  cliente?: string;
  produtoId?: number | null;
  produtoIds?: number[] | null;
  pesoGramas?: number | null;
  produtos?: OrcamentoProdutoInput[] | null;
}

export interface OrcamentoViewModel extends OrcamentoInput {
  id: number;
  criadoEm: string;
  atualizadoEm: string;
}
