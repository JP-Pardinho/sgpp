using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using sgpp.Models;
using sgpp.Services;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/projetos")]
    public class ProjetosController : ControllerBase
    {
        private readonly ProjetoServices _projetoServices;

        public ProjetosController(ProjetoServices projetoServices)
        {
            _projetoServices = projetoServices;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Projeto projeto)
        {
            try
            {
                var criado = await _projetoServices.Create(projeto);
                return CreatedAtAction(nameof(GetByCodigo), new { codigo = criado.codigo }, criado);
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
                return Conflict(new { mensagem = "Já existe um projeto cadastrado com este código." });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? busca,
            [FromQuery] string? situacao,
            [FromQuery] string? coordenador_cpf)
        {
            var projetos = await _projetoServices.GetAll(busca, situacao, coordenador_cpf);
            return Ok(projetos);
        }

        [HttpGet("{codigo}")]
        public async Task<IActionResult> GetByCodigo(string codigo)
        {
            var projeto = await _projetoServices.GetByCodigo(codigo);
            if (projeto is null)
            {
                return NotFound(new { mensagem = $"Projeto '{codigo}' não encontrado." });
            }

            return Ok(projeto);
        }

        [HttpPut("{codigo}")]
        public async Task<IActionResult> Update(string codigo, [FromBody] AtualizarProjetoRequest request)
        {
            try
            {
                var projeto = new Projeto
                {
                    codigo = codigo,
                    titulo = request.titulo,
                    descricao = request.descricao,
                    situacao = request.situacao,
                    dataInicio = request.dataInicio,
                    dataFim = request.dataFim,
                    coordenador_cpf = request.coordenador_cpf
                };

                var atualizado = await _projetoServices.Update(codigo, projeto);
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
        }

        [HttpPatch("{codigo}/situacao")]
        public async Task<IActionResult> UpdateSituacao(string codigo, [FromBody] AtualizarSituacaoRequest request)
        {
            try
            {
                var atualizado = await _projetoServices.UpdateSituacao(codigo, request.situacao);
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
        }

        [HttpDelete("{codigo}")]
        public async Task<IActionResult> Delete(string codigo)
        {
            try
            {
                await _projetoServices.Delete(codigo);
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
        }
    }

    public class AtualizarProjetoRequest
    {
        public string titulo { get; set; } = string.Empty;
        public string? descricao { get; set; }
        public string situacao { get; set; } = string.Empty;
        public DateTime dataInicio { get; set; }
        public DateTime? dataFim { get; set; }
        public string coordenador_cpf { get; set; } = string.Empty;
    }

    public class AtualizarSituacaoRequest
    {
        public string situacao { get; set; } = string.Empty;
    }
}