// Dados de exemplo para trabalhar o front sem o back-end (NEXT_PUBLIC_USE_MOCK=true).
import type { Usuario } from "@/lib/session";
import type { Dashboard } from "./dashboardServices";
import type { LoginPayload, LoginResposta } from "./authService";
import type { Participante } from "./participanteServices";
import type { Projeto } from "./projetoServices";
import type { EquipeMembro, FinanciamentoVinculado, ProducaoVinculada } from "./vinculoServices";

const atraso = <T,>(valor: T, ms = 250) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(valor), ms));

const participantes: Participante[] = [
  { cpf: "111.111.111-11", nome: "Prof. Carlos Mendes", tipo: "Docente" },
  { cpf: "222.222.222-22", nome: "Dra. Silvia das Dores Rissino", tipo: "Docente" },
  { cpf: "333.333.333-33", nome: "Dr. Carlos Eduardo Moronari", tipo: "Docente" },
  { cpf: "444.444.444-44", nome: "Prof. Gabriel dos Santos Lima", tipo: "Docente" },
  { cpf: "555.555.555-55", nome: "João Pedro Pardinho", tipo: "Docente" },
  { cpf: "666.666.666-66", nome: "Joaquim Moizes Honorato de Sá", tipo: "Docente" },
  { cpf: "777.777.777-77", nome: "Nícolas Leal Espindula", tipo: "Docente" },
  { cpf: "888.888.888-88", nome: "Mariana Souza Silva", tipo: "Discente" },
  { cpf: "999.999.999-99", nome: "Roberto Alves de Oliveira", tipo: "Técnico" },
];

const nomeDe = (cpf: string) => participantes.find((p) => p.cpf === cpf)?.nome ?? "";

const base: [string, string, string, string, string, string][] = [
  ["PRJ-2026-014", "Monitoramento ambiental do Rio Cricaré", "111.111.111-11", "Em andamento", "2026-03-01", "2028-02-28"],
  ["PRJ-2026-015", "Sistemas Inteligentes em Redes de Computadores", "222.222.222-22", "Concluído", "2025-01-10", "2027-01-09"],
  ["PRJ-2026-016", "Desenvolvimento de Algoritmos Otimizados", "333.333.333-33", "Em andamento", "2026-04-01", "2028-03-31"],
  ["PRJ-2026-017", "Análise de Poluentes na Bacia de São Mateus", "444.444.444-44", "Cancelado", "2025-02-15", "2026-02-14"],
  ["PRJ-2026-018", "Inteligência Artificial aplicada ao Clima", "555.555.555-55", "Em andamento", "2026-06-01", "2028-05-31"],
  ["PRJ-2026-019", "Estudos Ambientais do Litoral Capixaba", "666.666.666-66", "Concluído", "2024-03-10", "2026-03-09"],
  ["PRJ-2026-020", "Infraestrutura de Dados Abertos na Saúde", "777.777.777-77", "Em andamento", "2026-05-12", "2027-11-11"],
  ["PRJ-2026-021", "Tecnologias Assistivas no Ensino Superior", "222.222.222-22", "Em andamento", "2026-08-20", "2028-08-19"],
];

const temas = [
  "Análise de Dados Epidemiológicos no ES",
  "Sistemas de Informação Geográfica",
  "Produções Científicas no ES",
  "Energias Renováveis no Norte Capixaba",
  "Aprendizado de Máquina para Agricultura",
  "Qualidade da Água em Reservatórios",
  "Robótica Educacional",
  "Segurança de Redes Acadêmicas",
];
const sits = ["Em andamento", "Concluído", "Em andamento", "Cancelado"];

const projetos: Projeto[] = [
  ...base.map(([codigo, titulo, cpf, situacao, ini, fim]) => ({
    codigo,
    titulo,
    descricao: `Descrição do projeto "${titulo}".`,
    situacao,
    dataInicio: ini,
    dataFim: fim,
    coordenador_cpf: cpf,
    coordenador_nome: nomeDe(cpf),
  })),
  ...Array.from({ length: 16 }, (_, i): Projeto => {
    const cpf = participantes[i % 7].cpf;
    return {
      codigo: `PRJ-2026-${String(22 + i).padStart(3, "0")}`,
      titulo: temas[i % temas.length],
      descricao: "Projeto de pesquisa de exemplo.",
      situacao: sits[i % sits.length],
      dataInicio: "2026-01-15",
      dataFim: `202${7 + (i % 2)}-0${1 + (i % 9)}-28`,
      coordenador_cpf: cpf,
      coordenador_nome: nomeDe(cpf),
    };
  }),
];

const equipe: EquipeMembro[] = [
  { cpf: "111.111.111-11", nome: "Carlos Mendes", tipo: "Docente", funcao: "Coordenador", dataEntrada: "2026-03-01", dataSaida: null },
  { cpf: "888.888.888-88", nome: "Mariana Souza Silva", tipo: "Discente", funcao: "Bolsista de IC", dataEntrada: "2026-03-01", dataSaida: "2027-02-28" },
  { cpf: "999.999.999-99", nome: "Roberto Alves de Oliveira", tipo: "Técnico", funcao: "Apoio Técnico", dataEntrada: "2026-04-01", dataSaida: "2028-02-28" },
];

const financiamentos: FinanciamentoVinculado[] = [
  { idFinanciamento: 1, agencia: "CNPq", tipoFomento: "Bolsa", tipoVinculo: "Total", dataInicio: "2026-03-01", dataFim: "2028-02-28", valor: 48000 },
  { idFinanciamento: 2, agencia: "FAPES", tipoFomento: "Auxílio Pesquisa", tipoVinculo: "Parcial", dataInicio: "2026-05-01", dataFim: "2027-04-30", valor: 25000 },
  { idFinanciamento: 3, agencia: "CAPES", tipoFomento: "Apoio Financeiro", tipoVinculo: "Parcial", dataInicio: "2026-03-01", dataFim: "2028-02-28", valor: 12000 },
];

const producoes: ProducaoVinculada[] = [
  { id: 1, titulo: "Impacto das cheias na qualidade da água do Rio Cricaré", tipo: "Artigo", ano: 2026, meioDivulgacao: "Revista Brasileira de Recursos Hídricos" },
  { id: 2, titulo: "Análise microbiológica de sedimentos no estuário do Cricaré", tipo: "Artigo", ano: 2026, meioDivulgacao: "Congresso Brasileiro de Oceanografia" },
  { id: 3, titulo: "Protocolo de coleta e monitoramento participativo de rios", tipo: "Relatório Técnico", ano: 2026, meioDivulgacao: "Repositório Institucional UFES" },
];

export const mockApi = {
  login: ({ email, senha }: LoginPayload): Promise<LoginResposta> => {
    if (!email.includes("@") || !senha) {
      return atraso(null).then(() => {
        throw new Error("E-mail ou senha inválidos.");
      });
    }
    const usuario: Usuario = { nome: "Ana Souza", perfil: "Administrador", email };
    return atraso({ token: "token-de-exemplo", usuario });
  },

  listarProjetos: () => atraso([...projetos]),

  buscarProjeto: async (codigo: string) => {
    const projeto = projetos.find((p) => p.codigo === codigo);
    if (!projeto) throw new Error("Projeto não encontrado.");
    return atraso({ ...projeto });
  },

  criarProjeto: async (projeto: Projeto) => {
    if (projetos.some((p) => p.codigo === projeto.codigo)) {
      throw new Error("Já existe um projeto com este código.");
    }
    const novo = { ...projeto, coordenador_nome: nomeDe(projeto.coordenador_cpf ?? "") };
    projetos.unshift(novo);
    return atraso(novo);
  },

  atualizarProjeto: async (codigo: string, projeto: Projeto) => {
    const i = projetos.findIndex((p) => p.codigo === codigo);
    if (i < 0) throw new Error("Projeto não encontrado.");
    projetos[i] = { ...projeto, coordenador_nome: nomeDe(projeto.coordenador_cpf ?? "") };
    return atraso(projetos[i]);
  },

  excluirProjeto: async (codigo: string) => {
    const i = projetos.findIndex((p) => p.codigo === codigo);
    if (i >= 0) projetos.splice(i, 1);
    return atraso(undefined);
  },

  listarParticipantes: () => atraso([...participantes], 100),
  listarEquipe: () => atraso([...equipe]),
  listarFinanciamentos: () => atraso([...financiamentos]),
  listarProducoes: () => atraso([...producoes]),

  dashboard: (): Promise<Dashboard> => {
    const conta = (s: string) => projetos.filter((p) => p.situacao === s).length;
    return atraso({
      vencimentosProximos30Dias: 2,
      projetosEmAndamento: conta("Em andamento"),
      totalParticipantes: 138,
      financiamentoTotal: 2_450_000,
      producoesCientificas: 57,
      projetosPorSituacao: {
        emAndamento: conta("Em andamento"),
        concluido: conta("Concluído"),
        cancelado: conta("Cancelado"),
      },
      financiamentoPorAgencia: [
        { agencia: "CNPq", valor: 1_100_000 },
        { agencia: "FAPES", valor: 850_000 },
        { agencia: "CAPES", valor: 500_000 },
      ],
      projetosRecentes: projetos.slice(0, 5),
    });
  },
};
