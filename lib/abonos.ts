// All ABONOS (credits) extracted from cartolas Santander 9427-8910
// Source: 12 monthly cartolas (Ene-Dic 2025) + cartolas oficiales N°21-25
// (30/12/2025 - 29/05/2026) + cartola provisoria N°26 (29/05 - 10/06/2026)
// Each abono has the original glosa to preserve traceability

export interface Abono {
  fecha: string;        // ISO yyyy-mm-dd
  monto: number;        // CLP
  glosa: string;        // Original description from cartola
  doc: string;          // N° doc from bank
  cartolaMes: string;   // Name of source cartola file
}

export const ABONOS: Abono[] = [
  // ============ JULIO 2024 (libro mayor — anterior a cartolas analizadas) ============
  { fecha: "2024-07-30", monto: 7_000_000, glosa: "076441865 Transf. CREATIVE SEARCH", doc: "0", cartolaMes: "Julio 2024 (libro mayor)" },
  { fecha: "2024-07-30", monto: 200_000, glosa: "0770300517 Transf de CG METRICS", doc: "0", cartolaMes: "Julio 2024 (libro mayor)" },
  { fecha: "2024-07-31", monto: 6_312_304, glosa: "Transf. CREATIVE SEARCH", doc: "0", cartolaMes: "Julio 2024 (libro mayor)" },
  { fecha: "2024-07-31", monto: 4_110_415, glosa: "0770300517 Transf de CG METRICS", doc: "0", cartolaMes: "Julio 2024 (libro mayor)" },

  // ============ ENERO 2025 ============
  { fecha: "2025-01-24", monto: 1_100_428, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Enero 2025" },
  { fecha: "2025-01-27", monto: 20_000_000, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Enero 2025" },
  { fecha: "2025-01-27", monto: 600_000, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001120", cartolaMes: "Enero 2025" },
  { fecha: "2025-01-29", monto: 3_100_000, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001121", cartolaMes: "Enero 2025" },

  // ============ FEBRERO 2025 ============
  { fecha: "2025-02-11", monto: 15_000_000, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Febrero 2025" },
  { fecha: "2025-02-20", monto: 40_000_000, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Febrero 2025" },

  // ============ MARZO 2025 ============
  { fecha: "2025-03-05", monto: 25_659_280, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Marzo 2025" },
  { fecha: "2025-03-07", monto: 1_173_226, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001143", cartolaMes: "Marzo 2025" },
  { fecha: "2025-03-12", monto: 1_000_000, glosa: "0768585725 Transf. BEBIDAS FUNCION", doc: "012121114", cartolaMes: "Marzo 2025" },
  { fecha: "2025-03-14", monto: 5_000_000, glosa: "0768585725 Transf. BEBIDAS FUNCION", doc: "012141329", cartolaMes: "Marzo 2025" },
  { fecha: "2025-03-14", monto: 4_000_000, glosa: "0768585725 Transf. BEBIDAS FUNCION", doc: "012141329", cartolaMes: "Marzo 2025" },

  // ============ ABRIL 2025 ============
  { fecha: "2025-04-03", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039250925", cartolaMes: "Abril 2025" },
  { fecha: "2025-04-03", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039250925", cartolaMes: "Abril 2025" },
  { fecha: "2025-04-03", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039250925", cartolaMes: "Abril 2025" },
  { fecha: "2025-04-03", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039250925", cartolaMes: "Abril 2025" },
  { fecha: "2025-04-03", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039250925", cartolaMes: "Abril 2025" },
  { fecha: "2025-04-03", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039250925", cartolaMes: "Abril 2025" },
  { fecha: "2025-04-03", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039250925", cartolaMes: "Abril 2025" },
  { fecha: "2025-04-17", monto: 1_173_226, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001165", cartolaMes: "Abril 2025" },

  // ============ MAYO 2025 ============
  { fecha: "2025-05-02", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039251210", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-02", monto: 4_000_000, glosa: "077751766K Transf.", doc: "039251210", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-05", monto: 1_173_226, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001174", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-06", monto: 3_300_000, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001176", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-13", monto: 213_466_566, glosa: "Depósito Documento Otros Bancos", doc: "1997039", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 7_000_000, glosa: "0774235566 Transf.", doc: "039251395", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 7_000_000, glosa: "0774235566 Transf.", doc: "039251395", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 6_000_000, glosa: "0774235566 Transf.", doc: "039251395", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 5_000_000, glosa: "0774235566 Transf.", doc: "039251395", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 5_000_000, glosa: "0774235566 Transf.", doc: "039251395", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 5_000_000, glosa: "0774235566 Transf.", doc: "039251395", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 5_000_000, glosa: "0774235566 Transf.", doc: "039251395", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 5_000_000, glosa: "0774235566 Transf.", doc: "039251395", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 4_700_000, glosa: "0774235566 Transf.", doc: "039251395", cartolaMes: "Mayo 2025" },
  { fecha: "2025-05-19", monto: 350_000, glosa: "0774235566 Transf.", doc: "039251362", cartolaMes: "Mayo 2025" },

  // ============ JUNIO 2025 ============
  { fecha: "2025-06-09", monto: 722_854, glosa: "0162860682 Transf de JUAN PABLO GO", doc: "0", cartolaMes: "Junio 2025" },
  { fecha: "2025-06-12", monto: 3_000_000, glosa: "0162860682 Transf de JUAN PABLO GO", doc: "0", cartolaMes: "Junio 2025" },
  { fecha: "2025-06-12", monto: 1_990, glosa: "0162860682 Transf de JUAN PABLO GO", doc: "0", cartolaMes: "Junio 2025" },
  { fecha: "2025-06-13", monto: 15_000_000, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Junio 2025" },
  { fecha: "2025-06-13", monto: 5_000_000, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Junio 2025" },
  { fecha: "2025-06-16", monto: 1_173_226, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001199", cartolaMes: "Junio 2025" },
  { fecha: "2025-06-24", monto: 5_000_000, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Junio 2025" },

  // ============ JULIO 2025 ============
  { fecha: "2025-07-03", monto: 29_436, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Julio 2025" },
  { fecha: "2025-07-04", monto: 5_129_216, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Julio 2025" },
  { fecha: "2025-07-07", monto: 788_002, glosa: "0770300517 Transf de CG METRICS SP", doc: "0", cartolaMes: "Julio 2025" },
  { fecha: "2025-07-10", monto: 5_000_000, glosa: "0770300517 Transf. CG METRICS", doc: "0", cartolaMes: "Julio 2025" },
  { fecha: "2025-07-10", monto: 913_236, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Julio 2025" },
  { fecha: "2025-07-11", monto: 15_000_000, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Julio 2025" },
  { fecha: "2025-07-15", monto: 5_000_000, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Julio 2025" },
  { fecha: "2025-07-17", monto: 1_173_226, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001217", cartolaMes: "Julio 2025" },
  { fecha: "2025-07-17", monto: 1_070_839, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001217", cartolaMes: "Julio 2025" },

  // ============ AGOSTO 2025 ============
  { fecha: "2025-08-13", monto: 1_447_193, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Agosto 2025" },
  { fecha: "2025-08-13", monto: 1_000_000, glosa: "0162860682 Transf de JUAN PABLO GO", doc: "0", cartolaMes: "Agosto 2025" },
  { fecha: "2025-08-14", monto: 10_059_237, glosa: "Rescate Fondos Mutuos", doc: "0", cartolaMes: "Agosto 2025" },
  { fecha: "2025-08-18", monto: 1_173_226, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001236", cartolaMes: "Agosto 2025" },
  { fecha: "2025-08-18", monto: 1_070_839, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001236", cartolaMes: "Agosto 2025" },

  // ============ SEPTIEMBRE 2025 ============
  { fecha: "2025-09-22", monto: 1_195_356, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001256", cartolaMes: "Septiembre 2025" },
  { fecha: "2025-09-22", monto: 1_071_521, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001256", cartolaMes: "Septiembre 2025" },
  { fecha: "2025-09-24", monto: 569_253, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Septiembre 2025" },
  { fecha: "2025-09-26", monto: 38_967, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Septiembre 2025" },

  // ============ OCTUBRE 2025 ============
  { fecha: "2025-10-02", monto: 4_782, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Octubre 2025" },
  { fecha: "2025-10-07", monto: 780_522, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Octubre 2025" },
  { fecha: "2025-10-13", monto: 1_201_962, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001269", cartolaMes: "Octubre 2025" },
  { fecha: "2025-10-13", monto: 892_308, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001269", cartolaMes: "Octubre 2025" },
  { fecha: "2025-10-22", monto: 4_998_000, glosa: "0769865098 Transf de CICLA SPA", doc: "0", cartolaMes: "Octubre 2025" },
  { fecha: "2025-10-28", monto: 25_667, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Octubre 2025" },

  // ============ NOVIEMBRE 2025 ============
  { fecha: "2025-11-04", monto: 13_245, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Noviembre 2025" },
  { fecha: "2025-11-13", monto: 1_240_450, glosa: "Traspaso con la Cuenta N° 00200293", doc: "0", cartolaMes: "Noviembre 2025" },
  { fecha: "2025-11-17", monto: 1_203_818, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001289", cartolaMes: "Noviembre 2025" },
  { fecha: "2025-11-17", monto: 893_688, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001289", cartolaMes: "Noviembre 2025" },
  { fecha: "2025-11-28", monto: 169_506_610, glosa: "Depósito Documento Otros Bancos", doc: "0", cartolaMes: "Noviembre 2025" },

  // ============ DICIEMBRE 2025 ============
  { fecha: "2025-12-12", monto: 1_206_772, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001306", cartolaMes: "Diciembre 2025" },
  { fecha: "2025-12-12", monto: 895_880, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001306", cartolaMes: "Diciembre 2025" },
  { fecha: "2025-12-17", monto: 1_983_334, glosa: "0533192734 Transf de CONDOMINIO PUE", doc: "0", cartolaMes: "Diciembre 2025" },

  // ============ ENERO 2026 (Cartola oficial N°21: 30/12/2025 - 30/01/2026) ============
  { fecha: "2026-01-02", monto: 1_900_000, glosa: "0768585725 Transf. BEBIDAS FUNCION", doc: "012311817", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-06", monto: 7_000_000, glosa: "0774235566 Transf.", doc: "039260059", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-06", monto: 2_950_000, glosa: "0774235566 Transf.", doc: "039260059", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-27", monto: 1_208_171, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001332", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-27", monto: 896_918, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001332", cartolaMes: "Cartola N°21 (Enero 2026)" },
  { fecha: "2026-01-29", monto: 5_000_000, glosa: "0533219977 Transf. EDIFICIO LOS VI (anticipo 1/4)", doc: "016001333", cartolaMes: "Cartola N°21 (Enero 2026)" },

  // ============ FEBRERO 2026 (Cartola oficial N°22: 30/01 - 27/02/2026) ============
  // El anticipo Vikingos de $20MM llegó en 4 transferencias de $5MM (29/01 + 02/02 ×2 + 03/02)
  { fecha: "2026-02-02", monto: 5_000_000, glosa: "0533219977 Transf. EDIFICIO LOS VI (anticipo 2/4)", doc: "016001335", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-02", monto: 5_000_000, glosa: "0533219977 Transf. EDIFICIO LOS VI (anticipo 3/4)", doc: "016001336", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-03", monto: 5_000_000, glosa: "0533219977 Transf. EDIFICIO LOS VI (anticipo 4/4)", doc: "016001336", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-20", monto: 5_000_000, glosa: "0770187397 Transf. INGENIERIA E IN", doc: "001123533", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-20", monto: 5_000_000, glosa: "0770187397 Transf. INGENIERIA E IN", doc: "001123533", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-20", monto: 5_000_000, glosa: "0770187397 Transf. INGENIERIA E IN", doc: "001123533", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-20", monto: 5_000_000, glosa: "0770187397 Transf. INGENIERIA E IN", doc: "001123533", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-20", monto: 1_000_000, glosa: "0770187397 Transf. INGENIERIA E IN", doc: "001123533", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-20", monto: 1_983_334, glosa: "0533192734 Transf de CODOMINIO PUE", doc: "0", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-20", monto: 1_209_451, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001346", cartolaMes: "Cartola N°22 (Febrero 2026)" },
  { fecha: "2026-02-20", monto: 897_868, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001346", cartolaMes: "Cartola N°22 (Febrero 2026)" },

  // ============ MARZO 2026 (Cartola oficial N°23: 27/02 - 31/03/2026) ============
  { fecha: "2026-03-18", monto: 3_166_949, glosa: "0533192734 Transf de CODOMINIO PUE", doc: "0", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-23", monto: 1_210_029, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001364", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-23", monto: 898_296, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001364", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-27", monto: 270_033_596, glosa: "00211778202 Dep con Doc ATM 698186", doc: "3698186", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-27", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039260862", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-27", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039260862", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-27", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039260862", cartolaMes: "Cartola N°23 (Marzo 2026)" },
  { fecha: "2026-03-27", monto: 7_000_000, glosa: "077751766K Transf.", doc: "039260862", cartolaMes: "Cartola N°23 (Marzo 2026)" },

  // ============ ABRIL 2026 (Cartola oficial N°24: 31/03 - 30/04/2026) ============
  { fecha: "2026-04-21", monto: 717_151, glosa: "0076715299K Pago de Asigna", doc: "458610715", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-27", monto: 1_212_798, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001384", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-27", monto: 900_354, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001384", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-28", monto: 145_563_465, glosa: "00781918873 Traspaso de cuenta", doc: "459723652", cartolaMes: "Cartola N°24 (Abril 2026)" },
  { fecha: "2026-04-28", monto: 450_000, glosa: "0779619931 Transf. ECOIL SPA", doc: "016001385", cartolaMes: "Cartola N°24 (Abril 2026)" },

  // ============ MAYO 2026 (Cartola oficial N°25: 30/04 - 29/05/2026) ============
  { fecha: "2026-05-05", monto: 3_182_766, glosa: "0533192734 Transf de CODOMINIO PUE", doc: "0", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-06", monto: 2_431_760, glosa: "0533219977 Transf. EDIFICIO LOS VI", doc: "016001391", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-06", monto: 2_430_357, glosa: "0533219977 Transf. EDIFICIO LOS VI", doc: "016001391", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-12", monto: 2_452_817, glosa: "0533219977 Transf. EDIFICIO LOS VI", doc: "016001395", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-26", monto: 1_027_223, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001402", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-26", monto: 903_938, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001402", cartolaMes: "Cartola N°25 (Mayo 2026)" },
  { fecha: "2026-05-27", monto: 276_351, glosa: "0608050000 DEV IMPUESTO TESORERIA", doc: "0", cartolaMes: "Cartola N°25 (Mayo 2026)" },

  // ============ JUNIO 2026 (Cartola oficial N°26: 29/05 - 30/06/2026) ============
  { fecha: "2026-06-01", monto: 7_447_842, glosa: "00781918873 30.05 NOMINA PAGO PROV", doc: "466674200", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-11", monto: 7_000_000, glosa: "Factura 41. PTEC CODIGO25PTECVR30", doc: "094278910", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-11", monto: 3_710_000, glosa: "Factura 41. PTEC CODIGO25PTECVR30", doc: "094278910", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-11", monto: 1_983_334, glosa: "0533192734 Transf de CODOMINIO PUE", doc: "0", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-15", monto: 7_542_028, glosa: "00781918873 Pago de Provee", doc: "469563714", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-16", monto: 2_483_824, glosa: "0533219977 Transf. EDIFICIO LOS VI", doc: "016001415", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-25", monto: 1_038_558, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001420", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-25", monto: 913_913, glosa: "0141831984 Transf. Cristian Eduard", doc: "016001420", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-26", monto: 5_000_000, glosa: "0760583634 Transf. COMERCIALIZADOR", doc: "001305015", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-26", monto: 5_000_000, glosa: "0760583634 Transf. COMERCIALIZADOR", doc: "001305014", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-26", monto: 5_000_000, glosa: "0760583634 Transf. COMERCIALIZADOR", doc: "001305014", cartolaMes: "Cartola N°26 (Junio 2026)" },
  { fecha: "2026-06-26", monto: 2_205_087, glosa: "0760583634 Transf. COMERCIALIZADOR", doc: "001305014", cartolaMes: "Cartola N°26 (Junio 2026)" },
];
