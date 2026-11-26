using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly Func<MySqlConnection> _createConnection;

        public AuthController(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.email) || string.IsNullOrWhiteSpace(request.senha))
            {
                return BadRequest(new { mensagem = "E-mail e senha são obrigatórios." });
            }

            await using var connection = _createConnection();
            const string sql = @"
                SELECT cpf, nome, emailInstitucional, senhaHash, perfilAcesso
                FROM Participante
                WHERE LOWER(emailInstitucional) = LOWER(@email)
                LIMIT 1;";

            var usuario = await connection.QueryFirstOrDefaultAsync<ParticipanteAuthRow>(sql, new
            {
                email = request.email.Trim()
            });

            if (usuario is null || !SenhaValida(request.senha, usuario.senhaHash))
            {
                return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });
            }

            var tokenPayload = $"{usuario.cpf}:{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes(tokenPayload));

            return Ok(new
            {
                token,
                usuario = new
                {
                    nome = usuario.nome,
                    perfil = usuario.perfilAcesso,
                    email = usuario.emailInstitucional
                }
            });
        }

        private static bool SenhaValida(string senhaInformada, string? senhaArmazenada)
        {
            if (string.IsNullOrEmpty(senhaArmazenada))
            {
                return false;
            }

            if (string.Equals(senhaInformada, senhaArmazenada, StringComparison.Ordinal))
            {
                return true;
            }

            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(senhaInformada));
            var hashHex = Convert.ToHexString(hashBytes);
            return string.Equals(hashHex, senhaArmazenada, StringComparison.OrdinalIgnoreCase);
        }

        private sealed class ParticipanteAuthRow
        {
            public string cpf { get; set; } = string.Empty;
            public string nome { get; set; } = string.Empty;
            public string emailInstitucional { get; set; } = string.Empty;
            public string senhaHash { get; set; } = string.Empty;
            public string perfilAcesso { get; set; } = string.Empty;
        }
    }

    public class LoginRequest
    {
        public string email { get; set; } = string.Empty;
        public string senha { get; set; } = string.Empty;
    }
}
