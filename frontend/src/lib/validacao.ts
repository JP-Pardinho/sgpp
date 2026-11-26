/** Remove todos os caracteres não numéricos de uma string. */
export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Aplica máscara de CPF (000.000.000-00) progressivamente até 11 dígitos. */
export function formatarCpf(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 11);

  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

/** Valida CPF verificando apenas se possui 11 dígitos numéricos (aceita CPFs fictícios). */
export function validarCpf(cpf: string): boolean {
  const digitos = somenteDigitos(cpf);
  return digitos.length === 11;
}

const REGEX_EMAIL_GERAL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_DOMINIO_INSTITUCIONAL = /@([a-z0-9-]+\.)*(ufes\.br|edu\.br|gov\.br|edu)$/i;

/**
 * Valida formato e domínio institucional de e-mail.
 * Retorna null quando válido ou uma mensagem descritiva de erro.
 */
export function validarEmailInstitucional(email: string): string | null {
  const valor = email.trim();
  if (!valor) return "Informe o e-mail institucional.";
  if (!REGEX_EMAIL_GERAL.test(valor)) return "Informe um e-mail válido.";
  if (!REGEX_DOMINIO_INSTITUCIONAL.test(valor)) {
    return "Use um e-mail institucional válido (ex.: nome@ufes.br).";
  }
  return null;
}

/** Formata dígitos em centavos para moeda pt-BR sem símbolo (ex.: "15000000" -> "150.000,00"). */
export function formatarMoedaInput(valor: string): string {
  const digitos = somenteDigitos(valor);
  if (!digitos) return "";
  const numero = Number(digitos) / 100;
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Converte texto formatado em pt-BR ("150.000,00") para número (150000). */
export function parseMoedaInput(valor: string): number {
  const normalizado = valor.trim().replace(/\./g, "").replace(",", ".");
  if (!normalizado) return 0;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

/** Converte número (150000) em string formatada para input ("150.000,00"). */
export function numeroParaMoedaInput(valor: number): string {
  if (!Number.isFinite(valor) || valor <= 0) return "";
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
