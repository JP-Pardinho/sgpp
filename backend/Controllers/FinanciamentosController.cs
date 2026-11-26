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
    [Route("api/financiamentos")]
    public class FinanciamentosController : ControllerBase
    {
        private readonly FinanciamentoServices _financiamentoServices;

        public FinanciamentosController(FinanciamentoServices financiamentoServices)
        {
            _financiamentoServices = financiamentoServices;
        }

        [HttpPost]
        [ExigirPerfil("Administrador")]
        public async Task<IActionResult> Create([FromBody] Financiamento financiamento)
        {
            try
            {
                var criado = await _financiamentoServices.Create(financiamento);
                return CreatedAtAction(nameof(GetById), new { id = criado.id_financiamento }, criado);
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
                return Conflict(new { mensagem = "Já existe um financiamento cadastrado com este ID." });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? agencia,
            [FromQuery] string? tipoFomento)
        {
            var financiamentos = await _financiamentoServices.GetAll(agencia, tipoFomento);
            return Ok(financiamentos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var financiamento = await _financiamentoServices.GetById(id);
            if (financiamento is null)
            {
                return NotFound(new { mensagem = $"Financiamento '{id}' não encontrado." });
            }

            return Ok(financiamento);
        }

        [HttpPut("{id:int}")]
        [ExigirPerfil("Administrador")]
        public async Task<IActionResult> Update(int id, [FromBody] AtualizarFinanciamentoRequest request)
        {
            try
            {
                var financiamento = new Financiamento
                {
                    id_financiamento = id,
                    agenciaFinanciadora = request.agenciaFinanciadora,
                    tipoFomento = request.tipoFomento,
                    valorTotal = request.valorTotal,
                    dataInicio = request.dataInicio,
                    dataFim = request.dataFim
                };

                var atualizado = await _financiamentoServices.Update(id, financiamento);
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

        [HttpDelete("{id:int}")]
        [ExigirPerfil("Administrador")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _financiamentoServices.Delete(id);
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

        [HttpGet("apoios")]
        public async Task<IActionResult> GetAllApoios()
        {
            var apoios = await _financiamentoServices.ListarTodosApoios();
            return Ok(apoios);
        }

        [HttpGet("{id:int}/projetos")]
        public async Task<IActionResult> GetProjetos(int id)
        {
            try
            {
                var projetos = await _financiamentoServices.ListarProjetosPorFinanciamento(id);
                return Ok(projetos);
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

        [HttpGet("{id:int}/saldo")]
        public async Task<IActionResult> GetSaldo(int id)
        {
            try
            {
                var saldo = await _financiamentoServices.ObterSaldo(id);
                return Ok(saldo);
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

        [HttpPost("{id:int}/projetos")]
        [ExigirPerfil("Administrador")]
        public async Task<IActionResult> VincularProjeto(int id, [FromBody] VincularFinanciamentoRequest? request)
        {
            try
            {
                if (request is null)
                {
                    return BadRequest(new { mensagem = "Os dados do vínculo financeiro são obrigatórios." });
                }

                var codigoProjeto = request.projetoCodigo ?? request.projeto_codigo ?? string.Empty;
                var criado = await _financiamentoServices.VincularProjeto(
                    id,
                    codigoProjeto,
                    request.tipoVinculo,
                    request.valorDestinado);

                return CreatedAtAction(nameof(GetProjetos), new { id }, criado);
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
                return Conflict(new { mensagem = "Este projeto já está vinculado ao financiamento selecionado." });
            }
            catch (MySqlException ex) when (ex.Number == 1452)
            {
                return BadRequest(new { mensagem = "Financiamento ou projeto informado não encontrado." });
            }
        }

        [HttpDelete("{id:int}/projetos/{codigo}")]
        [ExigirPerfil("Administrador")]
        public async Task<IActionResult> RemoverProjeto(int id, string codigo)
        {
            try
            {
                var codigoDecodificado = Uri.UnescapeDataString(codigo);
                await _financiamentoServices.RemoverVinculo(id, codigoDecodificado);
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

    public class AtualizarFinanciamentoRequest
    {
        public string agenciaFinanciadora { get; set; } = string.Empty;
        public string tipoFomento { get; set; } = string.Empty;
        public decimal valorTotal { get; set; }
        public DateTime dataInicio { get; set; }
        public DateTime dataFim { get; set; }
    }
}
