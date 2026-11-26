using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.Models;

namespace sgpp.Repositories.Interfaces
{
    public interface IVinculoRepository
    {
        Task InserirVinculo(ProjetoParticipante vinculo);
        Task<IEnumerable<EquipeMembro>> ListarParticipantesPorProjeto(string projetoCodigo);
        Task<EquipeMembro?> ObterVinculo(string projetoCodigo, string participanteCpf);
        Task<bool> ExisteCoordenadorAtivo(string projetoCodigo);
        Task<bool> RegistrarDataSaida(string projetoCodigo, string participanteCpf, DateTime dataSaida);
        Task<bool> RemoverVinculo(string projetoCodigo, string participanteCpf);
    }
}
