using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using sgpp.DTOs;
using sgpp.Models;
using sgpp.Security;
using sgpp.Services;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/projetos")]
    public class ProjetosController : ControllerBase
    {
        private readonly ProjetoServices _projetoServices;
        private readonly VinculoServices _vinculoServices;
        private readonly Func<MySqlConnection> _createConnection;

        public ProjetosController(
            ProjetoServices projetoServices,
            VinculoServices vinculoServices,
            Func<MySqlConnection> createConnection)
        {
            _projetoServices = projetoServices;
            _vinculoServices = vinculoServices;
            _createConnection = createConnection;
        }

        [HttpPost]
        [ExigirPerfil("Administrador", "Coordenador")]
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
        [ExigirPerfil("Administrador", "Coordenador")]
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
        [ExigirPerfil("Administrador", "Coordenador")]
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
        [ExigirPerfil("Administrador", "Coordenador")]
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

        [HttpGet("{codigo}/participantes")]
        public async Task<IActionResult> GetParticipantes(string codigo)
        {
            try
            {
                var codigoDecodificado = Uri.UnescapeDataString(codigo);
                var equipe = await _vinculoServices.ListarParticipantes(codigoDecodificado);
                return Ok(equipe);
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

        [HttpPost("{codigo}/participantes")]
        [ExigirPerfil("Administrador", "Coordenador")]
        public async Task<IActionResult> VincularParticipante(string codigo, [FromBody] VincularParticipanteRequest? request)
        {
            try
            {
                if (request is null)
                {
                    return BadRequest(new { mensagem = "Os dados do vínculo são obrigatórios." });
                }

                var codigoDecodificado = Uri.UnescapeDataString(codigo);
                var cpf = request.participanteCpf ?? request.participante_cpf ?? string.Empty;
                var criado = await _vinculoServices.VincularParticipante(
                    codigoDecodificado,
                    cpf,
                    request.funcao,
                    request.dataEntrada,
                    request.dataSaida);

                return CreatedAtAction(nameof(GetParticipantes), new { codigo = codigoDecodificado }, criado);
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
                return Conflict(new { mensagem = "Este participante já está vinculado ao projeto selecionado." });
            }
            catch (MySqlException ex) when (ex.Number == 1452)
            {
                return BadRequest(new { mensagem = "Projeto ou participante informado não encontrado." });
            }
        }

        [HttpPatch("{codigo}/participantes/{cpf}/saida")]
        [ExigirPerfil("Administrador", "Coordenador")]
        public async Task<IActionResult> RegistrarSaida(string codigo, string cpf, [FromBody] RegistrarSaidaRequest? request)
        {
            try
            {
                if (request is null)
                {
                    return BadRequest(new { mensagem = "A data de saída é obrigatória." });
                }

                var codigoDecodificado = Uri.UnescapeDataString(codigo);
                var cpfDecodificado = Uri.UnescapeDataString(cpf);
                var atualizado = await _vinculoServices.RegistrarDataSaida(
                    codigoDecodificado,
                    cpfDecodificado,
                    request.dataSaida);

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

        [HttpDelete("{codigo}/participantes/{cpf}")]
        [ExigirPerfil("Administrador", "Coordenador")]
        public async Task<IActionResult> RemoverParticipante(string codigo, string cpf)
        {
            try
            {
                var codigoDecodificado = Uri.UnescapeDataString(codigo);
                var cpfDecodificado = Uri.UnescapeDataString(cpf);
                await _vinculoServices.RemoverVinculo(codigoDecodificado, cpfDecodificado);
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

        [HttpGet("{codigo}/financiamentos")]
        public async Task<IActionResult> GetFinanciamentos(string codigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT f.id_financiamento AS idFinanciamento,
                       f.agenciaFinanciadora AS agencia,
                       f.tipoFomento,
                       af.tipoVinculo,
                       f.dataInicio,
                       f.dataFim,
                       af.valorDestinado AS valor
                FROM Apoio_Financeiro af
                JOIN Financiamento f ON af.id_financiamento = f.id_financiamento
                WHERE af.projeto_codigo = @codigo
                ORDER BY f.dataInicio DESC;";

            var financiamentos = await connection.QueryAsync<FinanciamentoVinculadoResponse>(sql, new { codigo = codigo.Trim() });
            return Ok(financiamentos);
        }

        [HttpGet("{codigo}/producoes")]
        public async Task<IActionResult> GetProducoes(string codigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT id_producao AS id,
                       titulo,
                       tipoProducao AS tipo,
                       anoPublicacao AS ano,
                       meioDivulgacao
                FROM Producao_Cientifica
                WHERE projeto_codigo = @codigo
                ORDER BY anoPublicacao DESC, titulo ASC;";

            var producoes = await connection.QueryAsync<ProducaoVinculadaResponse>(sql, new { codigo = codigo.Trim() });
            return Ok(producoes);
        }
    }

    public class FinanciamentoVinculadoResponse
    {
        public int idFinanciamento { get; set; }
        public string agencia { get; set; } = string.Empty;
        public string tipoFomento { get; set; } = string.Empty;
        public string tipoVinculo { get; set; } = string.Empty;
        public DateTime dataInicio { get; set; }
        public DateTime dataFim { get; set; }
        public decimal valor { get; set; }
    }

    public class ProducaoVinculadaResponse
    {
        public int id { get; set; }
        public string titulo { get; set; } = string.Empty;
        public string tipo { get; set; } = string.Empty;
        public int ano { get; set; }
        public string meioDivulgacao { get; set; } = string.Empty;
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