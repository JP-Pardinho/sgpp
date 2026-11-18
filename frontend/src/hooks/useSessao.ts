"use client";

import { useMemo, useSyncExternalStore } from "react";
import { assinarSessao, interpretarSessao, lerSessaoBruta, type Sessao } from "@/lib/session";

const snapshotServidor = () => undefined;

/**
 * undefined = ainda carregando (servidor/hidratação)
 * null      = sem sessão
 * Sessao    = usuário logado
 */
export function useSessao(): Sessao | null | undefined {
  const bruta = useSyncExternalStore<string | null | undefined>(
    assinarSessao,
    lerSessaoBruta,
    snapshotServidor,
  );
  return useMemo(() => (bruta === undefined ? undefined : interpretarSessao(bruta)), [bruta]);
}
