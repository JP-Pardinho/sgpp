using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using MySqlConnector;
using sgpp.DTOs;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly Func<MySqlConnection> _createConnection;

        public DashboardRepository(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        // RNF05: Quantidade de financiamentos com vigência vencendo nos próximos 30 dias
        public async Task<int> ContarVencimentosProximos30Dias()
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT COUNT(*)
                FROM Financiamento
                WHERE dataFim >= CURDATE()
                  AND dataFim <= DATE_ADD(CURDATE(), INTERVAL 30 DAY);";

            return await connection.ExecuteScalarAsync<int>(sql);
        }

        public async Task<int> ContarTotalParticipantes()
        {
            await using var connection = _createConnection();
            const string sql = "SELECT COUNT(*) FROM Participante;";
            return await connection.ExecuteScalarAsync<int>(sql);
        }

        public async Task<decimal> SomarFinanciamentoTotal()
        {
            await using var connection = _createConnection();
            const string sql = "SELECT COALESCE(SUM(valorTotal), 0) FROM Financiamento;";
            return await connection.ExecuteScalarAsync<decimal>(sql);
        }

        public async Task<int> ContarTotalProducoes()
        {
            await using var connection = _createConnection();
            const string sql = "SELECT COUNT(*) FROM Producao_Cientifica;";
            return await connection.ExecuteScalarAsync<int>(sql);
        }

        public async Task<IEnumerable<SituacaoContagemRow>> ContarProjetosPorSituacao()
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT situacao, COUNT(*) AS total
                FROM Projeto
                GROUP BY situacao;";

            return await connection.QueryAsync<SituacaoContagemRow>(sql);
        }

        public async Task<IEnumerable<FinanciamentoPorAgenciaDto>> SomarFinanciamentoPorAgencia()
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT agenciaFinanciadora AS agencia,
                       COALESCE(SUM(valorTotal), 0) AS valor
                FROM Financiamento
                GROUP BY agenciaFinanciadora
                ORDER BY valor DESC, agenciaFinanciadora ASC;";

            return await connection.QueryAsync<FinanciamentoPorAgenciaDto>(sql);
        }

        public async Task<IEnumerable<Projeto>> ListarProjetosRecentes(int limite = 5)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT p.*, part.nome AS coordenador_nome
                FROM Projeto p
                JOIN Participante part ON p.coordenador_cpf = part.cpf
                ORDER BY p.dataInicio DESC, p.codigo DESC
                LIMIT @limite;";

            return await connection.QueryAsync<Projeto>(sql, new { limite });
        }
    }
}
