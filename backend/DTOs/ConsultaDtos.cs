using System;
using System.Collections.Generic;

namespace sgpp.DTOs
{
    public class GrupoConsultaDto
    {
        public string chave { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public string? subtitulo { get; set; }
        public List<string> colunas { get; set; } = new();
        public List<List<string>> linhas { get; set; } = new();
        public string subtotalLabel { get; set; } = string.Empty;
        public string subtotalValor { get; set; } = string.Empty;
    }

    public class ResultadoConsultaDto
    {
        public string tipo { get; set; } = string.Empty;
        public string tituloRelatorio { get; set; } = string.Empty;
        public string filtroAplicado { get; set; } = string.Empty;
        public List<string> colunasCsv { get; set; } = new();
        public List<List<string>> linhasCsv { get; set; } = new();
        public List<GrupoConsultaDto> grupos { get; set; } = new();
        public int totalRegistros { get; set; }
        public string resumoGeral { get; set; } = string.Empty;
    }

    public class ProjetoPorCoordenadorRow
    {
        public string codigo { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public string? descricao { get; set; }
        public string situacao { get; set; } = string.Empty;
        public DateTime dataInicio { get; set; }
        public DateTime? dataFim { get; set; }
        public string coordenador_cpf { get; set; } = string.Empty;
        public string coordenador_nome { get; set; } = string.Empty;
    }

    public class ParticipanteDoProjetoRow
    {
        public string projeto_codigo { get; set; } = string.Empty;
        public string projeto_titulo { get; set; } = string.Empty;
        public string projeto_situacao { get; set; } = string.Empty;
        public string? coordenador_nome { get; set; }
        public string participante_cpf { get; set; } = string.Empty;
        public string participante_nome { get; set; } = string.Empty;
        public string participante_tipo { get; set; } = string.Empty;
        public string funcao { get; set; } = string.Empty;
        public DateTime dataEntrada { get; set; }
        public DateTime? dataSaida { get; set; }
    }

    public class ProducaoDoProjetoRow
    {
        public int id_producao { get; set; }
        public string projeto_codigo { get; set; } = string.Empty;
        public string projeto_titulo { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public string tipoProducao { get; set; } = string.Empty;
        public int anoPublicacao { get; set; }
        public string meioDivulgacao { get; set; } = string.Empty;
        public string autores { get; set; } = "-";
    }

    public class FinanciamentoPorAgenciaRow
    {
        public int id_financiamento { get; set; }
        public string agenciaFinanciadora { get; set; } = string.Empty;
        public string tipoFomento { get; set; } = string.Empty;
        public decimal valorTotal { get; set; }
        public DateTime dataInicio { get; set; }
        public DateTime dataFim { get; set; }
        public decimal valorDistribuido { get; set; }
        public int qtdProjetosApoiados { get; set; }
    }
}
