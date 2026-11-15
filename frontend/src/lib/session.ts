export interface Usuario {
  nome: string;
  perfil: string;
  email?: string;
}

export interface Sessao {
  token: string;
  usuario: Usuario;
}

const CHAVE = "sgpp.sessao";
const ouvintes = new Set<() => void>();

function notificar() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function assinarSessao(callback: () => void) {
  ouvintes.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    ouvintes.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

/** Texto bruto salvo (localStorage se "lembrar-me", senão sessionStorage). */
export function lerSessaoBruta(): string | null {
  return window.localStorage.getItem(CHAVE) ?? window.sessionStorage.getItem(CHAVE);
}

export function interpretarSessao(bruta: string | null | undefined): Sessao | null {
  if (!bruta) return null;
  try {
    return JSON.parse(bruta) as Sessao;
  } catch {
    return null;
  }
}

export function lerSessao(): Sessao | null {
  if (typeof window === "undefined") return null;
  return interpretarSessao(lerSessaoBruta());
}

export function lerToken(): string | null {
  return lerSessao()?.token ?? null;
}

export function salvarSessao(sessao: Sessao, lembrar: boolean) {
  window.localStorage.removeItem(CHAVE);
  window.sessionStorage.removeItem(CHAVE);
  const storage = lembrar ? window.localStorage : window.sessionStorage;
  storage.setItem(CHAVE, JSON.stringify(sessao));
  notificar();
}

export function limparSessao() {
  window.localStorage.removeItem(CHAVE);
  window.sessionStorage.removeItem(CHAVE);
  notificar();
}
