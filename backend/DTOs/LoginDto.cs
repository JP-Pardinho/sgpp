namespace sgpp.DTOs
{
    public class LoginRequest
    {
        public string emailInstitucional { get; set; } = string.Empty;
        public string senha { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string cpf { get; set; } = string.Empty;
        public string nome { get; set; } = string.Empty;
        public string emailInstitucional { get; set; } = string.Empty;
        public string tipo { get; set; } = string.Empty;
        public string perfilAcesso { get; set; } = string.Empty;
    }
}
