"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PaginaSistema from "@/app/_components/layout/PaginaSistema";
import { btnContorno, btnPrimario, inputBase } from "@/app/_components/ui/Botoes";
import Icon from "@/app/_components/ui/Icon";
import { formatarData, formatarMoeda } from "@/lib/format";
import {
  AGENCIAS_FINANCIADORAS,
  financiamentosService,
  type ApoioFinanceiro,
  type Financiamento,
} from "@/services/financiamentoServices";

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function ListaFinanciamentosTela() {
  const [financiamentos, setFinanciamentos] = useState<Financiamento[]>([]);
  const [apoios, setApoios] = useState<ApoioFinanceiro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [agenciaFiltro, setAgenciaFiltro] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([
      financiamentosService.listar(),
      financiamentosService.listarTodosApoios().catch(() => [] as ApoioFinanceiro[]),
    ])
      .then(([listaFin, listaApoios]) => {
        if (!ativo) return;
        setFinanciamentos(listaFin);
        setApoios(listaApoios);
        setErro(null);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar os financiamentos.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const distribuidoPorId = useMemo(() => {
    const mapa = new Map<number, number>();
    for (const a of apoios) {
      mapa.set(a.idFinanciamento, (mapa.get(a.idFinanciamento) ?? 0) + a.valorDestinado);
    }
    return mapa;
  }, [apoios]);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return financiamentos.filter((f) => {
      if (agenciaFiltro && f.agenciaFinanciadora !== agenciaFiltro) return false;
      if (!termo) return true;
      return normalizar(
        `${f.agenciaFinanciadora} ${f.numeroProcesso ?? ""} #${f.idFinanciamento} ${f.tipoFomento}`,
      ).includes(termo);
    });
  }, [financiamentos, busca, agenciaFiltro]);

  return (
    <PaginaSistema
      titulo="Financiamentos"
      breadcrumb={[
        { rotulo: "Início", href: "/" },
        { rotulo: "Financiamentos" },
      ]}
      acoes={
        <>
          <Link href="/financiamentos/vincular" className={btnContorno}>
            Vincular a projeto
          </Link>
          <Link href="/financiamentos/novo" className={btnPrimario}>
            <Icon nome="plus" className="h-4 w-4" /> Novo financiamento
          </Link>
        </>
      }
    >
      {/* Filtros */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-60 flex-1">
            <label htmlFor="busca-financiamento" className="mb-1 block text-sm font-medium text-slate-900">
              Buscar por processo ou tipo de fomento
            </label>
            <input
              id="busca-financiamento"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite para buscar..."
              className={inputBase}
            />
          </div>

          <div className="min-w-48 flex-1">
            <label htmlFor="filtro-agencia" className="mb-1 block text-sm font-medium text-slate-900">
              Agência financiadora
            </label>
            <select
              id="filtro-agencia"
              value={agenciaFiltro}
              onChange={(e) => setAgenciaFiltro(e.target.value)}
              className={inputBase}
            >
              <option value="">Todas</option>
              {AGENCIAS_FINANCIADORAS.map((ag) => (
                <option key={ag} value={ag}>
                  {ag}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setBusca("");
              setAgenciaFiltro("");
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
          <p className="text-sm text-slate-500">Carregando financiamentos...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Agência</th>
                    <th className="px-3 py-2 font-semibold">Processo</th>
                    <th className="px-3 py-2 font-semibold">Tipo de fomento</th>
                    <th className="px-3 py-2 font-semibold">Vigência</th>
                    <th className="px-3 py-2 font-semibold">Valor total</th>
                    <th className="px-3 py-2 font-semibold">Disponível</th>
                    <th className="px-3 py-2 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                        Nenhum financiamento encontrado.
                      </td>
                    </tr>
                  )}
                  {filtrados.map((f) => {
                    const distribuido = distribuidoPorId.get(f.idFinanciamento) ?? 0;
                    const disponivel = Math.max(0, f.valorTotal - distribuido);
                    const pct = f.valorTotal > 0 ? Math.min(100, (distribuido / f.valorTotal) * 100) : 0;
                    return (
                      <tr key={f.idFinanciamento} className="border-b border-slate-100 even:bg-slate-50">
                        <td className="px-3 py-2.5 font-semibold text-slate-900">
                          {f.agenciaFinanciadora}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                          {f.numeroProcesso || `#${f.idFinanciamento}`}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700">{f.tipoFomento}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                          {formatarData(f.dataInicio)} a {formatarData(f.dataFim)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-900">
                          {formatarMoeda(f.valorTotal)}
                        </td>
                        <td className="min-w-40 px-3 py-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-emerald-700">
                              {formatarMoeda(disponivel)}
                            </span>
                            <span className="text-slate-500">
                              {pct.toFixed(0)}% usado
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <Link
                            href={`/financiamentos/vincular?financiamento=${f.idFinanciamento}`}
                            className="text-sm font-medium text-blue-700 hover:underline"
                          >
                            Vincular / Saldo
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-slate-700">
              Exibindo {filtrados.length} de {financiamentos.length} financiamentos
            </p>
          </>
        )}
      </section>
    </PaginaSistema>
  );
}
