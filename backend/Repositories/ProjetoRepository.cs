using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MySqlConnector;
using Dapper;
using sgpp.Models;

namespace sgpp.Repositories
{
    public class ProjetoRepository 
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
                INSERT INTO Projeto (codigo, titulo, descricao, situacao, dataInicio, dataFim)
                VALUES (@codigo, @titulo, @descricao, @situacao, @dataInicio, @dataFim);";
            await connection.ExecuteAsync(sql, projeto);
        }
    }
}