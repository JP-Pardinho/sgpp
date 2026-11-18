import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export type SituacaoProjeto = "Em andamento" | "Concluído" | "Cancelado";
export const SITUACOES: SituacaoProjeto[] = ["Em andamento", "Concluído", "Cancelado"];

export interface Projeto {
  codigo: string;
  titulo: string;
  descricao: string;
  situacao: string;
  dataInicio: string;
  dataFim?: string | null;
  /** CPF do coordenador principal (coluna coordenador_cpf do schema.sql) */
  coordenadorCpf?: string;
  coordenadorNome?: string;
}

export interface FiltrosProjeto {
  busca?: string;
  situacao?: string;
  coordenadorCpf?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface ResultadoPaginado<T> {
  itens: T[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Filtros e paginação feitos no cliente (o back-end ainda devolve a lista inteira). */
function aplicarFiltros(projetos: Projeto[], filtros: FiltrosProjeto): ResultadoPaginado<Projeto> {
  const { busca = "", situacao = "", coordenadorCpf = "", pagina = 1, tamanhoPagina = 8 } = filtros;
  const termo = normalizar(busca.trim());

  const filtrados = projetos.filter((p) => {
    if (termo && !normalizar(`${p.codigo} ${p.titulo}`).includes(termo)) return false;
    if (situacao && p.situacao !== situacao) return false;
    if (coordenadorCpf && p.coordenadorCpf !== coordenadorCpf) return false;
    return true;
  });

  const inicio = (pagina - 1) * tamanhoPagina;
  return {
    itens: filtrados.slice(inicio, inicio + tamanhoPagina),
    total: filtrados.length,
    pagina,
    tamanhoPagina,
  };
}

async function listar(): Promise<Projeto[]> {
  return USE_MOCK ? mockApi.listarProjetos() : apiFetch<Projeto[]>("/projetos");
}

export const projetosService = {
  listar,

  listarComFiltros: async (filtros: FiltrosProjeto = {}) =>
    aplicarFiltros(await listar(), filtros),

  buscarPorCodigo: (codigo: string) =>
    USE_MOCK
      ? mockApi.buscarProjeto(codigo)
      : apiFetch<Projeto>(`/projetos/${encodeURIComponent(codigo)}`),

  criar: (projeto: Projeto) =>
    USE_MOCK
      ? mockApi.criarProjeto(projeto)
      : apiFetch<Projeto>("/projetos", {
          method: "POST",
          body: JSON.stringify(projeto),
        }),

  atualizar: (codigo: string, projeto: Projeto) =>
    USE_MOCK
      ? mockApi.atualizarProjeto(codigo, projeto)
      : apiFetch<Projeto>(`/projetos/${encodeURIComponent(codigo)}`, {
          method: "PUT",
          body: JSON.stringify(projeto),
        }),

  excluir: (codigo: string) =>
    USE_MOCK
      ? mockApi.excluirProjeto(codigo)
      : apiFetch<void>(`/projetos/${encodeURIComponent(codigo)}`, { method: "DELETE" }),
};
