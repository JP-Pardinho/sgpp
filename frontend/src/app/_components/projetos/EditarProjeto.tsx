"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUsuario } from "@/app/_components/layout/AuthGuard";
import PaginaSistema from "@/app/_components/layout/PaginaSistema";
import PermissaoGuard from "@/app/_components/layout/PermissaoGuard";
import { temPermissao } from "@/lib/permissoes";
import { projetosService, type Projeto } from "@/services/projetoServices";
import ProjetoForm from "./ProjetoForm";

export default function EditarProjeto() {
    const params = useParams<{ codigo: string }>();
    const codigo = decodeURIComponent(params.codigo);
    const usuario = useUsuario();
    const podeEditar = temPermissao(usuario?.perfil, "gerenciarProjetos");
    const [projeto, setProjeto] = useState<Projeto | null>(null);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        if (!codigo || !podeEditar) return;
        let ativo = true;
        projetosService
            .buscarPorCodigo(codigo)
            .then((p) => ativo && setProjeto(p))
            .catch(() => ativo && setErro("Projeto não encontrado."));
        return () => {
            ativo = false;
        };
    }, [codigo, podeEditar]);

    return (
        <PermissaoGuard permissao="gerenciarProjetos">
            <PaginaSistema
                titulo="Editar projeto"
                breadcrumb={[
                    { rotulo: "Início", href: "/" },
                    { rotulo: "Projetos", href: "/projetos" },
                    {
                        rotulo: codigo ? decodeURIComponent(codigo) : "Projeto",
                        href: codigo ? `/projetos/${encodeURIComponent(codigo)}` : "/projetos",
                    },
                    { rotulo: "Editar" },
                ]}
            >
                {erro && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{erro}</p>}
                {!projeto && !erro && <p className="text-sm text-slate-500">Carregando projeto...</p>}
                {projeto && <ProjetoForm modo="editar" inicial={projeto} />}
            </PaginaSistema>
        </PermissaoGuard>
    );
}
