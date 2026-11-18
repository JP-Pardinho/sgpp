const ESTILOS: Record<string, string> = {
  "em andamento": "bg-blue-100 text-blue-800",
  "concluído": "bg-emerald-100 text-emerald-800",
  "concluido": "bg-emerald-100 text-emerald-800",
  "cancelado": "bg-red-100 text-red-800",
};

export default function StatusBadge({ situacao }: { situacao: string }) {
  const estilo = ESTILOS[situacao.toLowerCase()] ?? "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${estilo}`}>
      {situacao}
    </span>
  );
}
