export function fmtCLP(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n === 0) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtUF(n: number | null | undefined, decimals = 3): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n) + " UF";
}

export function fmtPct(n: number | null | undefined, decimals = 1): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n * 100) + "%";
}

export function fmtDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso + (iso.includes("T") ? "" : "T00:00:00")) : iso;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function fmtDateLong(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso + (iso.includes("T") ? "" : "T00:00:00")) : iso;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}
