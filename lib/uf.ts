// UF values — source: SII (https://www.sii.cl/valores_y_fechas/uf/)
// Format: "YYYY-MM-DD": number
// Verified values for last day of each month (Jan 2025 — May 2026)

export const UF_END_OF_MONTH: Record<string, number> = {
  "2025-01": 38384.41,
  "2025-02": 38647.94,
  "2025-03": 38894.11,
  "2025-04": 39075.41,
  "2025-05": 39189.45,
  "2025-06": 39267.07,
  "2025-07": 39179.01,
  "2025-08": 39383.07,
  "2025-09": 39485.65,
  "2025-10": 39597.67,
  "2025-11": 39643.59,
  "2025-12": 39727.96,
  "2026-01": 39706.07,
  "2026-02": 39790.63,
  "2026-03": 39841.72,
  "2026-04": 40120.20,
  "2026-05": 40610.69,
};

// UF on specific payment dates used in cartolas
export const UF_BY_DATE: Record<string, number> = {
  "2025-01-27": 38394.32,
  "2025-01-29": 38389.36,
  "2025-03-07": 38753.79,
  "2025-04-17": 38991.04,
  "2025-05-05": 39107.90,
  "2025-05-06": 39114.40,
  "2025-05-12": 39141.49,
  "2025-06-16": 39230.48,
  "2025-07-17": 39249.99,
  "2025-08-18": 39235.38,
  "2025-09-22": 39485.65,
  "2025-10-13": 39505.99,
  "2025-11-17": 39643.59,
  "2025-12-12": 39655.08,
  "2025-12-17": 39674.25,
  "2026-05-05": 40186.79,
  "2026-05-06": 40200.12,
  "2026-05-12": 40290.47,
};

/**
 * Get UF value for billing month.
 * The contract specifies: "el valor de la UF será aquel determinado para
 * el último día del mes anterior a la fecha de facturación".
 */
export function ufForBilling(billingDate: Date): number {
  const prev = new Date(billingDate.getFullYear(), billingDate.getMonth() - 1, 1);
  const key = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
  const val = UF_END_OF_MONTH[key];
  if (val !== undefined) return val;
  // Fallback to most recent available
  const keys = Object.keys(UF_END_OF_MONTH).sort();
  return UF_END_OF_MONTH[keys[keys.length - 1]];
}
