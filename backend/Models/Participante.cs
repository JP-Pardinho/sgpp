using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace sgpp.Models
{
    public class Participante
    {
        public string cpf { get; set; }
        public string nome { get; set; }
        public string email { get; set; }
        public string tipo { get; set; }
    
        public Participante (Participante participante)
        {
            this.cpf = participante.cpf;
            this.nome = participante.nome;
            this.email = participante.email;
            this.tipo = participante.tipo;
        }
    }
}