namespace sgpp.DTOs
{
    public class VincularFinanciamentoRequest
    {
        public int? idFinanciamento { get; set; }
        public int? id_financiamento { get; set; }
        public string? projetoCodigo { get; set; }
        public string? projeto_codigo { get; set; }
        public string tipoVinculo { get; set; } = string.Empty;
        public decimal? valorDestinado { get; set; }
    }

    public class SaldoFinanciamentoResponse
    {
        public int idFinanciamento { get; set; }
        public decimal valorTotal { get; set; }
        public decimal valorDistribuido { get; set; }
        public decimal valorDisponivel { get; set; }
        public decimal percentualDistribuido { get; set; }
    }
}
