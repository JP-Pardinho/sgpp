using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace sgpp.Models
{
    public class Projeto
    {
        public string codigo { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public string? descricao { get; set; }
        public string situacao { get; set; } = string.Empty;
        public DateTime dataInicio { get; set; }
        public DateTime? dataFim { get; set; }
        public string coordenador_cpf { get; set; } = string.Empty;
        public string? coordenador_nome { get; set; }

        public Projeto() { }

        public Projeto(Projeto projeto)
        {
            this.codigo = projeto.codigo;
            this.titulo = projeto.titulo;
            this.descricao = projeto.descricao;
            this.situacao = projeto.situacao;
            this.dataInicio = projeto.dataInicio;
            this.dataFim = projeto.dataFim;
            this.coordenador_cpf = projeto.coordenador_cpf;
            this.coordenador_nome = projeto.coordenador_nome;
        }
    }
}

