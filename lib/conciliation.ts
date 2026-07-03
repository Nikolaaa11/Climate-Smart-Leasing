import { Contract, CONTRACTS, IVA } from "./contracts";
import { Abono, ABONOS } from "./abonos";
import { ufForBilling } from "./uf";
import { FACTURA_POR_CUOTA } from "./facturas";

export type EstadoCuota =
  | "pagada"
  | "pagada-parcial"
  | "pagada-diferencia"
  | "vencida-sin-pago"
  | "por-vencer"
  | "sin-valor";

export interface Cuota {
  contractId: string;
  proyecto: string;
  numero: string;
  fecha: string;         // ISO yyyy-mm-dd
  uf: number | null;
  ufValorMes: number | null;
  netoClp: number;
  ivaClp: number;
  totalFacturado: number;
  totalPagado: number;
  estado: EstadoCuota;
  matchedAbonos: Array<{
    fecha: string;
    monto: number;
    glosa: string;
    aplicado: number; // amount of the abono allocated to this cuota
  }>;
  notas: string;
  factura?: string;   // folio de la factura SII real (ej. "F43"), si existe
}

/** Add months to a date, preserving day-of-month when valid. */
function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

/** ISO yyyy-mm-dd from Date */
function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/**
 * Identify which contract an abono belongs to by matching the RUT
 * embedded in the bank glosa against contracts' rutPagadorBanco.
 * Returns the contract or null if it's an internal/unidentified movement.
 */
export function identifyContract(abono: Abono): { contract: Contract | null; reason: string } {
  const glosa = abono.glosa.toUpperCase();
  const monto = abono.monto;
  const fecha = abono.fecha; // ISO yyyy-mm-dd

  // === Puerta Patagonia (RUT 0533192734 — único) ===
  if (glosa.includes("0533192734") || glosa.includes("CODOMINIO PUE") || glosa.includes("CONDOMINIO PUE") || glosa.includes("PUERTA PATAGONIA")) {
    return { contract: CONTRACTS.find(c => c.id === "C-001")!, reason: "RUT/Nombre Puerta Patagonia" };
  }
  // === Vikingos (RUT 0533219977 — único) ===
  if (glosa.includes("0533219977") || glosa.includes("EDIFICIO LOS VI") || glosa.includes("VIKINGOS")) {
    return { contract: CONTRACTS.find(c => c.id === "C-002")!, reason: "RUT/Nombre Vikingos" };
  }
  // === Trongkai (RUT 0772212038 — único) ===
  if (glosa.includes("0772212038") || glosa.includes("AGROTECN") || glosa.includes("TRONGKAI")) {
    return { contract: CONTRACTS.find(c => c.id === "C-003")!, reason: "RUT/Nombre Trongkai" };
  }
  // === Barranco Amarillo (RUT 0781918873 — único) ===
  // El "Traspaso de cuenta" de $145.563.465 (28/04/2026) corresponde al PAGO
  // INICIAL del contrato: factura SII F58 (01/05/2026), 3.051,93 UF = $145.563.464
  // total. Se identifica como pago de Barranco (se concilia contra la cuota de
  // pago inicial de C-006). Confirmado contra factura F58 adjunta.
  if (glosa.includes("0781918873") || glosa.includes("BARRANCO") || glosa.includes("BORQUEZ")) {
    return { contract: CONTRACTS.find(c => c.id === "C-006")!, reason: "RUT/Nombre Barranco Amarillo" };
  }

  // === SCG (RUT 0141831984 compartido entre Flota 1 y 2) ===
  // Desambiguar por monto, con fecha como tiebreaker
  if (glosa.includes("0141831984") || glosa.includes("CRISTIAN EDUARD")) {
    const flota1 = CONTRACTS.find(c => c.id === "C-004")!;
    const flota2 = CONTRACTS.find(c => c.id === "C-005")!;

    if (monto >= 3_500_000) {
      return { contract: flota1, reason: `SCG monto $${monto.toLocaleString("es-CL")} ≈ 1ª renta Flota 1 (82,86 UF)` };
    }
    if (monto >= 3_000_000 && monto < 3_500_000) {
      if (fecha < "2025-01-27") {
        return { contract: null, reason: `SCG monto $${monto.toLocaleString("es-CL")} pero fecha anterior a firma Flota 1` };
      }
      if (fecha <= "2025-04-30") {
        return { contract: flota1, reason: `SCG monto $${monto.toLocaleString("es-CL")} ≈ parcial 1ª renta Flota 1` };
      }
      return { contract: flota2, reason: `SCG monto $${monto.toLocaleString("es-CL")} ≈ 1ª renta Flota 2 (70,91 UF)` };
    }
    if (monto >= 2_500_000 && monto < 3_000_000) {
      return { contract: flota1, reason: `SCG monto $${monto.toLocaleString("es-CL")} ≈ parcial 1ª renta Flota 1` };
    }

    // Para cuotas regulares: comparar contra valor teórico Flota 1 vs Flota 2
    // y elegir el más cercano. Flota 1 = 25.58 UF, Flota 2 = 22.93 UF.
    // Usamos rangos amplios alrededor de cada cuota (UF×UF×IVA varía entre meses)
    if (monto >= 800_000 && monto < 1_300_000) {
      // Calcular cercanía relativa a cada cuota teórica con/sin IVA
      // Flota 1 con IVA: ~$1.17M-$1.25M
      // Flota 1 sin IVA: ~$1.00M-$1.05M
      // Flota 2 con IVA: ~$1.05M-$1.10M
      // Flota 2 sin IVA: ~$0.88M-$0.93M
      // Distancia a cada centro:
      const distFlota1ConIva = Math.abs(monto - 1_200_000);
      const distFlota1SinIva = Math.abs(monto - 1_025_000);
      const distFlota2ConIva = Math.abs(monto - 1_075_000);
      const distFlota2SinIva = Math.abs(monto - 905_000);
      const minDist = Math.min(distFlota1ConIva, distFlota1SinIva, distFlota2ConIva, distFlota2SinIva);
      if (minDist === distFlota1ConIva) {
        return { contract: flota1, reason: `SCG monto $${monto.toLocaleString("es-CL")} ≈ cuota Flota 1 con IVA (25,58 UF)` };
      }
      if (minDist === distFlota1SinIva) {
        return { contract: flota1, reason: `SCG monto $${monto.toLocaleString("es-CL")} ≈ cuota Flota 1 NETA sin IVA (25,58 UF)` };
      }
      if (minDist === distFlota2ConIva) {
        return { contract: flota2, reason: `SCG monto $${monto.toLocaleString("es-CL")} ≈ cuota Flota 2 con IVA (22,93 UF)` };
      }
      return { contract: flota2, reason: `SCG monto $${monto.toLocaleString("es-CL")} ≈ cuota Flota 2 NETA sin IVA (22,93 UF)` };
    }
    if (monto >= 500_000 && monto < 800_000 && fecha < "2025-05-12") {
      return { contract: flota1, reason: `SCG monto $${monto.toLocaleString("es-CL")} ≈ parcial 1ª renta Flota 1` };
    }
    return { contract: null, reason: `SCG pero monto inusual $${monto.toLocaleString("es-CL")} — revisar manualmente` };
  }

  // === Movimientos internos / terceros ===
  if (glosa.includes("RESCATE FONDOS MUTUOS") || (glosa.includes("FONDO") && glosa.includes("MUTUO"))) {
    return { contract: null, reason: "Movimiento interno: rescate de fondo mutuo" };
  }
  if (glosa.includes("TRASPASO CON LA CUENTA")) {
    return { contract: null, reason: "Movimiento interno: traspaso entre cuentas propias" };
  }
  if (glosa.includes("DEPÓSITO DOCUMENTO") || glosa.includes("DEPOSITO DOCUMENTO")) {
    return { contract: null, reason: "Depósito de documento (cheque) sin glosa detallada" };
  }
  if (glosa.includes("0162860682") || glosa.includes("JUAN PABLO GO")) {
    return { contract: null, reason: "Transferencia de socio Juan Pablo González (aporte de capital)" };
  }
  if (glosa.includes("0768585725") || glosa.includes("BEBIDAS FUNCION") || glosa.includes("CAELUM")) {
    // Bebidas Funcionales Caelum SpA firmó el contrato Axopur (C-007) el 26/05/2026,
    // con pagos desde junio 2026. Los abonos DESDE esa fecha se concilian a C-007;
    // los anteriores son transferencias históricas de otro origen (no del contrato).
    if (abono.fecha >= "2026-06-01") {
      return { contract: CONTRACTS.find(c => c.id === "C-007")!, reason: "RUT/Nombre Bebidas Funcionales Caelum — contrato Axopur (C-007)" };
    }
    return { contract: null, reason: "Cliente histórico: Bebidas Funcionales Caelum SpA (transferencia anterior al contrato Axopur, 05/2026)" };
  }
  if (glosa.includes("0774235566") || glosa.includes("077751766K")) {
    return { contract: null, reason: "Aporte de capital socio (préstamo / pago de acciones)" };
  }
  if (glosa.includes("0770300517") || glosa.includes("CG METRICS") || glosa.includes("CGMETRICS")) {
    return { contract: null, reason: "Cliente histórico: CG Metrics SpA (sin contrato vigente en sistema)" };
  }
  if (glosa.includes("0769865098") || glosa.includes("CICLA SPA") || glosa.includes("CICLASPA")) {
    return { contract: null, reason: "Cliente histórico: Cicla SpA (sin contrato vigente en sistema)" };
  }
  if (glosa.includes("076441865") || glosa.includes("CREATIVE SEARCH") || glosa.includes("CREATIVESEARCH")) {
    return { contract: null, reason: "Cliente histórico: Creative Searching (sin contrato vigente en sistema)" };
  }
  if (glosa.includes("0770187397") || glosa.includes("INGENIERIA E IN")) {
    return { contract: null, reason: "Ingeniería e Innovación SpA (REVTECH, empresa relacionada) — aporte/préstamo intercompañía, no es pago de contrato" };
  }
  if (glosa.includes("0779619931") || glosa.includes("ECOIL")) {
    return { contract: null, reason: "ECOIL SpA — tercero sin contrato vigente en sistema" };
  }
  if (glosa.includes("0076715299K") || glosa.includes("PAGO DE ASIGNA")) {
    return { contract: null, reason: "Pago de Asigna (RUT 76.715.299-K) — por clasificar con contabilidad" };
  }
  if (glosa.includes("DEV IMPUESTO") || glosa.includes("TESORER")) {
    return { contract: null, reason: "Devolución de impuestos Tesorería General de la República" };
  }
  if (glosa.includes("0760583634") || glosa.includes("COMERCIALIZADOR")) {
    return { contract: null, reason: "Transferencias de COMERCIALIZADORA (RUT 76.058.363-4) por $17,2MM el 26/06/2026 — sin contrato en sistema; clasificar (¿nuevo cliente / venta de equipos?)" };
  }
  if (glosa.includes("PTEC")) {
    return { contract: null, reason: "Pago Factura N°41 código PTEC ($10,71MM el 11/06/2026) — OJO: el 15/06 sale un CARGO por el mismo monto total (posible reversa o traspaso); clasificar con contabilidad" };
  }
  if (glosa.includes("DEP CON DOC ATM") || glosa.includes("00211778202")) {
    return { contract: null, reason: "Depósito con documento ATM $270MM (27/03/2026) — clasificar con contabilidad (no es pago de contrato de arriendo)" };
  }

  return { contract: null, reason: "Sin identificar — revisar manualmente" };
}

// ============================================================================
// Puerta Patagonia (C-001) — facturación REAL según facturas electrónicas SII.
// El anticipo de $10MM + IVA se facturó en 6 facturas mensuales INDEPENDIENTES
// (dic-2025 → may-2026, $1.983.334 IVA inc. c/u) y la renta mensual (67,13 UF
// + IVA) se factura por separado desde marzo-2026.
// Fuente: facturas electrónicas N°43, 47, 52, 53, 63, 64 y 69 (CSL → Comunidad
// Edificio Puerta Patagonia, RUT 53.319.273-4).
// ============================================================================
const C001_ANTICIPOS: Array<{ fecha: string; factura: string }> = [
  { fecha: "2025-12-06", factura: "Anticipo cuota 01/06 — factura dic-2025 (n° por confirmar)" },
  { fecha: "2026-01-06", factura: "Anticipo cuota 02/06 — factura ene-2026 (n° por confirmar)" },
  { fecha: "2026-02-06", factura: "Anticipo cuota 03/06 — Factura electrónica N°43 (06/02/2026)" },
  { fecha: "2026-03-06", factura: "Anticipo cuota 04/06 — Factura electrónica N°47 (06/03/2026)" },
  { fecha: "2026-04-07", factura: "Anticipo cuota 05/06 — Factura electrónica N°53 (07/04/2026)" },
  { fecha: "2026-05-06", factura: "Anticipo cuota 06/06 — Factura electrónica N°63 (06/05/2026)" },
];

// Rentas mensuales C-001 ya emitidas: monto neto EXACTO según factura
const C001_RENTAS_EMITIDAS: Record<string, { neto: number; factura: string }> = {
  "2026-03-06": { neto: 2_661_302, factura: "Renta cuota 01/36 — factura mar-2026 (n° por confirmar; monto inferido del pago exacto del 18/03/2026)" },
  "2026-04-06": { neto: 2_674_593, factura: "Renta cuota 02/36 — Factura electrónica N°52 (07/04/2026)" },
  "2026-05-06": { neto: 2_698_626, factura: "Renta cuota 03/36 — Factura electrónica N°64 (06/05/2026)" },
  "2026-06-06": { neto: 2_732_997, factura: "Renta cuota 04/36 — Factura electrónica N°69 (06/06/2026); plazo de pago 15 días corridos → vence ~21/06/2026" },
};

/**
 * Generate the full cuota schedule for a contract.
 */
export function generateCuotasForContract(c: Contract): Cuota[] {
  const cuotas: Cuota[] = [];
  const inicio = new Date(c.fechaInicioPagos + "T00:00:00");
  const firma = new Date(c.fechaFirma + "T00:00:00");

  // Special: contracts with primera renta at firma (Flota 1 & 2)
  if (c.rentaUfPrimera) {
    const ufVal = ufForBilling(addMonths(firma, 1)); // approximate
    const neto = Math.round(c.rentaUfPrimera * ufVal);
    const iva = Math.round(neto * IVA);
    cuotas.push({
      contractId: c.id,
      proyecto: c.proyecto,
      numero: "1ª renta (al firmar)",
      fecha: c.fechaFirma,
      uf: c.rentaUfPrimera,
      ufValorMes: ufVal,
      netoClp: neto,
      ivaClp: iva,
      totalFacturado: neto + iva,
      totalPagado: 0,
      estado: "vencida-sin-pago",
      matchedAbonos: [],
      notas: "Pagada en el momento de firmar el contrato (primera renta).",
    });
  }

  // Special: pago inicial en CLP neto facturado al firmar (ej. Axopur)
  if (c.pagoInicialNeto) {
    const neto = c.pagoInicialNeto;
    const iva = Math.round(neto * IVA);
    cuotas.push({
      contractId: c.id,
      proyecto: c.proyecto,
      numero: "Pago inicial",
      fecha: c.fechaFirma,
      uf: null,
      ufValorMes: null,
      netoClp: neto,
      ivaClp: iva,
      totalFacturado: neto + iva,
      totalPagado: 0,
      estado: "vencida-sin-pago",
      matchedAbonos: [],
      notas: "Pago inicial facturado frente al contrato (Cláusula Sexto).",
    });
  }

  // Special: Puerta Patagonia — 6 cuotas de anticipo facturadas por separado
  if (c.id === "C-001" && c.anticipoCuota) {
    C001_ANTICIPOS.forEach((a, i) => {
      const neto = c.anticipoCuota!;
      const iva = Math.round(neto * IVA);
      cuotas.push({
        contractId: c.id,
        proyecto: c.proyecto,
        numero: `Anticipo ${i + 1}/6`,
        fecha: a.fecha,
        uf: null,
        ufValorMes: null,
        netoClp: neto,
        ivaClp: iva,
        totalFacturado: neto + iva,
        totalPagado: 0,
        estado: "vencida-sin-pago",
        matchedAbonos: [],
        notas: a.factura,
      });
    });
  }

  // Special: Vikingos has an anticipo of $20M IVA included as first "cuota"
  if (c.id === "C-002") {
    cuotas.push({
      contractId: c.id,
      proyecto: c.proyecto,
      numero: "Anticipo (al inicio obra)",
      fecha: c.fechaFirma,
      uf: null,
      ufValorMes: null,
      netoClp: Math.round(20_000_000 / 1.19),
      ivaClp: 20_000_000 - Math.round(20_000_000 / 1.19),
      totalFacturado: 20_000_000,
      totalPagado: 0,
      estado: "vencida-sin-pago",
      matchedAbonos: [],
      notas: "Anticipo $20.000.000 IVA incluido, pagadero en 1 cuota para dar inicio a los trabajos.",
    });
  }

  // Regular cuotas
  for (let k = 1; k <= c.nCuotas; k++) {
    const fecha = addMonths(inicio, k - 1);
    let neto = 0;
    let iva = 0;
    let uf: number | null = null;
    let ufVal: number | null = null;
    let notas = "";

    if (c.monedaRenta === "UF" && c.rentaUf) {
      // Renta vigente para esta cuota (considera rebaja escalonada, ej. SCG)
      const rentaUfVig =
        c.rentaUf2 && c.rentaUf2DesdeCuota && k >= c.rentaUf2DesdeCuota
          ? c.rentaUf2
          : c.rentaUf;
      uf = rentaUfVig;
      // Puerta Patagonia: usar el monto EXACTO de la factura emitida si existe
      const emitida = c.id === "C-001" ? C001_RENTAS_EMITIDAS[isoDate(fecha)] : undefined;
      if (emitida) {
        neto = emitida.neto;
        ufVal = Math.round(neto / rentaUfVig);
        notas = emitida.factura;
      } else {
        ufVal = ufForBilling(fecha);
        neto = Math.round(rentaUfVig * ufVal);
      }
      iva = Math.round(neto * IVA);
    } else if (c.monedaRenta === "CLP" && c.rentaClpNeta) {
      neto = c.rentaClpNeta;
      iva = Math.round(neto * IVA);
      notas = "Tarifa fija mensual 2026 (esquema horario aplica desde 2027).";
    }

    cuotas.push({
      contractId: c.id,
      proyecto: c.proyecto,
      numero: `Cuota ${k}/${c.nCuotas}`,
      fecha: isoDate(fecha),
      uf,
      ufValorMes: ufVal,
      netoClp: neto,
      ivaClp: iva,
      totalFacturado: neto + iva,
      totalPagado: 0,
      estado: "vencida-sin-pago",
      matchedAbonos: [],
      notas,
    });
  }

  return cuotas;
}

/**
 * Allocate abonos to cuotas:
 *  1. EXACT MATCH first: if the abono amount coincides (±1,5%) with the
 *     outstanding balance of a specific open cuota, apply it there (oldest
 *     matching cuota if several). This reflects how clients actually pay —
 *     one transfer per factura, with the exact invoiced amount — and avoids
 *     smearing a renta payment across older anticipo cuotas.
 *  2. FIFO for the rest: apply the remainder to the oldest open cuota and
 *     spill forward. Any final excess is credited to the last cuota.
 */
function allocateAbonos(cuotas: Cuota[], abonos: Abono[]): void {
  const sortedAbonos = [...abonos].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const openCuotas = () =>
    cuotas
      .filter(c => c.totalFacturado > 0 && c.totalPagado < c.totalFacturado)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

  for (const ab of sortedAbonos) {
    let restante = ab.monto;

    // Paso 1: calce exacto contra una cuota específica
    const exacta = openCuotas().find(c => {
      const falta = c.totalFacturado - c.totalPagado;
      return falta > 0 && Math.abs(ab.monto - falta) / falta <= 0.015;
    });
    if (exacta) {
      const falta = exacta.totalFacturado - exacta.totalPagado;
      const aplicar = Math.min(restante, falta);
      exacta.matchedAbonos.push({ fecha: ab.fecha, monto: ab.monto, glosa: ab.glosa, aplicado: aplicar });
      exacta.totalPagado += aplicar;
      restante -= aplicar;
    }

    // Paso 2: FIFO con el remanente
    for (const c of openCuotas()) {
      if (restante <= 0) break;
      const falta = c.totalFacturado - c.totalPagado;
      if (falta <= 0) continue;
      const aplicar = Math.min(restante, falta);
      c.matchedAbonos.push({ fecha: ab.fecha, monto: ab.monto, glosa: ab.glosa, aplicado: aplicar });
      c.totalPagado += aplicar;
      restante -= aplicar;
    }

    // Final excess: prepayment credited to the last cuota
    if (restante > 0 && cuotas.length > 0) {
      const last = cuotas[cuotas.length - 1];
      last.matchedAbonos.push({ fecha: ab.fecha, monto: ab.monto, glosa: ab.glosa, aplicado: restante });
      last.totalPagado += restante;
    }
  }
}

/**
 * Días de gracia desde la emisión de una factura antes de considerarla ATRASADA.
 * Regla de negocio CSL: una factura impaga recién pasa a estar atrasada 30 días
 * después de emitida; dentro de esos 30 días está "en plazo / por vencer".
 */
export const DIAS_GRACIA_ATRASO = 30;

/** true si una factura impaga ya está atrasada (pasaron ≥30 días desde su emisión). */
export function estaAtrasada(fechaEmisionISO: string, today: Date): boolean {
  const venc = new Date(fechaEmisionISO + "T00:00:00");
  venc.setDate(venc.getDate() + DIAS_GRACIA_ATRASO);
  return today > venc;
}

/** Compute status of each cuota relative to a reference date (today) */
function computeStatus(cuotas: Cuota[], today: Date): void {
  for (const c of cuotas) {
    const fechaCuota = new Date(c.fecha + "T00:00:00");
    if (c.totalFacturado === 0) {
      c.estado = "sin-valor";
    } else if (fechaCuota > today) {
      c.estado = c.totalPagado > 0 ? "pagada-diferencia" : "por-vencer";
    } else if (c.totalPagado >= c.totalFacturado * 0.98) {
      c.estado = "pagada";
    } else if (c.totalPagado > 0) {
      const diffPct = Math.abs(c.totalPagado - c.totalFacturado) / c.totalFacturado;
      c.estado = diffPct < 0.10 ? "pagada-diferencia" : "pagada-parcial";
    } else {
      // Impaga y ya emitida: sólo se marca vencida si pasaron ≥30 días desde
      // la emisión; dentro de la gracia queda "por-vencer" (en plazo).
      c.estado = estaAtrasada(c.fecha, today) ? "vencida-sin-pago" : "por-vencer";
    }
  }
}

export interface ConciliationResult {
  cuotas: Cuota[];
  abonosNoIdentificados: Array<{ abono: Abono; reason: string }>;
  porContrato: Record<string, Cuota[]>;
}

export function buildConciliation(
  abonos: Abono[] = ABONOS,
  refDate: Date = new Date()
): ConciliationResult {
  const allCuotas: Cuota[] = [];
  const porContrato: Record<string, Cuota[]> = {};

  for (const c of CONTRACTS) {
    const cuotas = generateCuotasForContract(c);
    porContrato[c.id] = cuotas;
    allCuotas.push(...cuotas);
  }

  // Overlay de montos REALES: donde exista una factura SII emitida, se usan sus
  // cifras exactas (neto/IVA/total, UF, fecha de emisión y folio) en vez del
  // estimado por modelo UF. Se aplica ANTES de asignar abonos para que el calce
  // exacto por monto trabaje contra las cifras reales facturadas.
  for (const cu of allCuotas) {
    const f = FACTURA_POR_CUOTA[`${cu.contractId}|${cu.numero}`];
    if (!f) continue;
    cu.netoClp = f.neto;
    cu.ivaClp = f.iva;
    cu.totalFacturado = f.total;
    if (f.uf != null) cu.uf = f.uf;
    if (f.valorUf != null) cu.ufValorMes = f.valorUf;
    cu.fecha = f.fecha;
    cu.factura = `F${f.folio}`;
    cu.notas = cu.notas ? `${cu.notas} · Factura SII F${f.folio}` : `Factura SII F${f.folio}`;
  }

  // Group abonos by contract
  const abonosPorContrato: Record<string, Abono[]> = {};
  const noIdent: Array<{ abono: Abono; reason: string }> = [];
  for (const ab of abonos) {
    const { contract, reason } = identifyContract(ab);
    if (contract) {
      if (!abonosPorContrato[contract.id]) abonosPorContrato[contract.id] = [];
      abonosPorContrato[contract.id].push(ab);
    } else {
      noIdent.push({ abono: ab, reason });
    }
  }

  // Allocate per contract
  for (const c of CONTRACTS) {
    const cu = porContrato[c.id];
    const ab = abonosPorContrato[c.id] || [];
    allocateAbonos(cu, ab);
  }

  computeStatus(allCuotas, refDate);

  return { cuotas: allCuotas, abonosNoIdentificados: noIdent, porContrato };
}
