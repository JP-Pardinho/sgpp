using System;

namespace sgpp.DTOs
{
    public class VincularParticipanteRequest
    {
        public string? participanteCpf { get; set; }
        public string? participante_cpf { get; set; }
        public string funcao { get; set; } = string.Empty;
        public DateTime dataEntrada { get; set; }
        public DateTime? dataSaida { get; set; }
    }

    public class RegistrarSaidaRequest
    {
        public DateTime dataSaida { get; set; }
    }
}
