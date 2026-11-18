"use client";

import PaginaSistema from "@/components/layout/PaginaSistema";
import ProjetoForm from "@/components/projetos/ProjetoForm";

// Tela 5.3 - Cadastrar Novo Projeto (/projetos/novo)
export default function NovoProjetoPage() {
  return (
    <PaginaSistema
      titulo="Cadastrar projeto"
      breadcrumb={[
        { rotulo: "Início", href: "/dashboard" },
        { rotulo: "Projetos", href: "/projetos" },
        { rotulo: "Novo projeto" },
      ]}
    >
      <ProjetoForm modo="criar" />
    </PaginaSistema>
  );
}
