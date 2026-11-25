import { Suspense } from "react";
import VincularFinanciamentoTela from "@/components/financiamentos/VincularFinanciamentoTela";

// Tela 5.5 - Vincular Financiamento ao Projeto (/financiamentos/vincular)
export default function VincularFinanciamentoPage() {
  return (
    <Suspense fallback={null}>
      <VincularFinanciamentoTela />
    </Suspense>
  );
}
