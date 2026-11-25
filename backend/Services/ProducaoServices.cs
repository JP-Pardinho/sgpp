using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Services
{
    public class ProducaoServices
    {
        private readonly IProducaoRepository _producaoRepository;

        public ProducaoServices(IProducaoRepository producaoRepository)
        {
            _producaoRepository = producaoRepository;
        }

        public async Task<IEnumerable<ProducaoCientifica>> GetAll(string? tipoProducao = null, int? anoPublicacao = null, string? projeto_codigo = null)
        {
            return await _producaoRepository.GetAll(tipoProducao, anoPublicacao, projeto_codigo);
        }

        public async Task<ProducaoCientifica?> GetById(int id)
        {
            if (id <= 0)
            {
                return null;
            }

            return await _producaoRepository.GetById(id);
        }

        public async Task<ProducaoCientifica> Create(ProducaoCientifica producao)
        {
            await ValidarDadosProducaoAsync(producao);

            if (producao.id_producao > 0)
            {
                var existente = await _producaoRepository.GetById(producao.id_producao);
                if (existente is not null)
                {
                    throw new InvalidOperationException($"Já existe uma produção científica cadastrada com o ID '{producao.id_producao}'.");
                }
            }

            var idCriado = await _producaoRepository.Store(producao);
            return (await _producaoRepository.GetById(idCriado)) ?? producao;
        }

        public async Task<ProducaoCientifica> Update(int id, ProducaoCientifica producao)
        {
            if (id <= 0)
            {
                throw new ArgumentException("O ID da produção científica deve ser maior que zero.");
            }

            if (producao is null)
            {
                throw new ArgumentException("Os dados da produção científica são obrigatórios.");
            }

            var existente = await _producaoRepository.GetById(id);
            if (existente is null)
            {
                throw new KeyNotFoundException($"Produção científica '{id}' não encontrada.");
            }

            producao.id_producao = id;
            await ValidarDadosProducaoAsync(producao);

            await _producaoRepository.Update(producao);
            return (await _producaoRepository.GetById(id)) ?? producao;
        }

        public async Task Delete(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("O ID da produção científica deve ser maior que zero.");
            }

            var removido = await _producaoRepository.Delete(id);
            if (!removido)
            {
                throw new KeyNotFoundException($"Produção científica '{id}' não encontrada.");
            }
        }

        private async Task ValidarDadosProducaoAsync(ProducaoCientifica producao)
        {
            if (producao is null)
            {
                throw new ArgumentException("Os dados da produção científica são obrigatórios.");
            }

            producao.titulo = (producao.titulo ?? string.Empty).Trim();
            producao.tipoProducao = (producao.tipoProducao ?? string.Empty).Trim();
            producao.meioDivulgacao = (producao.meioDivulgacao ?? string.Empty).Trim();
            producao.projeto_codigo = string.IsNullOrWhiteSpace(producao.projeto_codigo)
                ? null
                : producao.projeto_codigo.Trim();

            if (string.IsNullOrWhiteSpace(producao.titulo))
            {
                throw new ArgumentException("O título da produção científica é obrigatório.");
            }

            if (producao.titulo.Length > 255)
            {
                throw new ArgumentException("O título da produção científica deve ter no máximo 255 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(producao.tipoProducao))
            {
                throw new ArgumentException("O tipo de produção científica é obrigatório.");
            }

            if (producao.tipoProducao.Length > 50)
            {
                throw new ArgumentException("O tipo de produção científica deve ter no máximo 50 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(producao.meioDivulgacao))
            {
                throw new ArgumentException("O meio de divulgação é obrigatório.");
            }

            if (producao.meioDivulgacao.Length > 150)
            {
                throw new ArgumentException("O meio de divulgação deve ter no máximo 150 caracteres.");
            }

            var anoMaximo = DateTime.UtcNow.Year + 5;
            if (producao.anoPublicacao < 1900 || producao.anoPublicacao > anoMaximo)
            {
                throw new ArgumentException($"O ano de publicação deve estar entre 1900 e {anoMaximo}.");
            }

            if (producao.projeto_codigo is not null)
            {
                if (producao.projeto_codigo.Length > 30)
                {
                    throw new ArgumentException("O código do projeto deve ter no máximo 30 caracteres.");
                }

                var projetoExiste = await _producaoRepository.ProjetoExiste(producao.projeto_codigo);
                if (!projetoExiste)
                {
                    throw new ArgumentException($"Projeto '{producao.projeto_codigo}' não encontrado.");
                }
            }
        }
    }
}
