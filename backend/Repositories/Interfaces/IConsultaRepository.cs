using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.DTOs;

namespace sgpp.Repositories.Interfaces
{
    public interface IConsultaRepository
    {
        Task<IEnumerable<ProjetoPorCoordenadorRow>> ConsultarProjetosPorCoordenador(string? coordenadorCpf = null);
        Task<IEnumerable<ParticipanteDoProjetoRow>> ConsultarParticipantesPorProjeto(string? projetoCodigo = null);
        Task<IEnumerable<ProducaoDoProjetoRow>> ConsultarProducoesPorProjeto(string? projetoCodigo = null);
        Task<IEnumerable<FinanciamentoPorAgenciaRow>> ConsultarFinanciamentosPorAgencia(string? agencia = null);
        Task<string?> ObterNomeParticipantePorCpf(string cpf);
        Task<string?> ObterTituloProjetoPorCodigo(string codigo);
    }
}
