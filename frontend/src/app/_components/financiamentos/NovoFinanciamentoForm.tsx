"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import PaginaSistema from "@/app/_components/layout/PaginaSistema";
import { btnContorno, btnPrimario, btnSecundario, inputBase } from "@/app/_components/ui/Botoes";
import Icon from "@/app/_components/ui/Icon";
import { formatarMoeda } from "@/lib/format";
import { formatarMoedaInput, parseMoedaInput } from "@/lib/validacao";
import {
  AGENCIAS_FINANCIADORAS,
  financiamentosService,
  TIPOS_FOMENTO,
  type Financiamento,
} from "@/services/financiamentoServices";

export default function NovoFinanciamentoForm() {
  const [agenciaFinanciadora, setAgenciaFinanciadora] = useState<string>(AGENCIAS_FINANCIADORAS[0]);
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [tipoFomento, setTipoFomento] = useState<string>(TIPOS_FOMENTO[0]);
  const [valorInput, setValorInput] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [tocado, setTocado] = useState({
    numeroProcesso: false,
    valor: false,
    dataInicio: false,
    dataFim: false,
  });

  const [existentes, setExistentes] = useState<Financiamento[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [ultimoCriado, setUltimoCriado] = useState<Financiamento | null>(null);

  useEffect(() => {
    let ativo = true;
    financiamentosService
      .listar()
      .then((dados) => ativo && setExistentes(dados))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!ultimoCriado) return;
    const timer = setTimeout(() => setUltimoCriado(null), 6000);
    return () => clearTimeout(timer);
  }, [ultimoCriado]);

  // RNF06: validações em tempo real
  const processoTrim = numeroProcesso.trim();
  const processoDuplicado =
    processoTrim.length >= 3 &&
    existentes.some(
      (f) => (f.numeroProcesso ?? "").trim().toLowerCase() === processoTrim.toLowerCase(),
    );

  let erroProcesso: string | null = null;
  if (processoDuplicado) {
    erroProcesso = "Já existe um financiamento cadastrado com este número de processo.";
  } else if (processoTrim.length > 0 && processoTrim.length < 3) {
    erroProcesso = "Informe pelo menos 3 caracteres para o número do processo.";
  }

  const valorNumero = parseMoedaInput(valorInput);
  const erroValor =
    (tocado.valor || valorInput.length > 0) && valorNumero <= 0
      ? "Informe um valor total maior que R$ 0,00."
      : null;

  const erroDataInicio =
    tocado.dataInicio && !dataInicio ? "Informe a data de início da vigência." : null;

  let erroDataFim: string | null = null;
  if (dataInicio && dataFim && dataFim <= dataInicio) {
    erroDataFim = "A data de fim da vigência deve ser posterior à data de início.";
  } else if (tocado.dataFim && !dataFim) {
    erroDataFim = "Informe a data de fim da vigência.";
  }

  const formularioValido =
    agenciaFinanciadora !== "" &&
    !erroProcesso &&
    !processoDuplicado &&
    tipoFomento !== "" &&
    valorNumero > 0 &&
    dataInicio !== "" &&
    dataFim !== "" &&
    dataFim > dataInicio;

  function limparFormulario() {
    setAgenciaFinanciadora(AGENCIAS_FINANCIADORAS[0]);
    setNumeroProcesso("");
    setTipoFomento(TIPOS_FOMENTO[0]);
    setValorInput("");
    setDataInicio("");
    setDataFim("");
    setTocado({ numeroProcesso: false, valor: false, dataInicio: false, dataFim: false });
    setErroEnvio(null);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setTocado({ numeroProcesso: true, valor: true, dataInicio: true, dataFim: true });
    if (!formularioValido) return;

    setErroEnvio(null);
    setSalvando(true);

    try {
      const novo = await financiamentosService.criar({
        agenciaFinanciadora,
        numeroProcesso: processoTrim,
        tipoFomento,
        valorTotal: valorNumero,
        dataInicio,
        dataFim,
      });
      setExistentes((prev) => [novo, ...prev]);
      limparFormulario();
      setUltimoCriado(novo);
    } catch (err) {
      setErroEnvio(
        err instanceof Error ? err.message : "Não foi possível cadastrar o financiamento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const rotulo = "mb-1 block text-sm font-medium text-slate-900";
  const classeErro = "border-red-500 focus:border-red-500 focus:ring-red-100";

  return (
    <PaginaSistema
      titulo="Cadastrar Financiamento"
      breadcrumb={[
        { rotulo: "Início", href: "/" },
        { rotulo: "Financiamentos", href: "/financiamentos" },
        { rotulo: "Novo financiamento" },
      ]}
      acoes={
        <Link href="/financiamentos" className={btnContorno}>
          Voltar para financiamentos
        </Link>
      }
    >
      <form
        onSubmit={salvar}
        noValidate
        className="mx-auto w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Novo financiamento</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre o edital ou termo de outorga antes de distribuir os recursos para os projetos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="agencia" className={rotulo}>
              Agência financiadora
            </label>
            <select
              id="agencia"
              required
              value={agenciaFinanciadora}
              onChange={(e) => setAgenciaFinanciadora(e.target.value)}
              className={inputBase}
            >
              {AGENCIAS_FINANCIADORAS.map((ag) => (
                <option key={ag} value={ag}>
                  {ag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="numeroProcesso" className={rotulo}>
              Número do processo (opcional)
            </label>
            <input
              id="numeroProcesso"
              type="text"
              maxLength={60}
              value={numeroProcesso}
              onChange={(e) => setNumeroProcesso(e.target.value)}
              onBlur={() => setTocado((prev) => ({ ...prev, numeroProcesso: true }))}
              placeholder="Ex.: 405123/2026-0"
              aria-invalid={erroProcesso ? true : undefined}
              aria-describedby={erroProcesso ? "erro-processo" : undefined}
              className={`${inputBase} ${erroProcesso ? classeErro : ""}`}
            />
            {erroProcesso && (
              <p id="erro-processo" className="mt-1 text-xs text-red-600">
                {erroProcesso}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tipoFomento" className={rotulo}>
              Tipo de fomento
            </label>
            <select
              id="tipoFomento"
              required
              value={tipoFomento}
              onChange={(e) => setTipoFomento(e.target.value)}
              className={inputBase}
            >
              {TIPOS_FOMENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="valorTotal" className={rotulo}>
              Valor total (R$)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-slate-500">
                R$
              </span>
              <input
                id="valorTotal"
                type="text"
                inputMode="numeric"
                required
                value={valorInput}
                onChange={(e) => setValorInput(formatarMoedaInput(e.target.value))}
                onBlur={() => setTocado((prev) => ({ ...prev, valor: true }))}
                placeholder="0,00"
                aria-invalid={erroValor ? true : undefined}
                aria-describedby={erroValor ? "erro-valor" : undefined}
                className={`${inputBase} pl-10 ${erroValor ? classeErro : ""}`}
              />
            </div>
            {erroValor && (
              <p id="erro-valor" className="mt-1 text-xs text-red-600">
                {erroValor}
              </p>
            )}
            {!erroValor && valorNumero > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Valor informado: {formatarMoeda(valorNumero)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="dataInicio" className={rotulo}>
              Início da vigência
            </label>
            <input
              id="dataInicio"
              type="date"
              required
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              onBlur={() => setTocado((prev) => ({ ...prev, dataInicio: true }))}
              aria-invalid={erroDataInicio ? true : undefined}
              aria-describedby={erroDataInicio ? "erro-dataInicio" : undefined}
              className={`${inputBase} ${erroDataInicio ? classeErro : ""}`}
            />
            {erroDataInicio && (
              <p id="erro-dataInicio" className="mt-1 text-xs text-red-600">
                {erroDataInicio}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="dataFim" className={rotulo}>
              Fim da vigência
            </label>
            <input
              id="dataFim"
              type="date"
              required
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              onBlur={() => setTocado((prev) => ({ ...prev, dataFim: true }))}
              aria-invalid={erroDataFim ? true : undefined}
              aria-describedby={erroDataFim ? "erro-dataFim" : undefined}
              className={`${inputBase} ${erroDataFim ? classeErro : ""}`}
            />
            {erroDataFim && (
              <p id="erro-dataFim" className="mt-1 text-xs text-red-600">
                {erroDataFim}
              </p>
            )}
          </div>
        </div>

        {erroEnvio && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroEnvio}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={limparFormulario} className={btnSecundario}>
            Limpar
          </button>
          <button type="submit" disabled={!formularioValido || salvando} className={btnPrimario}>
            <Icon nome="plus" className="h-4 w-4" />
            {salvando ? "Cadastrando..." : "Cadastrar financiamento"}
          </button>
        </div>
      </form>

      {ultimoCriado && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg"
        >
          <Icon nome="checkCircle" className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>Financiamento cadastrado com sucesso</span>
          <Link
            href={`/financiamentos/vincular?financiamento=${ultimoCriado.idFinanciamento}`}
            className="ml-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Vincular a projeto
          </Link>
          <button
            type="button"
            onClick={() => setUltimoCriado(null)}
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
