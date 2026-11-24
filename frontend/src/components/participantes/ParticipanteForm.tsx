"use client";

import { useState, type FormEvent } from "react";
import { btnPrimario, btnSecundario, inputBase } from "@/components/ui/Botoes";
import Icon from "@/components/ui/Icon";
import {
  formatarCpf,
  somenteDigitos,
  validarCpf,
  validarEmailInstitucional,
} from "@/lib/validacao";
import {
  participantesService,
  TIPOS_PARTICIPANTE,
  type Participante,
  type TipoParticipante,
} from "@/services/participanteServices";

interface Props {
  participantesExistentes: Participante[];
  onCadastrado: (novo: Participante) => void;
}

export default function ParticipanteForm({ participantesExistentes, onCadastrado }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [tipo, setTipo] = useState<TipoParticipante | "">("");

  const [tocado, setTocado] = useState({
    nome: false,
    email: false,
    cpf: false,
    tipo: false,
  });

  const [salvando, setSalvando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  // RNF06: validações em tempo real
  const nomeTrim = nome.trim();
  const erroNome =
    (tocado.nome || nome.length > 0) && nomeTrim.length < 3
      ? "Informe o nome completo (mínimo de 3 caracteres)."
      : null;

  const emailTrim = email.trim();
  const erroFormatoEmail =
    tocado.email || emailTrim.length > 0 ? validarEmailInstitucional(emailTrim) : null;
  const emailJaExiste =
    emailTrim.length > 0 &&
    !erroFormatoEmail &&
    participantesExistentes.some(
      (p) => (p.email ?? "").trim().toLowerCase() === emailTrim.toLowerCase(),
    );
  const erroEmail =
    erroFormatoEmail ?? (emailJaExiste ? "Este e-mail institucional já está cadastrado." : null);
  const emailValidoDisponivel = emailTrim.length > 0 && !erroEmail;

  const cpfDigitos = somenteDigitos(cpf);
  let erroCpf: string | null = null;
  if (cpfDigitos.length === 11) {
    if (!validarCpf(cpf)) {
      erroCpf = "CPF inválido. Verifique os dígitos informados.";
    } else if (
      participantesExistentes.some((p) => somenteDigitos(p.cpf) === cpfDigitos)
    ) {
      erroCpf = "Este CPF já está cadastrado.";
    }
  } else if (tocado.cpf && cpfDigitos.length > 0) {
    erroCpf = "CPF incompleto. Informe os 11 dígitos.";
  } else if (tocado.cpf && cpfDigitos.length === 0) {
    erroCpf = "Informe o CPF.";
  }
  const cpfValidoDisponivel = cpfDigitos.length === 11 && !erroCpf;

  const erroTipo = tocado.tipo && !tipo ? "Selecione o tipo de participante." : null;

  const formularioValido =
    nomeTrim.length >= 3 &&
    emailValidoDisponivel &&
    cpfValidoDisponivel &&
    tipo !== "";

  function limparFormulario() {
    setNome("");
    setEmail("");
    setCpf("");
    setTipo("");
    setTocado({ nome: false, email: false, cpf: false, tipo: false });
    setErroEnvio(null);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setTocado({ nome: true, email: true, cpf: true, tipo: true });
    if (!formularioValido || !tipo) return;

    setErroEnvio(null);
    setSalvando(true);

    try {
      const novo = await participantesService.criar({
        nome: nomeTrim,
        email: emailTrim,
        cpf: formatarCpf(cpfDigitos),
        tipo,
      });
      limparFormulario();
      onCadastrado(novo);
    } catch (err) {
      setErroEnvio(
        err instanceof Error ? err.message : "Não foi possível cadastrar o participante.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const rotulo = "mb-1 block text-sm font-medium text-slate-900";
  const classeErro = "border-red-500 focus:border-red-500 focus:ring-red-100";
  const classeSucesso = "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-100";

  return (
    <form
      onSubmit={salvar}
      noValidate
      className="mx-auto w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Novo participante</h2>
        <p className="mt-1 text-sm text-slate-500">
          Preencha os dados institucionais para vincular pesquisadores ao sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="nome" className={rotulo}>
            Nome completo
          </label>
          <input
            id="nome"
            type="text"
            required
            maxLength={150}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={() => setTocado((prev) => ({ ...prev, nome: true }))}
            placeholder="Ex.: Maria Clara Oliveira"
            aria-invalid={erroNome ? true : undefined}
            aria-describedby={erroNome ? "erro-nome" : undefined}
            className={`${inputBase} ${erroNome ? classeErro : ""}`}
          />
          {erroNome && (
            <p id="erro-nome" className="mt-1 text-xs text-red-600">
              {erroNome}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={rotulo}>
            E-mail institucional
          </label>
          <input
            id="email"
            type="email"
            required
            maxLength={150}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTocado((prev) => ({ ...prev, email: true }))}
            placeholder="nome@ufes.br"
            aria-invalid={erroEmail ? true : undefined}
            aria-describedby={erroEmail ? "erro-email" : emailValidoDisponivel ? "ok-email" : undefined}
            className={`${inputBase} ${
              erroEmail ? classeErro : emailValidoDisponivel ? classeSucesso : ""
            }`}
          />
          {erroEmail && (
            <p id="erro-email" className="mt-1 text-xs text-red-600">
              {erroEmail}
            </p>
          )}
          {emailValidoDisponivel && (
            <p id="ok-email" className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
              <Icon nome="checkCircle" className="h-3.5 w-3.5" />
              E-mail institucional disponível
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cpf" className={rotulo}>
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            inputMode="numeric"
            required
            maxLength={14}
            value={cpf}
            onChange={(e) => setCpf(formatarCpf(e.target.value))}
            onBlur={() => setTocado((prev) => ({ ...prev, cpf: true }))}
            placeholder="000.000.000-00"
            aria-invalid={erroCpf ? true : undefined}
            aria-describedby={erroCpf ? "erro-cpf" : cpfValidoDisponivel ? "ok-cpf" : undefined}
            className={`${inputBase} ${
              erroCpf ? classeErro : cpfValidoDisponivel ? classeSucesso : ""
            }`}
          />
          {erroCpf && (
            <p id="erro-cpf" className="mt-1 text-xs text-red-600">
              {erroCpf}
            </p>
          )}
          {cpfValidoDisponivel && (
            <p id="ok-cpf" className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
              <Icon nome="checkCircle" className="h-3.5 w-3.5" />
              CPF válido
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="tipo" className={rotulo}>
            Tipo
          </label>
          <select
            id="tipo"
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoParticipante | "")}
            onBlur={() => setTocado((prev) => ({ ...prev, tipo: true }))}
            aria-invalid={erroTipo ? true : undefined}
            aria-describedby={erroTipo ? "erro-tipo" : undefined}
            className={`${inputBase} ${erroTipo ? classeErro : ""}`}
          >
            <option value="">Selecione o tipo</option>
            {TIPOS_PARTICIPANTE.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
          {erroTipo && (
            <p id="erro-tipo" className="mt-1 text-xs text-red-600">
              {erroTipo}
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
          {salvando ? "Cadastrando..." : "Cadastrar participante"}
        </button>
      </div>
    </form>
  );
}
