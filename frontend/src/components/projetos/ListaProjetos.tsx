"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PaginaSistema from "@/components/layout/PaginaSistema";
import { btnContorno, btnPrimario, inputBase } from "@/components/ui/Botoes";
import Icon from "@/components/ui/Icon";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatarData } from "@/lib/format";
import { participantesService, type Participante } from "@/services/participanteServices";
import { projetosService, SITUACOES, type Projeto, type ResultadoPaginado } from "@/services/projetoServices";

const TAMANHO_PAGINA = 8;

/** Lê ?busca= da URL (vem do campo de busca do Header) e reinicia a tela quando muda. */
export default function ListaProjetos() {
  const busca = useSearchParams().get("busca") ?? "";
  return <ListaProjetosInterna key={busca} buscaInicial={busca} />;
}

function ListaProjetosInterna({ buscaInicial }: { buscaInicial: string }) {
  const [busca, setBusca] = useState(buscaInicial);
  const [buscaAplicada, setBuscaAplicada] = useState(buscaInicial);
  const [situacao, setSituacao] = useState("");
  const [coordenadorCpf, setCoordenadorCpf] = useState("");
  const [pagina, setPagina] = useState(1);
  const [recarregar, setRecarregar] = useState(0);

  const [docentes, setDocentes] = useState<Participante[]>([]);
  const [resultado, setResultado] = useState<ResultadoPaginado<Projeto> | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Docentes para o filtro "Coordenador"
  useEffect(() => {
    let ativo = true;
    participantesService.listarDocentes().then((d) => ativo && setDocentes(d)).catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  // Aguarda 300 ms depois de parar de digitar antes de buscar
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscaAplicada(busca);
      setPagina(1);
    }, 300);
    return () => clearTimeout(t);
  }, [busca]);

  // Carrega a lista sempre que algum filtro/página muda
  useEffect(() => {
    let ativo = true;
    projetosService
      .listarComFiltros({ busca: buscaAplicada, situacao, coordenadorCpf, pagina, tamanhoPagina: TAMANHO_PAGINA })
      .then((r) => {
        if (!ativo) return;
        setResultado(r);
        setErro(null);
      })
      .catch(() => ativo && setErro("Não foi possível carregar a lista de projetos."));
    return () => {
      ativo = false;
    };
  }, [buscaAplicada, situacao, coordenadorCpf, pagina, recarregar]);

  function limparFiltros() {
    setBusca("");
    setBuscaAplicada("");
    setSituacao("");
    setCoordenadorCpf("");
    setPagina(1);
  }

  async function excluir(p: Projeto) {
    if (!window.confirm(`Excluir o projeto ${p.codigo}? Esta ação não pode ser desfeita.`)) return;
    try {
      await projetosService.excluir(p.codigo);
      setRecarregar((n) => n + 1);
    } catch {
      setErro("Não foi possível excluir o projeto.");
    }
  }

  const nomeCoordenador = (p: Projeto) =>
    p.coordenadorNome ?? docentes.find((d) => d.cpf === p.coordenadorCpf)?.nome ?? "-";

  const total = resultado?.total ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO_PAGINA));
  const primeiro = total === 0 ? 0 : (pagina - 1) * TAMANHO_PAGINA + 1;
  const ultimo = Math.min(pagina * TAMANHO_PAGINA, total);

  return (
    <PaginaSistema
      titulo="Projetos"
      breadcrumb={[
        { rotulo: "Início", href: "/dashboard" },
        { rotulo: "Projetos", href: "/projetos" },
        { rotulo: "Lista de projetos" },
      ]}
      acoes={
        <Link href="/projetos/novo" className={btnPrimario}>
          <Icon nome="plus" className="h-4 w-4" /> Novo projeto
        </Link>
      }
    >
      {/* Filtros */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-60 flex-1">
            <label htmlFor="busca" className="mb-1 block text-sm font-medium text-slate-900">Buscar por código ou título</label>
            <input id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite para buscar..." className={inputBase} />
          </div>

          <div className="min-w-48 flex-1">
            <label htmlFor="situacao" className="mb-1 block text-sm font-medium text-slate-900">Situação</label>
            <select id="situacao" value={situacao} onChange={(e) => { setSituacao(e.target.value); setPagina(1); }} className={inputBase}>
              <option value="">Todas</option>
              {SITUACOES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="min-w-56 flex-1">
            <label htmlFor="coordenador" className="mb-1 block text-sm font-medium text-slate-900">Coordenador</label>
            <select id="coordenador" value={coordenadorCpf} onChange={(e) => { setCoordenadorCpf(e.target.value); setPagina(1); }} className={inputBase}>
              <option value="">Todos</option>
              {docentes.map((d) => <option key={d.cpf} value={d.cpf}>{d.nome}</option>)}
            </select>
          </div>

          <button type="button" onClick={limparFiltros} className={btnContorno}>Limpar filtros</button>
        </div>
      </section>

      {/* Tabela */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {erro && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
        {!resultado && !erro && <p className="text-sm text-slate-500">Carregando projetos...</p>}

        {resultado && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Código</th>
                    <th className="px-3 py-2 font-semibold">Título</th>
                    <th className="px-3 py-2 font-semibold">Coordenador</th>
                    <th className="px-3 py-2 font-semibold">Situação</th>
                    <th className="px-3 py-2 font-semibold">Início</th>
                    <th className="px-3 py-2 font-semibold">Término</th>
                    <th className="px-3 py-2 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.itens.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500">Nenhum projeto encontrado.</td></tr>
                  )}
                  {resultado.itens.map((p) => (
                    <tr key={p.codigo} className="border-b border-slate-100 even:bg-slate-50">
                      <td className="whitespace-nowrap px-3 py-2.5">{p.codigo}</td>
                      <td className="px-3 py-2.5">{p.titulo}</td>
                      <td className="px-3 py-2.5">{nomeCoordenador(p)}</td>
                      <td className="px-3 py-2.5"><StatusBadge situacao={p.situacao} /></td>
                      <td className="whitespace-nowrap px-3 py-2.5">{formatarData(p.dataInicio)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">{formatarData(p.dataFim)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3 text-slate-500">
                          <Link href={`/projetos/${encodeURIComponent(p.codigo)}`} title="Visualizar" aria-label={`Visualizar ${p.codigo}`} className="hover:text-blue-700"><Icon nome="eye" className="h-[18px] w-[18px]" /></Link>
                          <Link href={`/projetos/${encodeURIComponent(p.codigo)}/editar`} title="Editar" aria-label={`Editar ${p.codigo}`} className="hover:text-blue-700"><Icon nome="pencil" className="h-[18px] w-[18px]" /></Link>
                          <button type="button" onClick={() => excluir(p)} title="Excluir" aria-label={`Excluir ${p.codigo}`} className="hover:text-red-600"><Icon nome="trash" className="h-[18px] w-[18px]" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-slate-800">Exibindo {primeiro} a {ultimo} de {total} projetos</p>
              <div className="flex overflow-hidden rounded-lg border border-slate-300">
                <button type="button" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)} className="px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-white">Anterior</button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" onClick={() => setPagina(n)} aria-current={n === pagina ? "page" : undefined} className={`border-l border-slate-300 px-3 py-1.5 ${n === pagina ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}>{n}</button>
                ))}
                <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)} className="border-l border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-white">Próximo</button>
              </div>
            </div>
          </>
        )}
      </section>
    </PaginaSistema>
  );
}
