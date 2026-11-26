using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Services
{
    public class ProjetoServices
    {
        private readonly IProjetoRepository _projetoRepository;

        public ProjetoServices(IProjetoRepository projetoRepository)
        {
            _projetoRepository = projetoRepository;
        }

        public async Task<IEnumerable<Projeto>> GetAll(string? busca = null, string? situacao = null, string? coordenador_cpf = null)
        {
            return await _projetoRepository.GetAll(busca, situacao, coordenador_cpf);
        }

        public async Task<Projeto?> GetByCodigo(string codigo)
        {
            if (string.IsNullOrWhiteSpace(codigo))
            {
                return null;
            }

            return await _projetoRepository.GetByCodigo(codigo.Trim());
        }

        public async Task<Projeto> Create(Projeto projeto)
        {
            if (projeto is null)
            {
                throw new ArgumentException("Os dados do projeto são obrigatórios.");
            }

            if (string.IsNullOrWhiteSpace(projeto.codigo))
            {
                var ano = projeto.dataInicio != default ? projeto.dataInicio.Year : DateTime.Today.Year;
                projeto.codigo = await _projetoRepository.GerarProximoCodigo(ano);
            }

            await ValidarDadosProjetoAsync(projeto);

            var existente = await _projetoRepository.GetByCodigo(projeto.codigo);
            if (existente is not null)
            {
                throw new InvalidOperationException($"Já existe um projeto cadastrado com o código '{projeto.codigo}'.");
            }

            await _projetoRepository.Store(projeto);

            try
            {
                await _projetoRepository.InserirVinculoParticipante(
                    projeto.codigo,
                    projeto.coordenador_cpf,
                    "Coordenador",
                    projeto.dataInicio);
            }
            catch
            {
                try
                {
                    await _projetoRepository.Delete(projeto.codigo);
                }
                catch
                {
                    // Preserva a exceção original do vínculo se a compensação também falhar.
                }

                throw;
            }

            return (await _projetoRepository.GetByCodigo(projeto.codigo)) ?? projeto;
        }

        public async Task<Projeto> Update(string codigo, Projeto projeto)
        {
            if (string.IsNullOrWhiteSpace(codigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            if (projeto is null)
            {
                throw new ArgumentException("Os dados do projeto são obrigatórios.");
            }

            var codigoNormalizado = codigo.Trim();
            var existente = await _projetoRepository.GetByCodigo(codigoNormalizado);
            if (existente is null)
            {
                throw new KeyNotFoundException($"Projeto '{codigoNormalizado}' não encontrado.");
            }

            projeto.codigo = codigoNormalizado;
            await ValidarDadosProjetoAsync(projeto);

            await _projetoRepository.Update(projeto);

            return (await _projetoRepository.GetByCodigo(codigoNormalizado)) ?? projeto;
        }

        public async Task<Projeto> UpdateSituacao(string codigo, string novaSituacao)
        {
            if (string.IsNullOrWhiteSpace(codigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            if (string.IsNullOrWhiteSpace(novaSituacao))
            {
                throw new ArgumentException("A nova situação do projeto é obrigatória.");
            }

            var codigoNormalizado = codigo.Trim();
            var situacaoNormalizada = novaSituacao.Trim();

            if (situacaoNormalizada.Length > 50)
            {
                throw new ArgumentException("A situação deve ter no máximo 50 caracteres.");
            }

            var existente = await _projetoRepository.GetByCodigo(codigoNormalizado);
            if (existente is null)
            {
                throw new KeyNotFoundException($"Projeto '{codigoNormalizado}' não encontrado.");
            }

            await _projetoRepository.UpdateSituacao(codigoNormalizado, situacaoNormalizada);

            return (await _projetoRepository.GetByCodigo(codigoNormalizado))!;
        }

        public async Task Delete(string codigo)
        {
            if (string.IsNullOrWhiteSpace(codigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            var codigoNormalizado = codigo.Trim();
            var removido = await _projetoRepository.Delete(codigoNormalizado);
            if (!removido)
            {
                throw new KeyNotFoundException($"Projeto '{codigoNormalizado}' não encontrado.");
            }
        }

        private async Task ValidarDadosProjetoAsync(Projeto projeto)
        {
            if (projeto is null)
            {
                throw new ArgumentException("Os dados do projeto são obrigatórios.");
            }

            projeto.codigo = (projeto.codigo ?? string.Empty).Trim();
            projeto.titulo = (projeto.titulo ?? string.Empty).Trim();
            projeto.situacao = (projeto.situacao ?? string.Empty).Trim();
            projeto.coordenador_cpf = (projeto.coordenador_cpf ?? string.Empty).Trim();
            projeto.descricao = projeto.descricao?.Trim();

            if (string.IsNullOrWhiteSpace(projeto.codigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            if (projeto.codigo.Length > 30)
            {
                throw new ArgumentException("O código do projeto deve ter no máximo 30 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(projeto.titulo))
            {
                throw new ArgumentException("O título do projeto é obrigatório.");
            }

            if (projeto.titulo.Length > 255)
            {
                throw new ArgumentException("O título do projeto deve ter no máximo 255 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(projeto.situacao))
            {
                throw new ArgumentException("A situação do projeto é obrigatória.");
            }

            if (projeto.situacao.Length > 50)
            {
                throw new ArgumentException("A situação do projeto deve ter no máximo 50 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(projeto.coordenador_cpf))
            {
                throw new ArgumentException("O CPF do coordenador é obrigatório.");
            }

            if (projeto.coordenador_cpf.Length > 14)
            {
                throw new ArgumentException("O CPF do coordenador deve ter no máximo 14 caracteres.");
            }

            if (projeto.dataInicio == default)
            {
                throw new ArgumentException("A data de início do projeto é obrigatória.");
            }

            if (!projeto.dataFim.HasValue || projeto.dataFim.Value == default)
            {
                throw new ArgumentException("A data de término do projeto é obrigatória.");
            }

            // RNF06: A data de término não pode ser anterior à data de início.
            if (projeto.dataFim.Value.Date < projeto.dataInicio.Date)
            {
                throw new ArgumentException("A data de término não pode ser anterior à data de início.");
            }

            // RN01 / RF02: O coordenador deve existir em Participante e possuir tipo = 'Docente'.
            var tipoParticipante = await _projetoRepository.GetTipoParticipanteByCpf(projeto.coordenador_cpf);
            if (tipoParticipante is null)
            {
                throw new ArgumentException($"Coordenador não encontrado para o CPF '{projeto.coordenador_cpf}'.");
            }

            if (!string.Equals(tipoParticipante.Trim(), "Docente", StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException("Apenas participantes do tipo 'Docente' podem ser coordenadores de projeto.");
            }
        }
    }
}