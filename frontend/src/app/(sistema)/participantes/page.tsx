import PaginaSistema from "@/app/_components/layout/PaginaSistema";

export default function ParticipantesPage() {
    return (
        <PaginaSistema
            titulo="Participantes"
            breadcrumb={[
                { rotulo: "Início", href: "/" },
                { rotulo: "Participantes" },
            ]}
        >
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-600">Página de participantes em desenvolvimento.</p>
            </div>
        </PaginaSistema>
    );
}
