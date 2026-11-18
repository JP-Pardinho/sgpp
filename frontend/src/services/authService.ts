import type { Usuario } from "@/lib/session";
import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResposta {
  token: string;
  usuario: Usuario;
}

export const authService = {
  // AT01 - autenticação. Ajuste a rota/formato conforme o back-end definir.
  login: (payload: LoginPayload) =>
    USE_MOCK
      ? mockApi.login(payload)
      : apiFetch<LoginResposta>("/auth/login", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
};
