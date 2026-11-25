"use client";

import { useEffect, useState, type FormEvent } from "react";
import PaginaSistema from "@/components/layout/PaginaSistema";
import { btnContorno, btnPrimario, inputBase } from "@/components/ui/Botoes";
import Icon from "@/components/ui/Icon";
import {
  consultasService,
  exportarResultadoCsv,
  TIPOS_CONSULTA,
  type ResultadoConsulta,
  type TipoConsulta,
} from "@/services/consultaServices";
import { AGENCIAS_FINANCIADORAS } from "@/services/financiamentoServices";
import { participantesService, type Participante } from "@/services/participanteServices";
import { projetosService, type Projeto } from "@/services/projetoServices";

export default function ConsultasTela() {
  const [tipoConsulta, setTipoConsulta] = useState<TipoConsulta>("projetos-por-coordenador");
  const [filtroSecundario, setFiltroSecundario] = useState("");

  const [docentes, setDocentes] = useState<Participante[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);
  const [consultando, setConsultando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([
      participantesService.listarDocentes(),
      projetosService.listar(),
      consultasService.executar("projetos-por-coordenador", ""),
    ])
      .then(([listaDocentes, listaProjetos, resInicial]) => {
        if (!ativo) return;
        setDocentes(listaDocentes);
        setProjetos(listaProjetos);
        setResultado(resInicial);
        setErro(null);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar os dados de consulta.");
      })
      .finally(() => {
        if (ativo) setConsultando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const configAtual =
    TIPOS_CONSULTA.find((item) => item.valor === tipoConsulta) ?? TIPOS_CONSULTA[0];

  async function executar(tipo: TipoConsulta, filtro: string) {
    setConsultando(true);
    setErro(null);
    try {
      const dados = await consultasService.executar(tipo, filtro);
      setResultado(dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao executar a consulta.");
    } finally {
      setConsultando(false);
    }
  }

  function trocarTipoConsulta(novoTipo: TipoConsulta) {
    setTipoConsulta(novoTipo);
    setFiltroSecundario("");
    void executar(novoTipo, "");
  }

  function aoConsultar(e: FormEvent) {
    e.preventDefault();
    void executar(tipoConsulta, filtroSecundario);
  }

  return (
    <PaginaSistema
      titulo="Consultas e Relatórios"
      breadcrumb={[
        { rotulo: "Início", href: "/dashboard" },
        { rotulo: "Consultas" },
      ]}
    >
      {/* Filtro superior */}
      <form
        onSubmit={aoConsultar}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:hidden"
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Realizar consulta no sistema</h2>
          <p className="text-sm text-slate-500">{configAtual.descricao}</p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-64 flex-1">
            <label htmlFor="tipoConsulta" className="mb-1 block text-sm font-medium text-slate-900">
              Tipo de consulta
            </label>
            <select
              id="tipoConsulta"
              value={tipoConsulta}
              onChange={(e) => trocarTipoConsulta(e.target.value as TipoConsulta)}
              className={inputBase}
            >
              {TIPOS_CONSULTA.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-64 flex-1">
            <label
              htmlFor="filtroSecundario"
              className="mb-1 block text-sm font-medium text-slate-900"
            >
              {configAtual.rotuloFiltro}
            </label>
            <select
              id="filtroSecundario"
              value={filtroSecundario}
              onChange={(e) => setFiltroSecundario(e.target.value)}
              className={inputBase}
            >
              <option value="">{configAtual.opcaoTodos}</option>

              {tipoConsulta === "projetos-por-coordenador" &&
                docentes.map((d) => (
                  <option key={d.cpf} value={d.cpf}>
                    {d.nome}
                  </option>
                ))}

              {(tipoConsulta === "participantes-do-projeto" ||
                tipoConsulta === "producoes-do-projeto") &&
                projetos.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.codigo} — {p.titulo}
                  </option>
                ))}

              {tipoConsulta === "financiamentos-por-agencia" &&
                AGENCIAS_FINANCIADORAS.map((ag) => (
                  <option key={ag} value={ag}>
                    {ag}
                  </option>
                ))}
            </select>
          </div>

          <button type="submit" disabled={consultando} className={btnPrimario}>
            <Icon nome="search" className="h-4 w-4" />
            {consultando ? "Consultando..." : "Consultar"}
          </button>
        </div>
      </form>

      {/* Barra de ações: resumo + Exportar CSV + Imprimir */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm print:hidden">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {resultado?.tituloRelatorio ?? configAtual.rotulo}
          </p>
          <p className="text-xs text-slate-600">
            {resultado
              ? `${resultado.filtroAplicado} · ${resultado.resumoGeral}`
              : "Carregando resultados..."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!resultado || resultado.totalRegistros === 0 || consultando}
            onClick={() => resultado && exportarResultadoCsv(resultado)}
            className={`${btnContorno} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Icon nome="download" className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            type="button"
            disabled={!resultado || consultando}
            onClick={() => window.print()}
            className={`${btnContorno} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Icon nome="printer" className="h-4 w-4" />
            Imprimir
          </button>
        </div>
      </section>

      {/* Cabeçalho exclusivo para impressão */}
      {resultado && (
        <div className="hidden border-b border-slate-300 pb-3 print:block">
          <h2 className="text-xl font-bold text-slate-900">SGPP — {resultado.tituloRelatorio}</h2>
          <p className="text-sm text-slate-700">
            {resultado.filtroAplicado} · {resultado.resumoGeral}
          </p>
        </div>
      )}

      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </p>
      )}

      {consultando && !resultado && (
        <p className="text-sm text-slate-500">Executando consulta...</p>
      )}

      {/* Resultados agrupados */}
      {resultado && resultado.grupos.length === 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Nenhum registro encontrado para os critérios selecionados.
        </section>
      )}

      {resultado && resultado.grupos.length > 0 && (
        <div className="space-y-5">
          {resultado.grupos.map((grupo) => (
            <section
              key={grupo.chave}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:break-inside-avoid print:shadow-none"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-sgpp-50 px-5 py-3">
                <div>
                  <h3 className="text-base font-bold text-sgpp-900">{grupo.titulo}</h3>
                  {grupo.subtitulo && (
                    <p className="text-xs text-slate-600">{grupo.subtitulo}</p>
                  )}
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sgpp-800 shadow-xs">
                  {grupo.linhas.length}{" "}
                  {grupo.linhas.length === 1 ? "registro" : "registros"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      {grupo.colunas.map((col, idx) => (
                        <th key={`${idx}-${col}`} className="px-4 py-2 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.linhas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={grupo.colunas.length}
                          className="px-4 py-5 text-center text-slate-500"
                        >
                          Sem registros neste grupo.
                        </td>
                      </tr>
                    ) : (
                      grupo.linhas.map((linha, rowIdx) => (
                        <tr
                          key={`${grupo.chave}-${rowIdx}`}
                          className="border-b border-slate-100 even:bg-slate-50"
                        >
                          {linha.map((celula, colIdx) => (
                            <td key={`${rowIdx}-${colIdx}`} className="px-4 py-2.5 text-slate-800">
                              {celula}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-xs">
                <span className="font-medium text-slate-600">{grupo.subtotalLabel}</span>
                <span className="font-bold text-slate-900">{grupo.subtotalValor}</span>
              </div>
            </section>
          ))}

          <div className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm shadow-sm print:shadow-none">
            <span className="font-medium text-slate-700">Total geral da consulta</span>
            <span className="font-bold text-slate-900">{resultado.resumoGeral}</span>
          </div>
        </div>
      )}
    </PaginaSistema>
  );
}
