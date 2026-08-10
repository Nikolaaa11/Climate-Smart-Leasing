// ============================================================================
// CONSOLIDADO — el puente entre el capital y el negocio
// ============================================================================
// La plataforma tiene dos mundos que nunca se tocaban:
//
//   CAPITAL     lib/proyectos.ts     ¿en qué gasté $1.393MM?      (banco por proyecto)
//   COMERCIAL   lib/contracts.ts     ¿cuánto contraté y cobré?    (conciliación)
//
// Este módulo los une para responder la única pregunta que importa:
// por cada peso puesto en un activo, ¿cuánto contrato lo respalda y cuánto
// se ha cobrado?
//
// Reglas y criterios: "0. SUPER PROMPT - Consolidado Plataforma.md"
// ============================================================================

import { PROYECTOS, PROYECTOS_KPIS, Proyecto } from "./proyectos";
import { CONTRACTS } from "./contracts";
import { ConciliationResult } from "./conciliation";
import { totalesContrato } from "./totales";

/**
 * Mapa proyecto (banco) → contrato(s). Fijado a mano y con la razón explícita:
 * el nombre del proyecto en el Excel de banco y el del contrato NO coinciden,
 * así que esto no se puede inferir. Si se agrega un contrato nuevo, agregar
 * también su fila acá o el activo aparecerá como "sin contrato".
 */
export const MAPA_PROYECTO_CONTRATO: Record<string, { contratos: string[]; razon: string }> = {
  "Tratamiento Aguas Residuales": {
    contratos: ["C-007"],
    razon: "El equipo Axopur (Axolot) arrendado a Bebidas Funcionales Caelum sale de este proyecto",
  },
  "Opticept": {
    contratos: ["C-003"],
    razon: "El equipo ODIN de OptiCept, comprado a TS Swedish, es el activo arrendado a Agrotecnologías (Trongkai)",
  },
  "Barranco Amarillo": {
    contratos: ["C-006"],
    razon: "Equipamiento provisto por Borman con póliza HDI, arrendado a Procesadora Barranco Amarillo",
  },
  "Calderas": {
    contratos: ["C-001", "C-002"],
    razon: "Calderas Geist arrendadas a Puerta Patagonia y al Edificio Los Vikingos",
  },
  "Flota": {
    contratos: ["C-004", "C-005"],
    razon: "Flota Volvo EX30 (PLUS y CORE) en arriendo operativo a SCG SpA",
  },
  "Sensores": { contratos: [], razon: "Instrumentación Geist sin contrato de arriendo asociado a la fecha" },
  "PTEC": { contratos: [], razon: "Coejecución de servicios de monitoreo; no genera activo arrendable" },
  "Micronizador": { contratos: [], razon: "Piloto en desarrollo, sin contrato a la fecha" },
};

export interface FilaPuente {
  proyecto: string;
  tag: string;
  desc: string;
  razon: string;
  invertido: number;
  contratos: string[];
  clientes: string[];
  contratado: number;
  emitido: number;
  cobrado: number;
  /** Contratado ÷ invertido. null cuando no hay contrato (no es cero: es "no aplica todavía"). */
  cobertura: number | null;
  movs: number;
  desde: string;
  hasta: string;
}

export interface Consolidado {
  filas: FilaPuente[];
  totales: {
    invertido: number;
    contratado: number;
    emitido: number;
    cobrado: number;
    cobertura: number;
    /** Capital desplegado que todavía no tiene contrato que lo respalde. */
    brecha: number;
    /** Capital en activos sin ningún contrato asociado. */
    sinContrato: number;
  };
  /** C-008 no es cartera: compraventa back-to-back con su costo en la banda B. */
  reventa: {
    contrato: string;
    cliente: string;
    costo: number;
    venta: number;
    margen: number;
    margenPct: number;
  };
}

/** Costo de la compraventa Resin & Polimers, registrado en la banda B (Corporativo/Cliente). */
const COSTO_RESIN = 15_484_578;

export function buildConsolidado(result: ConciliationResult): Consolidado {
  const filas: FilaPuente[] = [];

  for (const p of PROYECTOS as Proyecto[]) {
    const m = MAPA_PROYECTO_CONTRATO[p.nombre];
    if (!m) continue; // sólo cartera (banda A); Corporativo, FIP, AFIS y demás no son activos

    let contratado = 0, emitido = 0, cobrado = 0;
    const clientes: string[] = [];
    for (const id of m.contratos) {
      const t = totalesContrato(result, id);
      contratado += t.totalContrato;
      emitido += t.emitido;
      cobrado += t.pagado;
      const c = CONTRACTS.find(x => x.id === id);
      if (c && !clientes.includes(c.cliente)) clientes.push(c.cliente);
    }

    filas.push({
      proyecto: p.nombre,
      tag: p.tag,
      desc: p.desc,
      razon: m.razon,
      invertido: p.egreso,
      contratos: m.contratos,
      clientes,
      contratado,
      emitido,
      cobrado,
      cobertura: m.contratos.length ? contratado / p.egreso : null,
      movs: p.movs,
      desde: p.desde,
      hasta: p.hasta,
    });
  }

  // De mayor a menor capital comprometido: así se lee primero dónde está el riesgo.
  filas.sort((a, b) => b.invertido - a.invertido);

  const invertido = filas.reduce((a, f) => a + f.invertido, 0);
  const contratado = filas.reduce((a, f) => a + f.contratado, 0);
  const emitido = filas.reduce((a, f) => a + f.emitido, 0);
  const cobrado = filas.reduce((a, f) => a + f.cobrado, 0);
  const sinContrato = filas.filter(f => f.cobertura === null).reduce((a, f) => a + f.invertido, 0);

  const t8 = totalesContrato(result, "C-008");
  const c8 = CONTRACTS.find(x => x.id === "C-008");

  return {
    filas,
    totales: {
      invertido,
      contratado,
      emitido,
      cobrado,
      cobertura: invertido ? contratado / invertido : 0,
      brecha: Math.max(0, invertido - contratado),
      sinContrato,
    },
    reventa: {
      contrato: "C-008",
      cliente: c8?.cliente ?? "Comercializadora Resin & Polimers Technology Limitada",
      costo: COSTO_RESIN,
      venta: t8.totalContrato,
      margen: t8.totalContrato - COSTO_RESIN,
      margenPct: t8.totalContrato ? (t8.totalContrato - COSTO_RESIN) / t8.totalContrato : 0,
    },
  };
}

/**
 * Origen de los fondos que financiaron el egreso.
 *
 * OJO — doble conteo: los aportes CORFO NO llegan directo, entran por el FIP.
 * El abono del proyecto "FIP" ($741.006.772) ya CONTIENE los $681.006.772 de
 * CORFO. Sumar "CORFO" y "FIP neto" como si fueran dos fuentes distintas
 * duplica casi $681MM. Acá se declara CORFO una sola vez y del FIP se muestra
 * únicamente lo que NO es CORFO.
 *
 * El Hito 1 de CORFO no está en el archivo de banco (es de ago-2024 y el
 * archivo parte en ene-2025): se declara como ausente, no se suma ni se estima.
 */
export interface FuenteFondos {
  nombre: string;
  monto: number;
  nota: string;
  /** true cuando no es financiamiento nuevo (puentes que netean, tesorería propia). */
  neutro?: boolean;
  /** true cuando el dato no está disponible y sólo se declara. */
  ausente?: boolean;
}

export interface OrigenFondos {
  fuentes: FuenteFondos[];
  /** Sólo lo que sí financió: excluye puentes, tesorería propia y lo ausente. */
  totalFinanciamiento: number;
}

const CORFO_EN_BANCO = 681_006_772;
const CORFO_HITO1_AUSENTE = 426_933_132;

export function buildOrigen(result: ConciliationResult): OrigenFondos {
  const p = (n: string) => (PROYECTOS as Proyecto[]).find(x => x.nombre === n);
  const fip = p("FIP"), afis = p("AFIS"), dep = p("Deposito a Plazo");
  const cobrado = CONTRACTS.reduce((a, c) => a + totalesContrato(result, c.id).pagado, 0);

  // Lo del FIP que no viene de CORFO: el puente de deuda que entró y volvió a salir.
  const fipOtrosAbonos = (fip?.abono ?? 0) - CORFO_EN_BANCO;
  const fipOtrosNeto = fipOtrosAbonos - (fip?.egreso ?? 0);
  const afisNeto = (afis?.abono ?? 0) - (afis?.egreso ?? 0);

  const fuentes: FuenteFondos[] = [
    {
      nombre: "Aportes CORFO · hitos 2, 3 y 4",
      monto: CORFO_EN_BANCO,
      nota: "Llegan vía FIP CEHTA ESG. Los tres calzan exactos contra el plan de hitos (Δ $4 de redondeo en el hito 4).",
    },
    {
      nombre: "Cobranza a clientes",
      monto: cobrado,
      nota: `Lo efectivamente pagado por los ${CONTRACTS.length} contratos de la cartera.`,
    },
    {
      nombre: "Rescates de fondo mutuo",
      monto: dep?.abono ?? 0,
      nota: "Tesorería propia que vuelve a la cuenta: no es financiamiento nuevo.",
      neutro: true,
    },
    {
      nombre: "Préstamo puente AFIS",
      monto: afisNeto,
      nota: `Entraron y salieron $${(afis?.egreso ?? 0).toLocaleString("es-CL")}. Netea cero.`,
      neutro: true,
    },
    {
      nombre: "Puente FIP · reconocimiento de deuda",
      monto: fipOtrosNeto,
      nota: "Movimientos del FIP distintos de CORFO, ya descontado el aporte. Prácticamente cero.",
      neutro: true,
    },
    {
      nombre: "Hito 1 CORFO · 1.146 acciones",
      monto: CORFO_HITO1_AUSENTE,
      nota: "Plan 30-08-2024. NO está en el archivo de banco, que parte en ene-2025. Falta conseguir la cartola 2024.",
      ausente: true,
    },
  ];

  return {
    fuentes,
    totalFinanciamiento: fuentes
      .filter(f => !f.neutro && !f.ausente)
      .reduce((a, f) => a + f.monto, 0),
  };
}

export { PROYECTOS_KPIS };
