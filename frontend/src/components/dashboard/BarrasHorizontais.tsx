export interface Barra {
  rotulo: string;
  valor: number;
}

export default function BarrasHorizontais({
  dados,
  formatar,
}: {
  dados: Barra[];
  formatar: (valor: number) => string;
}) {
  const maximo = Math.max(...dados.map((d) => d.valor), 1);

  return (
    <ul className="space-y-3">
      {dados.map((d) => (
        <li key={d.rotulo} className="flex items-center gap-3 text-sm">
          <span className="w-14 shrink-0 text-slate-600">{d.rotulo}</span>
          <div className="h-5 flex-1 rounded bg-slate-100">
            <div
              className="h-5 rounded bg-blue-600"
              style={{ width: `${(d.valor / maximo) * 100}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right font-medium text-slate-900">{formatar(d.valor)}</span>
        </li>
      ))}
    </ul>
  );
}
