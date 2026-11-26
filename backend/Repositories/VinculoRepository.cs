using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using MySqlConnector;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Repositories
{
    public class VinculoRepository : IVinculoRepository
    {
        private readonly Func<MySqlConnection> _createConnection;

        public VinculoRepository(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        public async Task InserirVinculo(ProjetoParticipante vinculo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                INSERT INTO Projeto_Participante (projeto_codigo, participante_cpf, funcao, dataEntrada, dataSaida)
                VALUES (@projeto_codigo, @participante_cpf, @funcao, @dataEntrada, @dataSaida);";

            await connection.ExecuteAsync(sql, vinculo);
        }

        public async Task<IEnumerable<EquipeMembro>> ListarParticipantesPorProjeto(string projetoCodigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT pp.participante_cpf AS cpf,
                       part.nome,
                       part.tipo,
                       pp.funcao,
                       pp.dataEntrada,
                       pp.dataSaida
                FROM Projeto_Participante pp
                JOIN Participante part ON pp.participante_cpf = part.cpf
                WHERE pp.projeto_codigo = @codigo
                ORDER BY pp.dataEntrada ASC, part.nome ASC;";

            return await connection.QueryAsync<EquipeMembro>(sql, new { codigo = projetoCodigo });
        }

        public async Task<EquipeMembro?> ObterVinculo(string projetoCodigo, string participanteCpf)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT pp.participante_cpf AS cpf,
                       part.nome,
                       part.tipo,
                       pp.funcao,
                       pp.dataEntrada,
                       pp.dataSaida
                FROM Projeto_Participante pp
                JOIN Participante part ON pp.participante_cpf = part.cpf
                WHERE pp.projeto_codigo = @codigo AND pp.participante_cpf = @cpf;";

            return await connection.QueryFirstOrDefaultAsync<EquipeMembro>(sql, new
            {
                codigo = projetoCodigo,
                cpf = participanteCpf
            });
        }

        public async Task<bool> ExisteCoordenadorAtivo(string projetoCodigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT COUNT(*)
                FROM Projeto_Participante
                WHERE projeto_codigo = @codigo
                  AND funcao = 'Coordenador'
                  AND dataSaida IS NULL;";

            var total = await connection.ExecuteScalarAsync<int>(sql, new { codigo = projetoCodigo });
            return total > 0;
        }

        public async Task<bool> RegistrarDataSaida(string projetoCodigo, string participanteCpf, DateTime dataSaida)
        {
            await using var connection = _createConnection();
            const string sql = @"
                UPDATE Projeto_Participante
                SET dataSaida = @dataSaida
                WHERE projeto_codigo = @codigo AND participante_cpf = @cpf;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new
            {
                codigo = projetoCodigo,
                cpf = participanteCpf,
                dataSaida
            });

            return linhasAfetadas > 0;
        }

        public async Task<bool> RemoverVinculo(string projetoCodigo, string participanteCpf)
        {
            await using var connection = _createConnection();
            const string sql = @"
                DELETE FROM Projeto_Participante
                WHERE projeto_codigo = @codigo AND participante_cpf = @cpf;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new
            {
                codigo = projetoCodigo,
                cpf = participanteCpf
            });

            return linhasAfetadas > 0;
        }
    }
}
