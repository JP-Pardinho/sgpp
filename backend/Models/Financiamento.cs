using System;

namespace sgpp.Models
{
    public class Financiamento
    {
        public int id_financiamento { get; set; }
        public string agenciaFinanciadora { get; set; } = string.Empty;
        public string tipoFomento { get; set; } = string.Empty;
        public decimal valorTotal { get; set; }
        public DateTime dataInicio { get; set; }
        public DateTime dataFim { get; set; }

        public Financiamento() { }

        public Financiamento(Financiamento financiamento)
        {
            this.id_financiamento = financiamento.id_financiamento;
            this.agenciaFinanciadora = financiamento.agenciaFinanciadora;
            this.tipoFomento = financiamento.tipoFomento;
            this.valorTotal = financiamento.valorTotal;
            this.dataInicio = financiamento.dataInicio;
            this.dataFim = financiamento.dataFim;
        }
    }
}
