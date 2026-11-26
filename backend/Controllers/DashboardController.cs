using System;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using sgpp.Models;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly Func<MySqlConnection> _createConnection;

        public DashboardController(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        [HttpGet]
        public async Task<IActionResult> Obter()
        {
            await using var connection = _createConnection();

            var vencimentosProximos30Dias = await connection.ExecuteScalarAsync<int>(@"
                SELECT COUNT(*)
                FROM Financiamento
                WHERE dataFim >= CURDATE() AND dataFim <= DATE_ADD(CURDATE(), INTERVAL 30 DAY);");

            var totalParticipantes = await connection.ExecuteScalarAsync<int>(@"
                SELECT COUNT(*) FROM Participante;");

            var financiamentoTotal = await connection.ExecuteScalarAsync<decimal>(@"
                SELECT COALESCE(SUM(valorTotal), 0) FROM Financiamento;");

            var producoesCientificas = await connection.ExecuteScalarAsync<int>(@"
                SELECT COUNT(*) FROM Producao_Cientifica;");

            var contagemSituacoes = (await connection.QueryAsync<SituacaoContagemRow>(@"
                SELECT situacao, COUNT(*) AS quantidade
                FROM Projeto
                GROUP BY situacao;")).ToList();

            int ContarSituacao(string alvo) =>
                contagemSituacoes
                    .Where(s => string.Equals(s.situacao?.Trim(), alvo, StringComparison.OrdinalIgnoreCase))
                    .Sum(s => s.quantidade);

            var emAndamento = ContarSituacao("Em andamento");
            var concluido = ContarSituacao("Concluído");
            var cancelado = ContarSituacao("Cancelado");

            var financiamentoPorAgencia = await connection.QueryAsync<FinanciamentoAgenciaRow>(@"
                SELECT agenciaFinanciadora AS agencia, COALESCE(SUM(valorTotal), 0) AS valor
                FROM Financiamento
                GROUP BY agenciaFinanciadora
                ORDER BY valor DESC;");

            var projetosRecentes = await connection.QueryAsync<Projeto>(@"
                SELECT p.*, part.nome AS coordenador_nome
                FROM Projeto p
                JOIN Participante part ON p.coordenador_cpf = part.cpf
                ORDER BY p.dataInicio DESC, p.codigo ASC
                LIMIT 5;");

            return Ok(new
            {
                vencimentosProximos30Dias,
                projetosEmAndamento = emAndamento,
                totalParticipantes,
                financiamentoTotal,
                producoesCientificas,
                projetosPorSituacao = new
                {
                    emAndamento,
                    concluido,
                    cancelado
                },
                financiamentoPorAgencia,
                projetosRecentes
            });
        }

        private sealed class SituacaoContagemRow
        {
            public string? situacao { get; set; }
            public int quantidade { get; set; }
        }

        private sealed class FinanciamentoAgenciaRow
        {
            public string agencia { get; set; } = string.Empty;
            public decimal valor { get; set; }
        }
    }
}
