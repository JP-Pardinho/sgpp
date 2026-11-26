using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.Models;

namespace sgpp.Repositories.Interfaces
{
    public interface IParticipanteRepository
    {
        Task Store(Participante participante);
        Task<IEnumerable<Participante>> GetAll(string? tipo = null);
        Task<Participante?> GetByCpf(string cpf);
        Task<Participante?> GetByEmail(string email);
        Task<bool> Update(Participante participante);
        Task<bool> Delete(string cpf);
    }
}
