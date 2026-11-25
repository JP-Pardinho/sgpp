import { Suspense } from "react";
import DetalhesProjeto from "@/app/_components/projetos/DetalhesProjeto";

// Tela 5.9 - Detalhes do Projeto (/projetos/[codigo])
export default function DetalhesProjetoPage() {
    return (
        <Suspense fallback={null}>
            <DetalhesProjeto />
        </Suspense>
    );
}
