"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { btnPrimario, btnSecundario, inputBase } from "@/app/_components/ui/Botoes";
import { paraInputData } from "@/lib/format";
import { participantesService, type Participante } from "@/services/participanteServices";
import { projetosService, SITUACOES, type Projeto } from "@/services/projetoServices";

interface Props {
    modo: "criar" | "editar";
    inicial?: Projeto;
}

export default function ProjetoForm({ modo, inicial }: Props) {
    const router = useRouter();

    const [codigo, setCodigo] = useState(inicial?.codigo ?? "");
    const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
    const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
    const [dataInicio, setDataInicio] = useState(paraInputData(inicial?.dataInicio));
    const [dataFim, setDataFim] = useState(paraInputData(inicial?.dataFim));
    const [situacao, setSituacao] = useState(inicial?.situacao ?? SITUACOES[0]);
    const [coordenador_cpf, setcoordenador_cpf] = useState(inicial?.coordenador_cpf ?? "");

    const [docentes, setDocentes] = useState<Participante[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        let ativo = true;
        participantesService
            .listarDocentes()
            .then((d) => ativo && setDocentes(d))
            .catch(() => ativo && setErro("Não foi possível carregar a lista de docentes."));
        return () => {
            ativo = false;
        };
    }, []);

    // RNF06: validação em tempo real (datas no formato yyyy-mm-dd comparam como texto)
    const erroData =
        dataInicio && dataFim && dataFim < dataInicio
            ? "A data de término não pode ser anterior à data de início"
            : null;

    const formularioValido =
        codigo.trim() !== "" &&
        titulo.trim() !== "" &&
        dataInicio !== "" &&
        dataFim !== "" &&
        coordenador_cpf !== "" &&
        !erroData;

    async function salvar(e: FormEvent) {
        e.preventDefault();
        if (!formularioValido) return;

        setErro(null);
        setSalvando(true);

        const projeto: Projeto = {
            codigo: codigo.trim(),
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            situacao,
            dataInicio,
            dataFim,
            coordenador_cpf,
        };

        try {
            if (modo === "criar") {
                await projetosService.criar(projeto);
            } else {
                await projetosService.atualizar(inicial!.codigo, projeto);
            }
            router.push("/projetos");
        } catch (err) {
            setErro(err instanceof Error ? err.message : "Não foi possível salvar o projeto.");
            setSalvando(false);
        }
    }

    const rotulo = "mb-1 block text-sm font-medium text-slate-900";
    const dica = "mt-1 text-xs text-slate-500";

    return (
        <form onSubmit={salvar} className="mx-auto w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
                {modo === "criar" ? "Cadastrar projeto" : "Editar projeto"}
            </h2>

            <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
                <div>
                    <label htmlFor="codigo" className={rotulo}>Código</label>
                    <input
                        id="codigo"
                        required
                        maxLength={30}
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        disabled={modo === "editar"}
                        placeholder="PRJ-2026-022"
                        className={inputBase}
                    />
                    <p className={dica}>Identificador único</p>
                </div>
                <div>
                    <label htmlFor="titulo" className={rotulo}>Título</label>
                    <input id="titulo" required maxLength={255} value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputBase} />
                </div>
            </div>

            <div className="mt-4">
                <label htmlFor="descricao" className={rotulo}>Descrição</label>
                <textarea id="descricao" rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputBase} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                    <label htmlFor="dataInicio" className={rotulo}>Data de início</label>
                    <input id="dataInicio" type="date" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={inputBase} />
                </div>
                <div>
                    <label htmlFor="dataFim" className={rotulo}>Data de término</label>
                    <input
                        id="dataFim"
                        type="date"
                        required
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        aria-invalid={erroData ? true : undefined}
                        aria-describedby={erroData ? "erro-dataFim" : undefined}
                        className={`${inputBase} ${erroData ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                    />
                    {erroData && <p id="erro-dataFim" className="mt-1 text-xs text-red-600">{erroData}</p>}
                </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                    <label htmlFor="situacao" className={rotulo}>Situação</label>
                    <select id="situacao" value={situacao} onChange={(e) => setSituacao(e.target.value)} className={inputBase}>
                        {SITUACOES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="coordenador" className={rotulo}>Coordenador principal</label>
                    <select id="coordenador" required value={coordenador_cpf} onChange={(e) => setcoordenador_cpf(e.target.value)} className={inputBase}>
                        <option value="">Selecione um docente</option>
                        {docentes.map((d) => <option key={d.cpf} value={d.cpf}>{d.nome}</option>)}
                    </select>
                    <p className={dica}>Cada projeto possui um único coordenador</p>
                </div>
            </div>

            {erro && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
                <Link href="/projetos" className={btnSecundario}>Cancelar</Link>
                <button type="submit" disabled={!formularioValido || salvando} className={btnPrimario}>
                    {salvando ? "Salvando..." : "Salvar projeto"}
                </button>
            </div>
        </form>
    );
}
