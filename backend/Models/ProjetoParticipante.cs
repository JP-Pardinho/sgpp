using System;

namespace sgpp.Models
{
    public class ProjetoParticipante
    {
        public string projeto_codigo { get; set; } = string.Empty;
        public string participante_cpf { get; set; } = string.Empty;
        public string funcao { get; set; } = string.Empty;
        public DateTime dataEntrada { get; set; }
        public DateTime? dataSaida { get; set; }

        public ProjetoParticipante() { }

        public ProjetoParticipante(ProjetoParticipante vinculo)
        {
            this.projeto_codigo = vinculo.projeto_codigo;
            this.participante_cpf = vinculo.participante_cpf;
            this.funcao = vinculo.funcao;
            this.dataEntrada = vinculo.dataEntrada;
            this.dataSaida = vinculo.dataSaida;
        }
    }

    public class EquipeMembro
    {
        public string cpf { get; set; } = string.Empty;
        public string nome { get; set; } = string.Empty;
        public string tipo { get; set; } = string.Empty;
        public string funcao { get; set; } = string.Empty;
        public DateTime dataEntrada { get; set; }
        public DateTime? dataSaida { get; set; }
    }
}
