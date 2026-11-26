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
    public class FinanciamentoRepository : IFinanciamentoRepository
    {
        private readonly Func<MySqlConnection> _createConnection;

        public FinanciamentoRepository(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        public async Task<int> Store(Financiamento financiamento)
        {
            await using var connection = _createConnection();

            if (financiamento.id_financiamento <= 0)
            {
                const string nextIdSql = "SELECT COALESCE(MAX(id_financiamento), 0) + 1 FROM Financiamento;";
                financiamento.id_financiamento = await connection.ExecuteScalarAsync<int>(nextIdSql);
            }

            const string sql = @"
                INSERT INTO Financiamento (id_financiamento, agenciaFinanciadora, tipoFomento, valorTotal, dataInicio, dataFim)
                VALUES (@id_financiamento, @agenciaFinanciadora, @tipoFomento, @valorTotal, @dataInicio, @dataFim);";

            await connection.ExecuteAsync(sql, financiamento);
            return financiamento.id_financiamento;
        }

        public async Task<IEnumerable<Financiamento>> GetAll(string? agencia = null, string? tipoFomento = null)
        {
            await using var connection = _createConnection();
            var sql = new StringBuilder("SELECT * FROM Financiamento WHERE 1 = 1");
            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(agencia))
            {
                sql.Append(" AND agenciaFinanciadora = @agencia");
                parameters.Add("agencia", agencia.Trim());
            }

            if (!string.IsNullOrWhiteSpace(tipoFomento))
            {
                sql.Append(" AND tipoFomento = @tipoFomento");
                parameters.Add("tipoFomento", tipoFomento.Trim());
            }

            sql.Append(" ORDER BY dataInicio DESC, id_financiamento ASC;");

            return await connection.QueryAsync<Financiamento>(sql.ToString(), parameters);
        }

        public async Task<Financiamento?> GetById(int id)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT * FROM Financiamento
                WHERE id_financiamento = @id;";

            return await connection.QueryFirstOrDefaultAsync<Financiamento>(sql, new { id });
        }

        public async Task<bool> Update(Financiamento financiamento)
        {
            await using var connection = _createConnection();
            const string sql = @"
                UPDATE Financiamento
                SET agenciaFinanciadora = @agenciaFinanciadora,
                    tipoFomento = @tipoFomento,
                    valorTotal = @valorTotal,
                    dataInicio = @dataInicio,
                    dataFim = @dataFim
                WHERE id_financiamento = @id_financiamento;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, financiamento);
            return linhasAfetadas > 0;
        }

        private const string BaseApoioDetalheSql = @"
            SELECT af.id_financiamento AS idFinanciamento,
                   af.projeto_codigo AS projetoCodigo,
                   p.titulo AS projetoTitulo,
                   p.coordenador_cpf AS coordenadorCpf,
                   part.nome AS coordenadorNome,
                   af.tipoVinculo,
                   af.valorDestinado
            FROM Apoio_Financeiro af
            JOIN Projeto p ON af.projeto_codigo = p.codigo
            JOIN Participante part ON p.coordenador_cpf = part.cpf";

        public async Task<bool> Delete(int id)
        {
            await using var connection = _createConnection();
            const string sql = @"
                DELETE FROM Financiamento
                WHERE id_financiamento = @id;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new { id });
            return linhasAfetadas > 0;
        }

        public async Task InserirApoio(ApoioFinanceiro apoio)
        {
            await using var connection = _createConnection();
            const string sql = @"
                INSERT INTO Apoio_Financeiro (projeto_codigo, id_financiamento, tipoVinculo, valorDestinado)
                VALUES (@projeto_codigo, @id_financiamento, @tipoVinculo, @valorDestinado);";

            await connection.ExecuteAsync(sql, apoio);
        }

        public async Task<IEnumerable<ApoioFinanceiroDetalhe>> ListarProjetosPorFinanciamento(int idFinanciamento)
        {
            await using var connection = _createConnection();
            var sql = $@"{BaseApoioDetalheSql}
                WHERE af.id_financiamento = @id
                ORDER BY p.titulo ASC, af.projeto_codigo ASC;";

            return await connection.QueryAsync<ApoioFinanceiroDetalhe>(sql, new { id = idFinanciamento });
        }

        public async Task<IEnumerable<ApoioFinanceiroDetalhe>> ListarTodosApoios()
        {
            await using var connection = _createConnection();
            var sql = $@"{BaseApoioDetalheSql}
                ORDER BY af.id_financiamento ASC, p.titulo ASC;";

            return await connection.QueryAsync<ApoioFinanceiroDetalhe>(sql);
        }

        public async Task<ApoioFinanceiroDetalhe?> ObterApoio(int idFinanciamento, string projetoCodigo)
        {
            await using var connection = _createConnection();
            var sql = $@"{BaseApoioDetalheSql}
                WHERE af.id_financiamento = @id AND af.projeto_codigo = @codigo;";

            return await connection.QueryFirstOrDefaultAsync<ApoioFinanceiroDetalhe>(sql, new
            {
                id = idFinanciamento,
                codigo = projetoCodigo
            });
        }

        public async Task<IEnumerable<FinanciamentoVinculado>> ListarFinanciamentosPorProjeto(string projetoCodigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT f.id_financiamento AS idFinanciamento,
                       f.agenciaFinanciadora AS agencia,
                       f.tipoFomento,
                       af.tipoVinculo,
                       f.dataInicio,
                       f.dataFim,
                       af.valorDestinado AS valor
                FROM Apoio_Financeiro af
                JOIN Financiamento f ON af.id_financiamento = f.id_financiamento
                WHERE af.projeto_codigo = @codigo
                ORDER BY f.dataInicio DESC, f.id_financiamento ASC;";

            return await connection.QueryAsync<FinanciamentoVinculado>(sql, new { codigo = projetoCodigo });
        }

        public async Task<decimal> CalcularValorDistribuido(int idFinanciamento)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT COALESCE(SUM(valorDestinado), 0)
                FROM Apoio_Financeiro
                WHERE id_financiamento = @id;";

            return await connection.ExecuteScalarAsync<decimal>(sql, new { id = idFinanciamento });
        }

        public async Task<bool> RemoverApoio(int idFinanciamento, string projetoCodigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                DELETE FROM Apoio_Financeiro
                WHERE id_financiamento = @id AND projeto_codigo = @codigo;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new
            {
                id = idFinanciamento,
                codigo = projetoCodigo
            });

            return linhasAfetadas > 0;
        }
    }
}
