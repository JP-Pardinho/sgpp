/** "2026-03-01" ou "2026-03-01T00:00:00" -> "01/03/2026" (sem converter fuso horário). */
export function formatarData(iso?: string | null): string {
  if (!iso) return "-";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** "2026-12-15" -> "12/2026" */
export function formatarMesAno(iso?: string | null): string {
  if (!iso) return "-";
  const [ano, mes] = iso.slice(0, 10).split("-");
  return `${mes}/${ano}`;
}

/** Valor para <input type="date"> (yyyy-mm-dd). */
export function paraInputData(iso?: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** 2450000 -> "R$ 2,45 mi" */
export function formatarMoedaResumida(valor: number): string {
  if (valor >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toFixed(2).replace(".", ",")} mi`;
  }
  return formatarMoeda(valor);
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function emBreve() {
  window.alert("Funcionalidade ainda não implementada nesta etapa.");
}
