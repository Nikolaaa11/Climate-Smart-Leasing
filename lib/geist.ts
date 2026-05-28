// CSL — Conciliación de desembolsos a Geist
// Servicios de Ingeniería Geist SpA (RUT 77.275.038-2), partner instalador de
// los proyectos de salas de calderas/ACS (Puerta Patagonia, Los Vikingos) y del
// proyecto de sensores (I+D).
//
// Cruza los pagos realizados a Geist contra el libro mayor (lib/ledger.ts) y su
// respaldo tributario (factura). El objetivo es identificar el monto desembolsado
// que aún NO cuenta con factura, que es el pendiente de regularización para auditoría.

export type EstadoRespaldo = "con-factura" | "factura-por-emitir" | "sin-documentar";

export interface DesembolsoGeist {
  id: string;
  pago: string;            // "Pago 1" … "Pago 6", o "Posterior"
  fecha: string;           // ISO date del/los asiento(s) en el ledger
  proyecto: string;        // "Sensores" | "Puerta Patagonia" | "Los Vikingos"
  monto: number;           // monto según la conciliación entregada por CSL
  factura: string | null;  // "771", "772" o null
  conFactura: boolean;
  estadoRespaldo: EstadoRespaldo;
  ledgerMonto: number;     // suma efectivamente registrada en el libro mayor
  nAsientos: number;       // cuántos asientos del ledger componen el desembolso
  grupo: "6-pagos" | "posterior"; // los 6 pagos conciliados vs. egresos posteriores
  nota?: string;
}

export const GEIST = {
  razonSocial: "Servicios de Ingeniería Geist SpA",
  rut: "77.275.038-2",
  rol: "Partner instalador (salas de calderas/ACS) y co-ejecutor I+D (sensores).",
};

export const DESEMBOLSOS_GEIST: DesembolsoGeist[] = [
  {
    id: "G-1",
    pago: "Pago 1",
    fecha: "2025-02-14",
    proyecto: "Sensores",
    monto: 13_435_695,
    factura: null,
    conFactura: false,
    estadoRespaldo: "factura-por-emitir",
    ledgerMonto: 13_435_695,
    nAsientos: 3,
    grupo: "6-pagos",
    nota: "3 asientos del 14-02-2025 ($3.435.695 + $5.000.000 + $5.000.000). I+D · Estudios Técnicos.",
  },
  {
    id: "G-2",
    pago: "Pago 2",
    fecha: "2025-04-01",
    proyecto: "Sensores",
    monto: 13_241_987,
    factura: null,
    conFactura: false,
    estadoRespaldo: "factura-por-emitir",
    ledgerMonto: 13_241_986,
    nAsientos: 4,
    grupo: "6-pagos",
    nota: "4 asientos del 01-04-2025. El ledger suma $13.241.986 (−$1 por redondeo en el desglose).",
  },
  {
    id: "G-3",
    pago: "Pago 3",
    fecha: "2025-12-05",
    proyecto: "Puerta Patagonia",
    monto: 42_262_348,
    factura: "771",
    conFactura: true,
    estadoRespaldo: "con-factura",
    ledgerMonto: 42_261_348,
    nAsientos: 1,
    grupo: "6-pagos",
    nota: "⚠️ Discrepancia: el ledger registra $42.261.348 (−$1.000). Pendiente verificar contra la factura 771 física.",
  },
  {
    id: "G-4",
    pago: "Pago 4",
    fecha: "2025-12-10",
    proyecto: "Puerta Patagonia",
    monto: 44_030_000,
    factura: "772",
    conFactura: true,
    estadoRespaldo: "con-factura",
    ledgerMonto: 44_030_000,
    nAsientos: 1,
    grupo: "6-pagos",
    nota: "Coincide con el ledger.",
  },
  {
    id: "G-5",
    pago: "Pago 5",
    fecha: "2026-02-03",
    proyecto: "Los Vikingos",
    monto: 15_000_000,
    factura: null,
    conFactura: false,
    estadoRespaldo: "sin-documentar",
    ledgerMonto: 15_000_000,
    nAsientos: 3,
    grupo: "6-pagos",
    nota: "3 de los 4 egresos de feb-2026 ($5.000.000 c/u). El cliente abonó $20M (Factura Afecta 48) el 03-02-2026, traspasado a Geist ese mismo día.",
  },
  {
    id: "G-6",
    pago: "Pago 6",
    fecha: "2026-02-04",
    proyecto: "Los Vikingos",
    monto: 5_000_000,
    factura: null,
    conFactura: false,
    estadoRespaldo: "sin-documentar",
    ledgerMonto: 5_000_000,
    nAsientos: 1,
    grupo: "6-pagos",
    nota: "4° egreso de feb-2026.",
  },
  {
    id: "G-7",
    pago: "Posterior",
    fecha: "2026-04-09",
    proyecto: "Puerta Patagonia",
    monto: 11_713_570,
    factura: null,
    conFactura: false,
    estadoRespaldo: "factura-por-emitir",
    ledgerMonto: 11_713_570,
    nAsientos: 1,
    grupo: "posterior",
    nota: "Servicio de monitoreo (PHI). Factura por emitir. Edificio por confirmar (atribuido a Puerta Patagonia por el sistema PHI).",
  },
  {
    id: "G-8",
    pago: "Posterior",
    fecha: "2026-04-13",
    proyecto: "Puerta Patagonia",
    monto: 2_126_000,
    factura: null,
    conFactura: false,
    estadoRespaldo: "sin-documentar",
    ledgerMonto: 2_126_000,
    nAsientos: 1,
    grupo: "posterior",
    nota: "Estudios técnicos. Sin referencia de factura. Edificio por confirmar.",
  },
];
