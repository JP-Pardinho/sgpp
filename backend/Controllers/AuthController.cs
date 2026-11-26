using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using sgpp.DTOs;
using sgpp.Repositories.Interfaces;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IParticipanteRepository _participanteRepository;

        public AuthController(IParticipanteRepository participanteRepository)
        {
            _participanteRepository = participanteRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request is null ||
                string.IsNullOrWhiteSpace(request.emailInstitucional) ||
                string.IsNullOrWhiteSpace(request.senha))
            {
                return BadRequest(new { mensagem = "Informe o e-mail institucional e a senha." });
            }

            var emailNormalizado = request.emailInstitucional.Trim().ToLowerInvariant();
            var participante = await _participanteRepository.GetByEmail(emailNormalizado);

            if (participante is null || !SenhaValida(request.senha, participante.senhaHash))
            {
                return Unauthorized(new { mensagem = "E-mail institucional ou senha inválidos." });
            }

            var resposta = new LoginResponse
            {
                cpf = participante.cpf,
                nome = participante.nome,
                emailInstitucional = participante.emailInstitucional,
                tipo = participante.tipo,
                perfilAcesso = participante.perfilAcesso ?? "Participante"
            };

            return Ok(resposta);
        }

        private static bool SenhaValida(string senhaInformada, string? senhaHashArmazenada)
        {
            if (string.IsNullOrWhiteSpace(senhaHashArmazenada))
            {
                return false;
            }

            var informadaBytes = Encoding.UTF8.GetBytes(senhaInformada);
            var armazenadaBytes = Encoding.UTF8.GetBytes(senhaHashArmazenada);

            if (informadaBytes.Length == armazenadaBytes.Length &&
                CryptographicOperations.FixedTimeEquals(informadaBytes, armazenadaBytes))
            {
                return true;
            }

            // Também suporta senhas armazenadas como hash SHA-256 em hexadecimal
            var sha256Hex = Convert.ToHexString(SHA256.HashData(informadaBytes));
            var sha256Bytes = Encoding.UTF8.GetBytes(sha256Hex);
            var armazenadaUpperBytes = Encoding.UTF8.GetBytes(senhaHashArmazenada.Trim().ToUpperInvariant());

            return sha256Bytes.Length == armazenadaUpperBytes.Length &&
                   CryptographicOperations.FixedTimeEquals(sha256Bytes, armazenadaUpperBytes);
        }
    }
}
