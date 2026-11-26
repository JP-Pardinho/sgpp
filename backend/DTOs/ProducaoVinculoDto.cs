using System.Collections.Generic;

namespace sgpp.DTOs
{
    public class VincularProducaoRequest
    {
        public string? projetoCodigo { get; set; }
        public string? projeto_codigo { get; set; }
        public List<string>? autoresCpfs { get; set; }
    }
}
