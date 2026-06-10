// CSL — Master contract data
// All values verified against source PDFs in /mnt/project/

export const IVA = 0.19;

export type EstadoObra = "en-ejecucion" | "recepcion-provisoria" | "recepcion-definitiva";

export interface HitoRecepcion {
  tipo: "provisoria" | "definitiva";
  fecha: string;      // ISO date
  firmante: string;
  doc: string;
}

export interface PendienteObra {
  item: string;
  resuelto: boolean;
  nota?: string;
}

export interface Contract {
  id: string;
  proyecto: string;
  cliente: string;
  rutCliente: string;
  rutPagadorBanco: string; // RUT as it appears in cartola movements (no dots, no DV separator if applicable)
  repLegal: string;
  direccion: string;
  fechaFirma: string;       // ISO date
  fechaInicioPagos: string; // ISO date — first scheduled cuota
  monedaRenta: "UF" | "CLP";
  rentaUf?: number;
  rentaUfPrimera?: number;
  rentaClpNeta?: number;
  nCuotas: number;
  anticipoTotal?: number;
  anticipoNCuotas?: number;
  anticipoCuota?: number;
  ivaIncluido: boolean;  // anticipo or rent already includes IVA?
  vigenciaMeses: number;
  facturacionDia: string;
  plazoPagoDias: string;
  interesMora: string;
  cuentaDestino: string;
  docFuente: string;
  obs: string;
  // Hitos de recepción de obra (opcional — sólo proyectos de instalación)
  estadoObra?: EstadoObra;
  recepciones?: HitoRecepcion[];
  pendientesObra?: PendienteObra[];
}

export const CONTRACTS: Contract[] = [
  {
    id: "C-001",
    proyecto: "Puerta Patagonia (Vilanova)",
    cliente: "Comunidad Edificio Puerta Patagonia Habitacional",
    rutCliente: "53.319.273-4",
    rutPagadorBanco: "0533192734",
    repLegal: "Juan Moisés González Muñoz (RUT 12.436.839-1)",
    direccion: "Vilanova 250, Las Condes, Región Metropolitana",
    fechaFirma: "2025-10-24",
    fechaInicioPagos: "2026-03-06", // 1ª renta facturada en marzo 2026 (pagada 18/03/2026) — confirmado contra facturas SII reales
    monedaRenta: "UF",
    rentaUf: 67.127,
    nCuotas: 36,
    anticipoTotal: 10_000_000,
    anticipoNCuotas: 6,
    anticipoCuota: 1_666_667,
    ivaIncluido: false,
    vigenciaMeses: 36,
    facturacionDia: "Dentro de los 5 primeros días hábiles de cada mes",
    plazoPagoDias: "30 días corridos desde recepción de factura",
    interesMora: "Interés máximo convencional",
    cuentaDestino: "Banco Santander Cta. Cte. N° 9427-8910",
    docFuente: "Contrato_Comunidad.pdf (24/10/2025) — protocolizado en Contrato_firmado__Vilanova.pdf y Contrato_firmado__Geist_1_VILANOVA.pdf (02/12/2025). Los 3 PDFs son el MISMO contrato.",
    obs: "Renta: 67,127 UF + IVA × 36 cuotas, facturadas desde marzo-2026 (facturas N°52, 64, 69...). Anticipo: $10.000.000 + IVA facturado en 6 facturas mensuales INDEPENDIENTES de $1.666.667 + IVA c/u, dic-2025 → may-2026 (facturas N°43, 47, 53, 63 + 2 anteriores). Facturación real confirmada contra PDFs SII el 10/06/2026. Partner instalador: Servicios de Ingeniería Geist SpA (RUT 77.275.038-2). Equipos: 2× Bombas de Calor Powerworld Air Heat Pump 60 kW R290 + 2× sistemas de recirculación Friwasta Z-60-K + 4× estanques de inercia 1.700L + sistema de bombeo + tablero eléctrico de fuerza y control con monitoreo PHI.",
    estadoObra: "recepcion-definitiva",
    recepciones: [
      {
        tipo: "provisoria",
        fecha: "2026-03-17",
        firmante: "Sebastián Esteban Lorca Tapia (Representante Comunidad)",
        doc: "Carta Recepción Provisoria de Obra (17/03/2026) — activa pago de cuotas 1 en adelante",
      },
      {
        tipo: "definitiva",
        fecha: "2026-04-08",
        firmante: "Juan González Muñoz (Administrador Comunidad)",
        doc: "Carta Recepción Definitiva de Obra (08/04/2026) — obra recepcionada en su totalidad, sin observaciones",
      },
    ],
    pendientesObra: [
      { item: "Instalación de reja perimetral de seguridad del área de equipos", resuelto: true, nota: "Confirmada como completada en la recepción definitiva." },
      { item: "Certificación SEC del tablero eléctrico y componentes del sistema", resuelto: true, nota: "Confirmada como completada en la recepción definitiva." },
      { item: "Bomba de calor en observación por falla (a subsanar en garantía)", resuelto: true, nota: "Recepción definitiva declara el sistema operativo sin observaciones pendientes." },
      { item: "Prueba del sistema de agua caliente para calefacción", resuelto: true, nota: "Recepción definitiva verifica cumplimiento total del alcance de obra." },
      { item: "Conexión del sistema al grupo electrógeno del edificio", resuelto: true, nota: "Recepción definitiva declara el sistema en servicio sin observaciones." },
    ],
  },
  {
    id: "C-002",
    proyecto: "Vikingos",
    cliente: "Comunidad Edificio Los Vikingos",
    rutCliente: "53.321.997-7",
    rutPagadorBanco: "0533219977",
    repLegal: "María Pilar Alliende Wielandt (RUT 7.011.710-K)",
    direccion: "Los Vikingos 6444, Las Condes, Región Metropolitana",
    fechaFirma: "2026-01-23",
    fechaInicioPagos: "2026-04-01",
    monedaRenta: "UF",
    rentaUf: 51.29,
    nCuotas: 24,
    anticipoTotal: 20_000_000,
    anticipoNCuotas: 1,
    anticipoCuota: 20_000_000,
    ivaIncluido: true,
    vigenciaMeses: 24,
    facturacionDia: "Dentro de los 5 primeros días hábiles de cada mes",
    plazoPagoDias: "15 días corridos desde emisión de factura",
    interesMora: "Interés máximo convencional + bloqueo/suspensión tras 10 días hábiles de mora",
    cuentaDestino: "Banco Santander Cta. Cte. N° 9427-8910",
    docFuente: "CONTRATO_PROYECTO_DE_SOLUCION_VIKINGOS2_6906770_1.pdf",
    obs: "Anticipo: $20.000.000 IVA incluido en UNA cuota para dar inicio a los trabajos. ⚠️ El contrato indica RUT 53.319.273-4 (idéntico a Puerta Patagonia) — corresponde a error de transcripción. El RUT verificado en cartola Mayo/2026 es 53.321.997-7. Confirmar y emitir adenda al contrato.",
  },
  {
    id: "C-003",
    proyecto: "Trongkai",
    cliente: "Agrotecnologías e Ingeniería SpA",
    rutCliente: "77.221.203-8",
    rutPagadorBanco: "0772212038",
    repLegal: "José Cuevas Valenzuela (RUT 15.354.775-0)",
    direccion: "Parral, sector Talquita, Región del Maule (operación) — 1 Sur N° 690 Of. 815, Talca (administrativo)",
    fechaFirma: "2025-12-05",
    fechaInicioPagos: "2026-05-01",
    monedaRenta: "CLP",
    rentaClpNeta: 400_000,
    nCuotas: 8,
    anticipoTotal: 0,
    anticipoNCuotas: 0,
    anticipoCuota: 0,
    ivaIncluido: false,
    vigenciaMeses: 60,
    facturacionDia: "Comunicación de horas vía correo último día hábil del mes vencido (esquema 2027+)",
    plazoPagoDias: "Por confirmar (contrato no detalla)",
    interesMora: "Término anticipado del contrato por retraso > 60 días corridos",
    cuentaDestino: "Por confirmar (contrato no especifica)",
    docFuente: "CONTRATO_DE_Arrendamiento_equipo_Electroporación_CSLTrongkai__Rev_3_JP_JCV.pdf",
    obs: "Equipo: ODIN de Opticept Technologies AB (Suecia) — capacidad 4 m³/h. Entregado físicamente 01/03/2026 en instalaciones RASOIL Talca. Cuota fija $400.000 netos/mes desde 01/05/2026 hasta 31/12/2026 (8 cuotas). Desde 01/01/2027: tarifa por hora escalonada (75k → 4.688 $/h). El modelo de tarifa horaria 2027+ NO se modela en este sistema.",
  },
  {
    id: "C-004",
    proyecto: "Flota 1 (Volvo EX30 PLUS)",
    cliente: "SCG SPA",
    rutCliente: "78.096.656-4",
    rutPagadorBanco: "0141831984",  // Cristian Eduardo Allende Tapia
    repLegal: "Cristian Eduardo Allende Tapia (RUT 14.183.198-4)",
    direccion: "Cólico, Camino a Maqueuto km 4, Hualqui, Región del Biobío",
    fechaFirma: "2025-01-27",
    fechaInicioPagos: "2025-02-21",
    monedaRenta: "UF",
    rentaUf: 25.58,
    rentaUfPrimera: 82.86,
    nCuotas: 48,
    anticipoTotal: 0,
    anticipoNCuotas: 0,
    anticipoCuota: 0,
    ivaIncluido: false,
    vigenciaMeses: 48,
    facturacionDia: "Día 21 de cada mes desde 01/02/2025",
    plazoPagoDias: "15 días corridos desde emisión",
    interesMora: "Reajuste por UF",
    cuentaDestino: "Banco Santander Cta. Cte. N° 9427-8910",
    docFuente: "Contrato_firmado__Flota_1.pdf",
    obs: "Leasing con opción de compra. Vehículo Volvo EX30 PLUS 100% Eléctrico, nuevo. Proveedor: Automotriz Cordillera S.A. Primera renta (82,86 UF) pagada al firmar; cuotas regulares de 25,58 UF + IVA. El pagador es Cristian Eduardo (representante legal de SCG) desde su cuenta personal.",
  },
  {
    id: "C-005",
    proyecto: "Flota 2 (Volvo EX30 CORE)",
    cliente: "SCG SPA",
    rutCliente: "78.096.656-4",
    rutPagadorBanco: "0141831984",
    repLegal: "Cristian Eduardo Allende Tapia (RUT 14.183.198-4)",
    direccion: "Cólico, Camino a Maqueuto km 4, Hualqui, Región del Biobío",
    fechaFirma: "2025-05-12",
    fechaInicioPagos: "2025-06-21",
    monedaRenta: "UF",
    rentaUf: 22.93,
    rentaUfPrimera: 70.91,
    nCuotas: 48,
    anticipoTotal: 0,
    anticipoNCuotas: 0,
    anticipoCuota: 0,
    ivaIncluido: false,
    vigenciaMeses: 48,
    facturacionDia: "Día 21 de cada mes desde 01/06/2025",
    plazoPagoDias: "15 días corridos desde emisión",
    interesMora: "Reajuste por UF",
    cuentaDestino: "Banco Santander Cta. Cte. N° 9427-8910",
    docFuente: "Contrato_firmado__Flota_2.pdf",
    obs: "Leasing con opción de compra. Vehículo Volvo EX30 CORE E60 100% Eléctrico, nuevo, patente SR GY 82. Proveedor: Automotriz Cordillera S.A. Mismo cliente y pagador que Flota 1.",
  },
  {
    id: "C-006",
    proyecto: "Barranco Amarillo",
    cliente: "Procesadora Barranco Amarillo SpA",
    rutCliente: "78.191.887-3",
    rutPagadorBanco: "0781918873",
    repLegal: "Washington Gilberto Borquez Mansilla (RUT 9.304.236-0)",
    direccion: "Rodolfo Novoa Barría 08260, Barranco Amarillo, Punta Arenas, Región de Magallanes",
    fechaFirma: "2026-05-04",
    fechaInicioPagos: "2026-05-05",
    monedaRenta: "UF",
    rentaUf: 155.74,
    rentaUfPrimera: 183,
    nCuotas: 24,
    ivaIncluido: false,
    vigenciaMeses: 24,
    facturacionDia: "Mensualidades anticipadas, dentro de los primeros 5 días de cada mes",
    plazoPagoDias: "Anticipado (primeros 5 días del mes)",
    interesMora: "Interés penal 1,5% mensual",
    cuentaDestino: "Banco Santander Cta. Cte. N° 9427-8910",
    docFuente: "Contrato firmado. Barranco Amarillo.pdf (firma electrónica avanzada Juan Pablo González Jaramillo, 04/05/2026).",
    obs: "Contrato de arrendamiento de equipos usados/reacondicionados, plazo fijo 24 meses (término 05/04/2028). Pago inicial 183 UF + IVA al firmar + 24 cuotas mensuales de 155,74 UF + IVA (anticipadas, 05/05/2026 → 05/04/2028), reajuste por UF. Equipos: Generador de hielo en escama 10 TON/24h (ICEMTS MIFE-HT, R507), Máquina Baader Ba200, Unidad condensadora ICEMTS 10 TONS (2× compresores Bock HGX66E + condensador HCV6304) y tablero eléctrico de fuerza (Siemens TP700 Comfort / PLC S7-1200). RUT pagador por verificar contra cartola.",
  },
  {
    id: "C-007",
    proyecto: "Axopur 1",
    cliente: "Por confirmar",
    rutCliente: "Por confirmar",
    rutPagadorBanco: "Por confirmar",
    repLegal: "Por confirmar",
    direccion: "Por confirmar",
    fechaFirma: "2026-05-03",
    fechaInicioPagos: "2026-06-01",
    monedaRenta: "UF",
    rentaUf: 22.66,
    nCuotas: 48,
    ivaIncluido: false,
    vigenciaMeses: 48,
    facturacionDia: "Por confirmar",
    plazoPagoDias: "Por confirmar",
    interesMora: "Por confirmar",
    cuentaDestino: "Banco Santander Cta. Cte. N° 9427-8910",
    docFuente: "Proyecto Leasing 1. Axopur 1. Rev 1.xlsx (modelo de negocio / caso de negocio, SIN contrato firmado).",
    obs: "⚠️ MODELO DE NEGOCIO (Rev 1) — aún SIN contrato firmado. Leasing Operativo de un Sistema Eléctrico. Valor activo $32.000.000 CLP financiado 100% (796,81 UF a UF $40.160 del 03/05/2026). 48 cuotas de ≈22,66 UF/mes, tasa 1,35% mensual (16,2% anual), sin cuota final. PENDIENTE de confirmar: cliente, RUT, representante legal, dirección, fecha de firma y fecha de inicio de pagos (las fechas mostradas son tentativas, basadas en el modelo).",
  },
];

// CSL identity
export const CSL = {
  razonSocial: "Climate Smart Leasing SpA",
  rut: "77.868.887-5",
  cuentaBancaria: {
    banco: "Banco Santander",
    numero: "0-000-9427891-0",
    moneda: "PESOS DE CHILE",
    sucursal: "0265 Centro Negocio PYME / 0011 Concepción",
  },
};
