using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using sgpp.Services;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/consultas")]
    public class ConsultasController : ControllerBase
    {
        private readonly ConsultaServices _consultaServices;

        public ConsultasController(ConsultaServices consultaServices)
        {
            _consultaServices = consultaServices;
        }

        // UC09 / RF12: Projetos por Coordenador
        [HttpGet("projetos-por-coordenador")]
        public async Task<IActionResult> ConsultarProjetosPorCoordenador(
            [FromQuery] string? filtro = null,
            [FromQuery] string? cpf = null)
        {
            var criterio = !string.IsNullOrWhiteSpace(filtro) ? filtro : cpf;
            var resultado = await _consultaServices.ConsultarProjetosPorCoordenador(criterio);
            return Ok(resultado);
        }

        // UC10 / RF13: Participantes do Projeto
        [HttpGet("participantes-do-projeto")]
        [HttpGet("participantes-por-projeto")]
        public async Task<IActionResult> ConsultarParticipantesPorProjeto(
            [FromQuery] string? filtro = null,
            [FromQuery] string? codigo = null)
        {
            var criterio = !string.IsNullOrWhiteSpace(filtro) ? filtro : codigo;
            var resultado = await _consultaServices.ConsultarParticipantesPorProjeto(criterio);
            return Ok(resultado);
        }

        // UC11 / RF14: Produções do Projeto
        [HttpGet("producoes-do-projeto")]
        [HttpGet("producoes-por-projeto")]
        public async Task<IActionResult> ConsultarProducoesPorProjeto(
            [FromQuery] string? filtro = null,
            [FromQuery] string? codigo = null)
        {
            var criterio = !string.IsNullOrWhiteSpace(filtro) ? filtro : codigo;
            var resultado = await _consultaServices.ConsultarProducoesPorProjeto(criterio);
            return Ok(resultado);
        }

        // UC12 / RF15: Financiamentos por Agência
        [HttpGet("financiamentos-por-agencia")]
        public async Task<IActionResult> ConsultarFinanciamentosPorAgencia(
            [FromQuery] string? filtro = null,
            [FromQuery] string? agencia = null)
        {
            var criterio = !string.IsNullOrWhiteSpace(filtro) ? filtro : agencia;
            var resultado = await _consultaServices.ConsultarFinanciamentosPorAgencia(criterio);
            return Ok(resultado);
        }
    }
}
