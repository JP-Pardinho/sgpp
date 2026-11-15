import { Suspense } from "react";
import EditarProjeto from "@/components/projetos/EditarProjeto";

export default function EditarProjetoPage() {
  return (
    <Suspense fallback={null}>
      <EditarProjeto />
    </Suspense>
  );
}
