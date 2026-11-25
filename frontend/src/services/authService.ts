import type { Usuario } from "@/lib/session";
import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export interface LoginPayload {
  emailInstitucional: string;
  senha: string;
}

export interface UsuarioAutenticadoApi {
  cpf: string;
  nome: string;
  emailInstitucional: string;
  tipo: string;
  perfilAcesso: string;
}

export interface LoginResposta {
  token: string;
  usuario: Usuario;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResposta> => {
    if (USE_MOCK) {
      return mockApi.login(payload);
    }

    const dados = await apiFetch<UsuarioAutenticadoApi>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        emailInstitucional: payload.emailInstitucional,
        senha: payload.senha,
      }),
    });

    return {
      token: `sgpp-session:${dados.cpf}`,
      usuario: {
        cpf: dados.cpf,
        nome: dados.nome,
        perfil: dados.perfilAcesso,
        emailInstitucional: dados.emailInstitucional,
        tipo: dados.tipo,
      },
    };
  },
};
