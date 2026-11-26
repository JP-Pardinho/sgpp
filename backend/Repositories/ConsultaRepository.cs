using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using MySqlConnector;
using sgpp.DTOs;
using sgpp.Repositories.Interfaces;

namespace sgpp.Repositories
{
    public class ConsultaRepository : IConsultaRepository
    {
        private readonly Func<MySqlConnection> _createConnection;

        public ConsultaRepository(Func<MySqlConnection> createConnection)
        {
            _createConnection = createConnection;
        }

        // UC09 / RF12: Lista todos os projetos sob a coordenação de um docente específico (ou todos)
        public async Task<IEnumerable<ProjetoPorCoordenadorRow>> ConsultarProjetosPorCoordenador(string? coordenadorCpf = null)
        {
            await using var connection = _createConnection();

            string? cpfTrim = string.IsNullOrWhiteSpace(coordenadorCpf) ? null : coordenadorCpf.Trim();
            string? cpfDigitos = cpfTrim is null ? null : new string(cpfTrim.Where(char.IsDigit).ToArray());

            const string sql = @"
                SELECT p.codigo,
                       p.titulo,
                       p.descricao,
                       p.situacao,
                       p.dataInicio,
                       p.dataFim,
                       p.coordenador_cpf,
                       coord.nome AS coordenador_nome
                FROM Projeto p
                JOIN Participante coord ON p.coordenador_cpf = coord.cpf
                WHERE (@cpfTrim IS NULL
                       OR p.coordenador_cpf = @cpfTrim
                       OR REPLACE(REPLACE(p.coordenador_cpf, '.', ''), '-', '') = @cpfDigitos)
                ORDER BY coord.nome ASC, p.dataInicio DESC, p.codigo ASC;";

            return await connection.QueryAsync<ProjetoPorCoordenadorRow>(sql, new { cpfTrim, cpfDigitos });
        }

        // UC10 / RF13: Lista todos os participantes vinculados a um determinado projeto (ou todos)
        public async Task<IEnumerable<ParticipanteDoProjetoRow>> ConsultarParticipantesPorProjeto(string? projetoCodigo = null)
        {
            await using var connection = _createConnection();
            string? codigoTrim = string.IsNullOrWhiteSpace(projetoCodigo) ? null : projetoCodigo.Trim();

            const string sql = @"
                SELECT p.codigo AS projeto_codigo,
                       p.titulo AS projeto_titulo,
                       p.situacao AS projeto_situacao,
                       coord.nome AS coordenador_nome,
                       part.cpf AS participante_cpf,
                       part.nome AS participante_nome,
                       part.tipo AS participante_tipo,
                       pp.funcao,
                       pp.dataEntrada,
                       pp.dataSaida
                FROM Projeto_Participante pp
                JOIN Projeto p ON pp.projeto_codigo = p.codigo
                JOIN Participante part ON pp.participante_cpf = part.cpf
                LEFT JOIN Participante coord ON p.coordenador_cpf = coord.cpf
                WHERE (@codigoTrim IS NULL OR p.codigo = @codigoTrim)
                ORDER BY p.codigo ASC,
                         CASE WHEN LOWER(pp.funcao) = 'coordenador' THEN 0 ELSE 1 END,
                         pp.dataEntrada ASC,
                         part.nome ASC;";

            return await connection.QueryAsync<ParticipanteDoProjetoRow>(sql, new { codigoTrim });
        }

        // UC11 / RF14: Exibe todas as produções científicas vinculadas a cada projeto e seus autores
        public async Task<IEnumerable<ProducaoDoProjetoRow>> ConsultarProducoesPorProjeto(string? projetoCodigo = null)
        {
            await using var connection = _createConnection();
            string? codigoTrim = string.IsNullOrWhiteSpace(projetoCodigo) ? null : projetoCodigo.Trim();

            const string sql = @"
                SELECT pc.id_producao,
                       pc.projeto_codigo,
                       p.titulo AS projeto_titulo,
                       pc.titulo,
                       pc.tipoProducao,
                       pc.anoPublicacao,
                       pc.meioDivulgacao,
                       COALESCE(GROUP_CONCAT(part.nome ORDER BY part.nome SEPARATOR ', '), '-') AS autores
                FROM Producao_Cientifica pc
                JOIN Projeto p ON pc.projeto_codigo = p.codigo
                LEFT JOIN Producao_Autor pa ON pc.id_producao = pa.producao_id
                LEFT JOIN Participante part ON pa.participante_cpf = part.cpf
                WHERE pc.projeto_codigo IS NOT NULL
                  AND (@codigoTrim IS NULL OR pc.projeto_codigo = @codigoTrim)
                GROUP BY pc.id_producao,
                         pc.projeto_codigo,
                         p.titulo,
                         pc.titulo,
                         pc.tipoProducao,
                         pc.anoPublicacao,
                         pc.meioDivulgacao
                ORDER BY pc.projeto_codigo ASC, pc.anoPublicacao DESC, pc.id_producao DESC;";

            return await connection.QueryAsync<ProducaoDoProjetoRow>(sql, new { codigoTrim });
        }

        // UC12 / RF15: Visualiza os financiamentos disponíveis agrupados por agência financiadora
        public async Task<IEnumerable<FinanciamentoPorAgenciaRow>> ConsultarFinanciamentosPorAgencia(string? agencia = null)
        {
            await using var connection = _createConnection();
            string? agenciaTrim = string.IsNullOrWhiteSpace(agencia) ? null : agencia.Trim();

            const string sql = @"
                SELECT f.id_financiamento,
                       f.agenciaFinanciadora,
                       f.tipoFomento,
                       f.valorTotal,
                       f.dataInicio,
                       f.dataFim,
                       COALESCE(SUM(af.valorDestinado), 0) AS valorDistribuido,
                       COUNT(af.projeto_codigo) AS qtdProjetosApoiados
                FROM Financiamento f
                LEFT JOIN Apoio_Financeiro af ON f.id_financiamento = af.id_financiamento
                WHERE (@agenciaTrim IS NULL OR f.agenciaFinanciadora = @agenciaTrim)
                GROUP BY f.id_financiamento,
                         f.agenciaFinanciadora,
                         f.tipoFomento,
                         f.valorTotal,
                         f.dataInicio,
                         f.dataFim
                ORDER BY f.agenciaFinanciadora ASC, f.dataInicio DESC, f.id_financiamento DESC;";

            return await connection.QueryAsync<FinanciamentoPorAgenciaRow>(sql, new { agenciaTrim });
        }

        public async Task<string?> ObterNomeParticipantePorCpf(string cpf)
        {
            await using var connection = _createConnection();
            var cpfTrim = cpf.Trim();
            var cpfDigitos = new string(cpfTrim.Where(char.IsDigit).ToArray());

            const string sql = @"
                SELECT nome
                FROM Participante
                WHERE cpf = @cpfTrim
                   OR REPLACE(REPLACE(cpf, '.', ''), '-', '') = @cpfDigitos
                LIMIT 1;";

            return await connection.QueryFirstOrDefaultAsync<string?>(sql, new { cpfTrim, cpfDigitos });
        }

        public async Task<string?> ObterTituloProjetoPorCodigo(string codigo)
        {
            await using var connection = _createConnection();
            const string sql = @"
                SELECT titulo
                FROM Projeto
                WHERE codigo = @codigo
                LIMIT 1;";

            return await connection.QueryFirstOrDefaultAsync<string?>(sql, new { codigo = codigo.Trim() });
        }
    }
}
