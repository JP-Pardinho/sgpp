"use client";

import PaginaSistema from "@/app/_components/layout/PaginaSistema";
import PermissaoGuard from "@/app/_components/layout/PermissaoGuard";
import ProjetoForm from "@/app/_components/projetos/ProjetoForm";

// Tela 5.3 - Cadastrar Novo Projeto (/projetos/novo)
export default function NovoProjetoPage() {
    return (
        <PermissaoGuard permissao="gerenciarProjetos">
            <PaginaSistema
                titulo="Cadastrar projeto"
                breadcrumb={[
                    { rotulo: "Início", href: "/" },
                    { rotulo: "Projetos", href: "/projetos" },
                    { rotulo: "Novo projeto" },
                ]}
            >
                <ProjetoForm modo="criar" />
            </PaginaSistema>
        </PermissaoGuard>
    );
}
