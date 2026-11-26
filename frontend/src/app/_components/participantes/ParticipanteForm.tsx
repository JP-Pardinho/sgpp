"use client";

import { useState, type FormEvent } from "react";
import { btnPrimario, btnSecundario, inputBase } from "@/app/_components/ui/Botoes";
import Icon from "@/app/_components/ui/Icon";
import {
  formatarCpf,
  somenteDigitos,
  validarCpf,
  validarEmailInstitucional,
} from "@/lib/validacao";
import {
  participantesService,
  PERFIS_ACESSO,
  TIPOS_PARTICIPANTE,
  type Participante,
  type PerfilAcesso,
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
  const [perfilAcesso, setPerfilAcesso] = useState<PerfilAcesso>("Participante");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [tocado, setTocado] = useState({
    nome: false,
    email: false,
    cpf: false,
    tipo: false,
    senha: false,
    confirmarSenha: false,
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
      (p) => (p.emailInstitucional ?? "").trim().toLowerCase() === emailTrim.toLowerCase(),
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

  let erroSenha: string | null = null;
  if (tocado.senha || senha.length > 0) {
    if (senha.trim().length === 0) {
      erroSenha = "Informe a senha de acesso.";
    } else if (senha.length < 6) {
      erroSenha = "A senha deve ter no mínimo 6 caracteres.";
    }
  }

  let erroConfirmarSenha: string | null = null;
  if (tocado.confirmarSenha || confirmarSenha.length > 0) {
    if (confirmarSenha.length === 0) {
      erroConfirmarSenha = "Confirme a senha de acesso.";
    } else if (confirmarSenha !== senha) {
      erroConfirmarSenha = "As senhas não coincidem.";
    }
  }

  const senhaValida = senha.trim().length > 0 && senha.length >= 6 && confirmarSenha === senha;

  const formularioValido =
    nomeTrim.length >= 3 &&
    emailValidoDisponivel &&
    cpfValidoDisponivel &&
    tipo !== "" &&
    senhaValida;

  function limparFormulario() {
    setNome("");
    setEmail("");
    setCpf("");
    setTipo("");
    setPerfilAcesso("Participante");
    setSenha("");
    setConfirmarSenha("");
    setMostrarSenha(false);
    setMostrarConfirmacao(false);
    setTocado({
      nome: false,
      email: false,
      cpf: false,
      tipo: false,
      senha: false,
      confirmarSenha: false,
    });
    setErroEnvio(null);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setTocado({
      nome: true,
      email: true,
      cpf: true,
      tipo: true,
      senha: true,
      confirmarSenha: true,
    });
    if (!formularioValido || !tipo) return;

    setErroEnvio(null);
    setSalvando(true);

    try {
      const novo = await participantesService.criar({
        nome: nomeTrim,
        emailInstitucional: emailTrim,
        cpf: formatarCpf(cpfDigitos),
        tipo,
        perfilAcesso,
        senha,
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

        <div>
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

        <div>
          <label htmlFor="perfilAcesso" className={rotulo}>
            Perfil de acesso
          </label>
          <select
            id="perfilAcesso"
            value={perfilAcesso}
            onChange={(e) => setPerfilAcesso(e.target.value as PerfilAcesso)}
            className={inputBase}
          >
            {PERFIS_ACESSO.map((perfil) => (
              <option key={perfil} value={perfil}>
                {perfil}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="senha" className={rotulo}>
            Senha de acesso
          </label>
          <div className="relative">
            <input
              id="senha"
              type={mostrarSenha ? "text" : "password"}
              required
              minLength={6}
              maxLength={255}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onBlur={() => setTocado((prev) => ({ ...prev, senha: true }))}
              placeholder="Mínimo de 6 caracteres"
              aria-invalid={erroSenha ? true : undefined}
              aria-describedby={erroSenha ? "erro-senha" : undefined}
              className={`${inputBase} pr-10 ${erroSenha ? classeErro : ""}`}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
            >
              <Icon nome={mostrarSenha ? "eye" : "eyeOff"} className="h-4 w-4" />
            </button>
          </div>
          {erroSenha && (
            <p id="erro-senha" className="mt-1 text-xs text-red-600">
              {erroSenha}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmarSenha" className={rotulo}>
            Confirmar senha
          </label>
          <div className="relative">
            <input
              id="confirmarSenha"
              type={mostrarConfirmacao ? "text" : "password"}
              required
              minLength={6}
              maxLength={255}
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              onBlur={() => setTocado((prev) => ({ ...prev, confirmarSenha: true }))}
              placeholder="Repita a senha"
              aria-invalid={erroConfirmarSenha ? true : undefined}
              aria-describedby={erroConfirmarSenha ? "erro-confirmarSenha" : undefined}
              className={`${inputBase} pr-10 ${
                erroConfirmarSenha ? classeErro : senhaValida ? classeSucesso : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmacao((v) => !v)}
              aria-label={mostrarConfirmacao ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
            >
              <Icon nome={mostrarConfirmacao ? "eye" : "eyeOff"} className="h-4 w-4" />
            </button>
          </div>
          {erroConfirmarSenha && (
            <p id="erro-confirmarSenha" className="mt-1 text-xs text-red-600">
              {erroConfirmarSenha}
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
