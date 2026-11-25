import { Suspense } from "react";
import EditarProjeto from "@/app/_components/projetos/EditarProjeto";

export default function EditarProjetoPage() {
    return (
        <Suspense fallback={null}>
            <EditarProjeto />
        </Suspense>
    );
}
