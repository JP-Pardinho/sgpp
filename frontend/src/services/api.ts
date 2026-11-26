import { lerToken, limparSessao } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/** Quando true, os services usam dados de exemplo (services/mock.ts) em vez da API. */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = lerToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // Sessão expirada: limpa e volta para o login (exceto na própria tentativa de login)
    if (response.status === 401 && !endpoint.startsWith("/auth/login")) {
      limparSessao();
      window.location.href = "/login";
    }

    let mensagem = `Erro na requisição (${response.status}): ${response.statusText}`;
    try {
      const corpo = (await response.json()) as { mensagem?: string; message?: string; title?: string };
      mensagem = corpo.mensagem ?? corpo.message ?? corpo.title ?? mensagem;
    } catch {
      // mantém mensagem padrão se o corpo não for JSON
    }

    throw new ApiError(response.status, mensagem);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
