"use client";

import { useMemo, useState } from "react";
import { btnContorno, inputBase } from "@/app/_components/ui/Botoes";
import Icon from "@/app/_components/ui/Icon";
import { formatarCpf, somenteDigitos } from "@/lib/validacao";
import { TIPOS_PARTICIPANTE, type Participante } from "@/services/participanteServices";

interface Props {
  participantes: Participante[];
  carregando: boolean;
  erro: string | null;
  podeExcluir?: boolean;
  onExcluir: (participante: Participante) => Promise<void>;
}

const ESTILO_TIPO: Record<string, string> = {
  docente: "bg-blue-100 text-blue-800",
  discente: "bg-emerald-100 text-emerald-800",
  técnico: "bg-amber-100 text-amber-800",
  tecnico: "bg-amber-100 text-amber-800",
};

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function ListaParticipantes({ participantes, carregando, erro, podeExcluir = true, onExcluir }: Props) {
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [excluindoCpf, setExcluindoCpf] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    const termoDigitos = somenteDigitos(busca);

    return participantes.filter((p) => {
      if (tipoFiltro && normalizar(p.tipo) !== normalizar(tipoFiltro)) return false;
      if (!termo) return true;

      const bateTexto = normalizar(`${p.nome} ${p.emailInstitucional ?? ""} ${p.cpf}`).includes(termo);
      const bateCpf = termoDigitos.length > 0 && somenteDigitos(p.cpf).includes(termoDigitos);
      return bateTexto || bateCpf;
    });
  }, [participantes, busca, tipoFiltro]);

  function limparFiltros() {
    setBusca("");
    setTipoFiltro("");
  }

  async function confirmarExclusao(p: Participante) {
    if (!window.confirm(`Excluir o participante "${p.nome}" (${formatarCpf(p.cpf)})?`)) return;
    setExcluindoCpf(p.cpf);
    try {
      await onExcluir(p);
    } finally {
      setExcluindoCpf(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-60 flex-1">
            <label htmlFor="busca-participante" className="mb-1 block text-sm font-medium text-slate-900">
              Buscar por nome, e-mail ou CPF
            </label>
            <input
              id="busca-participante"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite para buscar..."
              className={inputBase}
            />
          </div>

          <div className="min-w-48 flex-1">
            <label htmlFor="filtro-tipo" className="mb-1 block text-sm font-medium text-slate-900">
              Tipo
            </label>
            <select
              id="filtro-tipo"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className={inputBase}
            >
              <option value="">Todos</option>
              {TIPOS_PARTICIPANTE.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button type="button" onClick={limparFiltros} className={btnContorno}>
            Limpar filtros
          </button>
        </div>
      </section>

      {/* Tabela */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {erro && (
          <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="text-sm text-slate-500">Carregando participantes...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Nome completo</th>
                    <th className="px-3 py-2 font-semibold">E-mail institucional</th>
                    <th className="px-3 py-2 font-semibold">CPF</th>
                    <th className="px-3 py-2 font-semibold">Tipo</th>
                    {podeExcluir && <th className="px-3 py-2 font-semibold">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={podeExcluir ? 5 : 4} className="px-3 py-8 text-center text-slate-500">
                        Nenhum participante encontrado.
                      </td>
                    </tr>
                  )}
                  {filtrados.map((p) => {
                    const estilo =
                      ESTILO_TIPO[p.tipo.toLowerCase()] ?? "bg-slate-100 text-slate-700";
                    return (
                      <tr key={p.cpf} className="border-b border-slate-100 even:bg-slate-50">
                        <td className="px-3 py-2.5 font-medium text-slate-900">{p.nome}</td>
                        <td className="px-3 py-2.5 text-slate-700">{p.emailInstitucional || "-"}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                          {formatarCpf(p.cpf)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${estilo}`}
                          >
                            {p.tipo}
                          </span>
                        </td>
                        {podeExcluir && (
                          <td className="px-3 py-2.5">
                            <button
                              type="button"
                              disabled={excluindoCpf === p.cpf}
                              onClick={() => confirmarExclusao(p)}
                              title="Excluir"
                              aria-label={`Excluir ${p.nome}`}
                              className="text-slate-500 transition-colors hover:text-red-600 disabled:opacity-50"
                            >
                              <Icon nome="trash" className="h-[18px] w-[18px]" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-slate-700">
              Exibindo {filtrados.length} de {participantes.length} participantes
            </p>
          </>
        )}
      </section>
    </div>
  );
}
