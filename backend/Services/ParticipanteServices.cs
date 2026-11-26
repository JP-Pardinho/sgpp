using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Services
{
    public class ParticipanteServices
    {
        private static readonly string[] TiposPermitidos = { "Docente", "Discente", "Técnico" };
        private static readonly string[] PerfisPermitidos = { "Administrador", "Coordenador", "Participante" };

        private static readonly Regex RegexCpfFormato = new(@"^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$", RegexOptions.Compiled);
        private static readonly Regex RegexEmailGeral = new(@"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$", RegexOptions.Compiled);
        private static readonly Regex RegexDominioInstitucional = new(@"@([a-z0-9-]+\.)*(ufes\.br|edu\.br|gov\.br|edu)$", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex RegexSha256Hex = new(@"^[0-9a-fA-F]{64}$", RegexOptions.Compiled);

        private readonly IParticipanteRepository _participanteRepository;

        public ParticipanteServices(IParticipanteRepository participanteRepository)
        {
            _participanteRepository = participanteRepository;
        }

        public async Task<IEnumerable<Participante>> GetAll(string? tipo = null)
        {
            if (string.IsNullOrWhiteSpace(tipo))
            {
                return await _participanteRepository.GetAll();
            }

            var tipoTrim = tipo.Trim();
            var tipoCanonico = TiposPermitidos.FirstOrDefault(
                t => string.Equals(t, tipoTrim, StringComparison.OrdinalIgnoreCase));

            if (tipoCanonico is null && string.Equals(tipoTrim, "Tecnico", StringComparison.OrdinalIgnoreCase))
            {
                tipoCanonico = "Técnico";
            }

            return await _participanteRepository.GetAll(tipoCanonico ?? tipoTrim);
        }

        public async Task<Participante?> GetByCpf(string cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf))
            {
                return null;
            }

            return await BuscarPorCpfFlexivelAsync(cpf);
        }

        public async Task<Participante> Create(Participante participante)
        {
            if (participante is null)
            {
                throw new ArgumentException("Os dados do participante são obrigatórios.");
            }

            participante.cpf = ValidarEFormatarCpf(participante.cpf);
            ValidarDadosComuns(participante, perfilPadrao: "Participante");

            var senhaInformada = participante.senhaHash ?? string.Empty;
            if (string.IsNullOrWhiteSpace(senhaInformada))
            {
                throw new ArgumentException("A senha de acesso é obrigatória.");
            }

            if (senhaInformada.Length < 6)
            {
                throw new ArgumentException("A senha de acesso deve ter no mínimo 6 caracteres.");
            }

            if (senhaInformada.Length > 255)
            {
                throw new ArgumentException("A senha de acesso deve ter no máximo 255 caracteres.");
            }

            participante.senhaHash = RegexSha256Hex.IsMatch(senhaInformada)
                ? senhaInformada.ToUpperInvariant()
                : Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(senhaInformada)));

            var existentePorCpf = await _participanteRepository.GetByCpf(participante.cpf);
            if (existentePorCpf is not null)
            {
                throw new InvalidOperationException($"Já existe um participante cadastrado com o CPF '{participante.cpf}'.");
            }

            var existentePorEmail = await _participanteRepository.GetByEmail(participante.emailInstitucional);
            if (existentePorEmail is not null)
            {
                throw new InvalidOperationException($"Já existe um participante cadastrado com o e-mail institucional '{participante.emailInstitucional}'.");
            }

            await _participanteRepository.Store(participante);

            return (await _participanteRepository.GetByCpf(participante.cpf)) ?? participante;
        }

        public async Task<Participante> Update(string cpf, Participante participante)
        {
            if (string.IsNullOrWhiteSpace(cpf))
            {
                throw new ArgumentException("O CPF do participante é obrigatório.");
            }

            if (participante is null)
            {
                throw new ArgumentException("Os dados do participante são obrigatórios.");
            }

            var existente = await BuscarPorCpfFlexivelAsync(cpf);
            if (existente is null)
            {
                throw new KeyNotFoundException($"Participante com CPF '{cpf.Trim()}' não encontrado.");
            }

            participante.cpf = existente.cpf;
            ValidarDadosComuns(participante, perfilPadrao: existente.perfilAcesso);

            var existentePorEmail = await _participanteRepository.GetByEmail(participante.emailInstitucional);
            if (existentePorEmail is not null &&
                !string.Equals(existentePorEmail.cpf, existente.cpf, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException($"Já existe um participante cadastrado com o e-mail institucional '{participante.emailInstitucional}'.");
            }

            await _participanteRepository.Update(participante);

            return (await _participanteRepository.GetByCpf(existente.cpf)) ?? participante;
        }

        public async Task Delete(string cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf))
            {
                throw new ArgumentException("O CPF do participante é obrigatório.");
            }

            var existente = await BuscarPorCpfFlexivelAsync(cpf);
            if (existente is null)
            {
                throw new KeyNotFoundException($"Participante com CPF '{cpf.Trim()}' não encontrado.");
            }

            var removido = await _participanteRepository.Delete(existente.cpf);
            if (!removido)
            {
                throw new KeyNotFoundException($"Participante com CPF '{cpf.Trim()}' não encontrado.");
            }
        }

        private async Task<Participante?> BuscarPorCpfFlexivelAsync(string cpf)
        {
            var cpfTrim = cpf.Trim();
            var encontrado = await _participanteRepository.GetByCpf(cpfTrim);
            if (encontrado is not null)
            {
                return encontrado;
            }

            var digitos = ExtrairDigitos(cpfTrim);
            if (digitos.Length == 11)
            {
                var cpfFormatado = FormatarCpf(digitos);
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

        private static void ValidarDadosComuns(Participante participante, string? perfilPadrao)
        {
            participante.nome = (participante.nome ?? string.Empty).Trim();
            participante.emailInstitucional = (participante.emailInstitucional ?? string.Empty).Trim().ToLowerInvariant();
            participante.tipo = (participante.tipo ?? string.Empty).Trim();
            participante.perfilAcesso = (participante.perfilAcesso ?? string.Empty).Trim();

            if (string.IsNullOrWhiteSpace(participante.nome))
            {
                throw new ArgumentException("O nome do participante é obrigatório.");
            }

            if (participante.nome.Length < 3)
            {
                throw new ArgumentException("O nome do participante deve ter no mínimo 3 caracteres.");
            }

            if (participante.nome.Length > 150)
            {
                throw new ArgumentException("O nome do participante deve ter no máximo 150 caracteres.");
            }

            // RNF06: Validação de formato e domínio de e-mail institucional
            if (string.IsNullOrWhiteSpace(participante.emailInstitucional))
            {
                throw new ArgumentException("O e-mail institucional é obrigatório.");
            }

            if (participante.emailInstitucional.Length > 150)
            {
                throw new ArgumentException("O e-mail institucional deve ter no máximo 150 caracteres.");
            }

            if (!RegexEmailGeral.IsMatch(participante.emailInstitucional))
            {
                throw new ArgumentException("O e-mail institucional informado possui formato inválido.");
            }

            if (!RegexDominioInstitucional.IsMatch(participante.emailInstitucional))
            {
                throw new ArgumentException("Informe um e-mail institucional válido (ex.: nome@ufes.br ou nome@edu.ufes.br).");
            }

            // RF03 / UC02: Garantir que tipo seja Docente, Discente ou Técnico
            if (string.IsNullOrWhiteSpace(participante.tipo))
            {
                throw new ArgumentException("O tipo do participante é obrigatório.");
            }

            var tipoCanonico = TiposPermitidos.FirstOrDefault(
                t => string.Equals(t, participante.tipo, StringComparison.OrdinalIgnoreCase));

            if (tipoCanonico is null)
            {
                throw new ArgumentException("Tipo de participante inválido. Valores permitidos: Docente, Discente ou Técnico.");
            }

            participante.tipo = tipoCanonico;

            // Perfil de acesso: Administrador, Coordenador ou Participante
            if (string.IsNullOrWhiteSpace(participante.perfilAcesso))
            {
                participante.perfilAcesso = string.IsNullOrWhiteSpace(perfilPadrao) ? "Participante" : perfilPadrao;
            }
            else
            {
                var perfilCanonico = PerfisPermitidos.FirstOrDefault(
                    p => string.Equals(p, participante.perfilAcesso, StringComparison.OrdinalIgnoreCase));

                if (perfilCanonico is null)
                {
                    throw new ArgumentException("Perfil de acesso inválido. Valores permitidos: Administrador, Coordenador ou Participante.");
                }

                participante.perfilAcesso = perfilCanonico;
            }
        }

        // RNF06: Validação de formato de CPF (aceita CPFs fictícios com 11 dígitos)
        private static string ValidarEFormatarCpf(string? cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf))
            {
                throw new ArgumentException("O CPF do participante é obrigatório.");
            }

            var cpfTrim = cpf.Trim();
            if (!RegexCpfFormato.IsMatch(cpfTrim))
            {
                throw new ArgumentException("CPF inválido. Use o formato 000.000.000-00 ou informe os 11 dígitos numéricos.");
            }

            var digitos = ExtrairDigitos(cpfTrim);
            return FormatarCpf(digitos);
        }

        private static string ExtrairDigitos(string valor)
        {
            return new string(valor.Where(char.IsDigit).ToArray());
        }

        private static string FormatarCpf(string digitos)
        {
            return $"{digitos.Substring(0, 3)}.{digitos.Substring(3, 3)}.{digitos.Substring(6, 3)}-{digitos.Substring(9, 2)}";
        }
    }
}
