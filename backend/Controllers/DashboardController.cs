using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using sgpp.Services;

namespace sgpp.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardServices _dashboardServices;

        public DashboardController(DashboardServices dashboardServices)
        {
            _dashboardServices = dashboardServices;
        }

        // Seção 5.2 / RNF05: Indicadores e resumo geral do Dashboard
        [HttpGet]
        [HttpGet("resumo")]
        public async Task<IActionResult> ObterIndicadores()
        {
            var resumo = await _dashboardServices.ObterIndicadores();
            return Ok(resumo);
        }
    }
}
