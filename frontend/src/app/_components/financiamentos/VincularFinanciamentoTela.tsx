"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import PaginaSistema from "@/app/_components/layout/PaginaSistema";
import { btnContorno, btnPrimario, btnSecundario, inputBase } from "@/app/_components/ui/Botoes";
import Icon from "@/app/_components/ui/Icon";
import { formatarData, formatarMoeda } from "@/lib/format";
import {
  formatarMoedaInput,
  numeroParaMoedaInput,
  parseMoedaInput,
} from "@/lib/validacao";
import {
  financiamentosService,
  TIPOS_VINCULO,
  type ApoioFinanceiro,
  type Financiamento,
  type TipoVinculoFinanciamento,
} from "@/services/financiamentoServices";
import { projetosService, type Projeto } from "@/services/projetoServices";

/** Lê ?financiamento= e ?projeto= da URL para pré-seleção. */
export default function VincularFinanciamentoTela() {
  const params = useSearchParams();
  const finInicial = params.get("financiamento") ?? "";
  const projInicial = params.get("projeto") ?? "";

  return (
    <VincularFinanciamentoInterna
      key={`${finInicial}-${projInicial}`}
      financiamentoInicial={finInicial}
      projetoInicial={projInicial}
    />
  );
}

function VincularFinanciamentoInterna({
  financiamentoInicial,
  projetoInicial,
}: {
  financiamentoInicial: string;
  projetoInicial: string;
}) {
  const [financiamentos, setFinanciamentos] = useState<Financiamento[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const [financiamentoId, setFinanciamentoId] = useState(financiamentoInicial);
  const [projetoCodigo, setProjetoCodigo] = useState(projetoInicial);
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculoFinanciamento>("Parcial");
  const [valorInput, setValorInput] = useState("");
  const [valorTocado, setValorTocado] = useState(false);

  const [apoios, setApoios] = useState<ApoioFinanceiro[]>([]);
  const [apoiosCarregadosPara, setApoiosCarregadosPara] = useState<string | null>(null);
  const [erroApoios, setErroApoios] = useState<string | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [removendoCodigo, setRemovendoCodigo] = useState<string | null>(null);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([financiamentosService.listar(), projetosService.listar()])
      .then(([listaFin, listaProj]) => {
        if (!ativo) return;
        setFinanciamentos(listaFin);
        setProjetos(listaProj);
        setErroCarga(null);
      })
      .catch(() => {
        if (ativo) setErroCarga("Não foi possível carregar financiamentos e projetos.");
      })
      .finally(() => {
        if (ativo) setCarregandoDados(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!financiamentoId) return;
    const idNum = Number(financiamentoId);
    if (!Number.isFinite(idNum)) return;

    let ativo = true;
    financiamentosService
      .listarApoiosPorFinanciamento(idNum)
      .then((lista) => {
        if (!ativo) return;
        setApoios(lista);
        setApoiosCarregadosPara(financiamentoId);
        setErroApoios(null);
      })
      .catch(() => {
        if (!ativo) return;
        setApoios([]);
        setApoiosCarregadosPara(financiamentoId);
        setErroApoios("Não foi possível carregar os projetos apoiados por este financiamento.");
      });

    return () => {
      ativo = false;
    };
  }, [financiamentoId]);

  useEffect(() => {
    if (!toastMensagem) return;
    const timer = setTimeout(() => setToastMensagem(null), 5000);
    return () => clearTimeout(timer);
  }, [toastMensagem]);

  const carregandoApoios = financiamentoId !== "" && apoiosCarregadosPara !== financiamentoId;
  const apoiosVisiveis = financiamentoId ? apoios : [];

  const financiamentoSelecionado = financiamentos.find(
    (f) => String(f.idFinanciamento) === financiamentoId,
  );

  const valorTotal = financiamentoSelecionado?.valorTotal ?? 0;
  const valorDistribuido = apoiosVisiveis.reduce((acc, a) => acc + a.valorDestinado, 0);
  const valorDisponivel = Math.max(0, valorTotal - valorDistribuido);
  const percentualDistribuido =
    valorTotal > 0 ? Math.min(100, (valorDistribuido / valorTotal) * 100) : 0;

  const valorExibido =
    tipoVinculo === "Total" && financiamentoSelecionado
      ? numeroParaMoedaInput(financiamentoSelecionado.valorTotal)
      : valorInput;

  const valorDestinadoNumero =
    tipoVinculo === "Total" && financiamentoSelecionado
      ? financiamentoSelecionado.valorTotal
      : parseMoedaInput(valorInput);

  const bloqueioVinculoTotal =
    tipoVinculo === "Total" &&
    financiamentoId !== "" &&
    !carregandoApoios &&
    valorDistribuido > 0;

  const projetoJaVinculado =
    projetoCodigo !== "" &&
    financiamentoId !== "" &&
    !carregandoApoios &&
    apoiosVisiveis.some((a) => a.projetoCodigo === projetoCodigo);

  let erroValor: string | null = null;
  if (financiamentoSelecionado && tipoVinculo === "Parcial" && (valorTocado || valorInput !== "")) {
    if (valorDestinadoNumero <= 0) {
      erroValor = "Informe um valor destinado maior que R$ 0,00.";
    } else if (valorDestinadoNumero > valorDisponivel + 0.001) {
      erroValor = `O valor excede o saldo disponível (${formatarMoeda(valorDisponivel)}).`;
    }
  }

  const saldoAposVinculo =
    financiamentoSelecionado && valorDestinadoNumero > 0 && valorDestinadoNumero <= valorDisponivel + 0.001
      ? Math.max(0, valorDisponivel - valorDestinadoNumero)
      : null;

  const formularioValido =
    financiamentoSelecionado !== undefined &&
    projetoCodigo !== "" &&
    !carregandoApoios &&
    !bloqueioVinculoTotal &&
    !projetoJaVinculado &&
    valorDestinadoNumero > 0 &&
    valorDestinadoNumero <= valorDisponivel + 0.001;

  function selecionarFinanciamento(novoId: string) {
    setFinanciamentoId(novoId);
    setErroEnvio(null);
    setErroApoios(null);
  }

  function limparCampos() {
    setProjetoCodigo("");
    setTipoVinculo("Parcial");
    setValorInput("");
    setValorTocado(false);
    setErroEnvio(null);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setValorTocado(true);
    if (!formularioValido || !financiamentoSelecionado) return;

    setErroEnvio(null);
    setSalvando(true);

    try {
      const novo = await financiamentosService.vincularProjeto({
        idFinanciamento: financiamentoSelecionado.idFinanciamento,
        projetoCodigo,
        tipoVinculo,
        valorDestinado: valorDestinadoNumero,
      });
      setApoios((prev) => [...prev, novo]);
      limparCampos();
      setToastMensagem("Financiamento vinculado ao projeto");
    } catch (err) {
      setErroEnvio(
        err instanceof Error ? err.message : "Não foi possível vincular o financiamento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function remover(apoio: ApoioFinanceiro) {
    if (!financiamentoSelecionado) return;
    if (
      !window.confirm(
        `Remover o vínculo do financiamento ${financiamentoSelecionado.numeroProcesso || `#${financiamentoSelecionado.idFinanciamento}`} com o projeto ${apoio.projetoCodigo}?`,
      )
    ) {
      return;
    }

    setRemovendoCodigo(apoio.projetoCodigo);
    setErroApoios(null);
    try {
      await financiamentosService.removerVinculo(
        financiamentoSelecionado.idFinanciamento,
        apoio.projetoCodigo,
      );
      setApoios((prev) => prev.filter((a) => a.projetoCodigo !== apoio.projetoCodigo));
      setToastMensagem("Vínculo financeiro removido do projeto");
    } catch {
      setErroApoios("Não foi possível remover o vínculo do projeto.");
    } finally {
      setRemovendoCodigo(null);
    }
  }

  const tituloDe = (codigo: string, fallback?: string) =>
    fallback ?? projetos.find((p) => p.codigo === codigo)?.titulo ?? codigo;

  const rotulo = "mb-1 block text-sm font-medium text-slate-900";
  const classeErro = "border-red-500 focus:border-red-500 focus:ring-red-100";

  return (
    <PaginaSistema
      titulo="Vincular Financiamento"
      breadcrumb={[
        { rotulo: "Início", href: "/" },
        { rotulo: "Financiamentos", href: "/financiamentos" },
        { rotulo: "Vincular ao projeto" },
      ]}
      acoes={
        <>
          <Link href="/financiamentos" className={btnContorno}>
            Voltar para financiamentos
          </Link>
          <Link href="/financiamentos/novo" className={btnPrimario}>
            <Icon nome="plus" className="h-4 w-4" /> Novo financiamento
          </Link>
        </>
      }
    >
      {erroCarga && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {erroCarga}
        </p>
      )}

      {/* Bloco superior: Formulário + Card lateral Saldo do financiamento */}
      <div className="grid items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <form
          onSubmit={salvar}
          noValidate
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Vincular financiamento ao projeto
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecione o financiamento, o projeto beneficiado e defina o valor destinado.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="financiamento" className={rotulo}>
                Financiamento
              </label>
              <select
                id="financiamento"
                required
                disabled={carregandoDados}
                value={financiamentoId}
                onChange={(e) => selecionarFinanciamento(e.target.value)}
                className={inputBase}
              >
                <option value="">
                  {carregandoDados ? "Carregando financiamentos..." : "Selecione um financiamento"}
                </option>
                {financiamentos.map((f) => (
                  <option key={f.idFinanciamento} value={String(f.idFinanciamento)}>
                    {f.agenciaFinanciadora} ·{" "}
                    {f.numeroProcesso ? `Proc. ${f.numeroProcesso}` : `#${f.idFinanciamento}`} (
                    {f.tipoFomento} — {formatarMoeda(f.valorTotal)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="projeto" className={rotulo}>
                Projeto
              </label>
              <select
                id="projeto"
                required
                disabled={carregandoDados}
                value={projetoCodigo}
                onChange={(e) => {
                  setProjetoCodigo(e.target.value);
                  setErroEnvio(null);
                }}
                className={inputBase}
              >
                <option value="">
                  {carregandoDados ? "Carregando projetos..." : "Selecione um projeto"}
                </option>
                {projetos.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.codigo} — {p.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className={rotulo}>Tipo de vínculo</legend>
                <div className="mt-1 flex gap-3">
                  {TIPOS_VINCULO.map((opcao) => {
                    const selecionado = tipoVinculo === opcao;
                    return (
                      <label
                        key={opcao}
                        className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          selecionado
                            ? "border-sgpp-600 bg-sgpp-50 text-sgpp-800"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipoVinculo"
                          value={opcao}
                          checked={selecionado}
                          onChange={() => {
                            setTipoVinculo(opcao);
                            setErroEnvio(null);
                          }}
                          className="accent-sgpp-700"
                        />
                        {opcao}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="valorDestinado" className={rotulo}>
                  Valor destinado ao projeto (R$)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-slate-500">
                    R$
                  </span>
                  <input
                    id="valorDestinado"
                    type="text"
                    inputMode="numeric"
                    required
                    readOnly={tipoVinculo === "Total"}
                    disabled={!financiamentoSelecionado}
                    value={valorExibido}
                    onChange={(e) => {
                      setValorInput(formatarMoedaInput(e.target.value));
                      setErroEnvio(null);
                    }}
                    onBlur={() => setValorTocado(true)}
                    placeholder="0,00"
                    aria-invalid={erroValor ? true : undefined}
                    aria-describedby={erroValor ? "erro-valorDestinado" : undefined}
                    className={`${inputBase} pl-10 ${
                      tipoVinculo === "Total" ? "bg-slate-100 text-slate-700" : ""
                    } ${erroValor ? classeErro : ""}`}
                  />
                </div>
                {erroValor && (
                  <p id="erro-valorDestinado" className="mt-1 text-xs text-red-600">
                    {erroValor}
                  </p>
                )}
              </div>
            </div>
          </div>

          {bloqueioVinculoTotal && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-3.5 text-sm text-red-800"
            >
              <Icon nome="alert" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <p>
                Este financiamento já possui {formatarMoeda(valorDistribuido)} distribuídos. Escolha{" "}
                <strong>Parcial</strong> para destinar parte do saldo restante.
              </p>
            </div>
          )}

          {projetoJaVinculado && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              O projeto selecionado já possui vínculo com este financiamento.
            </p>
          )}

          {erroEnvio && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {erroEnvio}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={limparCampos} className={btnSecundario}>
              Limpar
            </button>
            <button type="submit" disabled={!formularioValido || salvando} className={btnPrimario}>
              <Icon nome="plus" className="h-4 w-4" />
              {salvando ? "Vinculando..." : "Vincular financiamento"}
            </button>
          </div>
        </form>

        {/* Card lateral: Saldo do financiamento */}
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-semibold text-slate-900">Saldo do financiamento</h2>
            <Icon nome="card" className="h-5 w-5 text-sgpp-700" />
          </div>

          {!financiamentoSelecionado ? (
            <p className="py-4 text-sm text-slate-500">
              Selecione um financiamento para visualizar os valores totais, já distribuídos e o saldo
              disponível.
            </p>
          ) : carregandoApoios ? (
            <p className="py-4 text-sm text-slate-500">Calculando saldo...</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">
                  {financiamentoSelecionado.agenciaFinanciadora} —{" "}
                  {financiamentoSelecionado.tipoFomento}
                </p>
                <p className="mt-0.5">
                  {financiamentoSelecionado.numeroProcesso
                    ? `Proc. ${financiamentoSelecionado.numeroProcesso}`
                    : `Financiamento #${financiamentoSelecionado.idFinanciamento}`}
                </p>
                <p className="mt-0.5">
                  Vigência: {formatarData(financiamentoSelecionado.dataInicio)} a{" "}
                  {formatarData(financiamentoSelecionado.dataFim)}
                </p>
              </div>

              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Valor total</dt>
                  <dd className="font-semibold text-slate-900">{formatarMoeda(valorTotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Valor já distribuído</dt>
                  <dd className="font-semibold text-blue-700">{formatarMoeda(valorDistribuido)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                  <dt className="font-medium text-slate-800">Valor disponível</dt>
                  <dd
                    className={`font-bold ${
                      valorDisponivel > 0 ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {formatarMoeda(valorDisponivel)}
                  </dd>
                </div>
              </dl>

              {/* Barra de progresso percentual */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700">
                  <span>Percentual distribuído</span>
                  <span>{percentualDistribuido.toFixed(1).replace(".", ",")}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Percentual distribuído do financiamento"
                  aria-valuenow={Math.round(percentualDistribuido)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percentualDistribuido >= 100 ? "bg-emerald-600" : "bg-blue-600"
                    }`}
                    style={{ width: `${percentualDistribuido}%` }}
                  />
                </div>
              </div>

              {saldoAposVinculo !== null && (
                <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  Saldo restante após este vínculo: <strong>{formatarMoeda(saldoAposVinculo)}</strong>
                </p>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Tabela inferior: Projetos apoiados por este financiamento */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Projetos apoiados por este financiamento
            </h2>
            {financiamentoSelecionado && (
              <p className="text-sm text-slate-500">
                {financiamentoSelecionado.agenciaFinanciadora} ·{" "}
                {financiamentoSelecionado.numeroProcesso
                  ? `Proc. ${financiamentoSelecionado.numeroProcesso}`
                  : `#${financiamentoSelecionado.idFinanciamento}`}
              </p>
            )}
          </div>
          {financiamentoSelecionado && !carregandoApoios && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {apoiosVisiveis.length}{" "}
              {apoiosVisiveis.length === 1 ? "projeto apoiado" : "projetos apoiados"}
            </span>
          )}
        </div>

        {erroApoios && (
          <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {erroApoios}
          </p>
        )}

        {!financiamentoId ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Selecione um financiamento acima para visualizar os projetos vinculados.
          </p>
        ) : carregandoApoios ? (
          <p className="py-6 text-sm text-slate-500">Carregando projetos apoiados...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">Código</th>
                  <th className="px-3 py-2 font-semibold">Projeto</th>
                  <th className="px-3 py-2 font-semibold">Tipo de vínculo</th>
                  <th className="px-3 py-2 font-semibold">Valor destinado</th>
                  <th className="px-3 py-2 font-semibold">% do total</th>
                  <th className="px-3 py-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {apoiosVisiveis.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                      Nenhum projeto vinculado a este financiamento ainda.
                    </td>
                  </tr>
                )}
                {apoiosVisiveis.map((a) => {
                  const pct = valorTotal > 0 ? (a.valorDestinado / valorTotal) * 100 : 0;
                  return (
                    <tr
                      key={`${a.idFinanciamento}-${a.projetoCodigo}`}
                      className="border-b border-slate-100 even:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <Link
                          href={`/projetos/${encodeURIComponent(a.projetoCodigo)}`}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {a.projetoCodigo}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-slate-900">
                        {tituloDe(a.projetoCodigo, a.projetoTitulo)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            a.tipoVinculo === "Total"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {a.tipoVinculo}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-900">
                        {formatarMoeda(a.valorDestinado)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                        {pct.toFixed(1).replace(".", ",")}%
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          disabled={removendoCodigo === a.projetoCodigo}
                          onClick={() => remover(a)}
                          aria-label={`Remover vínculo de ${a.projetoCodigo}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        >
                          <Icon nome="trash" className="h-4 w-4" />
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {toastMensagem && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg"
        >
          <Icon nome="checkCircle" className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{toastMensagem}</span>
          <button
            type="button"
            onClick={() => setToastMensagem(null)}
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
