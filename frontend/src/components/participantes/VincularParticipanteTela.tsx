"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import PaginaSistema from "@/components/layout/PaginaSistema";
import { btnContorno, btnPrimario, btnSecundario, inputBase } from "@/components/ui/Botoes";
import Icon from "@/components/ui/Icon";
import { formatarData } from "@/lib/format";
import { formatarCpf, somenteDigitos } from "@/lib/validacao";
import { participantesService, type Participante } from "@/services/participanteServices";
import { projetosService, type Projeto } from "@/services/projetoServices";
import {
  FUNCOES_EQUIPE,
  vinculosService,
  type EquipeMembro,
} from "@/services/vinculoServices";

const ESTILO_FUNCAO: Record<string, string> = {
  coordenador: "bg-blue-100 text-blue-800",
  bolsista: "bg-emerald-100 text-emerald-800",
  colaborador: "bg-purple-100 text-purple-800",
  "apoio técnico": "bg-amber-100 text-amber-800",
  "apoio tecnico": "bg-amber-100 text-amber-800",
};

/** Lê ?projeto= da URL (ex.: vindo dos detalhes de um projeto) e inicializa a seleção. */
export default function VincularParticipanteTela() {
  const projetoInicial = useSearchParams().get("projeto") ?? "";
  return <VincularParticipanteInterna key={projetoInicial} projetoInicial={projetoInicial} />;
}

function VincularParticipanteInterna({ projetoInicial }: { projetoInicial: string }) {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const [projetoCodigo, setProjetoCodigo] = useState(projetoInicial);
  const [participanteCpf, setParticipanteCpf] = useState("");
  const [funcao, setFuncao] = useState("");
  const [dataEntrada, setDataEntrada] = useState("");
  const [dataSaida, setDataSaida] = useState("");

  const [equipe, setEquipe] = useState<EquipeMembro[]>([]);
  const [equipeCarregadaPara, setEquipeCarregadaPara] = useState<string | null>(null);
  const [erroEquipe, setErroEquipe] = useState<string | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [removendoCpf, setRemovendoCpf] = useState<string | null>(null);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([projetosService.listar(), participantesService.listar()])
      .then(([listaProjetos, listaParticipantes]) => {
        if (!ativo) return;
        setProjetos(listaProjetos);
        setParticipantes(listaParticipantes);
        setErroCarga(null);
      })
      .catch(() => {
        if (ativo) setErroCarga("Não foi possível carregar projetos e participantes.");
      })
      .finally(() => {
        if (ativo) setCarregandoDados(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!projetoCodigo) return;
    let ativo = true;
    vinculosService
      .listarEquipe(projetoCodigo)
      .then((membros) => {
        if (!ativo) return;
        setEquipe(membros);
        setEquipeCarregadaPara(projetoCodigo);
        setErroEquipe(null);
      })
      .catch(() => {
        if (!ativo) return;
        setEquipe([]);
        setEquipeCarregadaPara(projetoCodigo);
        setErroEquipe("Não foi possível carregar os vínculos do projeto selecionado.");
      });

    return () => {
      ativo = false;
    };
  }, [projetoCodigo]);

  useEffect(() => {
    if (!toastMensagem) return;
    const timer = setTimeout(() => setToastMensagem(null), 5000);
    return () => clearTimeout(timer);
  }, [toastMensagem]);

  const carregandoEquipe = projetoCodigo !== "" && equipeCarregadaPara !== projetoCodigo;
  const equipeVisivel = projetoCodigo ? equipe : [];

  // RN01: apenas um coordenador principal ativo por projeto
  const projetoJaTemCoordenador =
    projetoCodigo !== "" &&
    !carregandoEquipe &&
    equipeVisivel.some((m) => m.funcao.trim().toLowerCase() === "coordenador");

  const bloqueioCoordenacao = funcao === "Coordenador" && projetoJaTemCoordenador;

  const participanteJaVinculado =
    participanteCpf !== "" &&
    !carregandoEquipe &&
    equipeVisivel.some((m) => somenteDigitos(m.cpf) === somenteDigitos(participanteCpf));

  const erroData =
    dataSaida && dataEntrada && dataSaida < dataEntrada
      ? "A data de saída não pode ser anterior à data de entrada."
      : null;

  const formularioValido =
    projetoCodigo !== "" &&
    participanteCpf !== "" &&
    funcao !== "" &&
    dataEntrada !== "" &&
    !erroData &&
    !bloqueioCoordenacao &&
    !participanteJaVinculado &&
    !carregandoEquipe;

  function selecionarProjeto(novoCodigo: string) {
    setProjetoCodigo(novoCodigo);
    setErroEnvio(null);
    setErroEquipe(null);
  }

  function limparCamposVinculo() {
    setParticipanteCpf("");
    setFuncao("");
    setDataEntrada("");
    setDataSaida("");
    setErroEnvio(null);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido) return;

    setErroEnvio(null);
    setSalvando(true);

    try {
      const novoMembro = await vinculosService.vincularParticipante(projetoCodigo, {
        participanteCpf,
        funcao,
        dataEntrada,
        dataSaida: dataSaida || null,
      });
      setEquipe((prev) => [...prev, novoMembro]);
      limparCamposVinculo();
      setToastMensagem("Participante vinculado ao projeto");
    } catch (err) {
      setErroEnvio(
        err instanceof Error ? err.message : "Não foi possível vincular o participante.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function remover(membro: EquipeMembro) {
    if (!projetoCodigo) return;
    if (
      !window.confirm(
        `Remover "${membro.nome}" (${membro.funcao}) da equipe do projeto ${projetoCodigo}?`,
      )
    ) {
      return;
    }

    setRemovendoCpf(membro.cpf);
    setErroEquipe(null);
    try {
      await vinculosService.removerParticipante(projetoCodigo, membro.cpf);
      const alvo = somenteDigitos(membro.cpf);
      setEquipe((prev) => prev.filter((m) => somenteDigitos(m.cpf) !== alvo));
      setToastMensagem("Vínculo removido do projeto");
    } catch {
      setErroEquipe("Não foi possível remover o vínculo do participante.");
    } finally {
      setRemovendoCpf(null);
    }
  }

  const projetoSelecionado = projetos.find((p) => p.codigo === projetoCodigo);
  const rotulo = "mb-1 block text-sm font-medium text-slate-900";

  return (
    <PaginaSistema
      titulo="Vincular Participantes"
      breadcrumb={[
        { rotulo: "Início", href: "/dashboard" },
        { rotulo: "Participantes", href: "/participantes" },
        { rotulo: "Vincular ao projeto" },
      ]}
      acoes={
        <Link href="/participantes" className={btnContorno}>
          Voltar para participantes
        </Link>
      }
    >
      {erroCarga && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {erroCarga}
        </p>
      )}

      {/* Formulário superior de alocação */}
      <form
        onSubmit={salvar}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Vincular participante ao projeto</h2>
          <p className="mt-1 text-sm text-slate-500">
            Selecione o projeto, o participante e sua função na equipe de pesquisa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="projeto" className={rotulo}>
              Projeto
            </label>
            <select
              id="projeto"
              required
              disabled={carregandoDados}
              value={projetoCodigo}
              onChange={(e) => selecionarProjeto(e.target.value)}
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

          <div>
            <label htmlFor="participante" className={rotulo}>
              Participante
            </label>
            <select
              id="participante"
              required
              disabled={carregandoDados}
              value={participanteCpf}
              onChange={(e) => {
                setParticipanteCpf(e.target.value);
                setErroEnvio(null);
              }}
              className={inputBase}
            >
              <option value="">
                {carregandoDados ? "Carregando participantes..." : "Selecione um participante"}
              </option>
              {participantes.map((p) => (
                <option key={p.cpf} value={p.cpf}>
                  {p.nome} ({p.tipo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="funcao" className={rotulo}>
              Função
            </label>
            <select
              id="funcao"
              required
              value={funcao}
              onChange={(e) => {
                setFuncao(e.target.value);
                setErroEnvio(null);
              }}
              aria-invalid={bloqueioCoordenacao ? true : undefined}
              className={`${inputBase} ${
                bloqueioCoordenacao ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
              }`}
            >
              <option value="">Selecione a função</option>
              {FUNCOES_EQUIPE.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dataEntrada" className={rotulo}>
                Data de entrada
              </label>
              <input
                id="dataEntrada"
                type="date"
                required
                value={dataEntrada}
                onChange={(e) => setDataEntrada(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <label htmlFor="dataSaida" className={rotulo}>
                Data de saída <span className="font-normal text-slate-500">(opcional)</span>
              </label>
              <input
                id="dataSaida"
                type="date"
                value={dataSaida}
                onChange={(e) => setDataSaida(e.target.value)}
                aria-invalid={erroData ? true : undefined}
                aria-describedby={erroData ? "erro-dataSaida" : undefined}
                className={`${inputBase} ${
                  erroData ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""
                }`}
              />
              {erroData && (
                <p id="erro-dataSaida" className="mt-1 text-xs text-red-600">
                  {erroData}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Alerta de bloqueio RN01 */}
        {bloqueioCoordenacao && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            <Icon nome="alert" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="font-medium">
              VALIDAÇÃO DE COORDENAÇÃO: Este projeto já possui um coordenador principal. Escolha
              outra função.
            </p>
          </div>
        )}

        {participanteJaVinculado && (
          <p role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Este participante já faz parte da equipe do projeto selecionado.
          </p>
        )}

        {erroEnvio && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroEnvio}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={limparCamposVinculo} className={btnSecundario}>
            Limpar
          </button>
          <button type="submit" disabled={!formularioValido || salvando} className={btnPrimario}>
            <Icon nome="plus" className="h-4 w-4" />
            {salvando ? "Vinculando..." : "Vincular participante"}
          </button>
        </div>
      </form>

      {/* Tabela inferior: Vínculos do projeto selecionado */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Vínculos do projeto selecionado
            </h2>
            {projetoSelecionado && (
              <p className="text-sm text-slate-500">
                {projetoSelecionado.codigo} — {projetoSelecionado.titulo}
              </p>
            )}
          </div>
          {projetoCodigo && !carregandoEquipe && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {equipeVisivel.length}{" "}
              {equipeVisivel.length === 1 ? "participante ativo" : "participantes ativos"}
            </span>
          )}
        </div>

        {erroEquipe && (
          <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {erroEquipe}
          </p>
        )}

        {!projetoCodigo ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Selecione um projeto no formulário acima para visualizar ou gerenciar sua equipe.
          </p>
        ) : carregandoEquipe ? (
          <p className="py-6 text-sm text-slate-500">Carregando vínculos do projeto...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">Participante</th>
                  <th className="px-3 py-2 font-semibold">CPF</th>
                  <th className="px-3 py-2 font-semibold">Tipo</th>
                  <th className="px-3 py-2 font-semibold">Função</th>
                  <th className="px-3 py-2 font-semibold">Data de entrada</th>
                  <th className="px-3 py-2 font-semibold">Data de saída</th>
                  <th className="px-3 py-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {equipeVisivel.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                      Nenhum participante vinculado a este projeto.
                    </td>
                  </tr>
                )}
                {equipeVisivel.map((m) => {
                  const estiloFuncao =
                    ESTILO_FUNCAO[m.funcao.toLowerCase()] ?? "bg-slate-100 text-slate-700";
                  return (
                    <tr key={m.cpf} className="border-b border-slate-100 even:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-900">{m.nome}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                        {formatarCpf(m.cpf)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">{m.tipo}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${estiloFuncao}`}
                        >
                          {m.funcao}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        {formatarData(m.dataEntrada)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        {formatarData(m.dataSaida)}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          disabled={removendoCpf === m.cpf}
                          onClick={() => remover(m)}
                          aria-label={`Remover ${m.nome}`}
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
