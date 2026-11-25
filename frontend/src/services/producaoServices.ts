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
}

export interface VincularProducaoPayload {
  producaoId: number;
  projetoCodigo: string;
  autoresCpfs: string[];
}

export const producoesService = {
  listar: (): Promise<ProducaoCientifica[]> =>
    USE_MOCK
      ? mockApi.listarCatalogoProducoes()
      : apiFetch<ProducaoCientifica[]>("/producoes"),

  buscarPorId: (id: number): Promise<ProducaoCientifica> =>
    USE_MOCK
      ? mockApi.buscarProducao(id)
      : apiFetch<ProducaoCientifica>(`/producoes/${id}`),

  criar: (dados: NovaProducao): Promise<ProducaoCientifica> =>
    USE_MOCK
      ? mockApi.criarProducao(dados)
      : apiFetch<ProducaoCientifica>("/producoes", {
          method: "POST",
          body: JSON.stringify(dados),
        }),

  vincular: (payload: VincularProducaoPayload): Promise<ProducaoCientifica> =>
    USE_MOCK
      ? mockApi.vincularProducao(payload)
      : apiFetch<ProducaoCientifica>(`/producoes/${payload.producaoId}/vinculo`, {
          method: "PUT",
          body: JSON.stringify({
            projetoCodigo: payload.projetoCodigo,
            autoresCpfs: payload.autoresCpfs,
          }),
        }),

  excluir: (id: number): Promise<void> =>
    USE_MOCK
      ? mockApi.excluirProducao(id)
      : apiFetch<void>(`/producoes/${id}`, { method: "DELETE" }),
};
