using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.DTOs;
using sgpp.Models;

namespace sgpp.Repositories.Interfaces
{
    public interface IDashboardRepository
    {
        Task<int> ContarVencimentosProximos30Dias();
        Task<int> ContarTotalParticipantes();
        Task<decimal> SomarFinanciamentoTotal();
        Task<int> ContarTotalProducoes();
        Task<IEnumerable<SituacaoContagemRow>> ContarProjetosPorSituacao();
        Task<IEnumerable<FinanciamentoPorAgenciaDto>> SomarFinanciamentoPorAgencia();
        Task<IEnumerable<Projeto>> ListarProjetosRecentes(int limite = 5);
    }
}
