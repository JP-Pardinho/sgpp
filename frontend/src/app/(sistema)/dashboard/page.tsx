"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BarrasHorizontais from "@/components/dashboard/BarrasHorizontais";
import CardResumo from "@/components/dashboard/CardResumo";
import DonutChart from "@/components/dashboard/DonutChart";
import PaginaSistema from "@/components/layout/PaginaSistema";
import Icon from "@/components/ui/Icon";
import StatusBadge from "@/components/ui/StatusBadge";
import { btnPrimario, btnSecundario } from "@/components/ui/Botoes";
import { formatarMesAno, formatarMoedaResumida } from "@/lib/format";
import { dashboardService, type Dashboard } from "@/services/dashboardServices";

export default function DashboardPage() {
  const [dados, setDados] = useState<Dashboard | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [alertaFechado, setAlertaFechado] = useState(false);

  useEffect(() => {
    let ativo = true;
    dashboardService
      .obter()
      .then((d) => ativo && setDados(d))
      .catch(() => ativo && setErro("Não foi possível carregar os indicadores do dashboard."));
    return () => {
      ativo = false;
    };
  }, []);

  const acoes = (
    <>
      <Link href="/projetos/novo" className={btnPrimario}>
        <Icon nome="plus" className="h-4 w-4" /> Novo projeto
      </Link>
      <Link href="/participantes/novo" className={btnSecundario}>
        <Icon nome="plus" className="h-4 w-4" /> Novo participante
      </Link>
    </>
  );

  return (
    <PaginaSistema
      titulo="Dashboard"
      breadcrumb={[
        { rotulo: "Início", href: "/dashboard" },
        { rotulo: "Dashboard", href: "/dashboard" },
        { rotulo: "Visão geral dos projetos de pesquisa" },
      ]}
      acoes={acoes}
    >
      {erro && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{erro}</p>}
      {!dados && !erro && <p className="text-sm text-slate-500">Carregando indicadores...</p>}

      {dados && (
        <>
          {dados.vencimentosProximos30Dias > 0 && !alertaFechado && (
            <div role="alert" className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900">
              <p className="flex items-center gap-2">
                <Icon nome="alert" className="h-5 w-5 text-amber-500" />
                <span>
                  <strong>Atenção:</strong> {dados.vencimentosProximos30Dias}{" "}
                  {dados.vencimentosProximos30Dias === 1 ? "financiamento vence" : "financiamentos vencem"} nos próximos 30 dias.
                </span>
              </p>
              <button type="button" onClick={() => setAlertaFechado(true)} aria-label="Fechar alerta" className="text-slate-600 hover:text-slate-900">
                <Icon nome="x" className="h-4 w-4" />
              </button>
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CardResumo icone="folder" rotulo="Projetos em andamento" valor={dados.projetosEmAndamento} />
            <CardResumo icone="users" rotulo="Participantes" valor={dados.totalParticipantes} />
            <CardResumo icone="dollar" rotulo="Financiamento total" valor={formatarMoedaResumida(dados.financiamentoTotal)} />
            <CardResumo icone="file" rotulo="Produções científicas" valor={dados.producoesCientificas} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Projetos por situação</h2>
              <DonutChart
                dados={[
                  { rotulo: "Em andamento", valor: dados.projetosPorSituacao.emAndamento, cor: "#2563eb" },
                  { rotulo: "Concluído", valor: dados.projetosPorSituacao.concluido, cor: "#22c55e" },
                  { rotulo: "Cancelado", valor: dados.projetosPorSituacao.cancelado, cor: "#ef4444" },
                ]}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Financiamento por agência</h2>
              <BarrasHorizontais
                dados={dados.financiamentoPorAgencia.map((f) => ({ rotulo: f.agencia, valor: f.valor }))}
                formatar={formatarMoedaResumida}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Projetos recentes</h2>
              <Link href="/projetos" className="text-sm text-blue-700 underline">Ver todos</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Código</th>
                    <th className="px-3 py-2 font-semibold">Título</th>
                    <th className="px-3 py-2 font-semibold">Coordenador</th>
                    <th className="px-3 py-2 font-semibold">Situação</th>
                    <th className="px-3 py-2 font-semibold">Término</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.projetosRecentes.map((p) => (
                    <tr key={p.codigo} className="border-b border-slate-100 last:border-0 even:bg-slate-50">
                      <td className="px-3 py-2.5">
                        <Link href={`/projetos/${encodeURIComponent(p.codigo)}`} className="text-blue-700 hover:underline">{p.codigo}</Link>
                      </td>
                      <td className="px-3 py-2.5">{p.titulo}</td>
                      <td className="px-3 py-2.5">{p.coordenadorNome ?? "-"}</td>
                      <td className="px-3 py-2.5"><StatusBadge situacao={p.situacao} /></td>
                      <td className="px-3 py-2.5">{formatarMesAno(p.dataFim)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PaginaSistema>
  );
}
