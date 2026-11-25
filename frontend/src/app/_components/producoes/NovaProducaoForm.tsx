"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import PaginaSistema from "@/app/_components/layout/PaginaSistema";
import { btnContorno, btnPrimario, btnSecundario, inputBase } from "@/app/_components/ui/Botoes";
import Icon from "@/app/_components/ui/Icon";
import {
  MEIOS_DIVULGACAO,
  producoesService,
  TIPOS_PRODUCAO,
  type ProducaoCientifica,
} from "@/services/producaoServices";

const ANO_PADRAO = 2026;
const ANO_MINIMO = 1900;
const ANO_MAXIMO = 2031;

export default function NovaProducaoForm() {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<string>(TIPOS_PRODUCAO[0]);
  const [ano, setAno] = useState(String(ANO_PADRAO));
  const [meioDivulgacao, setMeioDivulgacao] = useState<string>(MEIOS_DIVULGACAO[0]);

  const [tocado, setTocado] = useState({
    titulo: false,
    ano: false,
  });

  const [salvando, setSalvando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [ultimaCriada, setUltimaCriada] = useState<ProducaoCientifica | null>(null);

  useEffect(() => {
    if (!ultimaCriada) return;
    const timer = setTimeout(() => setUltimaCriada(null), 6000);
    return () => clearTimeout(timer);
  }, [ultimaCriada]);

  const tituloTrim = titulo.trim();
  const erroTitulo =
    (tocado.titulo || titulo.length > 0) && tituloTrim.length < 5
      ? "Informe o título da produção (mínimo de 5 caracteres)."
      : null;

  const anoNumero = Number(ano);
  const anoValido =
    ano.trim() !== "" &&
    Number.isInteger(anoNumero) &&
    anoNumero >= ANO_MINIMO &&
    anoNumero <= ANO_MAXIMO;

  const erroAno =
    (tocado.ano || ano !== "") && !anoValido
      ? `Informe um ano válido entre ${ANO_MINIMO} e ${ANO_MAXIMO}.`
      : null;

  const formularioValido =
    tituloTrim.length >= 5 && tipo !== "" && anoValido && meioDivulgacao !== "";

  function limparFormulario() {
    setTitulo("");
    setTipo(TIPOS_PRODUCAO[0]);
    setAno(String(ANO_PADRAO));
    setMeioDivulgacao(MEIOS_DIVULGACAO[0]);
    setTocado({ titulo: false, ano: false });
    setErroEnvio(null);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setTocado({ titulo: true, ano: true });
    if (!formularioValido) return;

    setErroEnvio(null);
    setSalvando(true);

    try {
      const nova = await producoesService.criar({
        titulo: tituloTrim,
        tipo,
        ano: anoNumero,
        meioDivulgacao,
      });
      limparFormulario();
      setUltimaCriada(nova);
    } catch (err) {
      setErroEnvio(
        err instanceof Error ? err.message : "Não foi possível cadastrar a produção científica.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const rotulo = "mb-1 block text-sm font-medium text-slate-900";
  const classeErro = "border-red-500 focus:border-red-500 focus:ring-red-100";

  return (
    <PaginaSistema
      titulo="Cadastrar Produção Científica"
      breadcrumb={[
        { rotulo: "Início", href: "/" },
        { rotulo: "Produções científicas", href: "/producoes" },
        { rotulo: "Nova produção" },
      ]}
      acoes={
        <Link href="/producoes" className={btnContorno}>
          Voltar para produções
        </Link>
      }
    >
      <form
        onSubmit={salvar}
        noValidate
        className="mx-auto w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Nova produção científica</h2>
          <p className="mt-1 text-sm text-slate-500">
            Registre a produção acadêmica antes de associá-la ao projeto de origem e autores.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="titulo" className={rotulo}>
              Título da produção
            </label>
            <input
              id="titulo"
              type="text"
              required
              maxLength={255}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onBlur={() => setTocado((prev) => ({ ...prev, titulo: true }))}
              placeholder="Ex.: Análise de dados aplicada ao monitoramento ambiental"
              aria-invalid={erroTitulo ? true : undefined}
              aria-describedby={erroTitulo ? "erro-titulo" : undefined}
              className={`${inputBase} ${erroTitulo ? classeErro : ""}`}
            />
            {erroTitulo && (
              <p id="erro-titulo" className="mt-1 text-xs text-red-600">
                {erroTitulo}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tipo" className={rotulo}>
              Tipo de produção
            </label>
            <select
              id="tipo"
              required
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={inputBase}
            >
              {TIPOS_PRODUCAO.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ano" className={rotulo}>
              Ano de publicação
            </label>
            <input
              id="ano"
              type="number"
              min={ANO_MINIMO}
              max={ANO_MAXIMO}
              required
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              onBlur={() => setTocado((prev) => ({ ...prev, ano: true }))}
              aria-invalid={erroAno ? true : undefined}
              aria-describedby={erroAno ? "erro-ano" : undefined}
              className={`${inputBase} ${erroAno ? classeErro : ""}`}
            />
            {erroAno && (
              <p id="erro-ano" className="mt-1 text-xs text-red-600">
                {erroAno}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="meioDivulgacao" className={rotulo}>
              Meio de divulgação
            </label>
            <select
              id="meioDivulgacao"
              required
              value={meioDivulgacao}
              onChange={(e) => setMeioDivulgacao(e.target.value)}
              className={inputBase}
            >
              {MEIOS_DIVULGACAO.map((meio) => (
                <option key={meio} value={meio}>
                  {meio}
                </option>
              ))}
            </select>
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
            {salvando ? "Cadastrando..." : "Cadastrar produção"}
          </button>
        </div>
      </form>

      {ultimaCriada && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg"
        >
          <Icon nome="checkCircle" className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>Produção científica cadastrada</span>
          <Link
            href={`/producoes/vincular?producao=${ultimaCriada.id}`}
            className="ml-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Vincular a projeto e autores
          </Link>
          <button
            type="button"
            onClick={() => setUltimaCriada(null)}
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
