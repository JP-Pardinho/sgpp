import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export interface EquipeMembro {
  cpf: string;
  nome: string;
  tipo: string;
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
      ? mockApi.listarEquipe()
      : apiFetch<EquipeMembro[]>(`${base(codigo)}/participantes`),

  listarFinanciamentos: (codigo: string) =>
    USE_MOCK
      ? mockApi.listarFinanciamentos()
      : apiFetch<FinanciamentoVinculado[]>(`${base(codigo)}/financiamentos`),

  listarProducoes: (codigo: string) =>
    USE_MOCK
      ? mockApi.listarProducoes()
      : apiFetch<ProducaoVinculada[]>(`${base(codigo)}/producoes`),
};
