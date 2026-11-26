using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Services
{
    public class ProducaoServices
    {
        private readonly IProducaoRepository _producaoRepository;
        private readonly IParticipanteRepository _participanteRepository;

        public ProducaoServices(
            IProducaoRepository producaoRepository,
            IParticipanteRepository participanteRepository)
        {
            _producaoRepository = producaoRepository;
            _participanteRepository = participanteRepository;
        }

        public async Task<IEnumerable<ProducaoCientifica>> GetAll(string? tipoProducao = null, int? anoPublicacao = null, string? projeto_codigo = null)
        {
            var lista = (await _producaoRepository.GetAll(tipoProducao, anoPublicacao, projeto_codigo)).ToList();
            if (lista.Count == 0)
            {
                return lista;
            }

            var autoresPorProducao = await _producaoRepository.ListarAutoresPorProducoes(lista.Select(p => p.id_producao));
            foreach (var producao in lista)
            {
                if (autoresPorProducao.TryGetValue(producao.id_producao, out var autores))
                {
                    producao.autores = autores;
                }
            }

            return lista;
        }

        public async Task<ProducaoCientifica?> GetById(int id)
        {
            if (id <= 0)
            {
                return null;
            }

            var producao = await _producaoRepository.GetById(id);
            if (producao is null)
            {
                return null;
            }

            producao.autores = (await _producaoRepository.ListarAutores(id)).ToList();
            return producao;
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
            return (await GetById(idCriado)) ?? producao;
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
            return (await GetById(id)) ?? producao;
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

        public async Task<ProducaoCientifica> Vincular(int idProducao, string? projetoCodigo, IEnumerable<string>? autoresCpfs)
        {
            if (idProducao <= 0)
            {
                throw new ArgumentException("O ID da produção científica deve ser maior que zero.");
            }

            var existente = await _producaoRepository.GetById(idProducao);
            if (existente is null)
            {
                throw new KeyNotFoundException($"Produção científica '{idProducao}' não encontrada.");
            }

            var codigoNormalizado = string.IsNullOrWhiteSpace(projetoCodigo) ? null : projetoCodigo.Trim();
            if (codigoNormalizado is null && autoresCpfs is null)
            {
                throw new ArgumentException("Informe o código do projeto e/ou os CPFs dos autores para vincular.");
            }

            if (codigoNormalizado is not null)
            {
                if (codigoNormalizado.Length > 30)
                {
                    throw new ArgumentException("O código do projeto deve ter no máximo 30 caracteres.");
                }

                var projetoExiste = await _producaoRepository.ProjetoExiste(codigoNormalizado);
                if (!projetoExiste)
                {
                    throw new ArgumentException($"Projeto '{codigoNormalizado}' não encontrado.");
                }
            }

            List<string>? cpfsValidados = null;
            if (autoresCpfs is not null)
            {
                cpfsValidados = new List<string>();
                var vistos = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                // RN04: Todos os autores devem estar previamente cadastrados em Participante.
                foreach (var cpfBruto in autoresCpfs)
                {
                    if (string.IsNullOrWhiteSpace(cpfBruto))
                    {
                        throw new ArgumentException("RN04: Todos os autores informados devem possuir CPF válido e cadastrado.");
                    }

                    var participante = await BuscarParticipantePorCpfFlexivelAsync(cpfBruto);
                    if (participante is null)
                    {
                        throw new ArgumentException($"RN04: Participante com CPF '{cpfBruto.Trim()}' não encontrado. Todos os autores devem estar previamente cadastrados.");
                    }

                    if (vistos.Add(participante.cpf))
                    {
                        cpfsValidados.Add(participante.cpf);
                    }
                }

                if (cpfsValidados.Count == 0)
                {
                    throw new ArgumentException("Selecione pelo menos um autor cadastrado.");
                }
            }

            if (codigoNormalizado is not null)
            {
                await _producaoRepository.AtualizarProjetoCodigo(idProducao, codigoNormalizado);
            }

            if (cpfsValidados is not null)
            {
                await _producaoRepository.SincronizarAutores(idProducao, cpfsValidados);
            }

            return (await GetById(idProducao))!;
        }

        public async Task<IEnumerable<AutorProducao>> ListarAutores(int idProducao)
        {
            if (idProducao <= 0)
            {
                throw new ArgumentException("O ID da produção científica deve ser maior que zero.");
            }

            var existente = await _producaoRepository.GetById(idProducao);
            if (existente is null)
            {
                throw new KeyNotFoundException($"Produção científica '{idProducao}' não encontrada.");
            }

            return await _producaoRepository.ListarAutores(idProducao);
        }

        public async Task RemoverAutor(int idProducao, string cpf)
        {
            if (idProducao <= 0)
            {
                throw new ArgumentException("O ID da produção científica deve ser maior que zero.");
            }

            if (string.IsNullOrWhiteSpace(cpf))
            {
                throw new ArgumentException("O CPF do autor é obrigatório.");
            }

            var existente = await _producaoRepository.GetById(idProducao);
            if (existente is null)
            {
                throw new KeyNotFoundException($"Produção científica '{idProducao}' não encontrada.");
            }

            var participante = await BuscarParticipantePorCpfFlexivelAsync(cpf);
            var cpfAlvo = participante?.cpf ?? cpf.Trim();

            var removido = await _producaoRepository.RemoverAutor(idProducao, cpfAlvo);
            if (!removido)
            {
                throw new KeyNotFoundException($"Autor com CPF '{cpf.Trim()}' não está vinculado à produção '{idProducao}'.");
            }
        }

        private async Task<Participante?> BuscarParticipantePorCpfFlexivelAsync(string cpf)
        {
            var cpfTrim = cpf.Trim();
            var encontrado = await _participanteRepository.GetByCpf(cpfTrim);
            if (encontrado is not null)
            {
                return encontrado;
            }

            var digitos = new string(cpfTrim.Where(char.IsDigit).ToArray());
            if (digitos.Length == 11)
            {
                var cpfFormatado = $"{digitos.Substring(0, 3)}.{digitos.Substring(3, 3)}.{digitos.Substring(6, 3)}-{digitos.Substring(9, 2)}";
                if (!string.Equals(cpfFormatado, cpfTrim, StringComparison.Ordinal))
                {
                    encontrado = await _participanteRepository.GetByCpf(cpfFormatado);
                    if (encontrado is not null)
                    {
                        return encontrado;
                    }
                }

                if (!string.Equals(digitos, cpfTrim, StringComparison.Ordinal))
                {
                    return await _participanteRepository.GetByCpf(digitos);
                }
            }

            return null;
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
