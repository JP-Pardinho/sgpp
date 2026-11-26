import { Suspense } from "react";
import PermissaoGuard from "@/app/_components/layout/PermissaoGuard";
import VincularProducaoTela from "@/app/_components/producoes/VincularProducaoTela";

// Tela 5.11 - Vincular Produção a Projetos (/producoes/vincular)
export default function VincularProducaoPage() {
  return (
    <PermissaoGuard permissao="gerenciarProducoes">
      <Suspense fallback={null}>
        <VincularProducaoTela />
      </Suspense>
    </PermissaoGuard>
  );
}
