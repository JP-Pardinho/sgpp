"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Header from "./Header";

export interface ItemBreadcrumb {
  rotulo: string;
  href?: string;
}

interface Props {
  titulo: string;
  breadcrumb: ItemBreadcrumb[];
  acoes?: ReactNode;
  children: ReactNode;
}

/** Cabeçalho + breadcrumb + área de conteúdo, usado por todas as telas internas. */
export default function PaginaSistema({ titulo, breadcrumb, acoes, children }: Props) {
  return (
    <>
      <Header titulo={titulo} />

      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          {breadcrumb.map((item, i) => {
            const ultimo = i === breadcrumb.length - 1;
            return (
              <span key={item.rotulo}>
                {item.href && !ultimo ? (
                  <Link href={item.href} className="hover:text-sgpp-700 hover:underline">
                    {item.rotulo}
                  </Link>
                ) : (
                  <span className={ultimo ? "text-slate-900" : ""}>{item.rotulo}</span>
                )}
                {!ultimo && <span className="mx-1.5">/</span>}
              </span>
            );
          })}
        </nav>
        {acoes && <div className="flex items-center gap-2">{acoes}</div>}
      </div>

      <main className="flex-1 space-y-5 p-6">{children}</main>
    </>
  );
}
