import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export type TipoParticipante = "Docente" | "Discente" | "Técnico";
export const TIPOS_PARTICIPANTE: TipoParticipante[] = ["Docente", "Discente", "Técnico"];

export type PerfilAcesso = "Administrador" | "Coordenador" | "Participante";
export const PERFIS_ACESSO: PerfilAcesso[] = ["Participante", "Coordenador", "Administrador"];

export interface Participante {
  cpf: string;
  nome: string;
  emailInstitucional: string;
  tipo: string; // Docente | Discente | Técnico
  perfilAcesso?: string;
}

export interface NovoParticipante {
  nome: string;
  emailInstitucional: string;
  cpf: string;
  tipo: TipoParticipante;
  perfilAcesso?: PerfilAcesso;
  senha: string;
  senhaHash?: string;
}

export interface AtualizarParticipante {
  nome: string;
  emailInstitucional: string;
  tipo: TipoParticipante;
  perfilAcesso?: PerfilAcesso;
}

async function listar(tipo?: string): Promise<Participante[]> {
  if (USE_MOCK) {
    return mockApi.listarParticipantes(tipo);
  }
  const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
  return apiFetch<Participante[]>(`/participantes${query}`);
}

export const participantesService = {
  listar,

  /** Usado no seletor de "Coordenador principal". */
  listarDocentes: (): Promise<Participante[]> => listar("Docente"),

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

  atualizar: (cpf: string, participante: AtualizarParticipante): Promise<Participante> =>
    USE_MOCK
      ? mockApi.atualizarParticipante(cpf, participante)
      : apiFetch<Participante>(`/participantes/${encodeURIComponent(cpf)}`, {
          method: "PUT",
          body: JSON.stringify(participante),
        }),

  excluir: (cpf: string): Promise<void> =>
    USE_MOCK
      ? mockApi.excluirParticipante(cpf)
      : apiFetch<void>(`/participantes/${encodeURIComponent(cpf)}`, { method: "DELETE" }),
};
