using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Services
{
    public class VinculoServices
    {
        private static readonly string[] FuncoesConhecidas =
        {
            "Coordenador",
            "Bolsista",
            "Colaborador",
            "Apoio Técnico"
        };

        private readonly IVinculoRepository _vinculoRepository;
        private readonly IProjetoRepository _projetoRepository;
        private readonly IParticipanteRepository _participanteRepository;

        public VinculoServices(
            IVinculoRepository vinculoRepository,
            IProjetoRepository projetoRepository,
            IParticipanteRepository participanteRepository)
        {
            _vinculoRepository = vinculoRepository;
            _projetoRepository = projetoRepository;
            _participanteRepository = participanteRepository;
        }

        public async Task<IEnumerable<EquipeMembro>> ListarParticipantes(string projetoCodigo)
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

            return await _vinculoRepository.ListarParticipantesPorProjeto(codigoNormalizado);
        }

        public async Task<EquipeMembro> VincularParticipante(
            string projetoCodigo,
            string participanteCpf,
            string funcao,
            DateTime dataEntrada,
            DateTime? dataSaida)
        {
            if (string.IsNullOrWhiteSpace(projetoCodigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            if (string.IsNullOrWhiteSpace(participanteCpf))
            {
                throw new ArgumentException("O CPF do participante é obrigatório.");
            }

            var codigoNormalizado = projetoCodigo.Trim();
            var projeto = await _projetoRepository.GetByCodigo(codigoNormalizado);
            if (projeto is null)
            {
                throw new KeyNotFoundException($"Projeto '{codigoNormalizado}' não encontrado.");
            }

            var participante = await BuscarParticipantePorCpfFlexivelAsync(participanteCpf);
            if (participante is null)
            {
                throw new ArgumentException($"Participante com CPF '{participanteCpf.Trim()}' não encontrado.");
            }

            var funcaoNormalizada = NormalizarFuncao(funcao);

            if (dataEntrada == default)
            {
                throw new ArgumentException("A data de entrada é obrigatória.");
            }

            // RNF06: A data de saída (quando informada) deve ser >= data de entrada.
            if (dataSaida.HasValue && dataSaida.Value.Date < dataEntrada.Date)
            {
                throw new ArgumentException("A data de saída não pode ser anterior à data de entrada.");
            }

            // RN02 permite atuação em vários projetos simultaneamente, impedindo apenas vínculo duplicado no mesmo projeto.
            var vinculoExistente = await _vinculoRepository.ObterVinculo(codigoNormalizado, participante.cpf);
            if (vinculoExistente is not null)
            {
                throw new InvalidOperationException("Este participante já está vinculado ao projeto selecionado.");
            }

            // RN01: Cada projeto pode ter apenas 1 coordenador principal ativo.
            if (string.Equals(funcaoNormalizada, "Coordenador", StringComparison.OrdinalIgnoreCase) &&
                !dataSaida.HasValue)
            {
                var jaTemCoordenador = await _vinculoRepository.ExisteCoordenadorAtivo(codigoNormalizado);
                if (jaTemCoordenador)
                {
                    throw new InvalidOperationException("RN01: Este projeto já possui um coordenador principal ativo. Escolha outra função.");
                }
            }

            var vinculo = new ProjetoParticipante
            {
                projeto_codigo = codigoNormalizado,
                participante_cpf = participante.cpf,
                funcao = funcaoNormalizada,
                dataEntrada = dataEntrada.Date,
                dataSaida = dataSaida?.Date
            };

            await _vinculoRepository.InserirVinculo(vinculo);

            return (await _vinculoRepository.ObterVinculo(codigoNormalizado, participante.cpf))!;
        }

        public async Task<EquipeMembro> RegistrarDataSaida(string projetoCodigo, string cpf, DateTime dataSaida)
        {
            if (string.IsNullOrWhiteSpace(projetoCodigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            if (string.IsNullOrWhiteSpace(cpf))
            {
                throw new ArgumentException("O CPF do participante é obrigatório.");
            }

            if (dataSaida == default)
            {
                throw new ArgumentException("A data de saída é obrigatória.");
            }

            var codigoNormalizado = projetoCodigo.Trim();
            var projeto = await _projetoRepository.GetByCodigo(codigoNormalizado);
            if (projeto is null)
            {
                throw new KeyNotFoundException($"Projeto '{codigoNormalizado}' não encontrado.");
            }

            var participante = await BuscarParticipantePorCpfFlexivelAsync(cpf);
            var cpfAlvo = participante?.cpf ?? cpf.Trim();

            var vinculoExistente = await _vinculoRepository.ObterVinculo(codigoNormalizado, cpfAlvo);
            if (vinculoExistente is null)
            {
                throw new KeyNotFoundException($"Vínculo do participante '{cpf.Trim()}' no projeto '{codigoNormalizado}' não encontrado.");
            }

            // RNF06: A data de saída deve ser >= data de entrada.
            if (dataSaida.Date < vinculoExistente.dataEntrada.Date)
            {
                throw new ArgumentException("A data de saída não pode ser anterior à data de entrada.");
            }

            await _vinculoRepository.RegistrarDataSaida(codigoNormalizado, cpfAlvo, dataSaida.Date);

            return (await _vinculoRepository.ObterVinculo(codigoNormalizado, cpfAlvo))!;
        }

        public async Task RemoverVinculo(string projetoCodigo, string cpf)
        {
            if (string.IsNullOrWhiteSpace(projetoCodigo))
            {
                throw new ArgumentException("O código do projeto é obrigatório.");
            }

            if (string.IsNullOrWhiteSpace(cpf))
            {
                throw new ArgumentException("O CPF do participante é obrigatório.");
            }

            var codigoNormalizado = projetoCodigo.Trim();
            var projeto = await _projetoRepository.GetByCodigo(codigoNormalizado);
            if (projeto is null)
            {
                throw new KeyNotFoundException($"Projeto '{codigoNormalizado}' não encontrado.");
            }

            var participante = await BuscarParticipantePorCpfFlexivelAsync(cpf);
            var cpfAlvo = participante?.cpf ?? cpf.Trim();

            var removido = await _vinculoRepository.RemoverVinculo(codigoNormalizado, cpfAlvo);
            if (!removido)
            {
                throw new KeyNotFoundException($"Vínculo do participante '{cpf.Trim()}' no projeto '{codigoNormalizado}' não encontrado.");
            }
        }

        private static string NormalizarFuncao(string? funcao)
        {
            if (string.IsNullOrWhiteSpace(funcao))
            {
                throw new ArgumentException("A função do participante no projeto é obrigatória.");
            }

            var funcaoTrim = funcao.Trim();
            if (funcaoTrim.Length > 50)
            {
                throw new ArgumentException("A função deve ter no máximo 50 caracteres.");
            }

            if (string.Equals(funcaoTrim, "Apoio Tecnico", StringComparison.OrdinalIgnoreCase))
            {
                return "Apoio Técnico";
            }

            var conhecida = FuncoesConhecidas.FirstOrDefault(
                f => string.Equals(f, funcaoTrim, StringComparison.OrdinalIgnoreCase));

            return conhecida ?? funcaoTrim;
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
    }
}
