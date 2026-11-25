using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.Models;

namespace sgpp.Repositories.Interfaces
{
    public interface IFinanciamentoRepository
    {
        Task<int> Store(Financiamento financiamento);
        Task<IEnumerable<Financiamento>> GetAll(string? agencia = null, string? tipoFomento = null);
        Task<Financiamento?> GetById(int id);
        Task<bool> Update(Financiamento financiamento);
        Task<bool> Delete(int id);
    }
}
