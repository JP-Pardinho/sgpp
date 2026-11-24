"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PaginaSistema from "@/components/layout/PaginaSistema";
import { btnContorno, btnPrimario } from "@/components/ui/Botoes";
import Icon from "@/components/ui/Icon";
import { somenteDigitos } from "@/lib/validacao";
import { participantesService, type Participante } from "@/services/participanteServices";
import ListaParticipantes from "./ListaParticipantes";
import ParticipanteForm from "./ParticipanteForm";

type AbaAtiva = "listar" | "cadastrar";

/** Lê ?aba= da URL (ex.: vindo do botão "Novo participante" no Dashboard) e define a aba inicial. */
export default function ParticipantesTela() {
  const abaParam = useSearchParams().get("aba");
  const abaInicial: AbaAtiva = abaParam === "cadastrar" ? "cadastrar" : "listar";
  return <ParticipantesTelaInterna key={abaInicial} abaInicial={abaInicial} />;
}

function ParticipantesTelaInterna({ abaInicial }: { abaInicial: AbaAtiva }) {
  const [aba, setAba] = useState<AbaAtiva>(abaInicial);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [toastVisivel, setToastVisivel] = useState(false);

  useEffect(() => {
    let ativo = true;
    participantesService
      .listar()
      .then((dados) => {
        if (!ativo) return;
        setParticipantes(dados);
        setErroLista(null);
      })
      .catch(() => {
        if (ativo) setErroLista("Não foi possível carregar os participantes.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!toastVisivel) return;
    const timer = setTimeout(() => setToastVisivel(false), 5000);
    return () => clearTimeout(timer);
  }, [toastVisivel]);

  function handleCadastrado(novo: Participante) {
    setParticipantes((prev) => {
      const cpfNovo = somenteDigitos(novo.cpf);
      if (prev.some((p) => somenteDigitos(p.cpf) === cpfNovo)) return prev;
      return [novo, ...prev];
    });
    setErroLista(null);
    setToastVisivel(true);
  }

  async function handleExcluir(participante: Participante) {
    try {
      await participantesService.excluir(participante.cpf);
      const cpfAlvo = somenteDigitos(participante.cpf);
      setParticipantes((prev) => prev.filter((p) => somenteDigitos(p.cpf) !== cpfAlvo));
      setErroLista(null);
    } catch {
      setErroLista("Não foi possível excluir o participante.");
    }
  }

  return (
    <PaginaSistema
      titulo="Participantes"
      breadcrumb={
        aba === "listar"
          ? [
              { rotulo: "Início", href: "/dashboard" },
              { rotulo: "Participantes" },
              { rotulo: "Lista de participantes" },
            ]
          : [
              { rotulo: "Início", href: "/dashboard" },
              { rotulo: "Participantes", href: "/participantes" },
              { rotulo: "Cadastrar participante" },
            ]
      }
      acoes={
        <>
          <Link href="/participantes/vincular" className={btnContorno}>
            Vincular a projeto
          </Link>
          {aba === "listar" && (
            <button type="button" onClick={() => setAba("cadastrar")} className={btnPrimario}>
              <Icon nome="plus" className="h-4 w-4" /> Novo participante
            </button>
          )}
        </>
      }
    >
      {/* Abas: Ver cadastrados | Cadastrar participante */}
      <div className="border-b border-slate-200">
        <div role="tablist" aria-label="Opções de participantes" className="flex gap-2">
          <button
            type="button"
            role="tab"
            id="tab-listar"
            aria-selected={aba === "listar"}
            aria-controls="painel-listar"
            onClick={() => setAba("listar")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              aba === "listar"
                ? "border-sgpp-700 text-sgpp-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Ver cadastrados
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {participantes.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-cadastrar"
            aria-selected={aba === "cadastrar"}
            aria-controls="painel-cadastrar"
            onClick={() => setAba("cadastrar")}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              aba === "cadastrar"
                ? "border-sgpp-700 text-sgpp-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Cadastrar participante
          </button>
        </div>
      </div>

      {aba === "listar" ? (
        <div role="tabpanel" id="painel-listar" aria-labelledby="tab-listar">
          <ListaParticipantes
            participantes={participantes}
            carregando={carregando}
            erro={erroLista}
            onExcluir={handleExcluir}
          />
        </div>
      ) : (
        <div role="tabpanel" id="painel-cadastrar" aria-labelledby="tab-cadastrar">
          <ParticipanteForm
            participantesExistentes={participantes}
            onCadastrado={handleCadastrado}
          />
        </div>
      )}

      {/* Toast / alerta verde de confirmação */}
      {toastVisivel && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg"
        >
          <Icon nome="checkCircle" className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>Participante cadastrado</span>
          <button
            type="button"
            onClick={() => setToastVisivel(false)}
            aria-label="Fechar notificação"
            className="ml-1 rounded p-0.5 text-emerald-700 hover:bg-emerald-100"
          >
            <Icon nome="x" className="h-4 w-4" />
          </button>
        </div>
      )}
    </PaginaSistema>
  );
}
