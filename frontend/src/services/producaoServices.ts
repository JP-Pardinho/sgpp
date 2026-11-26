import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export const TIPOS_PRODUCAO = [
  "Artigo",
  "Capítulo de livro",
  "Software",
  "Relatório técnico",
] as const;
export type TipoProducao = (typeof TIPOS_PRODUCAO)[number];

export const MEIOS_DIVULGACAO = ["Revista", "Congresso", "Repositório"] as const;
export type MeioDivulgacao = (typeof MEIOS_DIVULGACAO)[number];

export interface AutorProducao {
  cpf: string;
  nome: string;
  tipo: string;
}

export interface ProducaoCientifica {
  id: number;
  titulo: string;
  tipo: string;
  ano: number;
  meioDivulgacao: string;
  projetoCodigo?: string | null;
  projetoTitulo?: string | null;
  autores: AutorProducao[];
}

export interface NovaProducao {
  titulo: string;
  tipo: string;
  ano: number;
  meioDivulgacao: string;
  projetoCodigo?: string | null;
}

export interface VincularProducaoPayload {
  producaoId: number;
  projetoCodigo: string;
  autoresCpfs: string[];
}

export interface FiltrosProducao {
  tipoProducao?: string;
  anoPublicacao?: number;
  projeto_codigo?: string;
}

interface ProducaoApiDto {
  id_producao?: number;
  id?: number;
  projeto_codigo?: string | null;
  projetoCodigo?: string | null;
  projetoTitulo?: string | null;
  titulo: string;
  tipoProducao?: string;
  tipo?: string;
  anoPublicacao?: number;
  ano?: number;
  meioDivulgacao: string;
  autores?: AutorProducao[];
}

function normalizarProducaoApi(raw: ProducaoApiDto): ProducaoCientifica {
  return {
    id: raw.id_producao ?? raw.id ?? 0,
    titulo: raw.titulo,
    tipo: raw.tipoProducao ?? raw.tipo ?? "",
    ano: raw.anoPublicacao ?? raw.ano ?? 0,
    meioDivulgacao: raw.meioDivulgacao,
    projetoCodigo: raw.projeto_codigo ?? raw.projetoCodigo ?? null,
    projetoTitulo: raw.projetoTitulo ?? null,
    autores: Array.isArray(raw.autores) ? raw.autores : [],
  };
}

export const producoesService = {
  listar: async (filtros?: FiltrosProducao): Promise<ProducaoCientifica[]> => {
    if (USE_MOCK) {
      const lista = await mockApi.listarCatalogoProducoes();
      if (!filtros) return lista;
      return lista.filter((p) => {
        if (filtros.tipoProducao && p.tipo !== filtros.tipoProducao) return false;
        if (filtros.anoPublicacao && p.ano !== filtros.anoPublicacao) return false;
        if (filtros.projeto_codigo && p.projetoCodigo !== filtros.projeto_codigo) return false;
        return true;
      });
    }

    const params = new URLSearchParams();
    if (filtros?.tipoProducao) params.set("tipoProducao", filtros.tipoProducao);
    if (filtros?.anoPublicacao) params.set("anoPublicacao", String(filtros.anoPublicacao));
    if (filtros?.projeto_codigo) params.set("projeto_codigo", filtros.projeto_codigo);
    const query = params.toString() ? `?${params.toString()}` : "";

    const dados = await apiFetch<ProducaoApiDto[]>(`/producoes${query}`);
    return dados.map(normalizarProducaoApi);
  },

  buscarPorId: async (id: number): Promise<ProducaoCientifica> => {
    if (USE_MOCK) {
      return mockApi.buscarProducao(id);
    }

    const dado = await apiFetch<ProducaoApiDto>(`/producoes/${id}`);
    return normalizarProducaoApi(dado);
  },

  criar: async (dados: NovaProducao): Promise<ProducaoCientifica> => {
    if (USE_MOCK) {
      return mockApi.criarProducao(dados);
    }

    const criada = await apiFetch<ProducaoApiDto>("/producoes", {
      method: "POST",
      body: JSON.stringify({
        projeto_codigo: dados.projetoCodigo ?? null,
        titulo: dados.titulo,
        tipoProducao: dados.tipo,
        anoPublicacao: dados.ano,
        meioDivulgacao: dados.meioDivulgacao,
      }),
    });
    return normalizarProducaoApi(criada);
  },

  atualizar: async (id: number, dados: NovaProducao): Promise<ProducaoCientifica> => {
    if (USE_MOCK) {
      return mockApi.atualizarProducao(id, dados);
    }

    const atualizada = await apiFetch<ProducaoApiDto>(`/producoes/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        projeto_codigo: dados.projetoCodigo ?? null,
        titulo: dados.titulo,
        tipoProducao: dados.tipo,
        anoPublicacao: dados.ano,
        meioDivulgacao: dados.meioDivulgacao,
      }),
    });
    return normalizarProducaoApi(atualizada);
  },

  vincular: async (payload: VincularProducaoPayload): Promise<ProducaoCientifica> => {
    if (USE_MOCK) {
      return mockApi.vincularProducao(payload);
    }

    const atualizada = await apiFetch<ProducaoApiDto>(`/producoes/${payload.producaoId}/vincular`, {
      method: "POST",
      body: JSON.stringify({
        projetoCodigo: payload.projetoCodigo,
        autoresCpfs: payload.autoresCpfs,
      }),
    });
    return normalizarProducaoApi(atualizada);
  },

  listarAutores: async (id: number): Promise<AutorProducao[]> => {
    if (USE_MOCK) {
      const prod = await mockApi.buscarProducao(id);
      return prod.autores;
    }

    return apiFetch<AutorProducao[]>(`/producoes/${id}/autores`);
  },

  removerAutor: (id: number, cpf: string): Promise<void> =>
    USE_MOCK
      ? Promise.resolve()
      : apiFetch<void>(`/producoes/${id}/autores/${encodeURIComponent(cpf)}`, {
          method: "DELETE",
        }),

  excluir: (id: number): Promise<void> =>
    USE_MOCK
      ? mockApi.excluirProducao(id)
      : apiFetch<void>(`/producoes/${id}`, { method: "DELETE" }),
};
