// ============================================================================
// TOTALES CANÓNICOS — única fuente de agregados financieros de la plataforma.
// TODAS las secciones (Dashboard, Contratos, Cobranza, Consolidado) deben
// calcular sus cifras con estas funciones, nunca por su cuenta, para que
// los números SIEMPRE cuadren entre sí.
//
// Identidades garantizadas (verificadas por scripts/cuadratura.ts):
//   emitido        = pagadoEmitido + atrasado + enPlazo
//   totalContrato  = emitido + porFacturar
//   saldoEmitido   = atrasado + enPlazo
//   porPagarTotal  = totalContrato − pagado
// ============================================================================

import { ConciliationResult, Cuota, estaAtrasada } from "./conciliation";

export interface Totales {
  /** Suma de TODAS las cuotas del contrato (pasadas y futuras) */
  totalContrato: number;
  /** Cuotas ya emitidas (fecha ≤ hoy) */
  emitido: number;
  /** Todo lo pagado (incluye pagos aplicados a cuotas futuras / anticipados) */
  pagado: number;
  /** Pagado aplicado a cuotas ya emitidas */
  pagadoEmitido: number;
  /** Saldo impago de cuotas emitidas hace 15+ días (plazo contractual vencido) */
  atrasado: number;
  /** Saldo impago de cuotas emitidas hace <15 días (aún dentro del plazo de pago) */
  enPlazo: number;
  /** Saldo por cobrar de lo ya emitido = atrasado + enPlazo */
  saldoEmitido: number;
  /** Cuotas futuras aún no emitidas (bruto) */
  porFacturar: number;
  /** Cuotas futuras neto de pagos anticipados ya aplicados a ellas */
  porFacturarNeto: number;
  /** Todo lo que falta por pagar del contrato completo = totalContrato − pagado */
  porPagarTotal: number;
  /** pagadoEmitido / emitido (0..1; 1 si no hay nada emitido) */
  cumplimiento: number;
}

export function totalesDeCuotas(cuotas: Cuota[], hoy: Date = new Date()): Totales {
  let totalContrato = 0;
  let emitido = 0;
  let pagado = 0;
  let pagadoEmitido = 0;
  let atrasado = 0;
  let enPlazo = 0;
  let porFacturar = 0;
  let pagadoFuturo = 0;

  for (const c of cuotas) {
    if (c.totalFacturado <= 0) continue;
    totalContrato += c.totalFacturado;
    pagado += c.totalPagado;
    const esEmitida = new Date(c.fecha + "T00:00:00") <= hoy;
    if (esEmitida) {
      emitido += c.totalFacturado;
      // El asignador nunca aplica más que lo facturado a una cuota, pero el
      // cap protege la identidad ante cualquier caso borde.
      const aplicado = Math.min(c.totalPagado, c.totalFacturado);
      pagadoEmitido += aplicado;
      const saldo = c.totalFacturado - aplicado;
      if (saldo > 0) {
        if (estaAtrasada(c.fecha, hoy)) atrasado += saldo;
        else enPlazo += saldo;
      }
    } else {
      porFacturar += c.totalFacturado;
      pagadoFuturo += Math.min(c.totalPagado, c.totalFacturado);
    }
  }

  return {
    totalContrato,
    emitido,
    pagado,
    pagadoEmitido,
    atrasado,
    enPlazo,
    saldoEmitido: atrasado + enPlazo,
    porFacturar,
    porFacturarNeto: Math.max(0, porFacturar - pagadoFuturo),
    porPagarTotal: Math.max(0, totalContrato - pagado),
    cumplimiento: emitido > 0 ? pagadoEmitido / emitido : 1,
  };
}

/** Totales de un contrato específico */
export function totalesContrato(result: ConciliationResult, contractId: string, hoy: Date = new Date()): Totales {
  return totalesDeCuotas(result.porContrato[contractId] || [], hoy);
}

/** Totales globales de toda la cartera */
export function totalesGlobales(result: ConciliationResult, hoy: Date = new Date()): Totales {
  return totalesDeCuotas(result.cuotas, hoy);
}

/** Verifica las identidades aritméticas de un Totales. Devuelve las violaciones. */
export function verificarIdentidades(t: Totales, etiqueta: string): string[] {
  const errores: string[] = [];
  const ok = (a: number, b: number) => Math.abs(a - b) <= 1; // tolerancia $1 por redondeos
  if (!ok(t.emitido, t.pagadoEmitido + t.atrasado + t.enPlazo)) {
    errores.push(`${etiqueta}: emitido (${t.emitido}) ≠ pagadoEmitido + atrasado + enPlazo (${t.pagadoEmitido + t.atrasado + t.enPlazo})`);
  }
  if (!ok(t.totalContrato, t.emitido + t.porFacturar)) {
    errores.push(`${etiqueta}: totalContrato (${t.totalContrato}) ≠ emitido + porFacturar (${t.emitido + t.porFacturar})`);
  }
  if (!ok(t.saldoEmitido, t.atrasado + t.enPlazo)) {
    errores.push(`${etiqueta}: saldoEmitido ≠ atrasado + enPlazo`);
  }
  return errores;
}
