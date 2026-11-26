using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using sgpp.Models;
using sgpp.Repositories.Interfaces;

namespace sgpp.Security
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public sealed class ExigirPerfilAttribute : Attribute, IAsyncActionFilter
    {
        private readonly string[] _perfisPermitidos;

        public ExigirPerfilAttribute(params string[] perfisPermitidos)
        {
            _perfisPermitidos = perfisPermitidos ?? Array.Empty<string>();
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var authHeader = context.HttpContext.Request.Headers.Authorization.FirstOrDefault();
            var cpf = ExtrairCpfDoToken(authHeader);

            if (string.IsNullOrWhiteSpace(cpf))
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    mensagem = "Autenticação obrigatória. Faça login para continuar."
                });
                return;
            }

            var participanteRepository = context.HttpContext.RequestServices.GetRequiredService<IParticipanteRepository>();
            var participante = await BuscarPorCpfFlexivelAsync(participanteRepository, cpf);

            if (participante is null)
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    mensagem = "Sessão inválida ou usuário não encontrado."
                });
                return;
            }

            var perfilUsuario = (participante.perfilAcesso ?? string.Empty).Trim();
            var autorizado = _perfisPermitidos.Any(
                p => string.Equals(p, perfilUsuario, StringComparison.OrdinalIgnoreCase));

            if (!autorizado)
            {
                context.Result = new ObjectResult(new
                {
                    mensagem = $"Acesso negado. Esta ação exige perfil: {string.Join(" ou ", _perfisPermitidos)}."
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }

            await next();
        }

        private static string? ExtrairCpfDoToken(string? header)
        {
            if (string.IsNullOrWhiteSpace(header))
            {
                return null;
            }

            var valor = header.Trim();
            const string prefixoBearer = "Bearer ";
            if (valor.StartsWith(prefixoBearer, StringComparison.OrdinalIgnoreCase))
            {
                valor = valor[prefixoBearer.Length..].Trim();
            }

            const string prefixoSessao = "sgpp-session:";
            if (!valor.StartsWith(prefixoSessao, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var cpf = valor[prefixoSessao.Length..].Trim();
            return string.IsNullOrWhiteSpace(cpf) ? null : cpf;
        }

        private static async Task<Participante?> BuscarPorCpfFlexivelAsync(
            IParticipanteRepository repo,
            string cpf)
        {
            var cpfTrim = cpf.Trim();
            var encontrado = await repo.GetByCpf(cpfTrim);
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
                    encontrado = await repo.GetByCpf(cpfFormatado);
                    if (encontrado is not null)
                    {
                        return encontrado;
                    }
                }

                if (!string.Equals(digitos, cpfTrim, StringComparison.Ordinal))
                {
                    return await repo.GetByCpf(digitos);
                }
            }

            return null;
        }
    }
}
