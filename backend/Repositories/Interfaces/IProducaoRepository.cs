using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.Models;

namespace sgpp.Repositories.Interfaces
{
    public interface IProducaoRepository
    {
        Task<int> Store(ProducaoCientifica producao);
        Task<IEnumerable<ProducaoCientifica>> GetAll(string? tipoProducao = null, int? anoPublicacao = null, string? projeto_codigo = null);
        Task<ProducaoCientifica?> GetById(int id);
        Task<bool> Update(ProducaoCientifica producao);
        Task<bool> Delete(int id);
        Task<bool> ProjetoExiste(string codigo);
    }
}
