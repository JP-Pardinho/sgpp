import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export const FUNCOES_EQUIPE = [
  "Coordenador",
  "Bolsista",
  "Colaborador",
  "Apoio Técnico",
] as const;

export type FuncaoEquipe = (typeof FUNCOES_EQUIPE)[number];

export interface EquipeMembro {
  cpf: string;
  nome: string;
  tipo: string;
  funcao: string;
  dataEntrada: string;
  dataSaida?: string | null;
}

export interface VincularParticipantePayload {
  participanteCpf: string;
  funcao: string;
  dataEntrada: string;
  dataSaida?: string | null;
}

export interface FinanciamentoVinculado {
  idFinanciamento: number;
  agencia: string;
  tipoFomento: string;
  tipoVinculo: string; // Total | Parcial
  dataInicio: string;
  dataFim: string;
  valor: number;
}

export interface ProducaoVinculada {
  id: number;
  titulo: string;
  tipo: string;
  ano: number;
  meioDivulgacao: string;
}

const base = (codigo: string) => `/projetos/${encodeURIComponent(codigo)}`;

export const vinculosService = {
  listarEquipe: (codigo: string) =>
    USE_MOCK
      ? mockApi.listarEquipe(codigo)
      : apiFetch<EquipeMembro[]>(`${base(codigo)}/participantes`),

  vincularParticipante: (codigo: string, payload: VincularParticipantePayload) =>
    USE_MOCK
      ? mockApi.vincularParticipante(codigo, payload)
      : apiFetch<EquipeMembro>(`${base(codigo)}/participantes`, {
          method: "POST",
          body: JSON.stringify(payload),
        }),

  removerParticipante: (codigo: string, cpf: string) =>
    USE_MOCK
      ? mockApi.removerParticipante(codigo, cpf)
      : apiFetch<void>(`${base(codigo)}/participantes/${encodeURIComponent(cpf)}`, {
          method: "DELETE",
        }),

  listarFinanciamentos: (codigo: string) =>
    USE_MOCK
      ? mockApi.listarFinanciamentos(codigo)
      : apiFetch<FinanciamentoVinculado[]>(`${base(codigo)}/financiamentos`),

  listarProducoes: (codigo: string) =>
    USE_MOCK
      ? mockApi.listarProducoes()
      : apiFetch<ProducaoVinculada[]>(`${base(codigo)}/producoes`),
};
