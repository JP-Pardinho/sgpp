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
        Task<bool> AtualizarProjetoCodigo(int idProducao, string projetoCodigo);
        Task<IEnumerable<AutorProducao>> ListarAutores(int idProducao);
        Task<Dictionary<int, List<AutorProducao>>> ListarAutoresPorProducoes(IEnumerable<int> idsProducoes);
        Task InserirAutor(int idProducao, string participanteCpf);
        Task SincronizarAutores(int idProducao, IEnumerable<string> cpfsAutores);
        Task<bool> RemoverAutor(int idProducao, string participanteCpf);
    }
}
