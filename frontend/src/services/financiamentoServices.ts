import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export const AGENCIAS_FINANCIADORAS = ["CNPq", "FAPES", "CAPES"] as const;
export type AgenciaFinanciadora = (typeof AGENCIAS_FINANCIADORAS)[number];

export const TIPOS_FOMENTO = [
  "Bolsa",
  "Auxílio",
  "Convênio",
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
  numeroProcesso?: string;
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

interface FinanciamentoApiDto {
  id_financiamento?: number;
  idFinanciamento?: number;
  agenciaFinanciadora: string;
  numeroProcesso?: string;
  tipoFomento: string;
  valorTotal: number;
  dataInicio: string;
  dataFim: string;
}

function normalizarFinanciamentoApi(raw: FinanciamentoApiDto): Financiamento {
  return {
    idFinanciamento: raw.id_financiamento ?? raw.idFinanciamento ?? 0,
    agenciaFinanciadora: raw.agenciaFinanciadora,
    numeroProcesso: raw.numeroProcesso ?? "",
    tipoFomento: raw.tipoFomento,
    valorTotal: Number(raw.valorTotal),
    dataInicio: raw.dataInicio ? raw.dataInicio.slice(0, 10) : "",
    dataFim: raw.dataFim ? raw.dataFim.slice(0, 10) : "",
  };
}

export const financiamentosService = {
  listar: async (agencia?: string, tipoFomento?: string): Promise<Financiamento[]> => {
    if (USE_MOCK) {
      const lista = await mockApi.listarCatalogoFinanciamentos();
      return lista.filter((f) => {
        if (agencia && f.agenciaFinanciadora !== agencia) return false;
        if (tipoFomento && f.tipoFomento !== tipoFomento) return false;
        return true;
      });
    }

    const params = new URLSearchParams();
    if (agencia) params.set("agencia", agencia);
    if (tipoFomento) params.set("tipoFomento", tipoFomento);
    const query = params.toString() ? `?${params.toString()}` : "";

    const dados = await apiFetch<FinanciamentoApiDto[]>(`/financiamentos${query}`);
    return dados.map(normalizarFinanciamentoApi);
  },

  buscarPorId: async (id: number): Promise<Financiamento> => {
    if (USE_MOCK) {
      return mockApi.buscarFinanciamento(id);
    }

    const dado = await apiFetch<FinanciamentoApiDto>(`/financiamentos/${id}`);
    return normalizarFinanciamentoApi(dado);
  },

  criar: async (dados: NovoFinanciamento): Promise<Financiamento> => {
    if (USE_MOCK) {
      return mockApi.criarFinanciamento(dados);
    }

    const criado = await apiFetch<FinanciamentoApiDto>("/financiamentos", {
      method: "POST",
      body: JSON.stringify({
        agenciaFinanciadora: dados.agenciaFinanciadora,
        tipoFomento: dados.tipoFomento,
        valorTotal: dados.valorTotal,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
      }),
    });
    return normalizarFinanciamentoApi(criado);
  },

  atualizar: async (id: number, dados: NovoFinanciamento): Promise<Financiamento> => {
    if (USE_MOCK) {
      return mockApi.atualizarFinanciamento(id, dados);
    }

    const atualizado = await apiFetch<FinanciamentoApiDto>(`/financiamentos/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        agenciaFinanciadora: dados.agenciaFinanciadora,
        tipoFomento: dados.tipoFomento,
        valorTotal: dados.valorTotal,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
      }),
    });
    return normalizarFinanciamentoApi(atualizado);
  },

  excluir: (id: number): Promise<void> =>
    USE_MOCK
      ? mockApi.excluirFinanciamento(id)
      : apiFetch<void>(`/financiamentos/${id}`, { method: "DELETE" }),

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
