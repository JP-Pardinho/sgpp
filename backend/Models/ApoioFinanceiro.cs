using System;

namespace sgpp.Models
{
    public class ApoioFinanceiro
    {
        public string projeto_codigo { get; set; } = string.Empty;
        public int id_financiamento { get; set; }
        public string tipoVinculo { get; set; } = string.Empty;
        public decimal valorDestinado { get; set; }

        public ApoioFinanceiro() { }

        public ApoioFinanceiro(ApoioFinanceiro apoio)
        {
            this.projeto_codigo = apoio.projeto_codigo;
            this.id_financiamento = apoio.id_financiamento;
            this.tipoVinculo = apoio.tipoVinculo;
            this.valorDestinado = apoio.valorDestinado;
        }
    }

    public class ApoioFinanceiroDetalhe
    {
        public int idFinanciamento { get; set; }
        public string projetoCodigo { get; set; } = string.Empty;
        public string projetoTitulo { get; set; } = string.Empty;
        public string coordenadorCpf { get; set; } = string.Empty;
        public string coordenadorNome { get; set; } = string.Empty;
        public string tipoVinculo { get; set; } = string.Empty;
        public decimal valorDestinado { get; set; }
    }

    public class FinanciamentoVinculado
    {
        public int idFinanciamento { get; set; }
        public string agencia { get; set; } = string.Empty;
        public string tipoFomento { get; set; } = string.Empty;
        public string tipoVinculo { get; set; } = string.Empty;
        public DateTime dataInicio { get; set; }
        public DateTime dataFim { get; set; }
        public decimal valor { get; set; }
    }
}
