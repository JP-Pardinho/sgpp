import { apiFetch, USE_MOCK } from "./api";
import { mockApi } from "./mock";

export type TipoConsulta =
  | "projetos-por-coordenador"
  | "participantes-do-projeto"
  | "producoes-do-projeto"
  | "financiamentos-por-agencia";

export interface ConfigTipoConsulta {
  valor: TipoConsulta;
  rotulo: string;
  codigoUc: string;
  descricao: string;
  rotuloFiltro: string;
  opcaoTodos: string;
}

export const TIPOS_CONSULTA: ConfigTipoConsulta[] = [
  {
    valor: "projetos-por-coordenador",
    rotulo: "Projetos por Coordenador (UC09)",
    codigoUc: "UC09",
    descricao: "Lista os projetos agrupados por docente coordenador e situação.",
    rotuloFiltro: "Coordenador (Docente)",
    opcaoTodos: "Todos os docentes",
  },
  {
    valor: "participantes-do-projeto",
    rotulo: "Participantes do Projeto (UC10)",
    codigoUc: "UC10",
    descricao: "Exibe a equipe vinculada agrupada por projeto de pesquisa.",
    rotuloFiltro: "Projeto",
    opcaoTodos: "Todos os projetos",
  },
  {
    valor: "producoes-do-projeto",
    rotulo: "Produções do Projeto (UC11)",
    codigoUc: "UC11",
    descricao: "Apresenta as produções científicas e autores agrupados por projeto.",
    rotuloFiltro: "Projeto",
    opcaoTodos: "Todos os projetos",
  },
  {
    valor: "financiamentos-por-agencia",
    rotulo: "Financiamentos por Agência (UC12)",
    codigoUc: "UC12",
    descricao: "Consolida termos de fomento, valores distribuídos e saldo por agência.",
    rotuloFiltro: "Agência financiadora",
    opcaoTodos: "Todas as agências",
  },
];

export interface GrupoConsulta {
  chave: string;
  titulo: string;
  subtitulo?: string;
  colunas: string[];
  linhas: string[][];
  subtotalLabel: string;
  subtotalValor: string;
}

export interface ResultadoConsulta {
  tipo: TipoConsulta;
  tituloRelatorio: string;
  filtroAplicado: string;
  colunasCsv: string[];
  linhasCsv: string[][];
  grupos: GrupoConsulta[];
  totalRegistros: number;
  resumoGeral: string;
}

export const consultasService = {
  executar: (tipo: TipoConsulta, filtro = ""): Promise<ResultadoConsulta> => {
    if (USE_MOCK) {
      return mockApi.executarConsulta(tipo, filtro);
    }
    const query = filtro ? `?filtro=${encodeURIComponent(filtro)}` : "";
    return apiFetch<ResultadoConsulta>(`/consultas/${tipo}${query}`);
  },
};

function escaparCelulaCsv(valor: string): string {
  const texto = String(valor ?? "").replace(/\r?\n/g, " ");
  if (/[;"\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/** Gera e baixa um arquivo CSV com BOM UTF-8 compatível com Excel em português. */
export function exportarResultadoCsv(resultado: ResultadoConsulta): void {
  const linhas = [
    resultado.colunasCsv.map(escaparCelulaCsv).join(";"),
    ...resultado.linhasCsv.map((linha) => linha.map(escaparCelulaCsv).join(";")),
  ];
  const conteudo = `\uFEFF${linhas.join("\r\n")}`;
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `consulta-${resultado.tipo}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
