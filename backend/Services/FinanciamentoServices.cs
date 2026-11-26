using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Services
{
    public class FinanciamentoServices
    {
        private readonly IFinanciamentoRepository _financiamentoRepository;

        public FinanciamentoServices(IFinanciamentoRepository financiamentoRepository)
        {
            _financiamentoRepository = financiamentoRepository;
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
