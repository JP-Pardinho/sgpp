import { Suspense } from "react";
import ListaProjetos from "@/components/projetos/ListaProjetos";

// Tela 5.4 - Lista de Projetos (/projetos)
export default function ProjetosPage() {
  return (
    <Suspense fallback={null}>
      <ListaProjetos />
    </Suspense>
  );
}
