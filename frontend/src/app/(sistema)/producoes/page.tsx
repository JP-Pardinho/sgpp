import PaginaSistema from "@/app/_components/layout/PaginaSistema";

export default function ProducoesPage() {
    return (
        <PaginaSistema
            titulo="Produções científicas"
            breadcrumb={[
                { rotulo: "Início", href: "/" },
                { rotulo: "Produções científicas" },
            ]}
        >
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-600">Página de produções científicas em desenvolvimento.</p>
            </div>
        </PaginaSistema>
    );
}
