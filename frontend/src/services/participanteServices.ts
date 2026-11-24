import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export type TipoParticipante = "Docente" | "Discente" | "Técnico";
export const TIPOS_PARTICIPANTE: TipoParticipante[] = ["Docente", "Discente", "Técnico"];

export interface Participante {
  cpf: string;
  nome: string;
  email?: string;
  tipo: string; // Docente | Discente | Técnico ...
}

export interface NovoParticipante {
  nome: string;
  email: string;
  cpf: string;
  tipo: TipoParticipante;
}

async function listar(): Promise<Participante[]> {
  return USE_MOCK ? mockApi.listarParticipantes() : apiFetch<Participante[]>("/participantes");
}

export const participantesService = {
  listar,

  /** Usado no seletor de "Coordenador principal". */
  listarDocentes: async () =>
    (await listar()).filter((p) => p.tipo.toLowerCase() === "docente"),

  buscarPorCpf: (cpf: string): Promise<Participante> =>
    USE_MOCK
      ? mockApi.buscarParticipante(cpf)
      : apiFetch<Participante>(`/participantes/${encodeURIComponent(cpf)}`),

  criar: (participante: NovoParticipante): Promise<Participante> =>
    USE_MOCK
      ? mockApi.criarParticipante(participante)
      : apiFetch<Participante>("/participantes", {
          method: "POST",
          body: JSON.stringify(participante),
        }),

  excluir: (cpf: string): Promise<void> =>
    USE_MOCK
      ? mockApi.excluirParticipante(cpf)
      : apiFetch<void>(`/participantes/${encodeURIComponent(cpf)}`, { method: "DELETE" }),
};
