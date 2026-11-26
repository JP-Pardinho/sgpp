using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<bool> AtualizarProjetoCodigo(int idProducao, string projetoCodigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                UPDATE Producao_Cientifica
                SET projeto_codigo = @projetoCodigo
                WHERE id_producao = @id;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new { id = idProducao, projetoCodigo });
            return linhasAfetadas > 0;
        }

        public async Task<IEnumerable<AutorProducao>> ListarAutores(int idProducao)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT p.cpf, p.nome, p.emailInstitucional, p.tipo
                FROM Producao_Autor pa
                JOIN Participante p ON pa.participante_cpf = p.cpf
                WHERE pa.producao_id = @idProducao
                ORDER BY p.nome ASC;";

            return await connection.QueryAsync<AutorProducao>(sql, new { idProducao });
        }

        public async Task<Dictionary<int, List<AutorProducao>>> ListarAutoresPorProducoes(IEnumerable<int> idsProducoes)
        {
            var ids = idsProducoes.Distinct().ToList();
            var resultado = new Dictionary<int, List<AutorProducao>>();
            if (ids.Count == 0)
            {
                return resultado;
            }

            await using var connection = _createConnection();
            const string sql = @"
                SELECT pa.producao_id, p.cpf, p.nome, p.emailInstitucional, p.tipo
                FROM Producao_Autor pa
                JOIN Participante p ON pa.participante_cpf = p.cpf
                WHERE pa.producao_id IN @ids
                ORDER BY p.nome ASC;";

            var linhas = await connection.QueryAsync<ProducaoAutorRow>(sql, new { ids });
            foreach (var linha in linhas)
            {
                if (!resultado.TryGetValue(linha.producao_id, out var lista))
                {
                    lista = new List<AutorProducao>();
                    resultado[linha.producao_id] = lista;
                }

                lista.Add(new AutorProducao
                {
                    cpf = linha.cpf,
                    nome = linha.nome,
                    emailInstitucional = linha.emailInstitucional,
                    tipo = linha.tipo
                });
            }

            return resultado;
        }

        public async Task InserirAutor(int idProducao, string participanteCpf)
        {
            await using var connection = _createConnection();
            const string sql = @"
                INSERT IGNORE INTO Producao_Autor (producao_id, participante_cpf)
                VALUES (@idProducao, @participanteCpf);";

            await connection.ExecuteAsync(sql, new { idProducao, participanteCpf });
        }

        public async Task SincronizarAutores(int idProducao, IEnumerable<string> cpfsAutores)
        {
            await using var connection = _createConnection();
            await connection.OpenAsync();
            await using var transaction = await connection.BeginTransactionAsync();

            const string deleteSql = @"
                DELETE FROM Producao_Autor
                WHERE producao_id = @idProducao;";

            await connection.ExecuteAsync(deleteSql, new { idProducao }, transaction);

            const string insertSql = @"
                INSERT IGNORE INTO Producao_Autor (producao_id, participante_cpf)
                VALUES (@idProducao, @participanteCpf);";

            foreach (var cpf in cpfsAutores)
            {
                await connection.ExecuteAsync(insertSql, new { idProducao, participanteCpf = cpf }, transaction);
            }

            await transaction.CommitAsync();
        }

        public async Task<bool> RemoverAutor(int idProducao, string participanteCpf)
        {
            await using var connection = _createConnection();
            const string sql = @"
                DELETE FROM Producao_Autor
                WHERE producao_id = @idProducao AND participante_cpf = @participanteCpf;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new { idProducao, participanteCpf });
            return linhasAfetadas > 0;
        }

        private sealed class ProducaoAutorRow
        {
            public int producao_id { get; set; }
            public string cpf { get; set; } = string.Empty;
            public string nome { get; set; } = string.Empty;
            public string emailInstitucional { get; set; } = string.Empty;
            public string tipo { get; set; } = string.Empty;
        }
    }
}
