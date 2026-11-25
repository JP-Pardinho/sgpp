import PaginaSistema from "@/app/_components/layout/PaginaSistema";

export default function ConsultasPage() {
    return (
        <PaginaSistema
            titulo="Consultas"
            breadcrumb={[
                { rotulo: "Início", href: "/" },
                { rotulo: "Consultas" },
            ]}
        >
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-600">Página de consultas em desenvolvimento.</p>
            </div>
        </PaginaSistema>
    );
}
