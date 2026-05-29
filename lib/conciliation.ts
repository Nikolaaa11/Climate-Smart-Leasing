import { Contract, CONTRACTS, IVA } from "./contracts";
import { Abono, ABONOS } from "./abonos";
import { ufForBilling } from "./uf";

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
    return { contract: null, reason: "Cliente histórico: Bebidas Funcionales Caelum SpA (sin contrato vigente en sistema)" };
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

  return { contract: null, reason: "Sin identificar — revisar manualmente" };
}

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
      ufVal = ufForBilling(fecha);
      uf = c.rentaUf;
      neto = Math.round(c.rentaUf * ufVal);
      // Puerta Patagonia: añadir anticipo prorrateado primeras 6 cuotas
      if (c.id === "C-001" && c.anticipoCuota && c.anticipoNCuotas && k <= c.anticipoNCuotas) {
        neto += c.anticipoCuota;
        notas = `Incluye anticipo prorrateado $${c.anticipoCuota.toLocaleString("es-CL")} (cuota ${k} de ${c.anticipoNCuotas}).`;
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
 * Allocate abonos to cuotas using pure FIFO:
 *  - For each abono (in chronological order), apply to the oldest open cuota
 *    of the contract; spill the remainder forward to the next open cuotas.
 *  - Any final excess is credited to the last cuota as prepayment.
 *
 * Rationale: simpler and more honest than magnitude-matching. Each abono
 * settles the oldest outstanding obligation first, which matches how
 * accounts-receivable allocations work in practice.
 */
function allocateAbonos(cuotas: Cuota[], abonos: Abono[]): void {
  const sortedAbonos = [...abonos].sort((a, b) => a.fecha.localeCompare(b.fecha));

  for (const ab of sortedAbonos) {
    let restante = ab.monto;

    const open = cuotas
      .filter(c => c.totalFacturado > 0 && c.totalPagado < c.totalFacturado)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    for (const c of open) {
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
      c.estado = "vencida-sin-pago";
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
