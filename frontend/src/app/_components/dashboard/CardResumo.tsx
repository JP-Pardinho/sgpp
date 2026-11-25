import Icon, { type NomeIcone } from "@/app/_components/ui/Icon";

export default function CardResumo({
    icone,
    rotulo,
    valor,
}: {
    icone: NomeIcone;
    rotulo: string;
    valor: string | number;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-600">
                <Icon nome={icone} className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-slate-600">{rotulo}</p>
                <p className="text-2xl font-bold text-slate-900">{valor}</p>
            </div>
        </div>
    );
}
