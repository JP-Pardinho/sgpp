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
    public class ProjetoRepository : IProjetoRepository
    {
        private readonly Func<MySqlConnection> _createConnection;

        public ProjetoRepository(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        public async Task Store(Projeto projeto)
        {
            await using var connection = _createConnection();
            const string sql = @"
                INSERT INTO Projeto (codigo, titulo, descricao, situacao, dataInicio, dataFim, coordenador_cpf)
                VALUES (@codigo, @titulo, @descricao, @situacao, @dataInicio, @dataFim, @coordenador_cpf);";
            await connection.ExecuteAsync(sql, projeto);
        }

        public async Task<IEnumerable<Projeto>> GetAll(string? busca = null, string? situacao = null, string? coordenador_cpf = null)
        {
            await using var connection = _createConnection();
            var sql = new StringBuilder(@"
                SELECT p.*, part.nome AS coordenador_nome
                FROM Projeto p
                JOIN Participante part ON p.coordenador_cpf = part.cpf
                WHERE 1 = 1");

            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(busca))
            {
                sql.Append(" AND (p.codigo LIKE @busca OR p.titulo LIKE @busca)");
                parameters.Add("busca", $"%{busca.Trim()}%");
            }

            if (!string.IsNullOrWhiteSpace(situacao))
            {
                sql.Append(" AND p.situacao = @situacao");
                parameters.Add("situacao", situacao.Trim());
            }

            if (!string.IsNullOrWhiteSpace(coordenador_cpf))
            {
                sql.Append(" AND p.coordenador_cpf = @coordenador_cpf");
                parameters.Add("coordenador_cpf", coordenador_cpf.Trim());
            }

            sql.Append(" ORDER BY p.dataInicio DESC, p.codigo ASC;");

            return await connection.QueryAsync<Projeto>(sql.ToString(), parameters);
        }

        public async Task<Projeto?> GetByCodigo(string codigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT p.*, part.nome AS coordenador_nome
                FROM Projeto p
                JOIN Participante part ON p.coordenador_cpf = part.cpf
                WHERE p.codigo = @codigo;";

            return await connection.QueryFirstOrDefaultAsync<Projeto>(sql, new { codigo });
        }

        public async Task<bool> Update(Projeto projeto)
        {
            await using var connection = _createConnection();
            const string sql = @"
                UPDATE Projeto
                SET titulo = @titulo,
                    descricao = @descricao,
                    situacao = @situacao,
                    dataInicio = @dataInicio,
                    dataFim = @dataFim,
                    coordenador_cpf = @coordenador_cpf
                WHERE codigo = @codigo;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, projeto);
            return linhasAfetadas > 0;
        }

        public async Task<bool> UpdateSituacao(string codigo, string novaSituacao)
        {
            await using var connection = _createConnection();
            const string sql = @"
                UPDATE Projeto
                SET situacao = @novaSituacao
                WHERE codigo = @codigo;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new { codigo, novaSituacao });
            return linhasAfetadas > 0;
        }

        public async Task<bool> Delete(string codigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                DELETE FROM Projeto WHERE codigo = @codigo;";

            var linhasAfetadas = await connection.ExecuteAsync(sql, new { codigo });
            return linhasAfetadas > 0;
        }

        public async Task<string?> GetTipoParticipanteByCpf(string cpf)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT tipo
                FROM Participante
                WHERE cpf = @cpf;";

            return await connection.QueryFirstOrDefaultAsync<string?>(sql, new { cpf });
        }

        public async Task InserirVinculoParticipante(string projetoCodigo, string participanteCpf, string funcao, DateTime dataEntrada)
        {
            await using var connection = _createConnection();
            const string sql = @"
                INSERT INTO Projeto_Participante (projeto_codigo, participante_cpf, funcao, dataEntrada, dataSaida)
                VALUES (@projetoCodigo, @participanteCpf, @funcao, @dataEntrada, NULL);";

            await connection.ExecuteAsync(sql, new { projetoCodigo, participanteCpf, funcao, dataEntrada });
        }

        public async Task<string> GerarProximoCodigo(int ano)
        {
            await using var connection = _createConnection();
            var prefixo = $"PRJ-{ano}-";
            const string sql = @"
                SELECT codigo
                FROM Projeto
                WHERE codigo LIKE @padrao;";

            var codigos = await connection.QueryAsync<string>(sql, new { padrao = $"{prefixo}%" });

            var maiorNumero = 0;
            foreach (var c in codigos)
            {
                var trimmed = c.Trim();
                if (trimmed.StartsWith(prefixo, StringComparison.OrdinalIgnoreCase))
                {
                    var sufixo = trimmed[prefixo.Length..];
                    if (int.TryParse(sufixo, out var numero) && numero > maiorNumero)
                    {
                        maiorNumero = numero;
                    }
                }
            }

            return $"{prefixo}{(maiorNumero + 1):D3}";
        }
    }
}