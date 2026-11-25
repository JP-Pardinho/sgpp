"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/hooks/useSessao";
import type { Usuario } from "@/lib/session";

const UsuarioContext = createContext<Usuario | null>(null);

export function useUsuario() {
  return useContext(UsuarioContext);
}

/** Protege as telas internas: sem sessão, redireciona para /login. */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const sessao = useSessao();

  useEffect(() => {
    if (sessao === null) router.replace("/login");
  }, [sessao, router]);

  if (sessao === null) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-500">
        Carregando...
      </div>
    );
  }

  if (sessao === undefined) {
    return (
      <UsuarioContext.Provider value={null}>
        <div className="grid min-h-screen place-items-center text-sm text-slate-500">
          Carregando...
        </div>
        <div className="hidden" aria-hidden="true">
          {children}
        </div>
      </UsuarioContext.Provider>
    );
  }

  return <UsuarioContext.Provider value={sessao.usuario}>{children}</UsuarioContext.Provider>;
}
