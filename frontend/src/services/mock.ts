// Dados de exemplo para trabalhar o front sem o back-end (NEXT_PUBLIC_USE_MOCK=true).
import { formatarData, formatarMoeda } from "@/lib/format";
import { formatarCpf } from "@/lib/validacao";
import type { Usuario } from "@/lib/session";
import type { Dashboard } from "./dashboardServices";
import type { LoginPayload, LoginResposta } from "./authService";
import type { GrupoConsulta, ResultadoConsulta, TipoConsulta } from "./consultaServices";
import type {
  ApoioFinanceiro,
  Financiamento,
  NovoFinanciamento,
  VincularFinanciamentoPayload,
} from "./financiamentoServices";
import type { AtualizarParticipante, Participante } from "./participanteServices";
import type {
  AutorProducao,
  NovaProducao,
  ProducaoCientifica,
  VincularProducaoPayload,
} from "./producaoServices";
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
  { cpf: "111.111.111-11", nome: "Prof. Carlos Mendes", emailInstitucional: "carlos.mendes@ufes.br", tipo: "Docente", perfilAcesso: "Coordenador" },
  { cpf: "222.222.222-22", nome: "Dra. Silvia das Dores Rissino", emailInstitucional: "silvia.rissino@ufes.br", tipo: "Docente", perfilAcesso: "Coordenador" },
  { cpf: "333.333.333-33", nome: "Dr. Carlos Eduardo Moronari", emailInstitucional: "carlos.moronari@ufes.br", tipo: "Docente", perfilAcesso: "Coordenador" },
  { cpf: "444.444.444-44", nome: "Prof. Gabriel dos Santos Lima", emailInstitucional: "gabriel.lima@ufes.br", tipo: "Docente", perfilAcesso: "Coordenador" },
  { cpf: "555.555.555-55", nome: "João Pedro Pardinho", emailInstitucional: "joao.pardinho@ufes.br", tipo: "Docente", perfilAcesso: "Coordenador" },
  { cpf: "666.666.666-66", nome: "Joaquim Moizes Honorato de Sá", emailInstitucional: "joaquim.sa@ufes.br", tipo: "Docente", perfilAcesso: "Coordenador" },
  { cpf: "777.777.777-77", nome: "Nícolas Leal Espindula", emailInstitucional: "nicolas.espindula@ufes.br", tipo: "Docente", perfilAcesso: "Coordenador" },
  { cpf: "888.888.888-88", nome: "Mariana Souza Silva", emailInstitucional: "mariana.silva@edu.ufes.br", tipo: "Discente", perfilAcesso: "Participante" },
  { cpf: "999.999.999-99", nome: "Roberto Alves de Oliveira", emailInstitucional: "roberto.oliveira@ufes.br", tipo: "Técnico", perfilAcesso: "Participante" },
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
  if (!projeto?.coordenador_cpf) {
    equipesPorProjeto[codigo] = [];
    return equipesPorProjeto[codigo];
  }

  const cpfDigitos = projeto.coordenador_cpf.replace(/\D/g, "");
  const coord = participantes.find((p) => p.cpf.replace(/\D/g, "") === cpfDigitos);

  equipesPorProjeto[codigo] = [
    {
      cpf: coord?.cpf ?? projeto.coordenador_cpf,
      nome: coord?.nome ?? projeto.coordenador_nome ?? "Coordenador",
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

const autorDe = (cpf: string): AutorProducao => {
  const p = participantes.find((item) => item.cpf === cpf);
  return {
    cpf: p?.cpf ?? cpf,
    nome: p?.nome ?? "Pesquisador",
    tipo: p?.tipo ?? "Docente",
  };
};

const catalogoProducoes: ProducaoCientifica[] = [
  {
    id: 1,
    titulo: "Impacto das cheias na qualidade da água do Rio Cricaré",
    tipo: "Artigo",
    ano: 2026,
    meioDivulgacao: "Revista",
    projetoCodigo: "PRJ-2026-014",
    autores: [autorDe("111.111.111-11"), autorDe("888.888.888-88")],
  },
  {
    id: 2,
    titulo: "Análise microbiológica de sedimentos no estuário do Cricaré",
    tipo: "Artigo",
    ano: 2026,
    meioDivulgacao: "Congresso",
    projetoCodigo: "PRJ-2026-014",
    autores: [autorDe("111.111.111-11"), autorDe("999.999.999-99")],
  },
  {
    id: 3,
    titulo: "Protocolo de coleta e monitoramento participativo de rios",
    tipo: "Relatório técnico",
    ano: 2026,
    meioDivulgacao: "Repositório",
    projetoCodigo: "PRJ-2026-014",
    autores: [autorDe("111.111.111-11")],
  },
  {
    id: 4,
    titulo: "Sistema de Monitoramento Hidrológico OpenData",
    tipo: "Software",
    ano: 2026,
    meioDivulgacao: "Repositório",
    projetoCodigo: null,
    autores: [],
  },
];

let proximoIdProducao = 5;

export const mockApi = {
  login: ({ emailInstitucional, senha }: LoginPayload): Promise<LoginResposta> => {
    const emailNorm = emailInstitucional.trim().toLowerCase();
    if (!emailNorm.includes("@") || !senha) {
      return atraso(null).then(() => {
        throw new Error("E-mail institucional ou senha inválidos.");
      });
    }
    const encontrado = participantes.find(
      (p) => p.emailInstitucional.trim().toLowerCase() === emailNorm,
    );
    const usuario: Usuario = encontrado
      ? {
          cpf: encontrado.cpf,
          nome: encontrado.nome,
          perfil: encontrado.perfilAcesso ?? "Participante",
          emailInstitucional: encontrado.emailInstitucional,
          tipo: encontrado.tipo,
        }
      : {
          cpf: "111.111.111-01",
          nome: "Ana Beatriz Souza",
          perfil: "Administrador",
          emailInstitucional: emailNorm,
          tipo: "Técnico",
        };
    return atraso({ token: `token-de-exemplo:${usuario.cpf}`, usuario });
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

  listarParticipantes: (tipo?: string) => {
    const lista = tipo
      ? participantes.filter((p) => p.tipo.toLowerCase() === tipo.trim().toLowerCase())
      : [...participantes];
    return atraso(lista, 100);
  },

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
    const emailNorm = (participante.emailInstitucional ?? "").trim().toLowerCase();

    if (participantes.some((p) => p.cpf.replace(/\D/g, "") === cpfDigitos)) {
      throw new Error("Já existe um participante cadastrado com este CPF.");
    }
    if (
      emailNorm &&
      participantes.some((p) => (p.emailInstitucional ?? "").trim().toLowerCase() === emailNorm)
    ) {
      throw new Error("Já existe um participante cadastrado com este e-mail institucional.");
    }

    const novo: Participante = {
      cpf: participante.cpf.trim(),
      nome: participante.nome.trim(),
      emailInstitucional: participante.emailInstitucional.trim().toLowerCase(),
      tipo: participante.tipo,
      perfilAcesso: participante.perfilAcesso ?? "Participante",
    };
    participantes.unshift(novo);
    return atraso({ ...novo });
  },

  atualizarParticipante: async (cpf: string, dados: AtualizarParticipante) => {
    const alvo = cpf.replace(/\D/g, "");
    const i = participantes.findIndex(
      (p) => p.cpf === cpf || p.cpf.replace(/\D/g, "") === alvo,
    );
    if (i < 0) throw new Error("Participante não encontrado.");

    const emailNorm = dados.emailInstitucional.trim().toLowerCase();
    if (
      participantes.some(
        (p, idx) => idx !== i && p.emailInstitucional.trim().toLowerCase() === emailNorm,
      )
    ) {
      throw new Error("Já existe um participante cadastrado com este e-mail institucional.");
    }

    participantes[i] = {
      ...participantes[i],
      nome: dados.nome.trim(),
      emailInstitucional: emailNorm,
      tipo: dados.tipo,
      perfilAcesso: dados.perfilAcesso ?? participantes[i].perfilAcesso ?? "Participante",
    };
    return atraso({ ...participantes[i] });
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
    const processoNorm = (dados.numeroProcesso ?? "").trim().toLowerCase();
    if (
      processoNorm &&
      catalogoFinanciamentos.some(
        (f) => (f.numeroProcesso ?? "").trim().toLowerCase() === processoNorm,
      )
    ) {
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
      numeroProcesso: (dados.numeroProcesso ?? "").trim(),
      tipoFomento: dados.tipoFomento.trim(),
      valorTotal: dados.valorTotal,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
    };
    catalogoFinanciamentos.unshift(novo);
    return atraso({ ...novo });
  },

  atualizarFinanciamento: async (id: number, dados: NovoFinanciamento) => {
    const idx = catalogoFinanciamentos.findIndex((f) => f.idFinanciamento === id);
    if (idx < 0) throw new Error("Financiamento não encontrado.");
    if (!dados.dataInicio || !dados.dataFim || dados.dataFim <= dados.dataInicio) {
      throw new Error("A data de fim da vigência deve ser posterior à data de início.");
    }
    if (dados.valorTotal <= 0) {
      throw new Error("O valor total deve ser maior que zero.");
    }

    catalogoFinanciamentos[idx] = {
      ...catalogoFinanciamentos[idx],
      agenciaFinanciadora: dados.agenciaFinanciadora.trim(),
      numeroProcesso: (dados.numeroProcesso ?? catalogoFinanciamentos[idx].numeroProcesso ?? "").trim(),
      tipoFomento: dados.tipoFomento.trim(),
      valorTotal: dados.valorTotal,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
    };
    return atraso({ ...catalogoFinanciamentos[idx] });
  },

  excluirFinanciamento: async (id: number) => {
    const idx = catalogoFinanciamentos.findIndex((f) => f.idFinanciamento === id);
    if (idx >= 0) catalogoFinanciamentos.splice(idx, 1);
    return atraso(undefined);
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
  listarProducoes: (codigo = "PRJ-2026-014"): Promise<ProducaoVinculada[]> =>
    atraso(
      catalogoProducoes
        .filter((p) => p.projetoCodigo === codigo)
        .map((p) => ({
          id: p.id,
          titulo: p.titulo,
          tipo: p.tipo,
          ano: p.ano,
          meioDivulgacao: p.meioDivulgacao,
        })),
    ),

  listarCatalogoProducoes: () =>
    atraso(
      catalogoProducoes.map((p) => ({
        ...p,
        projetoTitulo: p.projetoCodigo ? tituloProjeto(p.projetoCodigo) : null,
        autores: p.autores.map((a) => ({ ...a })),
      })),
    ),

  buscarProducao: async (id: number) => {
    const prod = catalogoProducoes.find((p) => p.id === id);
    if (!prod) throw new Error("Produção científica não encontrada.");
    return atraso({
      ...prod,
      projetoTitulo: prod.projetoCodigo ? tituloProjeto(prod.projetoCodigo) : null,
      autores: prod.autores.map((a) => ({ ...a })),
    });
  },

  criarProducao: async (dados: NovaProducao) => {
    const tituloNorm = dados.titulo.trim().toLowerCase();
    if (
      catalogoProducoes.some(
        (p) => p.titulo.trim().toLowerCase() === tituloNorm && p.ano === dados.ano,
      )
    ) {
      throw new Error("Já existe uma produção científica com este título neste ano.");
    }

    const nova: ProducaoCientifica = {
      id: proximoIdProducao++,
      titulo: dados.titulo.trim(),
      tipo: dados.tipo.trim(),
      ano: dados.ano,
      meioDivulgacao: dados.meioDivulgacao.trim(),
      projetoCodigo: dados.projetoCodigo ?? null,
      projetoTitulo: dados.projetoCodigo ? tituloProjeto(dados.projetoCodigo) : null,
      autores: [],
    };
    catalogoProducoes.unshift(nova);
    return atraso({ ...nova, autores: [] });
  },

  atualizarProducao: async (id: number, dados: NovaProducao) => {
    const idx = catalogoProducoes.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Produção científica não encontrada.");

    const atual = catalogoProducoes[idx];
    const projetoCodigo =
      dados.projetoCodigo !== undefined ? dados.projetoCodigo : atual.projetoCodigo ?? null;

    catalogoProducoes[idx] = {
      ...atual,
      titulo: dados.titulo.trim(),
      tipo: dados.tipo.trim(),
      ano: dados.ano,
      meioDivulgacao: dados.meioDivulgacao.trim(),
      projetoCodigo,
      projetoTitulo: projetoCodigo ? tituloProjeto(projetoCodigo) : null,
    };
    return atraso({
      ...catalogoProducoes[idx],
      autores: catalogoProducoes[idx].autores.map((a) => ({ ...a })),
    });
  },

  vincularProducao: async (payload: VincularProducaoPayload) => {
    const prod = catalogoProducoes.find((p) => p.id === payload.producaoId);
    if (!prod) throw new Error("Produção científica não encontrada.");

    const projeto = projetos.find((p) => p.codigo === payload.projetoCodigo);
    if (!projeto) throw new Error("Projeto selecionado não encontrado.");

    // RN04: autores devem ser participantes previamente cadastrados
    const autoresUnicos: AutorProducao[] = [];
    const vistos = new Set<string>();
    for (const cpf of payload.autoresCpfs) {
      const digitos = cpf.replace(/\D/g, "");
      if (vistos.has(digitos)) continue;
      const participante = participantes.find((p) => p.cpf.replace(/\D/g, "") === digitos);
      if (!participante) {
        throw new Error(
          "RN04: Todos os autores devem estar previamente cadastrados como participantes.",
        );
      }
      vistos.add(digitos);
      autoresUnicos.push({
        cpf: participante.cpf,
        nome: participante.nome,
        tipo: participante.tipo,
      });
    }

    if (autoresUnicos.length === 0) {
      throw new Error("Selecione pelo menos um autor cadastrado.");
    }

    prod.projetoCodigo = projeto.codigo;
    prod.projetoTitulo = projeto.titulo;
    prod.autores = autoresUnicos;

    return atraso({
      ...prod,
      autores: autoresUnicos.map((a) => ({ ...a })),
    });
  },

  excluirProducao: async (id: number) => {
    const idx = catalogoProducoes.findIndex((p) => p.id === id);
    if (idx >= 0) catalogoProducoes.splice(idx, 1);
    return atraso(undefined);
  },

  executarConsulta: async (tipo: TipoConsulta, filtro = ""): Promise<ResultadoConsulta> => {
    const filtroLimpo = filtro.trim();

    if (tipo === "projetos-por-coordenador") {
      const filtroDigitos = filtroLimpo.replace(/\D/g, "");
      const filtrados = filtroDigitos
        ? projetos.filter((p) => (p.coordenador_cpf ?? "").replace(/\D/g, "") === filtroDigitos)
        : projetos;

      const mapa = new Map<string, Projeto[]>();
      for (const p of filtrados) {
        const chave = p.coordenador_cpf ?? "sem-coordenador";
        const lista = mapa.get(chave) ?? [];
        lista.push(p);
        mapa.set(chave, lista);
      }

      const grupos: GrupoConsulta[] = Array.from(mapa.entries()).map(([cpf, lista]) => {
        const nome = lista[0]?.coordenador_nome || nomeDe(cpf) || "Coordenador não informado";
        const emAndamento = lista.filter((p) => p.situacao === "Em andamento").length;
        return {
          chave: cpf,
          titulo: nome,
          subtitulo: cpf !== "sem-coordenador" ? `CPF: ${formatarCpf(cpf)}` : undefined,
          colunas: ["Código", "Título do projeto", "Situação", "Início", "Término"],
          linhas: lista.map((p) => [
            p.codigo,
            p.titulo,
            p.situacao,
            formatarData(p.dataInicio),
            formatarData(p.dataFim),
          ]),
          subtotalLabel: "Subtotal de projetos do coordenador",
          subtotalValor: `${lista.length} ${lista.length === 1 ? "projeto" : "projetos"} (${emAndamento} em andamento)`,
        };
      });

      const linhasCsv = filtrados.map((p) => [
        p.coordenador_nome || nomeDe(p.coordenador_cpf ?? "") || "-",
        formatarCpf(p.coordenador_cpf ?? ""),
        p.codigo,
        p.titulo,
        p.situacao,
        formatarData(p.dataInicio),
        formatarData(p.dataFim),
      ]);

      return atraso({
        tipo,
        tituloRelatorio: "Projetos por Coordenador (UC09)",
        filtroAplicado: filtroLimpo
          ? `Coordenador: ${nomeDe(filtroLimpo) || formatarCpf(filtroLimpo)}`
          : "Todos os docentes",
        colunasCsv: ["Coordenador", "CPF", "Código", "Título do projeto", "Situação", "Início", "Término"],
        linhasCsv,
        grupos,
        totalRegistros: filtrados.length,
        resumoGeral: `${grupos.length} ${grupos.length === 1 ? "coordenador" : "coordenadores"} · ${filtrados.length} ${filtrados.length === 1 ? "projeto" : "projetos"}`,
      });
    }

    if (tipo === "participantes-do-projeto") {
      const projetosAlvo = filtroLimpo
        ? projetos.filter((p) => p.codigo === filtroLimpo)
        : projetos;

      const grupos: GrupoConsulta[] = [];
      const linhasCsv: string[][] = [];
      let totalRegistros = 0;

      for (const proj of projetosAlvo) {
        const equipeProj = obterOuCriarEquipe(proj.codigo);
        if (!filtroLimpo && equipeProj.length === 0) continue;

        totalRegistros += equipeProj.length;
        grupos.push({
          chave: proj.codigo,
          titulo: `${proj.codigo} — ${proj.titulo}`,
          subtitulo: `Situação: ${proj.situacao} · Coordenador: ${proj.coordenador_nome ?? "-"}`,
          colunas: ["Participante", "CPF", "Tipo", "Função", "Entrada", "Saída"],
          linhas: equipeProj.map((m) => [
            m.nome,
            formatarCpf(m.cpf),
            m.tipo,
            m.funcao,
            formatarData(m.dataEntrada),
            formatarData(m.dataSaida),
          ]),
          subtotalLabel: "Subtotal de participantes no projeto",
          subtotalValor: `${equipeProj.length} ${equipeProj.length === 1 ? "participante" : "participantes"}`,
        });

        for (const m of equipeProj) {
          linhasCsv.push([
            proj.codigo,
            proj.titulo,
            m.nome,
            formatarCpf(m.cpf),
            m.tipo,
            m.funcao,
            formatarData(m.dataEntrada),
            formatarData(m.dataSaida),
          ]);
        }
      }

      return atraso({
        tipo,
        tituloRelatorio: "Participantes do Projeto (UC10)",
        filtroAplicado: filtroLimpo
          ? `Projeto: ${filtroLimpo} — ${tituloProjeto(filtroLimpo)}`
          : "Todos os projetos",
        colunasCsv: ["Código do projeto", "Título do projeto", "Participante", "CPF", "Tipo", "Função", "Entrada", "Saída"],
        linhasCsv,
        grupos,
        totalRegistros,
        resumoGeral: `${grupos.length} ${grupos.length === 1 ? "projeto" : "projetos"} · ${totalRegistros} ${totalRegistros === 1 ? "vínculo" : "vínculos"}`,
      });
    }

    if (tipo === "producoes-do-projeto") {
      const filtradas = catalogoProducoes.filter((p) => {
        if (!p.projetoCodigo) return false;
        if (filtroLimpo && p.projetoCodigo !== filtroLimpo) return false;
        return true;
      });

      const mapa = new Map<string, ProducaoCientifica[]>();
      for (const prod of filtradas) {
        const codigo = prod.projetoCodigo!;
        const lista = mapa.get(codigo) ?? [];
        lista.push(prod);
        mapa.set(codigo, lista);
      }

      const grupos: GrupoConsulta[] = Array.from(mapa.entries()).map(([codigo, lista]) => ({
        chave: codigo,
        titulo: `${codigo} — ${tituloProjeto(codigo)}`,
        subtitulo: "Produções científicas vinculadas ao projeto",
        colunas: ["Título da produção", "Tipo", "Ano", "Meio de divulgação", "Autores"],
        linhas: lista.map((prod) => [
          prod.titulo,
          prod.tipo,
          String(prod.ano),
          prod.meioDivulgacao,
          prod.autores.map((a) => a.nome).join(", ") || "-",
        ]),
        subtotalLabel: "Subtotal de produções do projeto",
        subtotalValor: `${lista.length} ${lista.length === 1 ? "produção" : "produções"}`,
      }));

      const linhasCsv = filtradas.map((prod) => [
        prod.projetoCodigo ?? "-",
        prod.projetoCodigo ? tituloProjeto(prod.projetoCodigo) : "-",
        prod.titulo,
        prod.tipo,
        String(prod.ano),
        prod.meioDivulgacao,
        prod.autores.map((a) => a.nome).join(", ") || "-",
      ]);

      return atraso({
        tipo,
        tituloRelatorio: "Produções do Projeto (UC11)",
        filtroAplicado: filtroLimpo
          ? `Projeto: ${filtroLimpo} — ${tituloProjeto(filtroLimpo)}`
          : "Todos os projetos com produções",
        colunasCsv: ["Código do projeto", "Título do projeto", "Título da produção", "Tipo", "Ano", "Meio de divulgação", "Autores"],
        linhasCsv,
        grupos,
        totalRegistros: filtradas.length,
        resumoGeral: `${grupos.length} ${grupos.length === 1 ? "projeto" : "projetos"} · ${filtradas.length} ${filtradas.length === 1 ? "produção" : "produções"}`,
      });
    }

    // UC12: financiamentos-por-agencia
    const filtrados = filtroLimpo
      ? catalogoFinanciamentos.filter((f) => f.agenciaFinanciadora === filtroLimpo)
      : catalogoFinanciamentos;

    const mapa = new Map<string, Financiamento[]>();
    for (const fin of filtrados) {
      const lista = mapa.get(fin.agenciaFinanciadora) ?? [];
      lista.push(fin);
      mapa.set(fin.agenciaFinanciadora, lista);
    }

    let somaGeralTotal = 0;
    const linhasCsv: string[][] = [];

    const grupos: GrupoConsulta[] = Array.from(mapa.entries()).map(([agencia, lista]) => {
      let somaTotal = 0;
      let somaDist = 0;
      let somaDisp = 0;

      const linhas = lista.map((f) => {
        const dist = apoiosFinanceiros
          .filter((a) => a.idFinanciamento === f.idFinanciamento)
          .reduce((acc, a) => acc + a.valorDestinado, 0);
        const disp = Math.max(0, f.valorTotal - dist);

        somaTotal += f.valorTotal;
        somaDist += dist;
        somaDisp += disp;

        const procLabel = f.numeroProcesso || `#${f.idFinanciamento}`;

        linhasCsv.push([
          agencia,
          procLabel,
          f.tipoFomento,
          formatarData(f.dataInicio),
          formatarData(f.dataFim),
          formatarMoeda(f.valorTotal),
          formatarMoeda(dist),
          formatarMoeda(disp),
        ]);

        return [
          procLabel,
          f.tipoFomento,
          `${formatarData(f.dataInicio)} a ${formatarData(f.dataFim)}`,
          formatarMoeda(f.valorTotal),
          formatarMoeda(dist),
          formatarMoeda(disp),
        ];
      });

      somaGeralTotal += somaTotal;

      return {
        chave: agencia,
        titulo: `Agência ${agencia}`,
        subtitulo: `${lista.length} ${lista.length === 1 ? "financiamento registrado" : "financiamentos registrados"}`,
        colunas: ["Processo", "Tipo de fomento", "Vigência", "Valor total", "Distribuído", "Disponível"],
        linhas,
        subtotalLabel: `Subtotal ${agencia}`,
        subtotalValor: `Total: ${formatarMoeda(somaTotal)} · Distribuído: ${formatarMoeda(somaDist)} · Disponível: ${formatarMoeda(somaDisp)}`,
      };
    });

    return atraso({
      tipo,
      tituloRelatorio: "Financiamentos por Agência (UC12)",
      filtroAplicado: filtroLimpo ? `Agência: ${filtroLimpo}` : "Todas as agências",
      colunasCsv: ["Agência", "Processo", "Tipo de fomento", "Início", "Fim", "Valor total", "Distribuído", "Disponível"],
      linhasCsv,
      grupos,
      totalRegistros: filtrados.length,
      resumoGeral: `${grupos.length} ${grupos.length === 1 ? "agência" : "agências"} · ${filtrados.length} ${filtrados.length === 1 ? "financiamento" : "financiamentos"} · Total ${formatarMoeda(somaGeralTotal)}`,
    });
  },

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
