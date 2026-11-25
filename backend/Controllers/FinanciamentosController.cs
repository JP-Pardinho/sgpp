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
    [Route("api/financiamentos")]
    public class FinanciamentosController : ControllerBase
    {
        private readonly FinanciamentoServices _financiamentoServices;

        public FinanciamentosController(FinanciamentoServices financiamentoServices)
        {
            _financiamentoServices = financiamentoServices;
        }

        [HttpPost]
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
