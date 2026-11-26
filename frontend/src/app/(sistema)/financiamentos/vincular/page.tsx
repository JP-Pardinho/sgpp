import { Suspense } from "react";
import PermissaoGuard from "@/app/_components/layout/PermissaoGuard";
import VincularFinanciamentoTela from "@/app/_components/financiamentos/VincularFinanciamentoTela";

// Tela 5.5 - Vincular Financiamento ao Projeto (/financiamentos/vincular)
export default function VincularFinanciamentoPage() {
  return (
    <PermissaoGuard permissao="gerenciarFinanciamentos">
      <Suspense fallback={null}>
        <VincularFinanciamentoTela />
      </Suspense>
    </PermissaoGuard>
  );
}
