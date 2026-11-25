"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import PaginaSistema from "@/app/_components/layout/PaginaSistema";
import { btnContorno, btnPrimario, btnSecundario, inputBase } from "@/app/_components/ui/Botoes";
import Icon from "@/app/_components/ui/Icon";
import { formatarCpf, somenteDigitos } from "@/lib/validacao";
import { participantesService, type Participante } from "@/services/participanteServices";
import { producoesService, type ProducaoCientifica } from "@/services/producaoServices";
import { projetosService, type Projeto } from "@/services/projetoServices";

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Lê ?producao= e ?projeto= da URL para pré-seleção. */
export default function VincularProducaoTela() {
  const params = useSearchParams();
  const prodInicial = params.get("producao") ?? "";
  const projInicial = params.get("projeto") ?? "";

  return (
    <VincularProducaoInterna
      key={`${prodInicial}-${projInicial}`}
      producaoInicial={prodInicial}
      projetoInicial={projInicial}
    />
  );
}

function VincularProducaoInterna({
  producaoInicial,
  projetoInicial,
}: {
  producaoInicial: string;
  projetoInicial: string;
}) {
  const [producoes, setProducoes] = useState<ProducaoCientifica[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const [producaoId, setProducaoId] = useState(producaoInicial);
  const [projetoCodigo, setProjetoCodigo] = useState(projetoInicial);
  const [autoresCpfs, setAutoresCpfs] = useState<string[]>([]);
  const [buscaAutor, setBuscaAutor] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([
      producoesService.listar(),
      projetosService.listar(),
      participantesService.listar(),
    ])
      .then(([listaProducoes, listaProjetos, listaParticipantes]) => {
        if (!ativo) return;
        setProducoes(listaProducoes);
        setProjetos(listaProjetos);
        setParticipantes(listaParticipantes);
        setErroCarga(null);

        if (producaoInicial) {
          const encontrada = listaProducoes.find((p) => String(p.id) === producaoInicial);
          if (encontrada) {
            setAutoresCpfs(encontrada.autores.map((a) => a.cpf));
            if (!projetoInicial && encontrada.projetoCodigo) {
              setProjetoCodigo(encontrada.projetoCodigo);
            }
          }
        }
      })
      .catch(() => {
        if (ativo) {
          setErroCarga("Não foi possível carregar produções, projetos e participantes.");
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [producaoInicial, projetoInicial]);

  useEffect(() => {
    if (!toastMensagem) return;
    const timer = setTimeout(() => setToastMensagem(null), 5000);
    return () => clearTimeout(timer);
  }, [toastMensagem]);

  const producaoSelecionada = producoes.find((p) => String(p.id) === producaoId);

  const autoresSelecionados = useMemo(() => {
    const mapa = new Map(participantes.map((p) => [somenteDigitos(p.cpf), p]));
    return autoresCpfs
      .map((cpf) => mapa.get(somenteDigitos(cpf)))
      .filter((p): p is Participante => p !== undefined);
  }, [autoresCpfs, participantes]);

  const participantesFiltrados = useMemo(() => {
    const termo = normalizar(buscaAutor.trim());
    const termoDigitos = somenteDigitos(buscaAutor);
    if (!termo) return participantes;

    return participantes.filter((p) => {
      const bateTexto = normalizar(`${p.nome} ${p.email ?? ""} ${p.tipo}`).includes(termo);
      const bateCpf = termoDigitos.length > 0 && somenteDigitos(p.cpf).includes(termoDigitos);
      return bateTexto || bateCpf;
    });
  }, [participantes, buscaAutor]);

  const producoesDoProjeto = useMemo(() => {
    if (!projetoCodigo) return [];
    return producoes.filter((p) => p.projetoCodigo === projetoCodigo);
  }, [producoes, projetoCodigo]);

  function selecionarProducao(novoId: string) {
    setProducaoId(novoId);
    setErroEnvio(null);

    const encontrada = producoes.find((p) => String(p.id) === novoId);
    if (encontrada) {
      setAutoresCpfs(encontrada.autores.map((a) => a.cpf));
      if (encontrada.projetoCodigo) {
        setProjetoCodigo(encontrada.projetoCodigo);
      }
    } else {
      setAutoresCpfs([]);
    }
  }

  function alternarAutor(cpf: string) {
    const alvo = somenteDigitos(cpf);
    setErroEnvio(null);
    setAutoresCpfs((prev) => {
      const jaTem = prev.some((item) => somenteDigitos(item) === alvo);
      if (jaTem) {
        return prev.filter((item) => somenteDigitos(item) !== alvo);
      }
      return [...prev, cpf];
    });
  }

  function limparSelecao() {
    setProducaoId("");
    setProjetoCodigo(projetoInicial);
    setAutoresCpfs([]);
    setBuscaAutor("");
    setErroEnvio(null);
  }

  const formularioValido =
    producaoSelecionada !== undefined &&
    projetoCodigo !== "" &&
    autoresSelecionados.length > 0;

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido || !producaoSelecionada) return;

    setErroEnvio(null);
    setSalvando(true);

    try {
      const atualizada = await producoesService.vincular({
        producaoId: producaoSelecionada.id,
        projetoCodigo,
        autoresCpfs: autoresSelecionados.map((a) => a.cpf),
      });

      setProducoes((prev) =>
        prev.map((p) => (p.id === atualizada.id ? atualizada : p)),
      );
      setToastMensagem("Vínculo da produção salvo com sucesso");
    } catch (err) {
      setErroEnvio(
        err instanceof Error ? err.message : "Não foi possível salvar o vínculo da produção.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const rotulo = "mb-1 block text-sm font-medium text-slate-900";

  return (
    <PaginaSistema
      titulo="Vincular Produção Científica"
      breadcrumb={[
        { rotulo: "Início", href: "/" },
        { rotulo: "Produções científicas", href: "/producoes" },
        { rotulo: "Vincular a projeto e autores" },
      ]}
      acoes={
        <>
          <Link href="/producoes" className={btnContorno}>
            Voltar para produções
          </Link>
          <Link href="/producoes/nova" className={btnPrimario}>
            <Icon nome="plus" className="h-4 w-4" /> Nova produção
          </Link>
        </>
      }
    >
      {erroCarga && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {erroCarga}
        </p>
      )}

      <form onSubmit={salvar} className="space-y-5">
        {/* Seção 1. Projeto de origem (UC07) */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">1. Projeto de origem</h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecione a produção científica registrada e associe-a ao projeto de pesquisa correspondente.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="producao" className={rotulo}>
                Produção científica
              </label>
              <select
                id="producao"
                required
                disabled={carregando}
                value={producaoId}
                onChange={(e) => selecionarProducao(e.target.value)}
                className={inputBase}
              >
                <option value="">
                  {carregando ? "Carregando produções..." : "Selecione uma produção"}
                </option>
                {producoes.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.titulo} ({p.tipo} · {p.ano})
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
                disabled={carregando}
                value={projetoCodigo}
                onChange={(e) => {
                  setProjetoCodigo(e.target.value);
                  setErroEnvio(null);
                }}
                className={inputBase}
              >
                <option value="">
                  {carregando ? "Carregando projetos..." : "Selecione um projeto"}
                </option>
                {projetos.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.codigo} — {p.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {producaoSelecionada && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-700">
              <span>
                <strong>Tipo:</strong> {producaoSelecionada.tipo}
              </span>
              <span aria-hidden="true">•</span>
              <span>
                <strong>Ano:</strong> {producaoSelecionada.ano}
              </span>
              <span aria-hidden="true">•</span>
              <span>
                <strong>Meio de divulgação:</strong> {producaoSelecionada.meioDivulgacao}
              </span>
              {producaoSelecionada.projetoCodigo && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="text-blue-700">
                    <strong>Vínculo atual:</strong> {producaoSelecionada.projetoCodigo}
                  </span>
                </>
              )}
            </div>
          )}
        </section>

        {/* Seção 2. Autores (UC08 / RN04) */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">2. Autores</h2>
              <p className="mt-1 text-sm text-slate-500">
                Busque e selecione um ou mais autores dentre os participantes previamente cadastrados (RN04).
              </p>
            </div>
            <Link
              href="/participantes?aba=cadastrar"
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              + Cadastrar participante
            </Link>
          </div>

          {/* Tags / chips dos autores selecionados */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">
                Autores selecionados ({autoresSelecionados.length})
              </span>
              {autoresSelecionados.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAutoresCpfs([])}
                  className="text-xs font-medium text-slate-500 hover:text-red-600"
                >
                  Remover todos
                </button>
              )}
            </div>

            {autoresSelecionados.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Nenhum autor selecionado. Marque pelo menos um participante na lista abaixo.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {autoresSelecionados.map((autor) => (
                  <span
                    key={autor.cpf}
                    className="inline-flex items-center gap-2 rounded-full border border-sgpp-100 bg-sgpp-50 px-3 py-1.5 text-sm font-medium text-sgpp-800"
                  >
                    <span>{autor.nome}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {autor.tipo}
                    </span>
                    <button
                      type="button"
                      onClick={() => alternarAutor(autor.cpf)}
                      aria-label={`Remover autor ${autor.nome}`}
                      className="rounded-full p-0.5 text-sgpp-700 hover:bg-sgpp-100 hover:text-red-700"
                    >
                      <Icon nome="x" className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Busca e seleção múltipla */}
          <div>
            <label htmlFor="busca-autor" className={rotulo}>
              Buscar participante cadastrado
            </label>
            <input
              id="busca-autor"
              type="text"
              value={buscaAutor}
              onChange={(e) => setBuscaAutor(e.target.value)}
              placeholder="Digite o nome, e-mail ou CPF do participante..."
              className={inputBase}
            />
          </div>

          <div className="mt-3 max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
            {carregando ? (
              <p className="p-4 text-sm text-slate-500">Carregando participantes...</p>
            ) : participantesFiltrados.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-500">
                Nenhum participante encontrado para a busca informada.
              </p>
            ) : (
              participantesFiltrados.map((p) => {
                const marcado = autoresCpfs.some(
                  (cpf) => somenteDigitos(cpf) === somenteDigitos(p.cpf),
                );
                return (
                  <label
                    key={p.cpf}
                    className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                      marcado ? "bg-sgpp-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => alternarAutor(p.cpf)}
                        className="h-4 w-4 rounded accent-sgpp-700"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{p.nome}</p>
                        <p className="text-xs text-slate-500">
                          {formatarCpf(p.cpf)}
                          {p.email ? ` · ${p.email}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {p.tipo}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {erroEnvio && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {erroEnvio}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={limparSelecao} className={btnSecundario}>
              Limpar seleção
            </button>
            <button type="submit" disabled={!formularioValido || salvando} className={btnPrimario}>
              {salvando ? "Salvando..." : "Salvar vínculo"}
            </button>
          </div>
        </section>
      </form>

      {/* Tabela resumo das produções vinculadas ao projeto selecionado */}
      {projetoCodigo && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Produções vinculadas ao projeto selecionado
              </h2>
              <p className="text-sm text-slate-500">{projetoCodigo}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {producoesDoProjeto.length}{" "}
              {producoesDoProjeto.length === 1 ? "produção" : "produções"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">Título</th>
                  <th className="px-3 py-2 font-semibold">Tipo</th>
                  <th className="px-3 py-2 font-semibold">Ano</th>
                  <th className="px-3 py-2 font-semibold">Meio</th>
                  <th className="px-3 py-2 font-semibold">Autores</th>
                </tr>
              </thead>
              <tbody>
                {producoesDoProjeto.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      Nenhuma produção vinculada a este projeto ainda.
                    </td>
                  </tr>
                )}
                {producoesDoProjeto.map((prod) => (
                  <tr key={prod.id} className="border-b border-slate-100 even:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-900">{prod.titulo}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{prod.tipo}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{prod.ano}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                      {prod.meioDivulgacao}
                    </td>
                    <td className="px-3 py-2.5">
                      {prod.autores.length === 0 ? (
                        <span className="text-xs text-slate-400">Sem autores</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {prod.autores.map((a) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
