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
        Task InserirApoio(ApoioFinanceiro apoio);
        Task<IEnumerable<ApoioFinanceiroDetalhe>> ListarProjetosPorFinanciamento(int idFinanciamento);
        Task<IEnumerable<ApoioFinanceiroDetalhe>> ListarTodosApoios();
        Task<ApoioFinanceiroDetalhe?> ObterApoio(int idFinanciamento, string projetoCodigo);
        Task<IEnumerable<FinanciamentoVinculado>> ListarFinanciamentosPorProjeto(string projetoCodigo);
        Task<decimal> CalcularValorDistribuido(int idFinanciamento);
        Task<bool> RemoverApoio(int idFinanciamento, string projetoCodigo);
    }
}
