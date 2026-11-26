using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using sgpp.DTOs;
using sgpp.Models;
using sgpp.Security;
using sgpp.Services;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/producoes")]
    public class ProducoesController : ControllerBase
    {
        private readonly ProducaoServices _producaoServices;

        public ProducoesController(ProducaoServices producaoServices)
        {
            _producaoServices = producaoServices;
        }

        [HttpPost]
        [ExigirPerfil("Administrador", "Coordenador")]
        public async Task<IActionResult> Create([FromBody] ProducaoCientifica producao)
        {
            try
            {
                var criada = await _producaoServices.Create(producao);
                return CreatedAtAction(nameof(GetById), new { id = criada.id_producao }, criada);
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
                return Conflict(new { mensagem = "Já existe uma produção científica cadastrada com este ID." });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? tipoProducao,
            [FromQuery] int? anoPublicacao,
            [FromQuery] string? projeto_codigo)
        {
            var producoes = await _producaoServices.GetAll(tipoProducao, anoPublicacao, projeto_codigo);
            return Ok(producoes);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var producao = await _producaoServices.GetById(id);
            if (producao is null)
            {
                return NotFound(new { mensagem = $"Produção científica '{id}' não encontrada." });
            }

            return Ok(producao);
        }

        [HttpPut("{id:int}")]
        [ExigirPerfil("Administrador", "Coordenador")]
        public async Task<IActionResult> Update(int id, [FromBody] AtualizarProducaoRequest request)
        {
            try
            {
                var producao = new ProducaoCientifica
                {
                    id_producao = id,
                    projeto_codigo = request.projeto_codigo,
                    titulo = request.titulo,
                    tipoProducao = request.tipoProducao,
                    anoPublicacao = request.anoPublicacao,
                    meioDivulgacao = request.meioDivulgacao
                };

                var atualizada = await _producaoServices.Update(id, producao);
                return Ok(atualizada);
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

        [HttpDelete("{id:int}")]
        [ExigirPerfil("Administrador", "Coordenador")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _producaoServices.Delete(id);
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

        [HttpPost("{id:int}/vincular")]
        [ExigirPerfil("Administrador", "Coordenador")]
        public async Task<IActionResult> Vincular(int id, [FromBody] VincularProducaoRequest? request)
        {
            try
            {
                var codigoProjeto = request?.projetoCodigo ?? request?.projeto_codigo;
                var atualizada = await _producaoServices.Vincular(id, codigoProjeto, request?.autoresCpfs);
                return Ok(atualizada);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (MySqlException ex) when (ex.Number == 1452)
            {
                return BadRequest(new { mensagem = "Projeto ou autor informado não encontrado no banco de dados." });
            }
            catch (MySqlException ex) when (ex.Number == 1062)
            {
                return Conflict(new { mensagem = "Autor já vinculado a esta produção científica." });
            }
        }

        [HttpGet("{id:int}/autores")]
        public async Task<IActionResult> GetAutores(int id)
        {
            try
            {
                var autores = await _producaoServices.ListarAutores(id);
                return Ok(autores);
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

        [HttpDelete("{id:int}/autores/{cpf}")]
        [ExigirPerfil("Administrador", "Coordenador")]
        public async Task<IActionResult> RemoveAutor(int id, string cpf)
        {
            try
            {
                var cpfDecodificado = Uri.UnescapeDataString(cpf);
                await _producaoServices.RemoverAutor(id, cpfDecodificado);
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

    public class AtualizarProducaoRequest
    {
        public string? projeto_codigo { get; set; }
        public string titulo { get; set; } = string.Empty;
        public string tipoProducao { get; set; } = string.Empty;
        public int anoPublicacao { get; set; }
        public string meioDivulgacao { get; set; } = string.Empty;
    }
}
