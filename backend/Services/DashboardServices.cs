using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using sgpp.DTOs;
using sgpp.Repositories.Interfaces;

namespace sgpp.Services
{
    public class DashboardServices
    {
        private static readonly string[] AgenciasPadrao = { "CNPq", "FAPES", "CAPES" };
        private readonly IDashboardRepository _dashboardRepository;

        public DashboardServices(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<DashboardDto> ObterIndicadores()
        {
            var vencimentos30Dias = await _dashboardRepository.ContarVencimentosProximos30Dias();
            var totalParticipantes = await _dashboardRepository.ContarTotalParticipantes();
            var financiamentoTotal = await _dashboardRepository.SomarFinanciamentoTotal();
            var totalProducoes = await _dashboardRepository.ContarTotalProducoes();
            var contagensSituacao = await _dashboardRepository.ContarProjetosPorSituacao();
            var totaisPorAgencia = (await _dashboardRepository.SomarFinanciamentoPorAgencia()).ToList();
            var projetosRecentes = (await _dashboardRepository.ListarProjetosRecentes(5)).ToList();

            var porSituacao = new ProjetosPorSituacaoDto();
            foreach (var item in contagensSituacao)
            {
                var sit = (item.situacao ?? string.Empty).Trim();
                if (string.Equals(sit, "Em andamento", StringComparison.OrdinalIgnoreCase))
                {
                    porSituacao.emAndamento += item.total;
                }
                else if (string.Equals(sit, "Concluído", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(sit, "Concluido", StringComparison.OrdinalIgnoreCase))
                {
                    porSituacao.concluido += item.total;
                }
                else if (string.Equals(sit, "Cancelado", StringComparison.OrdinalIgnoreCase))
                {
                    porSituacao.cancelado += item.total;
                }
            }

            // Garante que as agências principais (CNPq, FAPES, CAPES) sempre apareçam no gráfico do Dashboard
            var mapaAgencias = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
            foreach (var ag in AgenciasPadrao)
            {
                mapaAgencias[ag] = 0m;
            }

            foreach (var item in totaisPorAgencia)
            {
                var nomeAgencia = (item.agencia ?? string.Empty).Trim();
                if (!string.IsNullOrEmpty(nomeAgencia))
                {
                    mapaAgencias[nomeAgencia] = item.valor;
                }
            }

            var listaAgencias = mapaAgencias
                .Select(kvp => new FinanciamentoPorAgenciaDto
                {
                    agencia = kvp.Key,
                    valor = kvp.Value
                })
                .OrderByDescending(a => a.valor)
                .ThenBy(a => a.agencia)
                .ToList();

            return new DashboardDto
            {
                vencimentosProximos30Dias = vencimentos30Dias,
                projetosEmAndamento = porSituacao.emAndamento,
                totalParticipantes = totalParticipantes,
                financiamentoTotal = financiamentoTotal,
                producoesCientificas = totalProducoes,
                projetosPorSituacao = porSituacao,
                financiamentoPorAgencia = listaAgencias,
                projetosRecentes = projetosRecentes
            };
        }
    }
}
