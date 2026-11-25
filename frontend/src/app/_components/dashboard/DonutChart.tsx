export interface Fatia {
  rotulo: string;
  valor: number;
  cor: string;
}

/** Gráfico de rosca em SVG puro (sem biblioteca). */
export default function DonutChart({ dados }: { dados: Fatia[] }) {
  const total = dados.reduce((soma, d) => soma + d.valor, 0);
  const raio = 40;
  const circunferencia = 2 * Math.PI * raio;

  const arcos = dados.map((d, i) => {
    const antes = dados.slice(0, i).reduce((soma, x) => soma + x.valor, 0);
    const comprimento = total ? (d.valor / total) * circunferencia : 0;
    const deslocamento = total ? -(antes / total) * circunferencia : 0;
    return { ...d, comprimento, deslocamento };
  });

  return (
    <div className="flex items-center gap-8">
      <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90" role="img" aria-label="Projetos por situação">
        <circle cx="50" cy="50" r={raio} fill="none" stroke="#e2e8f0" strokeWidth="16" />
        {arcos.map((a) => (
          <circle
            key={a.rotulo}
            cx="50"
            cy="50"
            r={raio}
            fill="none"
            stroke={a.cor}
            strokeWidth="16"
            strokeDasharray={`${a.comprimento} ${circunferencia - a.comprimento}`}
            strokeDashoffset={a.deslocamento}
          />
        ))}
      </svg>

      <ul className="space-y-2 text-sm text-slate-700">
        {dados.map((d) => (
          <li key={d.rotulo} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.cor }} />
            {d.rotulo} <span className="font-semibold text-slate-900">({d.valor})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
