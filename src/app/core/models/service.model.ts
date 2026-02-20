export enum ServiceStatus {
  Ativo = 0,
  Inativo = 1
}

export interface ServiceInput {
  nome: string;
  descricao?: string | null;
  duracaoDias: number;
  precoBase: number;
  status: ServiceStatus;
}

export interface ServiceViewModel extends ServiceInput {
  id: number;
  criadoEm: string;
  atualizadoEm: string;
}
