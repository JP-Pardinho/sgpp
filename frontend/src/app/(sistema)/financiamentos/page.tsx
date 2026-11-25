import PaginaSistema from "@/app/_components/layout/PaginaSistema";

export default function FinanciamentosPage() {
    return (
        <PaginaSistema
            titulo="Financiamentos"
            breadcrumb={[
                { rotulo: "Início", href: "/" },
                { rotulo: "Financiamentos" },
            ]}
        >
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-600">Página de financiamentos em desenvolvimento.</p>
            </div>
        </PaginaSistema>
    );
}
