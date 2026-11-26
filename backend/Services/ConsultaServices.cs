using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using sgpp.DTOs;
using sgpp.Repositories.Interfaces;

namespace sgpp.Services
{
    public class ConsultaServices
    {
        private static readonly CultureInfo CulturaPtBr = new("pt-BR");
        private readonly IConsultaRepository _consultaRepository;

        public ConsultaServices(IConsultaRepository consultaRepository)
        {
            _consultaRepository = consultaRepository;
        }

        // UC09 / RF12: Projetos por Coordenador
        public async Task<ResultadoConsultaDto> ConsultarProjetosPorCoordenador(string? filtro = null)
        {
            var filtroLimpo = string.IsNullOrWhiteSpace(filtro) ? null : filtro.Trim();
            var registros = (await _consultaRepository.ConsultarProjetosPorCoordenador(filtroLimpo)).ToList();

            var grupos = registros
                .GroupBy(r => string.IsNullOrWhiteSpace(r.coordenador_cpf) ? "sem-coordenador" : r.coordenador_cpf)
                .Select(g =>
                {
                    var lista = g.ToList();
                    var primeiro = lista[0];
                    var nome = string.IsNullOrWhiteSpace(primeiro.coordenador_nome)
                        ? "Coordenador não informado"
                        : primeiro.coordenador_nome;
                    var emAndamento = lista.Count(p =>
                        string.Equals(p.situacao, "Em andamento", StringComparison.OrdinalIgnoreCase));

                    return new GrupoConsultaDto
                    {
                        chave = g.Key,
                        titulo = nome,
                        subtitulo = g.Key != "sem-coordenador" ? $"CPF: {FormatarCpf(g.Key)}" : null,
                        colunas = new List<string> { "Código", "Título do projeto", "Situação", "Início", "Término" },
                        linhas = lista.Select(p => new List<string>
                        {
                            p.codigo,
                            p.titulo,
                            p.situacao,
                            FormatarData(p.dataInicio),
                            FormatarData(p.dataFim)
                        }).ToList(),
                        subtotalLabel = "Subtotal de projetos do coordenador",
                        subtotalValor = $"{lista.Count} {(lista.Count == 1 ? "projeto" : "projetos")} ({emAndamento} em andamento)"
                    };
                })
                .ToList();

            var linhasCsv = registros.Select(p => new List<string>
            {
                string.IsNullOrWhiteSpace(p.coordenador_nome) ? "-" : p.coordenador_nome,
                FormatarCpf(p.coordenador_cpf),
                p.codigo,
                p.titulo,
                p.situacao,
                FormatarData(p.dataInicio),
                FormatarData(p.dataFim)
            }).ToList();

            string filtroAplicado = "Todos os docentes";
            if (filtroLimpo is not null)
            {
                var nomeCoord = registros.FirstOrDefault()?.coordenador_nome
                    ?? await _consultaRepository.ObterNomeParticipantePorCpf(filtroLimpo)
                    ?? FormatarCpf(filtroLimpo);
                filtroAplicado = $"Coordenador: {nomeCoord}";
            }

            return new ResultadoConsultaDto
            {
                tipo = "projetos-por-coordenador",
                tituloRelatorio = "Projetos por Coordenador (UC09)",
                filtroAplicado = filtroAplicado,
                colunasCsv = new List<string> { "Coordenador", "CPF", "Código", "Título do projeto", "Situação", "Início", "Término" },
                linhasCsv = linhasCsv,
                grupos = grupos,
                totalRegistros = registros.Count,
                resumoGeral = $"{grupos.Count} {(grupos.Count == 1 ? "coordenador" : "coordenadores")} · {registros.Count} {(registros.Count == 1 ? "projeto" : "projetos")}"
            };
        }

        // UC10 / RF13: Participantes do Projeto
        public async Task<ResultadoConsultaDto> ConsultarParticipantesPorProjeto(string? filtro = null)
        {
            var filtroLimpo = string.IsNullOrWhiteSpace(filtro) ? null : filtro.Trim();
            var registros = (await _consultaRepository.ConsultarParticipantesPorProjeto(filtroLimpo)).ToList();

            var grupos = registros
                .GroupBy(r => r.projeto_codigo)
                .Select(g =>
                {
                    var lista = g.ToList();
                    var primeiro = lista[0];
                    return new GrupoConsultaDto
                    {
                        chave = g.Key,
                        titulo = $"{primeiro.projeto_codigo} — {primeiro.projeto_titulo}",
                        subtitulo = $"Situação: {primeiro.projeto_situacao} · Coordenador: {primeiro.coordenador_nome ?? "-"}",
                        colunas = new List<string> { "Participante", "CPF", "Tipo", "Função", "Entrada", "Saída" },
                        linhas = lista.Select(m => new List<string>
                        {
                            m.participante_nome,
                            FormatarCpf(m.participante_cpf),
                            m.participante_tipo,
                            m.funcao,
                            FormatarData(m.dataEntrada),
                            FormatarData(m.dataSaida)
                        }).ToList(),
                        subtotalLabel = "Subtotal de participantes no projeto",
                        subtotalValor = $"{lista.Count} {(lista.Count == 1 ? "participante" : "participantes")}"
                    };
                })
                .ToList();

            var linhasCsv = registros.Select(m => new List<string>
            {
                m.projeto_codigo,
                m.projeto_titulo,
                m.participante_nome,
                FormatarCpf(m.participante_cpf),
                m.participante_tipo,
                m.funcao,
                FormatarData(m.dataEntrada),
                FormatarData(m.dataSaida)
            }).ToList();

            string filtroAplicado = "Todos os projetos";
            if (filtroLimpo is not null)
            {
                var tituloProj = registros.FirstOrDefault()?.projeto_titulo
                    ?? await _consultaRepository.ObterTituloProjetoPorCodigo(filtroLimpo)
                    ?? "-";
                filtroAplicado = $"Projeto: {filtroLimpo} — {tituloProj}";
            }

            return new ResultadoConsultaDto
            {
                tipo = "participantes-do-projeto",
                tituloRelatorio = "Participantes do Projeto (UC10)",
                filtroAplicado = filtroAplicado,
                colunasCsv = new List<string> { "Código do projeto", "Título do projeto", "Participante", "CPF", "Tipo", "Função", "Entrada", "Saída" },
                linhasCsv = linhasCsv,
                grupos = grupos,
                totalRegistros = registros.Count,
                resumoGeral = $"{grupos.Count} {(grupos.Count == 1 ? "projeto" : "projetos")} · {registros.Count} {(registros.Count == 1 ? "vínculo" : "vínculos")}"
            };
        }

        // UC11 / RF14: Produções do Projeto
        public async Task<ResultadoConsultaDto> ConsultarProducoesPorProjeto(string? filtro = null)
        {
            var filtroLimpo = string.IsNullOrWhiteSpace(filtro) ? null : filtro.Trim();
            var registros = (await _consultaRepository.ConsultarProducoesPorProjeto(filtroLimpo)).ToList();

            var grupos = registros
                .GroupBy(r => r.projeto_codigo)
                .Select(g =>
                {
                    var lista = g.ToList();
                    var primeiro = lista[0];
                    return new GrupoConsultaDto
                    {
                        chave = g.Key,
                        titulo = $"{primeiro.projeto_codigo} — {primeiro.projeto_titulo}",
                        subtitulo = "Produções científicas vinculadas ao projeto",
                        colunas = new List<string> { "Título da produção", "Tipo", "Ano", "Meio de divulgação", "Autores" },
                        linhas = lista.Select(prod => new List<string>
                        {
                            prod.titulo,
                            prod.tipoProducao,
                            prod.anoPublicacao.ToString(),
                            prod.meioDivulgacao,
                            string.IsNullOrWhiteSpace(prod.autores) ? "-" : prod.autores
                        }).ToList(),
                        subtotalLabel = "Subtotal de produções do projeto",
                        subtotalValor = $"{lista.Count} {(lista.Count == 1 ? "produção" : "produções")}"
                    };
                })
                .ToList();

            var linhasCsv = registros.Select(prod => new List<string>
            {
                prod.projeto_codigo,
                prod.projeto_titulo,
                prod.titulo,
                prod.tipoProducao,
                prod.anoPublicacao.ToString(),
                prod.meioDivulgacao,
                string.IsNullOrWhiteSpace(prod.autores) ? "-" : prod.autores
            }).ToList();

            string filtroAplicado = "Todos os projetos com produções";
            if (filtroLimpo is not null)
            {
                var tituloProj = registros.FirstOrDefault()?.projeto_titulo
                    ?? await _consultaRepository.ObterTituloProjetoPorCodigo(filtroLimpo)
                    ?? "-";
                filtroAplicado = $"Projeto: {filtroLimpo} — {tituloProj}";
            }

            return new ResultadoConsultaDto
            {
                tipo = "producoes-do-projeto",
                tituloRelatorio = "Produções do Projeto (UC11)",
                filtroAplicado = filtroAplicado,
                colunasCsv = new List<string> { "Código do projeto", "Título do projeto", "Título da produção", "Tipo", "Ano", "Meio de divulgação", "Autores" },
                linhasCsv = linhasCsv,
                grupos = grupos,
                totalRegistros = registros.Count,
                resumoGeral = $"{grupos.Count} {(grupos.Count == 1 ? "projeto" : "projetos")} · {registros.Count} {(registros.Count == 1 ? "produção" : "produções")}"
            };
        }

        // UC12 / RF15: Financiamentos por Agência
        public async Task<ResultadoConsultaDto> ConsultarFinanciamentosPorAgencia(string? filtro = null)
        {
            var filtroLimpo = string.IsNullOrWhiteSpace(filtro) ? null : filtro.Trim();
            var registros = (await _consultaRepository.ConsultarFinanciamentosPorAgencia(filtroLimpo)).ToList();

            decimal somaGeralTotal = 0m;
            var linhasCsv = new List<List<string>>();

            var grupos = registros
                .GroupBy(r => r.agenciaFinanciadora)
                .Select(g =>
                {
                    var lista = g.ToList();
                    decimal somaTotal = 0m;
                    decimal somaDist = 0m;
                    decimal somaDisp = 0m;

                    var linhas = lista.Select(f =>
                    {
                        var dist = f.valorDistribuido;
                        var disp = Math.Max(0m, f.valorTotal - dist);

                        somaTotal += f.valorTotal;
                        somaDist += dist;
                        somaDisp += disp;

                        var procLabel = $"#{f.id_financiamento}";

                        linhasCsv.Add(new List<string>
                        {
                            g.Key,
                            procLabel,
                            f.tipoFomento,
                            FormatarData(f.dataInicio),
                            FormatarData(f.dataFim),
                            FormatarMoeda(f.valorTotal),
                            FormatarMoeda(dist),
                            FormatarMoeda(disp)
                        });

                        return new List<string>
                        {
                            procLabel,
                            f.tipoFomento,
                            $"{FormatarData(f.dataInicio)} a {FormatarData(f.dataFim)}",
                            FormatarMoeda(f.valorTotal),
                            FormatarMoeda(dist),
                            FormatarMoeda(disp)
                        };
                    }).ToList();

                    somaGeralTotal += somaTotal;

                    return new GrupoConsultaDto
                    {
                        chave = g.Key,
                        titulo = $"Agência {g.Key}",
                        subtitulo = $"{lista.Count} {(lista.Count == 1 ? "financiamento registrado" : "financiamentos registrados")}",
                        colunas = new List<string> { "Processo", "Tipo de fomento", "Vigência", "Valor total", "Distribuído", "Disponível" },
                        linhas = linhas,
                        subtotalLabel = $"Subtotal {g.Key}",
                        subtotalValor = $"Total: {FormatarMoeda(somaTotal)} · Distribuído: {FormatarMoeda(somaDist)} · Disponível: {FormatarMoeda(somaDisp)}"
                    };
                })
                .ToList();

            return new ResultadoConsultaDto
            {
                tipo = "financiamentos-por-agencia",
                tituloRelatorio = "Financiamentos por Agência (UC12)",
                filtroAplicado = filtroLimpo is not null ? $"Agência: {filtroLimpo}" : "Todas as agências",
                colunasCsv = new List<string> { "Agência", "Processo", "Tipo de fomento", "Início", "Fim", "Valor total", "Distribuído", "Disponível" },
                linhasCsv = linhasCsv,
                grupos = grupos,
                totalRegistros = registros.Count,
                resumoGeral = $"{grupos.Count} {(grupos.Count == 1 ? "agência" : "agências")} · {registros.Count} {(registros.Count == 1 ? "financiamento" : "financiamentos")} · Total {FormatarMoeda(somaGeralTotal)}"
            };
        }

        private static string FormatarData(DateTime? data)
        {
            if (!data.HasValue || data.Value == default)
            {
                return "-";
            }

            return data.Value.ToString("dd/MM/yyyy", CulturaPtBr);
        }

        private static string FormatarMoeda(decimal valor)
        {
            return valor.ToString("C2", CulturaPtBr);
        }

        private static string FormatarCpf(string? cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf))
            {
                return "-";
            }

            var digitos = new string(cpf.Where(char.IsDigit).ToArray());
            if (digitos.Length == 11)
            {
                return $"{digitos.Substring(0, 3)}.{digitos.Substring(3, 3)}.{digitos.Substring(6, 3)}-{digitos.Substring(9, 2)}";
            }

            return cpf.Trim();
        }
    }
}
