import { apiFetch } from "./api";

export interface Projeto {
  codigo: string;
  titulo: string;
  descricao: string;
  situacao: string;
  dataInicio: string;
  dataFim?: string | null;
}

export const projetosService = {
  listar: () => apiFetch<Projeto[]>("/projetos"),
  criar: (projeto: Projeto) =>
    apiFetch<Projeto>("/projetos", {
      method: "POST",
      body: JSON.stringify(projeto),
    }),
};