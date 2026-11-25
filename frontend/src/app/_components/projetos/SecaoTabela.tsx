import type { ReactNode } from "react";
import Icon from "@/app/_components/ui/Icon";
import { emBreve } from "@/lib/format";

interface Props {
    titulo: string;
    textoBotao: string;
    colunas: string[];
    vazio: string;
    quantidade: number;
    children: ReactNode; // <tr> das linhas
}

/** Bloco "título + botão Vincular + tabela" usado na tela de detalhes. */
export default function SecaoTabela({ titulo, textoBotao, colunas, vazio, quantidade, children }: Props) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{titulo}</h2>
                {/* Modal de vínculo ainda não faz parte desta etapa */}
                <button
                    type="button"
                    onClick={emBreve}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
                >
                    <Icon nome="plus" className="h-4 w-4" /> {textoBotao}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            {colunas.map((c) => (
                                <th key={c} className="px-3 py-2 font-semibold">{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {quantidade === 0 && (
                            <tr><td colSpan={colunas.length} className="px-3 py-6 text-center text-slate-500">{vazio}</td></tr>
                        )}
                        {children}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export function AcoesLinha() {
    return (
        <div className="flex items-center gap-3">
            <button type="button" onClick={emBreve} title="Editar" aria-label="Editar" className="text-blue-600 hover:text-blue-800"><Icon nome="pencil" className="h-4 w-4" /></button>
            <button type="button" onClick={emBreve} title="Remover vínculo" aria-label="Remover vínculo" className="text-red-500 hover:text-red-700"><Icon nome="trash" className="h-4 w-4" /></button>
        </div>
    );
}
