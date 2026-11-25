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
    public class ProducaoRepository : IProducaoRepository
    {
        private readonly Func<MySqlConnection> _createConnection;

        public ProducaoRepository(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        public async Task<int> Store(ProducaoCientifica producao)
        {
            await using var connection = _createConnection();

            if (producao.id_producao <= 0)
            {
                const string nextIdSql = "SELECT COALESCE(MAX(id_producao), 0) + 1 FROM Producao_Cientifica;";
                producao.id_producao = await connection.ExecuteScalarAsync<int>(nextIdSql);
            }

            const string sql = @"
                INSERT INTO Producao_Cientifica (id_producao, projeto_codigo, titulo, tipoProducao, anoPublicacao, meioDivulgacao)
                VALUES (@id_producao, @projeto_codigo, @titulo, @tipoProducao, @anoPublicacao, @meioDivulgacao);";

            await connection.ExecuteAsync(sql, producao);
            return producao.id_producao;
        }

        public async Task<IEnumerable<ProducaoCientifica>> GetAll(string? tipoProducao = null, int? anoPublicacao = null, string? projeto_codigo = null)
        {
            await using var connection = _createConnection();
            var sql = new StringBuilder("SELECT * FROM Producao_Cientifica WHERE 1 = 1");
            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(tipoProducao))
            {
                sql.Append(" AND tipoProducao = @tipoProducao");
                parameters.Add("tipoProducao", tipoProducao.Trim());
            }

            if (anoPublicacao.HasValue)
            {
                sql.Append(" AND anoPublicacao = @anoPublicacao");
                parameters.Add("anoPublicacao", anoPublicacao.Value);
            }

            if (!string.IsNullOrWhiteSpace(projeto_codigo))
            {
                sql.Append(" AND projeto_codigo = @projeto_codigo");
                parameters.Add("projeto_codigo", projeto_codigo.Trim());
            }

            sql.Append(" ORDER BY anoPublicacao DESC, id_producao ASC;");

            return await connection.QueryAsync<ProducaoCientifica>(sql.ToString(), parameters);
        }

        public async Task<ProducaoCientifica?> GetById(int id)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT * FROM Producao_Cientifica
                WHERE id_producao = @id;";

            return await connection.QueryFirstOrDefaultAsync<ProducaoCientifica>(sql, new { id });
        }

        public async Task<bool> Update(ProducaoCientifica producao)
        {
            await using var connection = _createConnection();
            const string sql = @"
                UPDATE Producao_Cientifica
                SET projeto_codigo = @projeto_codigo,
                    titulo = @titulo,
                    tipoProducao = @tipoProducao,
                    anoPublicacao = @anoPublicacao,
                    meioDivulgacao = @meioDivulgacao
                WHERE id_producao = @id_producao;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, producao);
            return linhasAfetadas > 0;
        }

        public async Task<bool> Delete(int id)
        {
            await using var connection = _createConnection();
            const string sql = @"
                DELETE FROM Producao_Cientifica
                WHERE id_producao = @id;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new { id });
            return linhasAfetadas > 0;
        }

        public async Task<bool> ProjetoExiste(string codigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT COUNT(1)
                FROM Projeto
                WHERE codigo = @codigo;";

            var total = await connection.ExecuteScalarAsync<int>(sql, new { codigo });
            return total > 0;
        }
    }
}
