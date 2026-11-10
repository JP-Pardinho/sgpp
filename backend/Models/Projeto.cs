using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace sgpp.Models
{
    public class Projeto
    {
        public string codigo { get; set; }
        public string titulo { get; set; }
        public string descricao { get; set; }
        public string situacao { get; set; }
        public DateTime dataInicio { get; set; }
        public DateTime? dataFim { get; set; }
    
        public Projeto (Projeto projeto)
        {
            this.codigo = projeto.codigo;
            this.titulo = projeto.titulo;
            this.descricao = projeto.descricao;
            this.situacao = projeto.situacao; 
            this.dataInicio = projeto.dataInicio;
            this.dataFim = projeto.dataFim;
        }
    }
}

