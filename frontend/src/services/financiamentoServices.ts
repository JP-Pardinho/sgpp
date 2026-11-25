import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export const AGENCIAS_FINANCIADORAS = ["CNPq", "FAPES", "CAPES"] as const;
export type AgenciaFinanciadora = (typeof AGENCIAS_FINANCIADORAS)[number];

export const TIPOS_FOMENTO = [
  "Bolsa",
  "Auxílio Pesquisa",
  "Apoio Financeiro",
  "Infraestrutura",
  "Equipamentos",
] as const;
export type TipoFomento = (typeof TIPOS_FOMENTO)[number];

export const TIPOS_VINCULO = ["Total", "Parcial"] as const;
export type TipoVinculoFinanciamento = (typeof TIPOS_VINCULO)[number];

export interface Financiamento {
  idFinanciamento: number;
  agenciaFinanciadora: string;
  numeroProcesso: string;
  tipoFomento: string;
  valorTotal: number;
  dataInicio: string;
  dataFim: string;
}

export type NovoFinanciamento = Omit<Financiamento, "idFinanciamento">;

export interface ApoioFinanceiro {
  idFinanciamento: number;
  projetoCodigo: string;
  projetoTitulo?: string;
  tipoVinculo: TipoVinculoFinanciamento;
  valorDestinado: number;
}

export interface VincularFinanciamentoPayload {
  idFinanciamento: number;
  projetoCodigo: string;
  tipoVinculo: TipoVinculoFinanciamento;
  valorDestinado: number;
}

export const financiamentosService = {
  listar: (): Promise<Financiamento[]> =>
    USE_MOCK ? mockApi.listarCatalogoFinanciamentos() : apiFetch<Financiamento[]>("/financiamentos"),

  buscarPorId: (id: number): Promise<Financiamento> =>
    USE_MOCK
      ? mockApi.buscarFinanciamento(id)
      : apiFetch<Financiamento>(`/financiamentos/${id}`),

  criar: (dados: NovoFinanciamento): Promise<Financiamento> =>
    USE_MOCK
      ? mockApi.criarFinanciamento(dados)
      : apiFetch<Financiamento>("/financiamentos", {
          method: "POST",
          body: JSON.stringify(dados),
        }),

  listarApoiosPorFinanciamento: (idFinanciamento: number): Promise<ApoioFinanceiro[]> =>
    USE_MOCK
      ? mockApi.listarApoiosPorFinanciamento(idFinanciamento)
      : apiFetch<ApoioFinanceiro[]>(`/financiamentos/${idFinanciamento}/projetos`),

  listarTodosApoios: (): Promise<ApoioFinanceiro[]> =>
    USE_MOCK
      ? mockApi.listarTodosApoios()
      : apiFetch<ApoioFinanceiro[]>("/financiamentos/apoios"),

  vincularProjeto: (payload: VincularFinanciamentoPayload): Promise<ApoioFinanceiro> =>
    USE_MOCK
      ? mockApi.vincularFinanciamentoProjeto(payload)
      : apiFetch<ApoioFinanceiro>(
          `/projetos/${encodeURIComponent(payload.projetoCodigo)}/financiamentos`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        ),

  removerVinculo: (idFinanciamento: number, projetoCodigo: string): Promise<void> =>
    USE_MOCK
      ? mockApi.removerVinculoFinanciamento(idFinanciamento, projetoCodigo)
      : apiFetch<void>(
          `/projetos/${encodeURIComponent(projetoCodigo)}/financiamentos/${idFinanciamento}`,
          { method: "DELETE" },
        ),
};
