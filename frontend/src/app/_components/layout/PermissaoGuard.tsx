"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { btnPrimario } from "@/app/_components/ui/Botoes";
import Icon from "@/app/_components/ui/Icon";
import { temPermissao, type Permissao } from "@/lib/permissoes";
import { useUsuario } from "./AuthGuard";
import PaginaSistema from "./PaginaSistema";

interface Props {
  permissao: Permissao;
  children: ReactNode;
}

/** Bloqueia o acesso visual a telas de criação/edição/vínculo para perfis sem permissão. */
export default function PermissaoGuard({ permissao, children }: Props) {
  const usuario = useUsuario();

  if (!usuario) {
    return null;
  }

  if (!temPermissao(usuario.perfil, permissao)) {
    return (
      <PaginaSistema
        titulo="Acesso restrito"
        breadcrumb={[
          { rotulo: "Início", href: "/" },
          { rotulo: "Acesso restrito" },
        ]}
      >
        <section className="mx-auto max-w-xl rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600">
            <Icon nome="shield" className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Você não tem permissão para acessar esta tela
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Seu perfil atual (<strong>{usuario.perfil || "Participante"}</strong>) possui acesso
            restrito para esta funcionalidade.
          </p>
          <div className="mt-5 flex justify-center">
            <Link href="/" className={btnPrimario}>
              Voltar ao início
            </Link>
          </div>
        </section>
      </PaginaSistema>
    );
  }

  return <>{children}</>;
}
