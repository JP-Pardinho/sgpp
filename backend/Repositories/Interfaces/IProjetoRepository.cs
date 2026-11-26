using sgpp.Models;

namespace sgpp.Repositories.Interfaces
{
    public interface IProjetoRepository
    {
        Task Store(Projeto projeto);
        Task<IEnumerable<Projeto>> GetAll(string? busca = null, string? situacao = null, string? coordenador_cpf = null);
        Task<Projeto?> GetByCodigo(string codigo);
        Task<bool> Update(Projeto projeto);
        Task<bool> UpdateSituacao(string codigo, string novaSituacao);
        Task<bool> Delete(string codigo);
        Task<string?> GetTipoParticipanteByCpf(string cpf);
        Task InserirVinculoParticipante(string projetoCodigo, string participanteCpf, string funcao, DateTime dataEntrada);
        Task<string> GerarProximoCodigo(int ano);
    }
}
