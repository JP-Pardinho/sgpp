import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export interface Participante {
  cpf: string;
  nome: string;
  email?: string;
  tipo: string; // Docente | Discente | Técnico ...
}

async function listar(): Promise<Participante[]> {
  return USE_MOCK ? mockApi.listarParticipantes() : apiFetch<Participante[]>("/participantes");
}

export const participantesService = {
  listar,
  /** Usado no seletor de "Coordenador principal". */
  listarDocentes: async () =>
    (await listar()).filter((p) => p.tipo.toLowerCase() === "docente"),
};
