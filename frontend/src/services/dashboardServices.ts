import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";
import type { Projeto } from "./projetoServices";

export interface Dashboard {
  /** RNF05: financiamentos com vigência terminando nos próximos 30 dias */
  vencimentosProximos30Dias: number;
  projetosEmAndamento: number;
  totalParticipantes: number;
  financiamentoTotal: number;
  producoesCientificas: number;
  projetosPorSituacao: { emAndamento: number; concluido: number; cancelado: number };
  financiamentoPorAgencia: { agencia: string; valor: number }[];
  projetosRecentes: Projeto[];
}

export const dashboardService = {
  obter: () => (USE_MOCK ? mockApi.dashboard() : apiFetch<Dashboard>("/dashboard")),
};
