using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using sgpp.Models;
using sgpp.Security;
using sgpp.Services;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/participantes")]
    public class ParticipantesController : ControllerBase
    {
        private readonly ParticipanteServices _participanteServices;

        public ParticipantesController(ParticipanteServices participanteServices)
        {
            _participanteServices = participanteServices;
        }

        [HttpPost]
        [ExigirPerfil("Administrador")]
        public async Task<IActionResult> Create([FromBody] Participante participante)
        {
            try
            {
                var criado = await _participanteServices.Create(participante);
                return CreatedAtAction(nameof(GetByCpf), new { cpf = criado.cpf }, criado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { mensagem = ex.Message });
            }
            catch (MySqlException ex) when (ex.Number == 1062)
            {
                return Conflict(new { mensagem = "Já existe um participante cadastrado com este CPF ou e-mail institucional." });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? tipo)
        {
            var participantes = await _participanteServices.GetAll(tipo);
            return Ok(participantes);
        }

        [HttpGet("{cpf}")]
        public async Task<IActionResult> GetByCpf(string cpf)
        {
            var participante = await _participanteServices.GetByCpf(cpf);
            if (participante is null)
            {
                return NotFound(new { mensagem = $"Participante com CPF '{cpf}' não encontrado." });
            }

            return Ok(participante);
        }

        [HttpPut("{cpf}")]
        [ExigirPerfil("Administrador")]
        public async Task<IActionResult> Update(string cpf, [FromBody] AtualizarParticipanteRequest request)
        {
            try
            {
                var participante = new Participante
                {
                    cpf = cpf,
                    nome = request.nome,
                    emailInstitucional = request.emailInstitucional,
                    tipo = request.tipo,
                    perfilAcesso = request.perfilAcesso
                };

                var atualizado = await _participanteServices.Update(cpf, participante);
                return Ok(atualizado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { mensagem = ex.Message });
            }
            catch (MySqlException ex) when (ex.Number == 1062)
            {
                return Conflict(new { mensagem = "Já existe um participante cadastrado com este e-mail institucional." });
            }
        }

        [HttpDelete("{cpf}")]
        [ExigirPerfil("Administrador")]
        public async Task<IActionResult> Delete(string cpf)
        {
            try
            {
                await _participanteServices.Delete(cpf);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (MySqlException ex) when (ex.Number == 1451)
            {
                return Conflict(new { mensagem = "Não é possível excluir o participante pois ele está vinculado como coordenador de um ou mais projetos." });
            }
        }
    }

    public class AtualizarParticipanteRequest
    {
        public string nome { get; set; } = string.Empty;
        public string emailInstitucional { get; set; } = string.Empty;
        public string tipo { get; set; } = string.Empty;
        public string? perfilAcesso { get; set; }
    }
}
