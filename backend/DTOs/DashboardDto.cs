using System.Collections.Generic;
using sgpp.Models;

namespace sgpp.DTOs
{
    public class DashboardDto
    {
        public int vencimentosProximos30Dias { get; set; }
        public int projetosEmAndamento { get; set; }
        public int totalParticipantes { get; set; }
        public decimal financiamentoTotal { get; set; }
        public int producoesCientificas { get; set; }
        public ProjetosPorSituacaoDto projetosPorSituacao { get; set; } = new();
        public List<FinanciamentoPorAgenciaDto> financiamentoPorAgencia { get; set; } = new();
        public List<Projeto> projetosRecentes { get; set; } = new();
    }

    public class ProjetosPorSituacaoDto
    {
        public int emAndamento { get; set; }
        public int concluido { get; set; }
        public int cancelado { get; set; }
    }

    public class FinanciamentoPorAgenciaDto
    {
        public string agencia { get; set; } = string.Empty;
        public decimal valor { get; set; }
    }

    public class SituacaoContagemRow
    {
        public string situacao { get; set; } = string.Empty;
        public int total { get; set; }
    }
}
