"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PaginaSistema from "@/components/layout/PaginaSistema";
import { btnSecundario } from "@/components/ui/Botoes";
import Icon from "@/components/ui/Icon";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatarData, formatarMoeda } from "@/lib/format";
import { projetosService, type Projeto } from "@/services/projetoServices";
import {
  vinculosService,
  type EquipeMembro,
  type FinanciamentoVinculado,
  type ProducaoVinculada,
} from "@/services/vinculoServices";
import SecaoTabela, { AcoesLinha } from "./SecaoTabela";

interface Dados {
  projeto: Projeto;
  equipe: EquipeMembro[];
  financiamentos: FinanciamentoVinculado[];
  producoes: ProducaoVinculada[];
}

export default function DetalhesProjeto() {
  const { codigo } = useParams<{ codigo: string }>();
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) return;
    let ativo = true;
    Promise.all([
      projetosService.buscarPorCodigo(codigo),
      vinculosService.listarEquipe(codigo),
      vinculosService.listarFinanciamentos(codigo),
      vinculosService.listarProducoes(codigo),
    ])
      .then(([projeto, equipe, financiamentos, producoes]) => {
        if (ativo) setDados({ projeto, equipe, financiamentos, producoes });
      })
      .catch(() => ativo && setErro("Não foi possível carregar os detalhes do projeto."));
    return () => {
      ativo = false;
    };
  }, [codigo]);

  const projeto = dados?.projeto;

  return (
    <PaginaSistema
      titulo="Detalhes do Projeto"
      breadcrumb={[
        { rotulo: "Início", href: "/dashboard" },
        { rotulo: "Projetos", href: "/projetos" },
        { rotulo: "Detalhes do projeto" },
      ]}
    >
      {erro && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{erro}</p>}
      {!dados && !erro && <p className="text-sm text-slate-500">Carregando projeto...</p>}

      {dados && projeto && (
        <>
          {/* Cabeçalho do projeto */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{projeto.titulo}</h2>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                  <span>{projeto.codigo}</span>
                  <span aria-hidden="true">•</span>
                  <StatusBadge situacao={projeto.situacao} />
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Coordenador: {projeto.coordenadorNome ?? "-"} · {formatarData(projeto.dataInicio)} a {formatarData(projeto.dataFim)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href="/projetos" className={btnSecundario}>Voltar</Link>
                <Link
                  href={`/projetos/${encodeURIComponent(projeto.codigo)}/editar`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Icon nome="pencil" className="h-4 w-4" /> Editar
                </Link>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-800">{projeto.descricao}</p>
          </section>

          {/* Equipe */}
          <SecaoTabela
            titulo="Equipe"
            textoBotao="Vincular participante"
            hrefBotao={`/participantes/vincular?projeto=${encodeURIComponent(projeto.codigo)}`}
            colunas={["Nome", "Tipo", "Função", "Entrada", "Saída", "Ações"]}
            vazio="Nenhum participante vinculado."
            quantidade={dados.equipe.length}
          >
            {dados.equipe.map((m) => (
              <tr key={m.cpf} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2.5">{m.nome}</td>
                <td className="px-3 py-2.5">{m.tipo}</td>
                <td className="px-3 py-2.5">{m.funcao}</td>
                <td className="px-3 py-2.5">{formatarData(m.dataEntrada)}</td>
                <td className="px-3 py-2.5">{formatarData(m.dataSaida)}</td>
                <td className="px-3 py-2.5"><AcoesLinha /></td>
              </tr>
            ))}
          </SecaoTabela>

          {/* Financiamentos e Fomento */}
          <SecaoTabela
            titulo="Financiamentos e Fomento"
            textoBotao="Vincular financiamento"
            hrefBotao={`/financiamentos/vincular?projeto=${encodeURIComponent(projeto.codigo)}`}
            colunas={["Agência", "Tipo de Fomento", "Vínculo", "Vigência", "Valor", "Ações"]}
            vazio="Nenhum financiamento vinculado."
            quantidade={dados.financiamentos.length}
          >
            {dados.financiamentos.map((f) => (
              <tr key={f.idFinanciamento} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2.5">{f.agencia}</td>
                <td className="px-3 py-2.5">{f.tipoFomento}</td>
                <td className="px-3 py-2.5">{f.tipoVinculo}</td>
                <td className="whitespace-nowrap px-3 py-2.5">{formatarData(f.dataInicio)} a {formatarData(f.dataFim)}</td>
                <td className="whitespace-nowrap px-3 py-2.5">{formatarMoeda(f.valor)}</td>
                <td className="px-3 py-2.5"><AcoesLinha /></td>
              </tr>
            ))}
          </SecaoTabela>

          {/* Produções Científicas */}
          <SecaoTabela
            titulo="Produções Científicas"
            textoBotao="Vincular produção"
            colunas={["Título da Produção", "Tipo", "Ano", "Meio de Divulgação", "Ações"]}
            vazio="Nenhuma produção científica vinculada."
            quantidade={dados.producoes.length}
          >
            {dados.producoes.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2.5">{p.titulo}</td>
                <td className="px-3 py-2.5">{p.tipo}</td>
                <td className="px-3 py-2.5">{p.ano}</td>
                <td className="px-3 py-2.5">{p.meioDivulgacao}</td>
                <td className="px-3 py-2.5"><AcoesLinha /></td>
              </tr>
            ))}
          </SecaoTabela>
        </>
      )}
    </PaginaSistema>
  );
}
