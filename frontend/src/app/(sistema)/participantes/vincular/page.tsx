import { Suspense } from "react";
import PermissaoGuard from "@/app/_components/layout/PermissaoGuard";
import VincularParticipanteTela from "@/app/_components/participantes/VincularParticipanteTela";

// Tela 5.8 - Vincular Participantes ao Projeto (/participantes/vincular)
export default function VincularParticipantesPage() {
  return (
    <PermissaoGuard permissao="gerenciarEquipes">
      <Suspense fallback={null}>
        <VincularParticipanteTela />
      </Suspense>
    </PermissaoGuard>
  );
}
