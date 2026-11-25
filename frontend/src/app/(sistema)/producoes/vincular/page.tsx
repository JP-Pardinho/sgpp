import { Suspense } from "react";
import VincularProducaoTela from "@/components/producoes/VincularProducaoTela";

// Tela 5.11 - Vincular Produção a Projetos (/producoes/vincular)
export default function VincularProducaoPage() {
  return (
    <Suspense fallback={null}>
      <VincularProducaoTela />
    </Suspense>
  );
}
