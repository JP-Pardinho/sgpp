import { Suspense } from "react";
import VincularParticipanteTela from "@/components/participantes/VincularParticipanteTela";

// Tela 5.8 - Vincular Participantes ao Projeto (/participantes/vincular)
export default function VincularParticipantesPage() {
  return (
    <Suspense fallback={null}>
      <VincularParticipanteTela />
    </Suspense>
  );
}
