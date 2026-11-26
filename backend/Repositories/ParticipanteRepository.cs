using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using MySqlConnector;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Repositories
{
    public class ParticipanteRepository : IParticipanteRepository
    {
        private readonly Func<MySqlConnection> _createConnection;

        public ParticipanteRepository(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        public async Task Store(Participante participante)
        {
            await using var connection = _createConnection();
            const string sql = @"
                INSERT INTO Participante (cpf, nome, emailInstitucional, tipo, senhaHash, perfilAcesso)
                VALUES (@cpf, @nome, @emailInstitucional, @tipo, @senhaHash, @perfilAcesso);";

            await connection.ExecuteAsync(sql, participante);
        }

        public async Task<IEnumerable<Participante>> GetAll(string? tipo = null)
        {
            await using var connection = _createConnection();
            var sql = new StringBuilder("SELECT * FROM Participante WHERE 1 = 1");
            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(tipo))
            {
                sql.Append(" AND tipo = @tipo");
                parameters.Add("tipo", tipo.Trim());
            }

            sql.Append(" ORDER BY nome ASC;");

            return await connection.QueryAsync<Participante>(sql.ToString(), parameters);
        }

        public async Task<Participante?> GetByCpf(string cpf)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT * FROM Participante
                WHERE cpf = @cpf;";

            return await connection.QueryFirstOrDefaultAsync<Participante>(sql, new { cpf });
        }

        public async Task<Participante?> GetByEmail(string email)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT * FROM Participante
                WHERE emailInstitucional = @email;";

            return await connection.QueryFirstOrDefaultAsync<Participante>(sql, new { email });
        }

        public async Task<bool> Update(Participante participante)
        {
            await using var connection = _createConnection();
            const string sql = @"
                UPDATE Participante
                SET nome = @nome,
                    emailInstitucional = @emailInstitucional,
                    tipo = @tipo,
                    perfilAcesso = @perfilAcesso
                WHERE cpf = @cpf;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, participante);
            return linhasAfetadas > 0;
        }

        public async Task<bool> Delete(string cpf)
        {
            await using var connection = _createConnection();
            const string sql = @"
                DELETE FROM Participante
                WHERE cpf = @cpf;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new { cpf });
            return linhasAfetadas > 0;
        }
    }
}
