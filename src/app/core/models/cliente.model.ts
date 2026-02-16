export enum TipoCliente {
  PessoaFisica = 0,
  PessoaJuridica = 1
}

export interface ClienteInput {
  tipoCliente: TipoCliente;
  nomeCompleto: string;
  documento: string;
  dataNascimento?: string | null;
  email?: string | null;
  telefone: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  aceitarMarketing: boolean;
}

export interface ClienteViewModel extends Omit<ClienteInput, 'tipoCliente' | 'nomeCompleto'> {
  tipoCliente: TipoCliente | string | null;
  nomeCompleto?: string | null;
  nome?: string | null;
  id: number;
  criadoEm: string;
  atualizadoEm: string;
}
