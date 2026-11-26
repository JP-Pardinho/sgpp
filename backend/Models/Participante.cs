using System;
using System.Text.Json.Serialization;

namespace sgpp.Models
{
    public class Participante
    {
        public string cpf { get; set; } = string.Empty;
        public string nome { get; set; } = string.Empty;
        public string emailInstitucional { get; set; } = string.Empty;
        public string tipo { get; set; } = string.Empty;
        [JsonIgnore]
        public string? senhaHash { get; set; } = string.Empty;
        public string? perfilAcesso { get; set; } = string.Empty;

        public Participante() { }

        public Participante(Participante participante)
        {
            this.cpf = participante.cpf;
            this.nome = participante.nome;
            this.emailInstitucional = participante.emailInstitucional;
            this.tipo = participante.tipo;
            this.senhaHash = participante.senhaHash;
            this.perfilAcesso = participante.perfilAcesso;
        }
    }
}
