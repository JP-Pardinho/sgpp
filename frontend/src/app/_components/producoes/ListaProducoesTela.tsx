"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PaginaSistema from "@/app/_components/layout/PaginaSistema";
import { btnContorno, btnPrimario, inputBase } from "@/app/_components/ui/Botoes";
import Icon from "@/app/_components/ui/Icon";
import {
  producoesService,
  TIPOS_PRODUCAO,
  type ProducaoCientifica,
} from "@/services/producaoServices";

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function ListaProducoesTela() {
  const [producoes, setProducoes] = useState<ProducaoCientifica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");

  useEffect(() => {
    let ativo = true;
    producoesService
      .listar()
      .then((dados) => {
        if (!ativo) return;
        setProducoes(dados);
        setErro(null);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar as produções científicas.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    return producoes.filter((p) => {
      if (tipoFiltro && normalizar(p.tipo) !== normalizar(tipoFiltro)) return false;
      if (!termo) return true;
      const autoresTexto = p.autores.map((a) => a.nome).join(" ");
      return normalizar(
        `${p.titulo} ${p.meioDivulgacao} ${p.projetoCodigo ?? ""} ${autoresTexto}`,
      ).includes(termo);
    });
  }, [producoes, busca, tipoFiltro]);

  async function excluir(p: ProducaoCientifica) {
    if (!window.confirm(`Excluir a produção "${p.titulo}"?`)) return;
    setExcluindoId(p.id);
    try {
      await producoesService.excluir(p.id);
      setProducoes((prev) => prev.filter((item) => item.id !== p.id));
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Não foi possível excluir a produção científica.",
      );
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <PaginaSistema
      titulo="Produções Científicas"
      breadcrumb={[
        { rotulo: "Início", href: "/" },
        { rotulo: "Produções científicas" },
      ]}
      acoes={
        <>
          <Link href="/producoes/vincular" className={btnContorno}>
            Vincular a projeto
          </Link>
          <Link href="/producoes/nova" className={btnPrimario}>
            <Icon nome="plus" className="h-4 w-4" /> Nova produção
          </Link>
        </>
      }
    >
      {/* Filtros */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-60 flex-1">
            <label htmlFor="busca-producao" className="mb-1 block text-sm font-medium text-slate-900">
              Buscar por título, autor ou projeto
            </label>
            <input
              id="busca-producao"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite para buscar..."
              className={inputBase}
            />
          </div>

          <div className="min-w-48 flex-1">
            <label htmlFor="filtro-tipo-prod" className="mb-1 block text-sm font-medium text-slate-900">
              Tipo de produção
            </label>
            <select
              id="filtro-tipo-prod"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className={inputBase}
            >
              <option value="">Todos</option>
              {TIPOS_PRODUCAO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setBusca("");
              setTipoFiltro("");
            }}
            className={btnContorno}
          >
            Limpar filtros
          </button>
        </div>
      </section>

      {/* Tabela */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {erro && (
          <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="text-sm text-slate-500">Carregando produções científicas...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Título</th>
                    <th className="px-3 py-2 font-semibold">Tipo</th>
                    <th className="px-3 py-2 font-semibold">Ano</th>
                    <th className="px-3 py-2 font-semibold">Meio</th>
                    <th className="px-3 py-2 font-semibold">Projeto</th>
                    <th className="px-3 py-2 font-semibold">Autores</th>
                    <th className="px-3 py-2 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                        Nenhuma produção científica encontrada.
                      </td>
                    </tr>
                  )}
                  {filtradas.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 even:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-900">{p.titulo}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{p.tipo}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{p.ano}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                        {p.meioDivulgacao}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        {p.projetoCodigo ? (
                          <Link
                            href={`/projetos/${encodeURIComponent(p.projetoCodigo)}`}
                            className="font-medium text-blue-700 hover:underline"
                          >
                            {p.projetoCodigo}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">Não vinculado</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {p.autores.length === 0 ? (
                          <span className="text-xs text-slate-400">-</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {p.autores.map((a) => (
                              <span
                                key={a.cpf}
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                              >
                                {a.nome}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/producoes/vincular?producao=${p.id}`}
                            className="text-sm font-medium text-blue-700 hover:underline"
                          >
                            Vincular
                          </Link>
                          <button
                            type="button"
                            disabled={excluindoId === p.id}
                            onClick={() => excluir(p)}
                            title="Excluir"
                            aria-label={`Excluir ${p.titulo}`}
                            className="text-slate-500 hover:text-red-600 disabled:opacity-50"
                          >
                            <Icon nome="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-slate-700">
              Exibindo {filtradas.length} de {producoes.length} produções científicas
            </p>
          </>
        )}
      </section>
    </PaginaSistema>
  );
}
