import { Suspense } from "react";
import ParticipantesTela from "@/components/participantes/ParticipantesTela";

// Tela 5.7 - Cadastrar e Listar Participantes (/participantes)
export default function ParticipantesPage() {
  return (
    <Suspense fallback={null}>
      <ParticipantesTela />
    </Suspense>
  );
}
