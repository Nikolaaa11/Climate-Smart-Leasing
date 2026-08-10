// ============================================================================
// ARCHIVO GENERADO — NO EDITAR A MANO
// ============================================================================
// Fuente:    0_Banco-Climate Smart.xlsx / hoja CC_BancoSantander
// Cuenta:    Santander N° 9427-8910
// Corte:     2026-08-06   ·   Generado: 2026-08-10
// Regenerar: python "0. generar_cuadro_maestro.py" && python "0. generar_plataforma.py"
//            desde "1. Desembolsos CSL"
//
// Reglas de normalizacion, bandas e invariantes:
//   "0. SUPER PROMPT - Cuadro Maestro Proyectos CSL.md"
// ============================================================================

export type BandaId = "A" | "B" | "C" | "D";

export interface Monto { n: string; v: number }

export interface Proyecto {
  nombre: string;
  banda: BandaId;
  tag: string;
  desc: string;
  egreso: number;
  abono: number;
  neto: number;
  ea: number;            // egreso del primer anio
  eb: number;            // egreso del segundo anio (parcial)
  delta: number;
  share: number;         // participacion en el egreso total
  movs: number;
  desde: string;
  hasta: string;
  contrapartes: Monto[];
  conceptos: Monto[];
  abonosTop: Monto[];
}

export interface Banda {
  id: BandaId;
  nombre: string;
  desc: string;
  egreso: number;
  abono: number;
  ea: number;
  eb: number;
  share: number;
  proyectos: string[];
}

export interface PivotRow {
  proyecto: string;
  banda: BandaId;
  cg: string;            // concepto general
  cd: string;            // concepto detallado
  a: number;
  b: number;
  total: number;
}


export const PROYECTOS_META = {
  fuente: "0_Banco-Climate Smart.xlsx / hoja CC_BancoSantander",
  cuenta: "Santander N° 9427-8910",
  corte: "2026-08-06",
  desde: "2025-01-06",
  anios: [
    2025,
    2026
  ],
  anioParcial: 2026,
  nota: "2026 es un anio parcial: los datos llegan hasta el corte.",
  generado: "2026-08-10"
};

export const PROYECTOS_KPIS = {
  egresoTotal: 1393021974.0,
  abonoTotal: 1394674346.0,
  egresoA: 761121997.0,
  egresoB: 631899977.0,
  abonoA: 794091507.0,
  abonoB: 600582839.0,
  carteraTotal: 1101116230.0,
  movimientos: 484,
  proyectos: 8
};

export const PROYECTOS_BANDAS: Banda[] = [
  {
    id: "A",
    nombre: "Cartera de proyectos",
    desc: "Inversión productiva real en los activos y desarrollos de la cartera.",
    egreso: 1101116230.0,
    abono: 273479329.0,
    ea: 532036505.0,
    eb: 569079725.0,
    share: 0.79045144,
    proyectos: [
      "Tratamiento Aguas Residuales",
      "Barranco Amarillo",
      "Opticept",
      "Calderas",
      "Flota",
      "Sensores",
      "PTEC",
      "Micronizador"
    ]
  },
  {
    id: "B",
    nombre: "Estructura",
    desc: "Costo de operar la sociedad: administración, honorarios, impuestos y operación.",
    egreso: 124404621.0,
    abono: 105383287.0,
    ea: 90943213.0,
    eb: 33461408.0,
    share: 0.08930557,
    proyectos: [
      "Corporativo"
    ]
  },
  {
    id: "C",
    nombre: "Vehículos y tesorería",
    desc: "Movimientos con el FIP y la AFIS más colocaciones. Netean cerca de cero: no son gasto.",
    egreso: 120230000.0,
    abono: 966852505.0,
    ea: 109090000.0,
    eb: 11140000.0,
    share: 0.08630876,
    proyectos: [
      "FIP",
      "AFIS",
      "Deposito a Plazo",
      "Contenedor"
    ]
  },
  {
    id: "D",
    nombre: "No asignado",
    desc: "Movimientos sin proyecto, anulaciones y errores de transferencia. Se muestra, no se esconde.",
    egreso: 47271123.0,
    abono: 48959225.0,
    ea: 29052279.0,
    eb: 18218844.0,
    share: 0.03393423,
    proyectos: [
      "(sin proyecto)"
    ]
  }
];

export const PROYECTOS: Proyecto[] = [
  {
    nombre: "Tratamiento Aguas Residuales",
    banda: "A",
    tag: "Axolot",
    desc: "Planta de tratamiento de aguas residuales. Ejecutan Ecoil, CICLA y Alister Ingeniería.",
    egreso: 332110409.0,
    abono: 15788002.0,
    neto: -316322407.0,
    ea: 116549791.0,
    eb: 215560618.0,
    delta: 99010827.0,
    share: 0.23841003,
    movs: 70,
    desde: "2025-01-06",
    hasta: "2026-06-15",
    contrapartes: [
      {
        n: "Ecoil",
        v: 154443600.0
      },
      {
        n: "CICLA SPA",
        v: 50000000.0
      },
      {
        n: "CICLA",
        v: 31650000.0
      },
      {
        n: "Alister ingenieria",
        v: 31351236.0
      },
      {
        n: "TS Swendish",
        v: 19683259.0
      }
    ],
    conceptos: [
      {
        n: "Estudios Técnicos",
        v: 305416528.0
      },
      {
        n: "Auditoria Técnica",
        v: 11730000.0
      },
      {
        n: "Honorario",
        v: 7332570.0
      },
      {
        n: "F29",
        v: 4631311.0
      }
    ],
    abonosTop: [
      {
        n: "Bebidas Funcionales Caelum",
        v: 10000000.0
      },
      {
        n: "CG METRICS",
        v: 5788002.0
      }
    ]
  },
  {
    nombre: "Barranco Amarillo",
    banda: "A",
    tag: "C-006",
    desc: "Leasing operativo de equipamiento provisto por Borman, con póliza HDI.",
    egreso: 295238127.0,
    abono: 168121125.0,
    neto: -127117002.0,
    ea: 0,
    eb: 295238127.0,
    delta: 295238127.0,
    share: 0.21194075,
    movs: 9,
    desde: "2026-04-28",
    hasta: "2026-07-06",
    contrapartes: [
      {
        n: "Borman",
        v: 289394434.0
      },
      {
        n: "HDI Seguros",
        v: 5843693.0
      }
    ],
    conceptos: [
      {
        n: "Leasing Operativo",
        v: 289394434.0
      },
      {
        n: "Poliza",
        v: 5843693.0
      }
    ],
    abonosTop: [
      {
        n: "Barranco Amarillo",
        v: 168121125.0
      }
    ]
  },
  {
    nombre: "Opticept",
    banda: "A",
    tag: "CEPT6",
    desc: "Equipo ODIN de OptiCept adquirido a TS Swedish.",
    egreso: 221694958.0,
    abono: 0.0,
    neto: -221694958.0,
    ea: 221694958.0,
    eb: 0,
    delta: -221694958.0,
    share: 0.15914678,
    movs: 15,
    desde: "2025-03-04",
    hasta: "2025-06-23",
    contrapartes: [
      {
        n: "TS Swedish",
        v: 218056180.0
      },
      {
        n: "Scientific Lab",
        v: 1654100.0
      },
      {
        n: "Yalitech",
        v: 1298424.0
      },
      {
        n: "Ts Swedish",
        v: 686254.0
      }
    ],
    conceptos: [
      {
        n: "Estudios Técnicos",
        v: 221694958.0
      }
    ],
    abonosTop: []
  },
  {
    nombre: "Calderas",
    banda: "A",
    tag: "C-001 / C-002",
    desc: "Calderas Geist arrendadas a Puerta Patagonia y Edificio Los Vikingos.",
    egreso: 127803676.0,
    abono: 50540784.0,
    neto: -77262892.0,
    ea: 86291348.0,
    eb: 41512328.0,
    delta: -44779020.0,
    share: 0.09174563,
    movs: 26,
    desde: "2025-12-05",
    hasta: "2026-08-03",
    contrapartes: [
      {
        n: "Geist",
        v: 96090106.0
      },
      {
        n: "Geist Falta Factura por emitir",
        v: 20000000.0
      },
      {
        n: "Pago Factura por emitir Geist",
        v: 11713570.0
      }
    ],
    conceptos: [
      {
        n: "Estudios Técnicos",
        v: 116090106.0
      },
      {
        n: "Servicios de Monitoreo",
        v: 11713570.0
      }
    ],
    abonosTop: [
      {
        n: "EDIFICIO LOS VIKINGOS",
        v: 32291065.0
      },
      {
        n: "PUERTA PATAGONIA",
        v: 16266385.0
      },
      {
        n: "Puerta Patagonia",
        v: 1983334.0
      }
    ]
  },
  {
    nombre: "Flota",
    banda: "A",
    tag: "C-004 / C-005",
    desc: "Flota Volvo EX30 en arriendo operativo a SCG SpA.",
    egreso: 71799999.0,
    abono: 39029418.0,
    neto: -32770581.0,
    ea: 71799999.0,
    eb: 0.0,
    delta: -71799999.0,
    share: 0.05154262,
    movs: 36,
    desde: "2025-01-27",
    hasta: "2026-07-28",
    contrapartes: [
      {
        n: "Automotriz",
        v: 71799999.0
      }
    ],
    conceptos: [
      {
        n: "Estudios Técnicos",
        v: 71799999.0
      }
    ],
    abonosTop: [
      {
        n: "Contrato flota 1 SCG",
        v: 23501144.0
      },
      {
        n: "Contrato flota 2 SCG",
        v: 15528274.0
      }
    ]
  },
  {
    nombre: "Sensores",
    banda: "A",
    tag: "Geist",
    desc: "Instrumentación y sensórica provista por Geist.",
    egreso: 26677681.0,
    abono: 0.0,
    neto: -26677681.0,
    ea: 26677681.0,
    eb: 0,
    delta: -26677681.0,
    share: 0.01915094,
    movs: 7,
    desde: "2025-02-14",
    hasta: "2025-04-01",
    contrapartes: [
      {
        n: "Geist",
        v: 26677681.0
      }
    ],
    conceptos: [
      {
        n: "Estudios Técnicos",
        v: 26677681.0
      }
    ],
    abonosTop: []
  },
  {
    nombre: "PTEC",
    banda: "A",
    tag: "Coejecución",
    desc: "Servicios de monitoreo con Alerce Nanobiotecnología y Scientific Lab.",
    egreso: 16768652.0,
    abono: 0.0,
    neto: -16768652.0,
    ea: 0,
    eb: 16768652.0,
    delta: 16768652.0,
    share: 0.01203761,
    movs: 3,
    desde: "2026-07-29",
    hasta: "2026-07-30",
    contrapartes: [
      {
        n: "Alerce Nanobiotecnología",
        v: 11543000.0
      },
      {
        n: "Scientific Lab",
        v: 5225652.0
      }
    ],
    conceptos: [
      {
        n: "Servicios de Monitoreo",
        v: 16768652.0
      }
    ],
    abonosTop: []
  },
  {
    nombre: "Micronizador",
    banda: "A",
    tag: "Piloto",
    desc: "Desarrollo y auditoría técnica del micronizador.",
    egreso: 9022728.0,
    abono: 0.0,
    neto: -9022728.0,
    ea: 9022728.0,
    eb: 0,
    delta: -9022728.0,
    share: 0.00647709,
    movs: 15,
    desde: "2025-02-14",
    hasta: "2025-09-08",
    contrapartes: [
      {
        n: "TSST Energy",
        v: 3008930.0
      },
      {
        n: "Sebastián Briones",
        v: 2838196.0
      },
      {
        n: "Daniela Nuñez",
        v: 933600.0
      },
      {
        n: "Tiare Medina",
        v: 820000.0
      },
      {
        n: "F29 Febrero 2025",
        v: 574606.0
      }
    ],
    conceptos: [
      {
        n: "Estudios Técnicos",
        v: 3942530.0
      },
      {
        n: "Auditoria Técnica",
        v: 2838196.0
      },
      {
        n: "F29",
        v: 872001.0
      },
      {
        n: "Honorario",
        v: 820000.0
      }
    ],
    abonosTop: []
  },
  {
    nombre: "Corporativo",
    banda: "B",
    tag: "Estructura",
    desc: "Contabilidad, legal, arriendo, marketing e impuestos de la sociedad.",
    egreso: 124404621.0,
    abono: 105383287.0,
    neto: -19021334.0,
    ea: 90943213.0,
    eb: 33461408.0,
    delta: -57481805.0,
    share: 0.08930557,
    movs: 213,
    desde: "2025-01-13",
    hasta: "2026-08-06",
    contrapartes: [
      {
        n: "Inversión en Fondo Mutuo",
        v: 60000000.0
      },
      {
        n: "RESIN POLIMERS",
        v: 15484578.0
      },
      {
        n: "Erick Mendez",
        v: 8970710.0
      },
      {
        n: "MCG",
        v: 6238763.0
      },
      {
        n: "Amortización Periódica LCA",
        v: 5062751.0
      }
    ],
    conceptos: [
      {
        n: "Inv. Fondo Mutuo",
        v: 60000000.0
      },
      {
        n: "Resin Polimers",
        v: 15484578.0
      },
      {
        n: "Honorario",
        v: 11868710.0
      },
      {
        n: "Asesoría Contable",
        v: 6460661.0
      }
    ],
    abonosTop: [
      {
        n: "Depósito en Efectivo",
        v: 81635568.0
      },
      {
        n: "RESIN POLIMERS",
        v: 17205087.0
      },
      {
        n: "Traspaso con la Cuenta",
        v: 6163179.0
      }
    ]
  },
  {
    nombre: "FIP",
    banda: "C",
    tag: "FIP CEHTA ESG",
    desc: "Aportes de capital del Fondo más un puente de liquidez de $60MM ya devuelto.",
    egreso: 60230000.0,
    abono: 741006772.0,
    neto: 680776772.0,
    ea: 49090000.0,
    eb: 11140000.0,
    delta: -37950000.0,
    share: 0.04323693,
    movs: 20,
    desde: "2025-04-03",
    hasta: "2026-04-28",
    contrapartes: [
      {
        n: "FIP Cehta",
        v: 60000000.0
      },
      {
        n: "Pago OT Pendiente 11.927.397-8 EVALDO DANIEL",
        v: 140000.0
      },
      {
        n: "Juan Enrique",
        v: 90000.0
      }
    ],
    conceptos: [
      {
        n: "Reconocimiento de Deuda",
        v: 60000000.0
      },
      {
        n: "(sin detalle)",
        v: 140000.0
      },
      {
        n: "Notarias",
        v: 90000.0
      }
    ],
    abonosTop: [
      {
        n: "FIP Cehta",
        v: 358033596.0
      },
      {
        n: "Depósito Documento Otros Bancos",
        v: 213466566.0
      },
      {
        n: "Depósito Documento Otros Bancos FIP",
        v: 169506610.0
      }
    ]
  },
  {
    nombre: "AFIS",
    banda: "C",
    tag: "Administradora",
    desc: "Préstamo puente de $60MM: entra y sale completo, neto cero.",
    egreso: 60000000.0,
    abono: 60000000.0,
    neto: 0.0,
    ea: 60000000.0,
    eb: 0.0,
    delta: -60000000.0,
    share: 0.04307183,
    movs: 13,
    desde: "2025-05-19",
    hasta: "2026-01-06",
    contrapartes: [
      {
        n: "AFIS Prestamo",
        v: 60000000.0
      }
    ],
    conceptos: [
      {
        n: "Reconocimiento de Deuda",
        v: 60000000.0
      }
    ],
    abonosTop: [
      {
        n: "AFIS Prestamo",
        v: 50050000.0
      },
      {
        n: "AFIS",
        v: 9950000.0
      }
    ]
  },
  {
    nombre: "Deposito a Plazo",
    banda: "C",
    tag: "Tesorería",
    desc: "Rescates de fondos mutuos.",
    egreso: 0.0,
    abono: 160847733.0,
    neto: 160847733.0,
    ea: 0.0,
    eb: 0,
    delta: 0.0,
    share: 0.0,
    movs: 11,
    desde: "2025-01-27",
    hasta: "2025-08-14",
    contrapartes: [],
    conceptos: [],
    abonosTop: [
      {
        n: "Rescate Fondos Mutuos",
        v: 160847733.0
      }
    ]
  },
  {
    nombre: "Contenedor",
    banda: "C",
    tag: "Menor",
    desc: "Un único abono de CICLA SpA.",
    egreso: 0.0,
    abono: 4998000.0,
    neto: 4998000.0,
    ea: 0.0,
    eb: 0,
    delta: 0.0,
    share: 0.0,
    movs: 1,
    desde: "2025-10-22",
    hasta: "2025-10-22",
    contrapartes: [],
    conceptos: [],
    abonosTop: [
      {
        n: "CICLA SPA",
        v: 4998000.0
      }
    ]
  },
  {
    nombre: "(sin proyecto)",
    banda: "D",
    tag: "Por etiquetar",
    desc: "Fondos a rendir, transferencias rechazadas y anulaciones sin proyecto asignado.",
    egreso: 47271123.0,
    abono: 48959225.0,
    neto: 1688102.0,
    ea: 29052279.0,
    eb: 18218844.0,
    delta: -10833435.0,
    share: 0.03393423,
    movs: 45,
    desde: "2025-01-27",
    hasta: "2026-07-27",
    contrapartes: [
      {
        n: "Monto Rechazado $10,710,000 Aprobado $2,166,",
        v: 10710000.0
      },
      {
        n: "Fondoarendircajachica2 Juan Pablo",
        v: 5000000.0
      },
      {
        n: "Fondo a rendir caja chica 11 Juan Pablo Gonz",
        v: 4998000.0
      },
      {
        n: "Juan Pablo Gonzalez",
        v: 3417424.0
      },
      {
        n: "Fondoarendircajachica1 Juan Pablo",
        v: 3000000.0
      }
    ],
    conceptos: [
      {
        n: "(sin detalle)",
        v: 32552367.0
      },
      {
        n: "Error de Transferencia",
        v: 10710000.0
      },
      {
        n: "Honorario",
        v: 2118750.0
      },
      {
        n: "Anulación",
        v: 1699381.0
      }
    ],
    abonosTop: [
      {
        n: "REVTECH Pago cuota 1 Comprobante de ingreso",
        v: 21000000.0
      },
      {
        n: "Bebidas Funcionales Caelum",
        v: 10825000.0
      },
      {
        n: "PTEC CODIGO25PTECVR30 Monto Rechazado de $12",
        v: 10710000.0
      }
    ]
  }
];

export const PROYECTOS_PIVOT: PivotRow[] = [
  {
    proyecto: "Tratamiento Aguas Residuales",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Estudios Técnicos",
    a: 90262928.0,
    b: 215153600.0,
    total: 305416528.0
  },
  {
    proyecto: "Barranco Amarillo",
    banda: "A",
    cg: "Operación",
    cd: "Leasing Operativo",
    a: 0.0,
    b: 289394434.0,
    total: 289394434.0
  },
  {
    proyecto: "Opticept",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Estudios Técnicos",
    a: 221694958.0,
    b: 0.0,
    total: 221694958.0
  },
  {
    proyecto: "Calderas",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Estudios Técnicos",
    a: 86291348.0,
    b: 29798758.0,
    total: 116090106.0
  },
  {
    proyecto: "Flota",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Estudios Técnicos",
    a: 71799999.0,
    b: 0.0,
    total: 71799999.0
  },
  {
    proyecto: "Sensores",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Estudios Técnicos",
    a: 26677681.0,
    b: 0.0,
    total: 26677681.0
  },
  {
    proyecto: "PTEC",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Servicios de Monitoreo",
    a: 0.0,
    b: 16768652.0,
    total: 16768652.0
  },
  {
    proyecto: "Tratamiento Aguas Residuales",
    banda: "A",
    cg: "Administración",
    cd: "Auditoria Técnica",
    a: 11730000.0,
    b: 0.0,
    total: 11730000.0
  },
  {
    proyecto: "Calderas",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Servicios de Monitoreo",
    a: 0.0,
    b: 11713570.0,
    total: 11713570.0
  },
  {
    proyecto: "Tratamiento Aguas Residuales",
    banda: "A",
    cg: "Recurso_Humano",
    cd: "Honorario",
    a: 7332570.0,
    b: 0.0,
    total: 7332570.0
  },
  {
    proyecto: "Barranco Amarillo",
    banda: "A",
    cg: "Operación",
    cd: "Poliza",
    a: 0.0,
    b: 5843693.0,
    total: 5843693.0
  },
  {
    proyecto: "Tratamiento Aguas Residuales",
    banda: "A",
    cg: "Administración",
    cd: "F29",
    a: 3975631.0,
    b: 407018.0,
    total: 4382649.0
  },
  {
    proyecto: "Micronizador",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Estudios Técnicos",
    a: 3942530.0,
    b: 0.0,
    total: 3942530.0
  },
  {
    proyecto: "Micronizador",
    banda: "A",
    cg: "Administración",
    cd: "Auditoria Técnica",
    a: 2838196.0,
    b: 0.0,
    total: 2838196.0
  },
  {
    proyecto: "Tratamiento Aguas Residuales",
    banda: "A",
    cg: "Administración",
    cd: "Asesorías",
    a: 2400000.0,
    b: 0.0,
    total: 2400000.0
  },
  {
    proyecto: "Micronizador",
    banda: "A",
    cg: "Administración",
    cd: "F29",
    a: 872001.0,
    b: 0.0,
    total: 872001.0
  },
  {
    proyecto: "Micronizador",
    banda: "A",
    cg: "Recurso_Humano",
    cd: "Honorario",
    a: 820000.0,
    b: 0.0,
    total: 820000.0
  },
  {
    proyecto: "Tratamiento Aguas Residuales",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Análisis Operacional",
    a: 600000.0,
    b: 0.0,
    total: 600000.0
  },
  {
    proyecto: "Micronizador",
    banda: "A",
    cg: "Desarrollo_Proyecto",
    cd: "Análisis Operacional",
    a: 550001.0,
    b: 0.0,
    total: 550001.0
  },
  {
    proyecto: "Tratamiento Aguas Residuales",
    banda: "A",
    cg: "Operación",
    cd: "F29",
    a: 248662.0,
    b: 0.0,
    total: 248662.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Financiamiento",
    cd: "Inv. Fondo Mutuo",
    a: 60000000.0,
    b: 0.0,
    total: 60000000.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Cliente",
    cd: "Resin Polimers",
    a: 0.0,
    b: 15484578.0,
    total: 15484578.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Recurso_Humano",
    cd: "Honorario",
    a: 9083510.0,
    b: 2785200.0,
    total: 11868710.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "Asesoría Contable",
    a: 3465716.0,
    b: 2994945.0,
    total: 6460661.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "Amortización L/C",
    a: 5062751.0,
    b: 0.0,
    total: 5062751.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "Asesorías",
    a: 0.0,
    b: 4422017.0,
    total: 4422017.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Operación",
    cd: "Gasto Operacional",
    a: 4130927.0,
    b: 0.0,
    total: 4130927.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "F29",
    a: 2513529.0,
    b: 1373504.0,
    total: 3887033.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Operación",
    cd: "Sello B",
    a: 0.0,
    b: 2331962.0,
    total: 2331962.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Operación",
    cd: "Arriendo",
    a: 2180645.0,
    b: 0.0,
    total: 2180645.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Operación",
    cd: "Redes sociales",
    a: 669951.0,
    b: 1101071.0,
    total: 1771022.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Operación",
    cd: "Viáticos",
    a: 1649636.0,
    b: 0.0,
    total: 1649636.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "PPM",
    a: 0.0,
    b: 1646281.0,
    total: 1646281.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Operación",
    cd: "Poliza",
    a: 564249.0,
    b: 191412.0,
    total: 755661.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "Mantención Plan",
    a: 464440.0,
    b: 277771.0,
    total: 742211.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "Abogados",
    a: 0.0,
    b: 717151.0,
    total: 717151.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Desarrollo_Proyecto",
    cd: "Estudios Técnicos",
    a: 582220.0,
    b: 0.0,
    total: 582220.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Operación",
    cd: "Costo Operativo",
    a: 504155.0,
    b: 0.0,
    total: 504155.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "Retención Ley 21133",
    a: 0.0,
    b: 110716.0,
    total: 110716.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "CBR",
    a: 7500.0,
    b: 24800.0,
    total: 32300.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "Notarias",
    a: 31800.0,
    b: 0.0,
    total: 31800.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "Interés Linea de Credito",
    a: 29068.0,
    b: 0.0,
    total: 29068.0
  },
  {
    proyecto: "Corporativo",
    banda: "B",
    cg: "Administración",
    cd: "Impuesto Sobre Giro",
    a: 3116.0,
    b: 0.0,
    total: 3116.0
  },
  {
    proyecto: "AFIS",
    banda: "C",
    cg: "Financiamiento",
    cd: "Reconocimiento de Deuda",
    a: 60000000.0,
    b: 0.0,
    total: 60000000.0
  },
  {
    proyecto: "FIP",
    banda: "C",
    cg: "Financiamiento",
    cd: "Reconocimiento de Deuda",
    a: 49000000.0,
    b: 11000000.0,
    total: 60000000.0
  },
  {
    proyecto: "FIP",
    banda: "C",
    cg: "Administración",
    cd: "(sin detalle)",
    a: 0.0,
    b: 140000.0,
    total: 140000.0
  },
  {
    proyecto: "FIP",
    banda: "C",
    cg: "Administración",
    cd: "Notarias",
    a: 90000.0,
    b: 0.0,
    total: 90000.0
  },
  {
    proyecto: "(sin proyecto)",
    banda: "D",
    cg: "(sin concepto)",
    cd: "(sin detalle)",
    a: 27869621.0,
    b: 3582318.0,
    total: 31451939.0
  },
  {
    proyecto: "(sin proyecto)",
    banda: "D",
    cg: "Nula",
    cd: "Error de Transferencia",
    a: 0.0,
    b: 10710000.0,
    total: 10710000.0
  },
  {
    proyecto: "(sin proyecto)",
    banda: "D",
    cg: "Recurso_Humano",
    cd: "Honorario",
    a: 0.0,
    b: 2118750.0,
    total: 2118750.0
  },
  {
    proyecto: "(sin proyecto)",
    banda: "D",
    cg: "Nula",
    cd: "Anulación",
    a: 82230.0,
    b: 1617151.0,
    total: 1699381.0
  },
  {
    proyecto: "(sin proyecto)",
    banda: "D",
    cg: "Operación",
    cd: "(sin detalle)",
    a: 1100428.0,
    b: 0.0,
    total: 1100428.0
  },
  {
    proyecto: "(sin proyecto)",
    banda: "D",
    cg: "Administración",
    cd: "F29",
    a: 0.0,
    b: 190625.0,
    total: 190625.0
  }
];

export const PROYECTOS_CORFO = {
  valorAccion: 372542,
  enBanco: [
    {
      fecha: "2025-05-13",
      monto: 213466566.0
    },
    {
      fecha: "2025-11-28",
      monto: 169506610.0
    },
    {
      fecha: "2026-03-27",
      monto: 298033596.0
    }
  ],
  totalEnBanco: 681006772.0,
  hitos: [
    {
      hito: "1",
      acciones: 1146,
      plan: "30-08-2024",
      teorico: 426933132
    },
    {
      hito: "2",
      acciones: 573,
      plan: "12-05-2025",
      teorico: 213466566
    },
    {
      hito: "3",
      acciones: 455,
      plan: "01-12-2025",
      teorico: 169506610
    },
    {
      hito: "4",
      acciones: 800,
      plan: "feb-2026",
      teorico: 298033600
    }
  ]
};

export const PROYECTOS_CONTROL = {
  filasLeidas: 609,
  filasValidas: 484,
  filasExcluidas: 125,
  sinProyecto: {
    movs: 45,
    egreso: 47271123.0,
    abono: 48959225.0
  },
  cajaChica: {
    movs: 10,
    egreso: 25998000.0
  },
  nula: {
    movs: 11,
    egreso: 12409381.0
  },
  mayoresSinProyecto: [
    {
      fila: 438,
      fecha: "2026-06-11",
      desc: "Monto Rechazado $10,710,000 Aprobado $2,166,350",
      egreso: 10710000.0
    },
    {
      fila: 166,
      fecha: "2025-06-09",
      desc: "Fondoarendircajachica2 Juan Pablo",
      egreso: 5000000.0
    },
    {
      fila: 284,
      fecha: "2025-10-24",
      desc: "Fondo a rendir caja chica 11 Juan Pablo Gonzalez",
      egreso: 4998000.0
    },
    {
      fila: 140,
      fecha: "2025-05-15",
      desc: "Fondoarendircajachica1 Juan Pablo",
      egreso: 3000000.0
    },
    {
      fila: 188,
      fecha: "2025-06-26",
      desc: "Fondo a rendir caja chica 6 Juan Pablo",
      egreso: 2500000.0
    },
    {
      fila: 186,
      fecha: "2025-06-23",
      desc: "Fondoarendircajachica5 Juan Pablo",
      egreso: 2250000.0
    },
    {
      fila: 185,
      fecha: "2025-06-23",
      desc: "Fondoarendircajachica4 Juan Pablo",
      egreso: 2000000.0
    },
    {
      fila: 414,
      fecha: "2026-05-06",
      desc: "Reintegro Invoice Inter No. 252748 y 252749 Juan Gonzalez 16,286,068-2",
      egreso: 1917633.0
    },
    {
      fila: 229,
      fecha: "2025-08-11",
      desc: "Fondo a rendir caja chica 7 Juan Pablo Gonzalez",
      egreso: 1750000.0
    },
    {
      fila: 247,
      fecha: "2025-08-29",
      desc: "Fondo a rendir caja chica 10 Juan Pablo",
      egreso: 1750000.0
    }
  ]
};
