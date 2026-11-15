"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { iniciais } from "@/lib/format";
import { useUsuario } from "./AuthGuard";

export default function Header({ titulo }: { titulo: string }) {
  const router = useRouter();
  const usuario = useUsuario();
  const [busca, setBusca] = useState("");

  function buscar(e: FormEvent) {
    e.preventDefault();
    const termo = busca.trim();
    router.push(termo ? `/projetos?busca=${encodeURIComponent(termo)}` : "/projetos");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-900">{titulo}</h1>

      <div className="flex items-center gap-4">
        <form onSubmit={buscar} className="relative">
          <Icon nome="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar..."
            aria-label="Buscar projetos"
            className="w-56 rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-sgpp-600 focus:ring-2 focus:ring-sgpp-100"
          />
        </form>

        <button type="button" aria-label="Notificações" className="rounded-full p-2 text-slate-600 hover:bg-slate-100">
          <Icon nome="bell" />
        </button>

        {usuario && (
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-sgpp-100 text-sm font-semibold text-sgpp-700">
              {iniciais(usuario.nome)}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-900">{usuario.nome}</p>
              <p className="text-xs text-slate-500">{usuario.perfil}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
