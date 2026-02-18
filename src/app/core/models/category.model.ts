export enum CategoryStatus {
  Ativo = 0,
  Inativo = 1
}

export interface CategoryInput {
  nome: string;
  tipo: string;
  descricao?: string | null;
  status: CategoryStatus;
}

export interface CategoryViewModel extends CategoryInput {
  id: number;
  criadoEm: string;
  atualizadoEm: string;
}
