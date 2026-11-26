"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/app/_components/ui/Icon";
import { salvarSessao } from "@/lib/session";
import { ApiError } from "@/services/api";
import { authService } from "@/services/authService";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [lembrar, setLembrar] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function entrar(e: FormEvent) {
        e.preventDefault();
        setErro(null);
        setEnviando(true);
        try {
            const resposta = await authService.login({ emailInstitucional: email.trim(), senha });
            salvarSessao({ token: resposta.token, usuario: resposta.usuario }, lembrar);
            router.replace("/");
        } catch (err) {
            setErro(
                err instanceof ApiError
                    ? err.message
                    : err instanceof Error
                        ? err.message
                        : "Não foi possível acessar o sistema. Tente novamente.",
            );
            setEnviando(false);
        }
    }

    return (
        <div className="grid min-h-screen place-items-center bg-[#f8f9ff] px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
                <div className="flex flex-col items-center text-center">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-sgpp-50 text-sgpp-700">
                        <Icon nome="landmark" className="h-6 w-6" />
                    </div>
                    <h1 className="mt-2 text-2xl font-bold text-sgpp-700">SGPP</h1>
                    <p className="mt-1 text-lg font-semibold text-slate-900">Acesso ao sistema</p>
                    <p className="text-xs text-slate-600">Sistema de Gerenciamento de Projetos de Pesquisa</p>
                </div>

                <form onSubmit={entrar} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-900">
                            E-mail institucional
                        </label>
                        <div className="relative">
                            <Icon nome="mail" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu e-mail institucional"
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sgpp-600 focus:ring-2 focus:ring-sgpp-100"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <label htmlFor="senha" className="text-xs font-semibold text-slate-900">
                                Senha
                            </label>
                            <a href="#" className="text-xs text-sgpp-700 hover:underline">
                                Esqueci minha senha
                            </a>
                        </div>
                        <div className="relative">
                            <Icon nome="lock" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                                id="senha"
                                type={mostrarSenha ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="Digite sua senha"
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-10 text-sm outline-none focus:border-sgpp-600 focus:ring-2 focus:ring-sgpp-100"
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
                    </div>

                    {erro && (
                        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                            {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={enviando}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-sgpp-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sgpp-900 disabled:opacity-60"
                    >
                        {enviando ? "Entrando..." : "Entrar"}
                        {!enviando && <Icon nome="arrowRight" className="h-4 w-4" />}
                    </button>

                    <label className="flex items-center gap-2 text-xs text-slate-700">
                        <input
                            type="checkbox"
                            checked={lembrar}
                            onChange={(e) => setLembrar(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                        />
                        Lembrar-me neste dispositivo
                    </label>
                </form>

                <div className="mt-6 text-center text-xs text-slate-600">
                    <p className="mb-1 flex items-center justify-center gap-1.5 uppercase tracking-wide">
                        <Icon nome="shield" className="h-3.5 w-3.5" />
                        Ambiente autenticado seguro
                    </p>
                    <p>© 2026 SGPP — Universidade Federal do Espírito Santo · Banco de Dados 1</p>
                </div>
            </div>
        </div>
    );
}
