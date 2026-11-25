"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import Icon, { type NomeIcone } from "@/components/ui/Icon";
import { limparSessao } from "@/lib/session";

const ITENS: { rotulo: string; href: string; icone: NomeIcone }[] = [
  { rotulo: "Dashboard", href: "/dashboard", icone: "home" },
  { rotulo: "Projetos", href: "/projetos", icone: "folder" },
  { rotulo: "Participantes", href: "/participantes", icone: "users" },
  { rotulo: "Financiamentos", href: "/financiamentos", icone: "card" },
  { rotulo: "Produções científicas", href: "/producoes", icone: "file" },
  { rotulo: "Consultas", href: "/consultas", icone: "search" },
];

function ListaLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav className="flex-1 space-y-1 px-3 pt-2">
      {ITENS.map((item) => {
        const ativo =
          pathname !== null &&
          (pathname === item.href || pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              ativo ? "bg-sgpp-800 font-medium" : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <Icon nome={item.icone} />
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

function NavegacaoSidebar() {
  const pathname = usePathname();
  return <ListaLinks pathname={pathname} />;
}

export default function Sidebar() {
  const router = useRouter();

  function sair() {
    limparSessao();
    router.replace("/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-sgpp-900 text-white">
      <div className="px-5 py-5">
        <p className="text-2xl font-bold tracking-tight">SGPP</p>
        <p className="text-[11px] leading-tight text-slate-300">Univ. Fed. do Espírito Santo</p>
      </div>

      <Suspense fallback={<ListaLinks pathname={null} />}>
        <NavegacaoSidebar />
      </Suspense>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={sair}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10"
        >
          <Icon nome="logout" />
          Sair
        </button>
      </div>
    </aside>
  );
}
