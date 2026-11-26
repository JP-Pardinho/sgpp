using System;
using System.Collections.Generic;

namespace sgpp.Models
{
    public class ProducaoCientifica
    {
        public int id_producao { get; set; }
        public string? projeto_codigo { get; set; }
        public string titulo { get; set; } = string.Empty;
        public string tipoProducao { get; set; } = string.Empty;
        public int anoPublicacao { get; set; }
        public string meioDivulgacao { get; set; } = string.Empty;
        public List<AutorProducao> autores { get; set; } = new();

        public ProducaoCientifica() { }

        public ProducaoCientifica(ProducaoCientifica producao)
        {
            this.id_producao = producao.id_producao;
            this.projeto_codigo = producao.projeto_codigo;
            this.titulo = producao.titulo;
            this.tipoProducao = producao.tipoProducao;
            this.anoPublicacao = producao.anoPublicacao;
            this.meioDivulgacao = producao.meioDivulgacao;
            this.autores = producao.autores is not null
                ? new List<AutorProducao>(producao.autores)
                : new List<AutorProducao>();
        }
    }

    public class AutorProducao
    {
        public string cpf { get; set; } = string.Empty;
        public string nome { get; set; } = string.Empty;
        public string emailInstitucional { get; set; } = string.Empty;
        public string tipo { get; set; } = string.Empty;
    }
}
