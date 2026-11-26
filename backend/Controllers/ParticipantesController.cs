using System;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using sgpp.Models;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/participantes")]
    public class ParticipantesController : ControllerBase
    {
        private readonly Func<MySqlConnection> _createConnection;

        public ParticipantesController(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? tipo = null)
        {
            await using var connection = _createConnection();
            var sql = @"
                SELECT cpf, nome, emailInstitucional AS email, tipo
                FROM Participante
                WHERE (@tipo IS NULL OR LOWER(tipo) = LOWER(@tipo))
                ORDER BY nome ASC;";

            var participantes = await connection.QueryAsync<Participante>(sql, new
            {
                tipo = string.IsNullOrWhiteSpace(tipo) ? null : tipo.Trim()
            });

            return Ok(participantes);
        }
    }
}
