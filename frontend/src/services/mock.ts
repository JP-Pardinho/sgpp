// Dados de exemplo para trabalhar o front sem o back-end (NEXT_PUBLIC_USE_MOCK=true).
import type { Usuario } from "@/lib/session";
import type { Dashboard } from "./dashboardServices";
import type { LoginPayload, LoginResposta } from "./authService";
import type {
  ApoioFinanceiro,
  Financiamento,
  NovoFinanciamento,
  VincularFinanciamentoPayload,
} from "./financiamentoServices";
import type { Participante } from "./participanteServices";
import type { Projeto } from "./projetoServices";
import type {
  EquipeMembro,
  FinanciamentoVinculado,
  ProducaoVinculada,
  VincularParticipantePayload,
} from "./vinculoServices";

const atraso = <T,>(valor: T, ms = 250) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(valor), ms));

const participantes: Participante[] = [
  { cpf: "111.111.111-11", nome: "Prof. Carlos Mendes", email: "carlos.mendes@ufes.br", tipo: "Docente" },
  { cpf: "222.222.222-22", nome: "Dra. Silvia das Dores Rissino", email: "silvia.rissino@ufes.br", tipo: "Docente" },
  { cpf: "333.333.333-33", nome: "Dr. Carlos Eduardo Moronari", email: "carlos.moronari@ufes.br", tipo: "Docente" },
  { cpf: "444.444.444-44", nome: "Prof. Gabriel dos Santos Lima", email: "gabriel.lima@ufes.br", tipo: "Docente" },
  { cpf: "555.555.555-55", nome: "João Pedro Pardinho", email: "joao.pardinho@ufes.br", tipo: "Docente" },
  { cpf: "666.666.666-66", nome: "Joaquim Moizes Honorato de Sá", email: "joaquim.sa@ufes.br", tipo: "Docente" },
  { cpf: "777.777.777-77", nome: "Nícolas Leal Espindula", email: "nicolas.espindula@ufes.br", tipo: "Docente" },
  { cpf: "888.888.888-88", nome: "Mariana Souza Silva", email: "mariana.silva@edu.ufes.br", tipo: "Discente" },
  { cpf: "999.999.999-99", nome: "Roberto Alves de Oliveira", email: "roberto.oliveira@ufes.br", tipo: "Técnico" },
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
    coordenadorCpf: cpf,
    coordenadorNome: nomeDe(cpf),
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
      coordenadorCpf: cpf,
      coordenadorNome: nomeDe(cpf),
    };
  }),
];

const equipe: EquipeMembro[] = [
  { cpf: "111.111.111-11", nome: "Prof. Carlos Mendes", tipo: "Docente", funcao: "Coordenador", dataEntrada: "2026-03-01", dataSaida: null },
  { cpf: "888.888.888-88", nome: "Mariana Souza Silva", tipo: "Discente", funcao: "Bolsista", dataEntrada: "2026-03-01", dataSaida: "2027-02-28" },
  { cpf: "999.999.999-99", nome: "Roberto Alves de Oliveira", tipo: "Técnico", funcao: "Apoio Técnico", dataEntrada: "2026-04-01", dataSaida: "2028-02-28" },
];

const equipesPorProjeto: Record<string, EquipeMembro[]> = {
  "PRJ-2026-014": equipe,
};

function obterOuCriarEquipe(codigo: string): EquipeMembro[] {
  if (equipesPorProjeto[codigo]) return equipesPorProjeto[codigo];

  const projeto = projetos.find((p) => p.codigo === codigo);
  if (!projeto?.coordenadorCpf) {
    equipesPorProjeto[codigo] = [];
    return equipesPorProjeto[codigo];
  }

  const cpfDigitos = projeto.coordenadorCpf.replace(/\D/g, "");
  const coord = participantes.find((p) => p.cpf.replace(/\D/g, "") === cpfDigitos);

  equipesPorProjeto[codigo] = [
    {
      cpf: coord?.cpf ?? projeto.coordenadorCpf,
      nome: coord?.nome ?? projeto.coordenadorNome ?? "Coordenador",
      tipo: coord?.tipo ?? "Docente",
      funcao: "Coordenador",
      dataEntrada: projeto.dataInicio,
      dataSaida: null,
    },
  ];
  return equipesPorProjeto[codigo];
}

const catalogoFinanciamentos: Financiamento[] = [
  {
    idFinanciamento: 1,
    agenciaFinanciadora: "CNPq",
    numeroProcesso: "402198/2026-4",
    tipoFomento: "Bolsa",
    valorTotal: 120_000,
    dataInicio: "2026-03-01",
    dataFim: "2028-02-28",
  },
  {
    idFinanciamento: 2,
    agenciaFinanciadora: "FAPES",
    numeroProcesso: "2026-88412",
    tipoFomento: "Auxílio Pesquisa",
    valorTotal: 80_000,
    dataInicio: "2026-05-01",
    dataFim: "2027-04-30",
  },
  {
    idFinanciamento: 3,
    agenciaFinanciadora: "CAPES",
    numeroProcesso: "88887.910234/2026-00",
    tipoFomento: "Apoio Financeiro",
    valorTotal: 60_000,
    dataInicio: "2026-03-01",
    dataFim: "2028-02-28",
  },
  {
    idFinanciamento: 4,
    agenciaFinanciadora: "CNPq",
    numeroProcesso: "409876/2026-1",
    tipoFomento: "Equipamentos",
    valorTotal: 50_000,
    dataInicio: "2026-06-01",
    dataFim: "2028-05-31",
  },
];

let proximoIdFinanciamento = 5;

const apoiosFinanceiros: ApoioFinanceiro[] = [
  { idFinanciamento: 1, projetoCodigo: "PRJ-2026-014", tipoVinculo: "Parcial", valorDestinado: 48_000 },
  { idFinanciamento: 1, projetoCodigo: "PRJ-2026-016", tipoVinculo: "Parcial", valorDestinado: 36_000 },
  { idFinanciamento: 2, projetoCodigo: "PRJ-2026-014", tipoVinculo: "Parcial", valorDestinado: 25_000 },
  { idFinanciamento: 3, projetoCodigo: "PRJ-2026-014", tipoVinculo: "Parcial", valorDestinado: 12_000 },
];

const tituloProjeto = (codigo: string) =>
  projetos.find((p) => p.codigo === codigo)?.titulo ?? codigo;

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
    const novo = { ...projeto, coordenadorNome: nomeDe(projeto.coordenadorCpf ?? "") };
    projetos.unshift(novo);
    return atraso(novo);
  },

  atualizarProjeto: async (codigo: string, projeto: Projeto) => {
    const i = projetos.findIndex((p) => p.codigo === codigo);
    if (i < 0) throw new Error("Projeto não encontrado.");
    projetos[i] = { ...projeto, coordenadorNome: nomeDe(projeto.coordenadorCpf ?? "") };
    return atraso(projetos[i]);
  },

  excluirProjeto: async (codigo: string) => {
    const i = projetos.findIndex((p) => p.codigo === codigo);
    if (i >= 0) projetos.splice(i, 1);
    return atraso(undefined);
  },

  listarParticipantes: () => atraso([...participantes], 100),

  buscarParticipante: async (cpf: string) => {
    const alvo = cpf.replace(/\D/g, "");
    const encontrado = participantes.find(
      (p) => p.cpf === cpf || p.cpf.replace(/\D/g, "") === alvo,
    );
    if (!encontrado) throw new Error("Participante não encontrado.");
    return atraso({ ...encontrado });
  },

  criarParticipante: async (participante: Participante) => {
    const cpfDigitos = participante.cpf.replace(/\D/g, "");
    const emailNorm = (participante.email ?? "").trim().toLowerCase();

    if (participantes.some((p) => p.cpf.replace(/\D/g, "") === cpfDigitos)) {
      throw new Error("Já existe um participante cadastrado com este CPF.");
    }
    if (emailNorm && participantes.some((p) => (p.email ?? "").trim().toLowerCase() === emailNorm)) {
      throw new Error("Já existe um participante cadastrado com este e-mail institucional.");
    }

    const novo: Participante = {
      cpf: participante.cpf.trim(),
      nome: participante.nome.trim(),
      email: participante.email?.trim(),
      tipo: participante.tipo,
    };
    participantes.unshift(novo);
    return atraso({ ...novo });
  },

  excluirParticipante: async (cpf: string) => {
    const alvo = cpf.replace(/\D/g, "");
    const i = participantes.findIndex(
      (p) => p.cpf === cpf || p.cpf.replace(/\D/g, "") === alvo,
    );
    if (i >= 0) participantes.splice(i, 1);
    return atraso(undefined);
  },

  listarEquipe: (codigo = "PRJ-2026-014") =>
    atraso(obterOuCriarEquipe(codigo).map((m) => ({ ...m }))),

  vincularParticipante: async (codigo: string, payload: VincularParticipantePayload) => {
    const lista = obterOuCriarEquipe(codigo);
    const cpfAlvo = payload.participanteCpf.replace(/\D/g, "");

    if (lista.some((m) => m.cpf.replace(/\D/g, "") === cpfAlvo)) {
      throw new Error("Este participante já está vinculado ao projeto.");
    }

    if (
      payload.funcao.trim().toLowerCase() === "coordenador" &&
      lista.some((m) => m.funcao.trim().toLowerCase() === "coordenador")
    ) {
      throw new Error(
        "VALIDAÇÃO DE COORDENAÇÃO: Este projeto já possui um coordenador principal. Escolha outra função.",
      );
    }

    const participante = participantes.find((p) => p.cpf.replace(/\D/g, "") === cpfAlvo);
    if (!participante) {
      throw new Error("Participante não encontrado.");
    }

    const novo: EquipeMembro = {
      cpf: participante.cpf,
      nome: participante.nome,
      tipo: participante.tipo,
      funcao: payload.funcao,
      dataEntrada: payload.dataEntrada,
      dataSaida: payload.dataSaida || null,
    };

    lista.push(novo);
    return atraso({ ...novo });
  },

  removerParticipante: async (codigo: string, cpf: string) => {
    const lista = obterOuCriarEquipe(codigo);
    const cpfAlvo = cpf.replace(/\D/g, "");
    const idx = lista.findIndex((m) => m.cpf.replace(/\D/g, "") === cpfAlvo);
    if (idx >= 0) lista.splice(idx, 1);
    return atraso(undefined);
  },
  listarFinanciamentos: (codigo = "PRJ-2026-014"): Promise<FinanciamentoVinculado[]> => {
    const lista = apoiosFinanceiros
      .filter((a) => a.projetoCodigo === codigo)
      .map((a): FinanciamentoVinculado | null => {
        const fin = catalogoFinanciamentos.find((f) => f.idFinanciamento === a.idFinanciamento);
        if (!fin) return null;
        return {
          idFinanciamento: fin.idFinanciamento,
          agencia: fin.agenciaFinanciadora,
          tipoFomento: fin.tipoFomento,
          tipoVinculo: a.tipoVinculo,
          dataInicio: fin.dataInicio,
          dataFim: fin.dataFim,
          valor: a.valorDestinado,
        };
      })
      .filter((item): item is FinanciamentoVinculado => item !== null);
    return atraso(lista);
  },

  listarCatalogoFinanciamentos: () =>
    atraso(catalogoFinanciamentos.map((f) => ({ ...f }))),

  buscarFinanciamento: async (id: number) => {
    const fin = catalogoFinanciamentos.find((f) => f.idFinanciamento === id);
    if (!fin) throw new Error("Financiamento não encontrado.");
    return atraso({ ...fin });
  },

  criarFinanciamento: async (dados: NovoFinanciamento) => {
    const processoNorm = dados.numeroProcesso.trim().toLowerCase();
    if (catalogoFinanciamentos.some((f) => f.numeroProcesso.trim().toLowerCase() === processoNorm)) {
      throw new Error("Já existe um financiamento cadastrado com este número de processo.");
    }
    if (!dados.dataInicio || !dados.dataFim || dados.dataFim <= dados.dataInicio) {
      throw new Error("A data de fim da vigência deve ser posterior à data de início.");
    }
    if (dados.valorTotal <= 0) {
      throw new Error("O valor total deve ser maior que zero.");
    }

    const novo: Financiamento = {
      idFinanciamento: proximoIdFinanciamento++,
      agenciaFinanciadora: dados.agenciaFinanciadora.trim(),
      numeroProcesso: dados.numeroProcesso.trim(),
      tipoFomento: dados.tipoFomento.trim(),
      valorTotal: dados.valorTotal,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
    };
    catalogoFinanciamentos.unshift(novo);
    return atraso({ ...novo });
  },

  listarApoiosPorFinanciamento: (idFinanciamento: number) => {
    const lista = apoiosFinanceiros
      .filter((a) => a.idFinanciamento === idFinanciamento)
      .map((a) => ({
        ...a,
        projetoTitulo: tituloProjeto(a.projetoCodigo),
      }));
    return atraso(lista, 120);
  },

  listarTodosApoios: () =>
    atraso(
      apoiosFinanceiros.map((a) => ({
        ...a,
        projetoTitulo: tituloProjeto(a.projetoCodigo),
      })),
      100,
    ),

  vincularFinanciamentoProjeto: async (payload: VincularFinanciamentoPayload) => {
    const fin = catalogoFinanciamentos.find((f) => f.idFinanciamento === payload.idFinanciamento);
    if (!fin) throw new Error("Financiamento não encontrado.");

    const apoiosDoFinanciamento = apoiosFinanceiros.filter(
      (a) => a.idFinanciamento === payload.idFinanciamento,
    );

    if (apoiosDoFinanciamento.some((a) => a.projetoCodigo === payload.projetoCodigo)) {
      throw new Error("Este projeto já está vinculado a este financiamento.");
    }

    const valorDistribuido = apoiosDoFinanciamento.reduce((acc, a) => acc + a.valorDestinado, 0);
    const saldoDisponivel = Math.max(0, fin.valorTotal - valorDistribuido);

    if (payload.tipoVinculo === "Total" && valorDistribuido > 0) {
      throw new Error(
        "Não é possível usar vínculo Total quando o financiamento já possui valores distribuídos.",
      );
    }

    const valorFinal = payload.tipoVinculo === "Total" ? fin.valorTotal : payload.valorDestinado;
    if (valorFinal <= 0) {
      throw new Error("O valor destinado deve ser maior que zero.");
    }
    if (valorFinal > saldoDisponivel + 0.001) {
      throw new Error("O valor destinado excede o saldo disponível do financiamento.");
    }

    const novo: ApoioFinanceiro = {
      idFinanciamento: payload.idFinanciamento,
      projetoCodigo: payload.projetoCodigo,
      projetoTitulo: tituloProjeto(payload.projetoCodigo),
      tipoVinculo: payload.tipoVinculo,
      valorDestinado: valorFinal,
    };
    apoiosFinanceiros.push(novo);
    return atraso({ ...novo });
  },

  removerVinculoFinanciamento: async (idFinanciamento: number, projetoCodigo: string) => {
    const idx = apoiosFinanceiros.findIndex(
      (a) => a.idFinanciamento === idFinanciamento && a.projetoCodigo === projetoCodigo,
    );
    if (idx >= 0) apoiosFinanceiros.splice(idx, 1);
    return atraso(undefined);
  },
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
