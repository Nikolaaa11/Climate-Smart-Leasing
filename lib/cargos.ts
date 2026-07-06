// Todos los CARGOS (egresos) de la cuenta Santander 9427-8910 de CSL
// Fuente: cartolas oficiales N°20-26 (dic-2025 → 30-jun-2026)
// Validado: la suma de cargos por cartola calza con el total "Otros cargos" del encabezado

export interface Cargo {
  fecha: string;        // ISO yyyy-mm-dd
  monto: number;        // CLP (positivo)
  glosa: string;        // Descripción original de la cartola
  doc: string;          // N° doc
  cartolaMes: string;   // ej. "Cartola N°22 (Febrero 2026)"
}

export const CARGOS: Cargo[] = [
  // ============ CARTOLA N°20 (28/11/2025 - 30/12/2025) — Otros cargos $122.122.541 + Impuestos $229 = $122.122.770 ============
  { fecha: "2025-12-02", monto: 5_830, glosa: "Intereses Línea de Crédito", doc: "002938491", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-02", monto: 229, glosa: "Impuesto Sobregiro / Uso LCA", doc: "002938491", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-05", monto: 42_261_348, glosa: "Pago de Asigna", doc: "429670038", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-10", monto: 44_030_000, glosa: "Pago Equipos Sala Caldera Vilanova", doc: "430610855", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-11", monto: 140_000, glosa: "Contrato Mutuo", doc: "430814266", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-11", monto: 1_138_616, glosa: "BH59", doc: "430937032", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-15", monto: 2_400_000, glosa: "Asesoría Desarrollo de Contratos", doc: "431223438", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-15", monto: 7_500, glosa: "Certificado de vigencia de socieda", doc: "431427139", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-26", monto: 39_247, glosa: "COM.MANTENCION PLAN", doc: "0", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-29", monto: 450_000, glosa: "Servicio de Administración de red", doc: "434693165", cartolaMes: "Cartola N°20 (Diciembre 2025)" },
  { fecha: "2025-12-29", monto: 31_650_000, glosa: "Pago Factura 2297", doc: "434798724", cartolaMes: "Cartola N°20 (Diciembre 2025)" },

  // ============ CARTOLA N°21 (30/12/2025 - 30/01/2026) — Otros cargos $62.968.392 ============
  { fecha: "2026-01-07", monto: 17_669, glosa: "Pago F29 Diciembre", doc: "436657019", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-07", monto: 11_000_000, glosa: "Pago Prestamo (11/12)", doc: "436687615", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-07", monto: 590_777, glosa: "Primera cuota Certificación Tipo", doc: "434693095", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-19", monto: 870_619, glosa: "Pago F29 Mes de Diciembre", doc: "439282053", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-20", monto: 50_000_000, glosa: "Pago Factura por emitir", doc: "439404451", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-28", monto: 39_327, glosa: "COM.MANTENCION PLAN", doc: "0", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-30", monto: 450_000, glosa: "BH73 SERVICIO DE ADMINISTRACION DE", doc: "441435208", cartolaMes: "Cartola N°21 (Enero 2026)" },

  // ============ CARTOLA N°22 (30/01/2026 - 27/02/2026) — Otros cargos $21.769.095 ============
  { fecha: "2026-02-03", monto: 15_000_000, glosa: "Pago Factura por emitir", doc: "442356916", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-04", monto: 5_000_000, glosa: "Pago Factura por emitir", doc: "442742427", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-09", monto: 510_266, glosa: "Sello B Pendiente Período Febrero", doc: "443381016", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-18", monto: 258_903, glosa: "Pago F29 Mes de Febrero", doc: "445617633", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-18", monto: 593_202, glosa: "Segunda cuota Capacitación Certif", doc: "445651104", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-25", monto: 367_412, glosa: "Factura 42218. Google Workspace", doc: "445764182", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-25", monto: 39_312, glosa: "COM.MANTENCION PLAN", doc: "0", cartolaMes: "Cartola N°22 (Febrero 2026)" },

  // ============ CARTOLA N°23 (27/02/2026 - 31/03/2026) — Otros cargos $2.279.810 ============
  { fecha: "2026-03-04", monto: 1_318_763, glosa: "Pago Factura 9685", doc: "446852801", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-04", monto: 450_000, glosa: "Servicio de Administración de red", doc: "447206518", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-12", monto: 24_800, glosa: "Pago de CBR 21.800 y transporte 30", doc: "449971362", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-20", monto: 331_503, glosa: "mgcontreras@mcg.cl", doc: "448977908", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-20", monto: 115_357, glosa: "Pago F29 Mes de Marzo", doc: "451629631", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-27", monto: 39_387, glosa: "COM.MANTENCION PLAN", doc: "0", cartolaMes: "Cartola N°23 (Marzo 2026)" },

  // ============ CARTOLA N°24 (31/03/2026 - 30/04/2026) — Otros cargos $95.773.766 ============
  { fecha: "2026-04-02", monto: 77_207_000, glosa: "Factura 38", doc: "454664287", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-02", monto: 485_200, glosa: "Servicio de Administración de red", doc: "454503092", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-09", monto: 11_713_570, glosa: "Pago Factura por emitir", doc: "456023369", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-13", monto: 806_148, glosa: "Factura 43218. Google Workspace", doc: "454664287", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-13", monto: 450_000, glosa: "Factura por emitir Proyecto Axolo", doc: "456226448", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-13", monto: 2_126_000, glosa: "0", doc: "456892775", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-15", monto: 88_997, glosa: "Factura 43218. Google Workspace", doc: "456892775", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-15", monto: 450_000, glosa: "0", doc: "456892775", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-15", monto: 331_882, glosa: "0766422802 Transf a MCG AUDITORES", doc: "005803349", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-15", monto: 596_695, glosa: "0764722442 Transf a BIRUS SPA", doc: "00000000", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-15", monto: 717_151, glosa: "Factura 620", doc: "456892775", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-15", monto: 331_882, glosa: "Asesoría mensual mes de Abril Fa", doc: "457299188", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-20", monto: 289_798, glosa: "Pago F29 Mes de Marzo", doc: "457911037", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-28", monto: 140_000, glosa: "Pago OT Pendiente", doc: "459714294", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-28", monto: 39_443, glosa: "COM.MANTENCION PLAN", doc: "0", cartolaMes: "Cartola N°24 (Abril 2026)" },

  // ============ CARTOLA N°25 (30/04/2026 - 29/05/2026) — Otros cargos $377.466.985 ============
  { fecha: "2026-05-04", monto: 450_000, glosa: "BH ABRIL 2026", doc: "460154469", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-06", monto: 7_000_000, glosa: "Factura 68", doc: "461564642", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-06", monto: 4_882_303, glosa: "Reintegro Invoice Inter No. 252748", doc: "461565057", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-06", monto: 572_916, glosa: "Cuota 2", doc: "461743440", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-06", monto: 2_431, glosa: "Pago mensual Mayo Diferencia Factu", doc: "461756854", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-06", monto: 135_394_434, glosa: "Factura 68", doc: "461564642", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-06", monto: 140_000_000, glosa: "Factura 68", doc: "461564642", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-06", monto: 7_000_000, glosa: "Factura 68", doc: "461564642", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-08", monto: 31_897_559, glosa: "Factura 43752. Google Workspace", doc: "462259366", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-15", monto: 39_206_934, glosa: "Pago Factura por emitir", doc: "463672509", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-20", monto: 191_689, glosa: "F29 ABRIL", doc: "464447867", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-27", monto: 39_719, glosa: "COM.MANTENCION PLAN", doc: "0", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-29", monto: 10_829_000, glosa: "Factura por emitir", doc: "466164002", cartolaMes: "Cartola N°25 (Mayo 2026)" },

  // ============ CARTOLA N°26 (29/05/2026 - 30/06/2026) — Otros cargos $33.303.644 ============
  { fecha: "2026-06-01", monto: 450_000, glosa: "Servicio de Administración de red", doc: "466167525", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-11", monto: 1_520_239, glosa: "Factura 44312. Google Workspace", doc: "467591120", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-11", monto: 12_876_350, glosa: "Remanente Factura", doc: "469024563", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-15", monto: 10_710_000, glosa: "Factura 41. PTEC CÓDIGO 25PTECVR3", doc: "469091506", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-17", monto: 5_843_693, glosa: "Número de póliza 1257104", doc: "470013146", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-17", monto: 338_428, glosa: "Factura 12025", doc: "470254542", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-19", monto: 1_524_763, glosa: "Pago F29 Mes de Mayo", doc: "470416557", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-25", monto: 40_171, glosa: "COM.MANTENCION PLAN", doc: "0", cartolaMes: "Cartola N°26 (Junio 2026)" },
];
