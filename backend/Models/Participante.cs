namespace sgpp.Models
{
    public class Participante
    {
        public string cpf { get; set; } = string.Empty;
        public string nome { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string tipo { get; set; } = string.Empty;

        public Participante() { }

        public Participante(Participante participante)
        {
            this.cpf = participante.cpf;
            this.nome = participante.nome;
            this.email = participante.email;
            this.tipo = participante.tipo;
        }
    }
}
