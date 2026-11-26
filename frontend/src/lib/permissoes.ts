export type Permissao =
  | "gerenciarProjetos"
  | "gerenciarEquipes"
  | "gerenciarProducoes"
  | "gerenciarParticipantes"
  | "gerenciarFinanciamentos";

export interface PermissoesPerfil {
  ehAdmin: boolean;
  ehCoordenador: boolean;
  ehParticipante: boolean;
  gerenciarProjetos: boolean;
  gerenciarEquipes: boolean;
  gerenciarProducoes: boolean;
  gerenciarParticipantes: boolean;
  gerenciarFinanciamentos: boolean;
}

function normalizarPerfil(perfil?: string | null): string {
  return (perfil ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function obterPermissoes(perfil?: string | null): PermissoesPerfil {
  const norm = normalizarPerfil(perfil);
  const ehAdmin = norm === "administrador" || norm === "admin";
  const ehCoordenador = norm === "coordenador";
  const ehParticipante = !ehAdmin && !ehCoordenador;

  return {
    ehAdmin,
    ehCoordenador,
    ehParticipante,
    gerenciarProjetos: ehAdmin || ehCoordenador,
    gerenciarEquipes: ehAdmin || ehCoordenador,
    gerenciarProducoes: ehAdmin || ehCoordenador,
    gerenciarParticipantes: ehAdmin,
    gerenciarFinanciamentos: ehAdmin,
  };
}

export function temPermissao(perfil: string | null | undefined, permissao: Permissao): boolean {
  return obterPermissoes(perfil)[permissao];
}
