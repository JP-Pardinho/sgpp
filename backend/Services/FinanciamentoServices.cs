using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.DTOs;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Services
{
    public class FinanciamentoServices
    {
        private readonly IFinanciamentoRepository _financiamentoRepository;
        private readonly IProjetoRepository _projetoRepository;

        public FinanciamentoServices(
            IFinanciamentoRepository financiamentoRepository,
            IProjetoRepository projetoRepository)
        {
            _financiamentoRepository = financiamentoRepository;
            _projetoRepository = projetoRepository;
        }

        public async Task<IEnumerable<Financiamento>> GetAll(string? agencia = null, string? tipoFomento = null)
        {
            return await _financiamentoRepository.GetAll(agencia, tipoFomento);
        }

        public async Task<Financiamento?> GetById(int id)
        {
            if (id <= 0)
            {
                return null;
            }

            return await _financiamentoRepository.GetById(id);
        }

        public async Task<Financiamento> Create(Financiamento financiamento)
        {
            ValidarDadosFinanciamento(financiamento);

            if (financiamento.id_financiamento > 0)
            {
                var existente = await _financiamentoRepository.GetById(financiamento.id_financiamento);
                if (existente is not null)
                {
                    throw new InvalidOperationException($"Já existe um financiamento cadastrado com o ID '{financiamento.id_financiamento}'.");
                }
            }

            var idCriado = await _financiamentoRepository.Store(financiamento);
            return (await _financiamentoRepository.GetById(idCriado)) ?? financiamento;
        }

        public async Task<Financiamento> Update(int id, Financiamento financiamento)
        {
            if (id <= 0)
            {
                throw new ArgumentException("O ID do financiamento deve ser maior que zero.");
            }

            if (financiamento is null)
            {
                throw new ArgumentException("Os dados do financiamento são obrigatórios.");
            }

            var existente = await _financiamentoRepository.GetById(id);
            if (existente is null)
            {
                throw new KeyNotFoundException($"Financiamento '{id}' não encontrado.");
            }

            financiamento.id_financiamento = id;
            ValidarDadosFinanciamento(financiamento);

            var valorDistribuido = await _financiamentoRepository.CalcularValorDistribuido(id);
            if (financiamento.valorTotal < valorDistribuido)
            {
                throw new ArgumentException($"O valor total do financiamento não pode ser menor que o valor já distribuído ({valorDistribuido:N2}).");
            }

            await _financiamentoRepository.Update(financiamento);
            return (await _financiamentoRepository.GetById(id)) ?? financiamento;
        }

        public async Task Delete(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("O ID do financiamento deve ser maior que zero.");
            }

            var removido = await _financiamentoRepository.Delete(id);
            if (!removido)
            {
                throw new KeyNotFoundException($"Financiamento '{id}' não encontrado.");
            }
        }

        public async Task<IEnumerable<ApoioFinanceiroDetalhe>> ListarProjetosPorFinanciamento(int idFinanciamento)
        {
            if (idFinanciamento <= 0)
            {
                throw new ArgumentException("O ID do financiamento deve ser maior que zero.");
            }

            var financiamento = await _financiamentoRepository.GetById(idFinanciamento);
            if (financiamento is null)
            {
                throw new KeyNotFoundException($"Financiamento '{idFinanciamento}' não encontrado.");
            }

            return await _financiamentoRepository.ListarProjetosPorFinanciamento(idFinanciamento);
        }

        public async Task<IEnumerable<ApoioFinanceiroDetalhe>> ListarTodosApoios()
        {
            return await _financiamentoRepository.ListarTodosApoios();
        }

        public async Task<IEnumerable<FinanciamentoVinculado>> ListarFinanciamentosPorProjeto(string projetoCodigo)
        {
            if (string.IsNullOrWhiteSpace(projetoCodigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            var codigoNormalizado = projetoCodigo.Trim();
            var projeto = await _projetoRepository.GetByCodigo(codigoNormalizado);
            if (projeto is null)
            {
                throw new KeyNotFoundException($"Projeto '{codigoNormalizado}' não encontrado.");
            }

            return await _financiamentoRepository.ListarFinanciamentosPorProjeto(codigoNormalizado);
        }

        public async Task<SaldoFinanciamentoResponse> ObterSaldo(int idFinanciamento)
        {
            if (idFinanciamento <= 0)
            {
                throw new ArgumentException("O ID do financiamento deve ser maior que zero.");
            }

            var financiamento = await _financiamentoRepository.GetById(idFinanciamento);
            if (financiamento is null)
            {
                throw new KeyNotFoundException($"Financiamento '{idFinanciamento}' não encontrado.");
            }

            var valorDistribuido = await _financiamentoRepository.CalcularValorDistribuido(idFinanciamento);
            var valorDisponivel = Math.Max(0m, financiamento.valorTotal - valorDistribuido);
            var percentualDistribuido = financiamento.valorTotal > 0
                ? Math.Round((valorDistribuido / financiamento.valorTotal) * 100m, 2)
                : 0m;

            return new SaldoFinanciamentoResponse
            {
                idFinanciamento = financiamento.id_financiamento,
                valorTotal = financiamento.valorTotal,
                valorDistribuido = valorDistribuido,
                valorDisponivel = valorDisponivel,
                percentualDistribuido = percentualDistribuido
            };
        }

        public async Task<ApoioFinanceiroDetalhe> VincularProjeto(
            int idFinanciamento,
            string projetoCodigo,
            string tipoVinculo,
            decimal? valorDestinado)
        {
            if (idFinanciamento <= 0)
            {
                throw new ArgumentException("O ID do financiamento deve ser maior que zero.");
            }

            if (string.IsNullOrWhiteSpace(projetoCodigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            var codigoNormalizado = projetoCodigo.Trim();

            var financiamento = await _financiamentoRepository.GetById(idFinanciamento);
            if (financiamento is null)
            {
                throw new KeyNotFoundException($"Financiamento '{idFinanciamento}' não encontrado.");
            }

            var projeto = await _projetoRepository.GetByCodigo(codigoNormalizado);
            if (projeto is null)
            {
                throw new KeyNotFoundException($"Projeto '{codigoNormalizado}' não encontrado.");
            }

            var tipoNormalizado = NormalizarTipoVinculo(tipoVinculo);

            // RN03 permite N:M entre projetos e financiamentos, impedindo apenas vínculo duplicado do mesmo par.
            var vinculoExistente = await _financiamentoRepository.ObterApoio(idFinanciamento, codigoNormalizado);
            if (vinculoExistente is not null)
            {
                throw new InvalidOperationException("Este projeto já está vinculado ao financiamento selecionado.");
            }

            var valorDistribuido = await _financiamentoRepository.CalcularValorDistribuido(idFinanciamento);
            var saldoDisponivel = financiamento.valorTotal - valorDistribuido;

            decimal valorFinal;
            if (tipoNormalizado == "Total")
            {
                if (valorDistribuido > 0)
                {
                    throw new InvalidOperationException("RN03: Não é possível usar vínculo 'Total' quando o financiamento já possui valores distribuídos.");
                }

                if (valorDestinado.HasValue && valorDestinado.Value < 0)
                {
                    throw new ArgumentException("O valor destinado não pode ser negativo.");
                }

                if (valorDestinado.HasValue && valorDestinado.Value > 0 && valorDestinado.Value != financiamento.valorTotal)
                {
                    throw new ArgumentException("Para vínculo 'Total', o valor destinado deve ser igual ao valor total do financiamento.");
                }

                valorFinal = financiamento.valorTotal;
            }
            else
            {
                if (!valorDestinado.HasValue || valorDestinado.Value <= 0)
                {
                    throw new ArgumentException("Para vínculo 'Parcial', informe um valor destinado maior que zero.");
                }

                valorFinal = valorDestinado.Value;
            }

            // RN03: O valor destinado não pode ultrapassar o saldo disponível (valorTotal - valorDistribuido).
            if (valorFinal > saldoDisponivel)
            {
                throw new ArgumentException($"RN03: O valor destinado ({valorFinal:N2}) ultrapassa o saldo disponível ({Math.Max(0m, saldoDisponivel):N2}).");
            }

            var apoio = new ApoioFinanceiro
            {
                projeto_codigo = codigoNormalizado,
                id_financiamento = idFinanciamento,
                tipoVinculo = tipoNormalizado,
                valorDestinado = valorFinal
            };

            await _financiamentoRepository.InserirApoio(apoio);
            return (await _financiamentoRepository.ObterApoio(idFinanciamento, codigoNormalizado))!;
        }

        public async Task RemoverVinculo(int idFinanciamento, string projetoCodigo)
        {
            if (idFinanciamento <= 0)
            {
                throw new ArgumentException("O ID do financiamento deve ser maior que zero.");
            }

            if (string.IsNullOrWhiteSpace(projetoCodigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            var codigoNormalizado = projetoCodigo.Trim();

            var financiamento = await _financiamentoRepository.GetById(idFinanciamento);
            if (financiamento is null)
            {
                throw new KeyNotFoundException($"Financiamento '{idFinanciamento}' não encontrado.");
            }

            var projeto = await _projetoRepository.GetByCodigo(codigoNormalizado);
            if (projeto is null)
            {
                throw new KeyNotFoundException($"Projeto '{codigoNormalizado}' não encontrado.");
            }

            var removido = await _financiamentoRepository.RemoverApoio(idFinanciamento, codigoNormalizado);
            if (!removido)
            {
                throw new KeyNotFoundException($"Vínculo entre o financiamento '{idFinanciamento}' e o projeto '{codigoNormalizado}' não encontrado.");
            }
        }

        private static string NormalizarTipoVinculo(string? tipoVinculo)
        {
            if (string.IsNullOrWhiteSpace(tipoVinculo))
            {
                throw new ArgumentException("O tipo de vínculo é obrigatório ('Total' ou 'Parcial').");
            }

            var tipoTrim = tipoVinculo.Trim();
            if (string.Equals(tipoTrim, "Total", StringComparison.OrdinalIgnoreCase))
            {
                return "Total";
            }

            if (string.Equals(tipoTrim, "Parcial", StringComparison.OrdinalIgnoreCase))
            {
                return "Parcial";
            }

            throw new ArgumentException("Tipo de vínculo inválido. Utilize 'Total' ou 'Parcial'.");
        }

        private static void ValidarDadosFinanciamento(Financiamento financiamento)
        {
            if (financiamento is null)
            {
                throw new ArgumentException("Os dados do financiamento são obrigatórios.");
            }

            financiamento.agenciaFinanciadora = (financiamento.agenciaFinanciadora ?? string.Empty).Trim();
            financiamento.tipoFomento = (financiamento.tipoFomento ?? string.Empty).Trim();

            if (string.IsNullOrWhiteSpace(financiamento.agenciaFinanciadora))
            {
                throw new ArgumentException("A agência financiadora é obrigatória.");
            }

            if (financiamento.agenciaFinanciadora.Length > 50)
            {
                throw new ArgumentException("A agência financiadora deve ter no máximo 50 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(financiamento.tipoFomento))
            {
                throw new ArgumentException("O tipo de fomento é obrigatório.");
            }

            if (financiamento.tipoFomento.Length > 50)
            {
                throw new ArgumentException("O tipo de fomento deve ter no máximo 50 caracteres.");
            }

            // RNF06: valorTotal deve ser positivo
            if (financiamento.valorTotal <= 0)
            {
                throw new ArgumentException("O valor total do financiamento deve ser maior que zero.");
            }

            if (financiamento.dataInicio == default)
            {
                throw new ArgumentException("A data de início da vigência é obrigatória.");
            }

            if (financiamento.dataFim == default)
            {
                throw new ArgumentException("A data de término da vigência é obrigatória.");
            }

            // RNF06: dataFim deve ser posterior à dataInicio
            if (financiamento.dataFim.Date <= financiamento.dataInicio.Date)
            {
                throw new ArgumentException("A data de término da vigência deve ser posterior à data de início.");
            }
        }
    }
}
