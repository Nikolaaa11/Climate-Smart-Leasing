"use client";

import { useState } from "react";
import { fmtCLP, fmtPct } from "@/lib/format";
import { ConciliationResult } from "@/lib/conciliation";
import {
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Mail,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  Building2,
  User,
  FileText,
  Download,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";

// ============================================================================
// DEUDORES — metadata cualitativa por contrato (severidad, narrativa, contacto).
// Las cifras financieras (esperado / pagado / deuda / % cobranza) se DERIVAN
// en tiempo de ejecución desde el motor de conciliación (result.porContrato),
// para mantener consistencia con el Dashboard y la sección Contratos.
// ============================================================================
export interface Deudor {
  id: string;
  contractId: string;          // ID del contrato (C-001, ...) — clave para derivar cifras
  proyecto: string;
  cliente: string;
  rut: string;
  repLegal: string;
  emailRepLegal: string;       // (placeholder — editable en cada caso)
  emailContacto?: string;
  // Snapshot histórico (opcional, no se usa en runtime — sólo referencia)
  esperadoClp?: number;
  pagadoClp?: number;
  deudaClp?: number;
  cumplimiento?: number;        // 0..1
  cuotasPagadas: string;       // ej. "15 de 16"
  inicioFacturacion: string;
  severidad: "leve" | "moderado" | "grave" | "nunca_pago";
  diagnostico: string;
  detalleAtraso: string[];     // bullet points para el cuerpo del mail
  rentaTexto: string;          // resumen renta
  notasInternas?: string[];    // observaciones para la plataforma (no van al mail)
  archivoExcel?: string;       // ruta al Excel de estado de cuenta
  archivoPpt?: string;         // ruta a la PPT (sólo PP)
}

const HOY = "03-Julio-2026";

export const DEUDORES: Deudor[] = [
  {
    id: "PP",
    contractId: "C-001",
    proyecto: "Puerta Patagonia — Calderas Vilanova",
    cliente: "Comunidad Edificio Puerta Patagonia Habitacional",
    rut: "53.319.273-4",
    repLegal: "Juan Moisés González Muñoz",
    emailRepLegal: "administracion@puertapatagonia.cl",
    esperadoClp: 24_713_350,
    pagadoClp: 12_299_717,
    deudaClp: 12_413_633,
    cumplimiento: 0.4977,
    cuotasPagadas: "5 de 10 facturas pagadas",
    inicioFacturacion: "Anticipo: dic-2025 · Rentas: mar-2026",
    severidad: "grave",
    diagnostico:
      "DEUDA GRAVE al 03-jul-2026: $12.413.633 en 5 facturas impagas, TODAS VENCIDAS (3 de anticipo + 2 de renta). El 11-jun-2026 pagaron la Factura N°43 ($1.983.334) — primer pago desde el 05-may. Verificado contra facturas SII reales y cartolas Santander N°21-26 (hasta 30-jun-2026).",
    rentaTexto:
      "Renta mensual: 67,127 UF + IVA × 36 cuotas facturadas desde marzo-2026 · Anticipo $10.000.000 + IVA en 6 facturas mensuales independientes de $1.983.334 IVA inc. (dic-2025 → may-2026).",
    detalleAtraso: [
      "Factura N°47 (06-mar-2026, anticipo 4/6): $1.983.334 — IMPAGA, vencida 21-mar-2026.",
      "Factura N°53 (07-abr-2026, anticipo 5/6): $1.983.334 — IMPAGA, vencida 22-abr-2026.",
      "Factura N°63 (06-may-2026, anticipo 6/6): $1.983.334 — IMPAGA, vencida 21-may-2026.",
      "Factura N°64 (06-may-2026, renta 3/36): $3.211.365 — IMPAGA, vencida 21-may-2026.",
      "Factura N°69 (06-jun-2026, renta 4/36): $3.252.266 — IMPAGA, vencida 21-jun-2026.",
      "Pagos recibidos: anticipos 1, 2 y 3/F43 ($1.983.334 el 17-dic-2025, 20-feb y 11-jun-2026) + renta marzo ($3.166.949 el 18-mar-2026) + renta abril / Factura N°52 ($3.182.766 el 05-may-2026). Total: $12.299.717.",
    ],
    notasInternas: [
      "✅ Recalculado el 03-jul-2026 contra las 7 facturas SII reales (F43/47/52/53/63/64/69) + cartolas oficiales N°21-26 (hasta 30-jun).",
      "✅ Factura N°43 PAGADA el 11-jun-2026 ($1.983.334 exactos desde RUT PP) — se imputó a la cuota 3/6 del anticipo.",
      "⚠️ La Factura N°52 que figuraba como adeudada FUE PAGADA: transferencia exacta de $3.182.766 el 05-may-2026 desde RUT 53.319.273-4.",
      "La facturación real difiere del contrato: anticipo facturado en 6 facturas mensuales separadas (dic-may) y rentas desde marzo — el sistema ya refleja este esquema.",
      "Patrón de pago: PP paga de a 1 factura exacta por transferencia, aproximadamente 1 vez al mes, siempre quedando ~5 facturas atrás. Próxima renta (cuota 5/36, ~$3,24MM) se factura ~06-jul-2026.",
    ],
    archivoExcel: "/downloads/CSL_EstadoCuenta_PuertaPatagonia.xlsx",
    archivoPpt: "/downloads/CSL_Presentacion_PuertaPatagonia.pptx",
  },
  {
    id: "VK",
    contractId: "C-002",
    proyecto: "Vikingos — Sistema ACS",
    cliente: "Comunidad Edificio Los Vikingos",
    rut: "53.321.997-7",
    repLegal: "María Pilar Alliende Wielandt",
    emailRepLegal: "administracion@edificiovikingos.cl",
    esperadoClp: 29_798_758,
    pagadoClp: 29_798_758,
    deudaClp: 0,
    cumplimiento: 1.0,
    cuotasPagadas: "Anticipo + 4 de 4 rentas",
    inicioFacturacion: "Anticipo: ene-2026 · Rentas: abr-2026",
    severidad: "leve",
    diagnostico:
      "AL DÍA al 03-jul-2026 — sin deuda. Anticipo $20MM pagado completo y las 4 rentas (abr-jul) cubiertas; la de julio la pagaron ANTICIPADA el 16-jun. Conciliado contra las facturas reales N°54/55/65/70, sin diferencias.",
    rentaTexto:
      "Renta mensual: 51,29 UF + IVA · Anticipo $20.000.000 IVA incluido (pagado) · 24 cuotas en total",
    detalleAtraso: [
      "Anticipo de $20.000.000 IVA incluido: PAGADO completo en 4 transferencias de $5MM (29-ene, 02-feb ×2 y 03-feb-2026). ✓",
      "Rentas abril a julio 2026 (facturas N°54/55/65/70): PAGADAS ($2.431.760 y $2.430.357 el 06-may; $2.452.817 el 12-may; $2.483.824 el 16-jun — julio anticipada). ✓",
      "Sin saldo pendiente: lo facturado coincide exacto con lo pagado.",
    ],
    notasInternas: [
      "⚠️ RUT en contrato (53.319.273-4) NO COINCIDE con RUT pagador real en cartola (53.321.997-7). Emitir adenda para corregir.",
      "✅ Cartolas oficiales N°21-22 confirman el anticipo: 4 transferencias de $5MM (no 1 de $20MM como estaba registrado).",
    ],
    archivoExcel: "/downloads/CSL_EstadoCuenta_Vikingos.xlsx",
  },
  {
    id: "F1",
    contractId: "C-004",
    proyecto: "Flota — Volvo EX30 PLUS",
    cliente: "SCG SpA",
    rut: "78.096.656-4",
    repLegal: "Cristian Eduardo Allende Tapia",
    emailRepLegal: "cristian.allende@scg.cl",
    esperadoClp: 23_581_255,
    pagadoClp: 22_453_494,
    deudaClp: 1_127_761,
    cumplimiento: 0.952,
    cuotasPagadas: "16 de 18",
    inicioFacturacion: "21-Feb-2025",
    severidad: "leve",
    diagnostico: "Pagador puntual — pequeño saldo arrastrado de la última cuota",
    rentaTexto:
      "Renta mensual: 25,58 UF + IVA (rebajada a 21,58 UF desde la cuota 15, may-2026, por reducción de costo de garantías) · 1ª renta: 82,86 UF · 48 cuotas en total",
    detalleAtraso: [
      "Cliente con historial impecable de pagos mensuales durante todo 2025 y 2026.",
      "Diferencia de $1.127.761 al cierre del 03-jul-2026 (~1 cuota; siguió pagando puntual en junio: $1.038.558 el 25-jun).",
      "Cumplimiento actual: 95,2% del facturado esperado.",
    ],
    notasInternas: [
      "Pagos vía RUT pagador 0141831984 (Cristian Eduardo Allende Tapia, persona natural).",
      "Cuotas iniciales de ene-2025 anticipadas — primera renta de 82,86 UF cubrió varios meses.",
    ],
    archivoExcel: "/downloads/CSL_EstadoCuenta_SCG.xlsx",
  },
  {
    id: "F2",
    contractId: "C-005",
    proyecto: "Flota — Volvo EX30 CORE",
    cliente: "SCG SpA",
    rut: "78.096.656-4",
    repLegal: "Cristian Eduardo Allende Tapia",
    emailRepLegal: "cristian.allende@scg.cl",
    esperadoClp: 15_523_704,
    pagadoClp: 14_606_362,
    deudaClp: 917_342,
    cumplimiento: 0.941,
    cuotasPagadas: "13 de 14",
    inicioFacturacion: "21-Jun-2025",
    severidad: "leve",
    diagnostico: "Pagador puntual — pequeño saldo arrastrado (~1 cuota)",
    rentaTexto:
      "Renta mensual: 22,93 UF + IVA (rebajada a 18,99 UF desde la cuota 4, sep-2025, por reducción de costo de garantías) · 1ª renta: 70,91 UF · 48 cuotas en total",
    detalleAtraso: [
      "Mismo titular que Flota Volvo EX30 PLUS — historial general de pagos puntuales.",
      "Saldo pendiente de $917.342 al 03-jul-2026, equivalente a ~1 cuota mensual (pagó $913.913 el 25-jun).",
      "Cumplimiento actual: 94,1% del facturado esperado.",
    ],
    notasInternas: [
      "$3.300.000 pagado en may-2025 cubrió la primera factura adelantada.",
      "Pagos vía RUT pagador 0141831984.",
    ],
    archivoExcel: "/downloads/CSL_EstadoCuenta_SCG.xlsx",
  },
  {
    id: "TK",
    contractId: "C-003",
    proyecto: "Trongkai — Electroporación ODIN Opticept",
    cliente: "Agrotecnologías e Ingeniería SpA",
    rut: "77.221.203-8",
    repLegal: "José Cuevas Valenzuela",
    emailRepLegal: "jcuevas@trongkai.cl",
    esperadoClp: 952_000,
    pagadoClp: 0,
    deudaClp: 952_000,
    cumplimiento: 0,
    cuotasPagadas: "0 de 2",
    inicioFacturacion: "01-Jun-2026",
    severidad: "nunca_pago",
    diagnostico: "Nunca ha pagado — cuotas de junio y julio 2026 vencidas ($952.000 total)",
    rentaTexto:
      "Renta: $400.000 netos/mes durante 2026 (pruebas) · Vigencia 5 años + 3 prórrogas · Desde 01-Ene-2027 tarifa por hora",
    detalleAtraso: [
      "Inicio de facturación: 01-jun-2026 (primera cuota).",
      "Cuota junio 2026 ($476.000 IVA inc.): vencida, sin pago.",
      "Cuota julio 2026 ($476.000 IVA inc.): vencida (pago anticipado día 1), sin pago.",
      "Equipo ODIN Opticept ya entregado el 01-mar-2026 — sin ningún pago a la fecha (verificado contra cartolas hasta el 30-jun-2026).",
    ],
    notasInternas: [
      "Contrato vigente por 5 años + 3 prórrogas. Tarifa por hora inicia 01-ene-2027 (mínimo $400.000/mes).",
    ],
  },
  {
    id: "BA",
    contractId: "C-006",
    proyecto: "Barranco Amarillo — Planta de hielo y proceso",
    cliente: "Procesadora Barranco Amarillo SpA",
    rut: "78.191.887-3",
    repLegal: "Washington Gilberto Borquez Mansilla",
    emailRepLegal: "contacto@barrancoamarillo.cl",
    esperadoClp: 160_553_334,
    pagadoClp: 160_553_334,
    deudaClp: 0,
    cumplimiento: 1.0,
    cuotasPagadas: "Pago inicial + 2 de 2 cuotas pagadas",
    inicioFacturacion: "Pago inicial: 01-may-2026 · Cuotas: 05-may-2026",
    severidad: "leve",
    diagnostico:
      "AL DÍA al 03-jul-2026 — sin deuda. El pago inicial (factura N°58, 3.051,93 UF = $145.563.464) fue pagado mediante el 'Traspaso de cuenta' de $145.563.465 del 28-abr-2026 (antes figuraba sin clasificar; ya está identificado y conciliado). Las cuotas 1 y 2 (may-jun) también están pagadas. La cuota 3 (julio) vence el 05-jul.",
    rentaTexto:
      "Pago inicial: 3.051,93 UF + IVA = $145.563.464 (factura N°58) · Renta mensual: 155,74 UF + IVA × 24 cuotas anticipadas (primeros 5 días del mes) · Interés penal 1,5% mensual",
    detalleAtraso: [
      "Pago inicial (factura N°58, $145.563.464): PAGADO vía 'Traspaso de cuenta' de $145.563.465 el 28-abr-2026. ✓",
      "Cuota 1/24 mayo 2026 (factura N°62, $7.447.842): PAGADA el 01-jun-2026. ✓",
      "Cuota 2/24 junio 2026 (factura N°71, $7.542.028): PAGADA el 15-jun-2026. ✓",
      "Cuota 3/24 julio 2026 (≈$7,5MM): por vencer el 05-jul-2026.",
    ],
    notasInternas: [
      "✅ Resuelto: el traspaso de $145,5MM (28-abr-2026, glosa 'Traspaso de cuenta') era el pago inicial (factura N°58 por 3.051,93 UF). Antes estaba en 'abonos no identificados'; ahora se concilia contra la cuota de pago inicial de C-006.",
      "Email del representante legal es PROVISORIO — confirmar antes de enviar.",
      "Contrato firmado 04-may-2026 con firma electrónica avanzada. Término: 05-abr-2028.",
    ],
  },
  {
    id: "AX",
    contractId: "C-007",
    proyecto: "Axopur 1 — Equipo de electropulsos",
    cliente: "Bebidas Funcionales Caelum SpA",
    rut: "76.858.572-5",
    repLegal: "Sebastián Riquelme Riffo",
    emailRepLegal: "s.riquelme@udt.cl",
    esperadoClp: 11_104_371,
    pagadoClp: 0,
    deudaClp: 11_104_371,
    cumplimiento: 0,
    cuotasPagadas: "0 de 3 facturas (por conciliar)",
    inicioFacturacion: "Pago inicial + cuotas 1-2: 30-jun-2026",
    severidad: "moderado",
    diagnostico:
      "Contrato firmado el 26-may-2026. El 30-jun-2026 se emitieron 3 facturas: pago inicial (N°79, $8.925.000), cuota 1/48 (N°77) y cuota 2/48 (N°78). Aún NO conciliadas — falta cargar la cartola de junio/julio. La factura N°79 indica 'Forma de pago: Contado', por lo que el pago inicial probablemente ya está cursado: CONFIRMAR con la cartola antes de cobrar.",
    rentaTexto:
      "Pago inicial: $7.500.000 neto + IVA · Renta mensual: 22,66 UF + IVA × 48 cuotas (primeros 5 días de cada mes desde jun-2026)",
    detalleAtraso: [
      "Pago inicial (factura N°79, 30-jun-2026): $8.925.000 — sin pago conciliado aún.",
      "Cuota 1/48 (factura N°77, 30-jun-2026): $1.082.931 — sin pago conciliado aún.",
      "Cuota 2/48 (factura N°78, 30-jun-2026): $1.096.440 — sin pago conciliado aún.",
      "⚠️ Cargar la cartola de junio/julio 2026 para confirmar los pagos (la N°79 es al contado) antes de gestionar cobranza.",
    ],
    notasInternas: [
      "Equipo Axopur (Axolot, 55 L/h) entregado el 01-jun-2026. Contacto: Sebastián Riquelme, s.riquelme@udt.cl.",
      "Los abonos de Caelum en el sistema (mar-2025, ene-2026) son ANTERIORES al contrato y corresponden a otras OC (estudios), no a Axopur.",
    ],
  },
];

const SEVERIDAD_META = {
  leve: {
    label: "Atraso leve",
    color: "text-amber-700",
    bgChip: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: AlertCircle,
    priority: 3,
  },
  moderado: {
    label: "Atraso moderado",
    color: "text-orange-700",
    bgChip: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
    icon: AlertTriangle,
    priority: 2,
  },
  grave: {
    label: "Atraso grave",
    color: "text-red-700",
    bgChip: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: AlertOctagon,
    priority: 1,
  },
  nunca_pago: {
    label: "Nunca ha pagado",
    color: "text-red-800",
    bgChip: "bg-red-100",
    border: "border-red-300",
    dot: "bg-red-700",
    icon: AlertOctagon,
    priority: 0,
  },
};

// ============================================================================
// PLANTILLAS DE EMAIL — prosa natural, sin cuadros ASCII
// ============================================================================
function generarMail(d: Deudor): { asunto: string; cuerpo: string } {
  // Mails personalizados por deudor — versión prosa lista para Gmail/Outlook
  const mails: Record<string, { asunto: string; cuerpo: string }> = {
    PP: {
      asunto: "Facturas pendientes de pago · Contrato Calderas Vilanova — Puerta Patagonia",
      cuerpo: `Estimado Juan Moisés,

Junto con saludar, le escribo desde Climate Smart Leasing SpA respecto del estado de cuenta del contrato de solución energética del Edificio Puerta Patagonia, conciliado al 3 de julio de 2026 contra nuestra cuenta Santander N° 9427891-0 y las facturas electrónicas emitidas.

Primero, agradezco los pagos que tenemos correctamente registrados: las cuotas 1, 2 y 3 del anticipo ($1.983.334 recibidos el 17 de diciembre de 2025, el 20 de febrero y el 11 de junio de 2026 — esta última correspondiente a la factura N°43), la renta de marzo ($3.166.949 recibida el 18 de marzo) y la renta de abril, factura N°52 ($3.182.766 recibida el 5 de mayo).

Sin embargo, a la fecha quedan cinco facturas pendientes de pago, todas ya vencidas:

- Factura N°47 (06-mar-2026) — Anticipo cuota 4 de 6: $1.983.334
- Factura N°53 (07-abr-2026) — Anticipo cuota 5 de 6: $1.983.334
- Factura N°63 (06-may-2026) — Anticipo cuota 6 de 6: $1.983.334
- Factura N°64 (06-may-2026) — Renta mensual cuota 3 de 36: $3.211.365
- Factura N°69 (06-jun-2026) — Renta mensual cuota 4 de 36: $3.252.266

Total pendiente: $12.413.633

Las cinco facturas se encuentran vencidas según el plazo contractual de 15 días corridos desde la emisión de cada factura, establecido en la Cláusula Tercera del contrato (la última en vencer fue la N°69, el 21 de junio). En los próximos días se emitirá además la renta de julio (cuota 5 de 36).

El proyecto fue recepcionado definitivamente por ustedes el 8 de abril de 2026 sin observaciones, por lo que no existen pendientes de obra asociados a estos pagos.

Valoro el pago recibido en junio; sin embargo, al ritmo actual de un pago mensual la deuda vencida se mantiene en torno a los $12 millones y sigue devengando interés máximo convencional conforme al contrato. Le agradecería coordinar a la brevedad la regularización total de las cinco facturas vencidas, o indicarme si alguno de estos pagos ya fue cursado y no figura aún en nuestra cuenta. Si necesitan un calendario de regularización, estoy disponible para conversarlo.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: nikolasromero@climatesmartleasing.com

Quedo atento a sus comentarios.

Saludos cordiales,

Nikolás Romero
Climate Smart Leasing SpA`,
    },
    VK: {
      asunto: "Estado de cuenta · Sistema ACS — Comunidad Edificio Los Vikingos",
      cuerpo: `Estimada María Pilar,

Junto con saludar, le escribo desde Climate Smart Leasing SpA con el estado de cuenta actualizado del contrato del Sistema ACS de la Comunidad Edificio Los Vikingos.

Quiero partir agradeciendo la excelente puntualidad de la comunidad: el anticipo de $20.000.000 IVA incluido quedó cubierto en su totalidad (recibido en cuatro transferencias entre el 29 de enero y el 3 de febrero de 2026) y las rentas de abril a julio están todas pagadas — la de julio incluso de forma anticipada, el 16 de junio.

Al conciliar contra los movimientos de la cuenta Santander N° 9427891-0 al 3 de julio de 2026, la cuenta está completamente al día, sin saldo pendiente.

Estado de cuenta al 3 de julio de 2026:

Facturado esperado: $29.798.758
Recibido a la fecha: $29.798.758
Saldo pendiente: $0
Cumplimiento: 100%

Le recuerdo que la renta mensual del contrato es de 51,29 UF más IVA (aproximadamente $2,4 a $2,5 millones IVA incluido al valor UF vigente), por 24 cuotas.

Aprovecho también de comentarle que estamos preparando una adenda menor al contrato para corregir el RUT del cliente (quedó 53.319.273-4 en el documento original, cuando el correcto y desde el cual ustedes pagan es 53.321.997-7); se la haré llegar en los próximos días para su firma.

Adjunto el estado de cuenta detallado en Excel.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: nikolasromero@climatesmartleasing.com

Muchas gracias por su buena disposición.

Saludos cordiales,

Nikolás Romero
Climate Smart Leasing SpA`,
    },
    F1: {
      asunto: "Estado de cuenta SCG · Flota Volvo EX30 PLUS y CORE — conciliación al 12-may-2026",
      cuerpo: `Estimado Cristian,

Junto con saludar, te escribo desde Climate Smart Leasing SpA con el estado de cuenta de los dos contratos de arrendamiento de SCG SpA — Flota Volvo EX30 PLUS y Flota Volvo EX30 CORE — conciliado al 3 de julio de 2026 contra los movimientos de la cuenta Santander N° 9427891-0.

Partir diciendo que SCG ha sido nuestro cliente más puntual en lo que va de los contratos, con un historial impecable de pagos mensuales durante todo 2025 y 2026. Al cierre quedan dos pequeñas diferencias que probablemente corresponden a cuotas en tránsito o ajustes de UF, pero te las paso para que las revisemos en conjunto.

Flota Volvo EX30 PLUS (renta 25,58 UF + IVA, rebajada a 21,58 UF desde may-2026, inicio facturación 21 feb 2025):

Facturado esperado: $23.581.255
Recibido a la fecha: $22.453.494
Saldo pendiente: $1.127.761
Cumplimiento: 95,2%

Flota Volvo EX30 CORE (renta 22,93 UF + IVA, rebajada a 18,99 UF desde sep-2025, inicio facturación 21 jun 2025):

Facturado esperado: $15.523.704
Recibido a la fecha: $14.606.362
Saldo pendiente: $917.342
Cumplimiento: 94,1%

Saldo consolidado: $2.045.103

Si de tu lado los pagos están al día, avísame para revisar bien si hay alguna transferencia que no me figura registrada y conciliarlo. Si efectivamente queda esa diferencia, agradezco regularizarla cuando puedas.

Adjunto el estado de cuenta detallado en Excel con las cuotas de ambos contratos.

Los datos de transferencia son los de siempre:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: nikolasromero@climatesmartleasing.com

Muchas gracias por la puntualidad de siempre, Cristian. Cualquier duda, conversemos.

Saludos,

Nikolás Romero
Climate Smart Leasing SpA`,
    },
    F2: {
      asunto: "Estado de cuenta SCG · Flota Volvo EX30 PLUS y CORE — conciliación al 12-may-2026",
      cuerpo: `Estimado Cristian,

Junto con saludar, te escribo desde Climate Smart Leasing SpA con el estado de cuenta de los dos contratos de arrendamiento de SCG SpA — Flota Volvo EX30 PLUS y Flota Volvo EX30 CORE — conciliado al 3 de julio de 2026 contra los movimientos de la cuenta Santander N° 9427891-0.

Partir diciendo que SCG ha sido nuestro cliente más puntual en lo que va de los contratos, con un historial impecable de pagos mensuales durante todo 2025 y 2026. Al cierre quedan dos pequeñas diferencias que probablemente corresponden a cuotas en tránsito o ajustes de UF, pero te las paso para que las revisemos en conjunto.

Flota Volvo EX30 PLUS (renta 25,58 UF + IVA, rebajada a 21,58 UF desde may-2026, inicio facturación 21 feb 2025):

Facturado esperado: $23.581.255
Recibido a la fecha: $22.453.494
Saldo pendiente: $1.127.761
Cumplimiento: 95,2%

Flota Volvo EX30 CORE (renta 22,93 UF + IVA, rebajada a 18,99 UF desde sep-2025, inicio facturación 21 jun 2025):

Facturado esperado: $15.523.704
Recibido a la fecha: $14.606.362
Saldo pendiente: $917.342
Cumplimiento: 94,1%

Saldo consolidado: $2.045.103

Si de tu lado los pagos están al día, avísame para revisar bien si hay alguna transferencia que no me figura registrada y conciliarlo. Si efectivamente queda esa diferencia, agradezco regularizarla cuando puedas.

Adjunto el estado de cuenta detallado en Excel con las cuotas de ambos contratos.

Los datos de transferencia son los de siempre:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: nikolasromero@climatesmartleasing.com

Muchas gracias por la puntualidad de siempre, Cristian. Cualquier duda, conversemos.

Saludos,

Nikolás Romero
Climate Smart Leasing SpA`,
    },
    TK: {
      asunto: "Primera cuota pendiente · Contrato ODIN Opticept — Agrotecnologías e Ingeniería",
      cuerpo: `Estimado José,

Junto con saludar, le escribo desde Climate Smart Leasing SpA en relación al contrato de arrendamiento del equipo de electroporación ODIN Opticept entregado a Agrotecnologías e Ingeniería SpA el 1 de marzo de 2026.

Según lo establecido en el contrato, la facturación inició el 1 de junio de 2026. Al revisar nuestros registros conciliados con la cuenta Santander N° 9427891-0 al 3 de julio de 2026, las cuotas de junio y julio figuran pendientes de pago.

Estado de cuenta al 3 de julio de 2026:

Facturado esperado: $952.000
Recibido a la fecha: $0
Saldo pendiente: $952.000
Cumplimiento: 0% (0 de 2 cuotas)

Le recuerdo que el contrato considera $400.000 netos mensuales durante 2026 como tarifa de prueba, con vigencia de 5 años más 3 prórrogas, cambiando a tarifa por hora desde el 1 de enero de 2027 (mínimo $400.000 mensuales).

Le agradecería coordinar el pago de estas dos cuotas a la brevedad. Si hay alguna observación respecto al funcionamiento del equipo o alguna condición del contrato que necesitemos revisar antes de la regularización, avíseme y lo conversamos.

Adjunto el estado de cuenta detallado en Excel.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: nikolasromero@climatesmartleasing.com

Quedo atento a sus comentarios.

Saludos cordiales,

Nikolás Romero
Climate Smart Leasing SpA`,
    },
    AX: {
      asunto: "Confirmación de pagos · Contrato Axopur — Bebidas Funcionales Caelum",
      cuerpo: `Estimado Sebastián,

Junto con saludar, le escribo desde Climate Smart Leasing SpA en relación al contrato de arriendo del equipo Axopur, firmado el 26 de mayo de 2026.

El 30 de junio de 2026 emitimos las tres primeras facturas del contrato:

- Factura N°79 — Pago inicial: $8.925.000 (IVA incluido)
- Factura N°77 — Cuota 1/48: $1.082.931
- Factura N°78 — Cuota 2/48: $1.096.440

Total: $11.104.371

Estamos actualizando la conciliación con la cuenta Santander N° 9427891-0 y quería confirmar con usted si estos pagos ya fueron cursados de su lado, en particular el pago inicial (pactado al contado). Si ya los realizaron, le agradezco reenviarme el comprobante para dejar la cuenta cuadrada; si aún están pendientes, quedo atento para coordinar.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: nikolasromero@climatesmartleasing.com

Quedo atento a sus comentarios.

Saludos cordiales,

Nikolás Romero
Climate Smart Leasing SpA`,
    },
  };

  return mails[d.id] || { asunto: "Estado de cuenta", cuerpo: "Mail no configurado." };
}

// ============================================================================
// COMPONENTE
// ============================================================================
interface CobranzaProps {
  result: ConciliationResult;
}

export default function Cobranza({ result }: CobranzaProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mailOpen, setMailOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<"asunto" | "cuerpo" | "todo" | null>(null);

  // Cifras derivadas en tiempo real desde la conciliación. Usa la misma
  // ventana temporal que el Dashboard (cuotas con fecha ≤ hoy) para que
  // todos los dashboards muestren el mismo número.
  const today = new Date();
  const finByContract: Record<string, { esperado: number; pagado: number; deuda: number; cumplimiento: number }> = {};
  for (const cid of Object.keys(result.porContrato)) {
    const vencidas = result.porContrato[cid].filter(x => {
      const f = new Date(x.fecha + "T00:00:00");
      return f <= today && x.totalFacturado > 0;
    });
    const esperado = vencidas.reduce((s, x) => s + x.totalFacturado, 0);
    const pagado = vencidas.reduce((s, x) => s + x.totalPagado, 0);
    const deuda = Math.max(0, esperado - pagado);
    const cumplimiento = esperado > 0 ? Math.min(1, pagado / esperado) : 1;
    finByContract[cid] = { esperado, pagado, deuda, cumplimiento };
  }
  const fin = (d: Deudor) => finByContract[d.contractId] || { esperado: 0, pagado: 0, deuda: 0, cumplimiento: 1 };

  // Ordenar por severidad (más grave primero) y deuda descendente
  const deudores = [...DEUDORES].sort((a, b) => {
    const ap = SEVERIDAD_META[a.severidad].priority;
    const bp = SEVERIDAD_META[b.severidad].priority;
    if (ap !== bp) return ap - bp;
    return fin(b).deuda - fin(a).deuda;
  });

  const totalEsperado = deudores.reduce((s, d) => s + fin(d).esperado, 0);
  const totalPagado = deudores.reduce((s, d) => s + fin(d).pagado, 0);
  const totalDeuda = deudores.reduce((s, d) => s + fin(d).deuda, 0);
  const cumpGlobal = totalEsperado > 0 ? totalPagado / totalEsperado : 1;

  const copyText = async (text: string, kind: "asunto" | "cuerpo" | "todo") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const openMailto = (d: Deudor) => {
    const m = generarMail(d);
    const url = `mailto:${d.emailRepLegal}?subject=${encodeURIComponent(
      m.asunto
    )}&body=${encodeURIComponent(m.cuerpo)}`;
    window.location.href = url;
  };

  return (
    <section id="cobranza" className="py-20 md:py-28 border-t border-black/[0.04]">
      {/* Header */}
      <div className="mb-12">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-csl-600 mb-3">
          Sección 06 · Cobranza
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tighter leading-[1.05]">
          Deudores y
          <br />
          <span className="text-csl-600">comunicación de cobro.</span>
        </h2>
        <p className="text-lg text-ink-500 mt-6 max-w-3xl leading-relaxed">
          Estado de cuenta consolidado al {HOY} para los {DEUDORES.length} contratos con cobranza activa.
          Cada deudor tiene un mail personalizado listo para enviar — adaptado
          a la severidad de su atraso.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl bg-white border border-black/[0.06] shadow-soft p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-400 mb-2">
            Facturado esperado
          </div>
          <div className="text-2xl font-display font-semibold tabular text-ink-900">
            {fmtCLP(totalEsperado)}
          </div>
          <div className="text-xs text-ink-400 mt-1">{DEUDORES.length} contratos con cobranza activa</div>
        </div>
        <div className="rounded-2xl bg-white border border-black/[0.06] shadow-soft p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-400 mb-2">
            Recibido a la fecha
          </div>
          <div className="text-2xl font-display font-semibold tabular text-csl-600">
            {fmtCLP(totalPagado)}
          </div>
          <div className="text-xs text-ink-400 mt-1">
            {fmtPct(cumpGlobal)} del esperado
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-red-200 shadow-soft p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-red-600 mb-2">
            Saldo a cobrar
          </div>
          <div className="text-2xl font-display font-semibold tabular text-red-700">
            {fmtCLP(totalDeuda)}
          </div>
          <div className="text-xs text-red-500 mt-1">
            {deudores.filter((d) => fin(d).deuda > 0).length} deudores activos
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-csl-50 to-csl-100/50 border border-csl-200 shadow-soft p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-csl-700 mb-2">
            Mails listos
          </div>
          <div className="text-2xl font-display font-semibold tabular text-csl-700">
            {deudores.length}
          </div>
          <div className="text-xs text-csl-600 mt-1">
            Personalizados por severidad
          </div>
        </div>
      </div>

      {/* Lista de deudores */}
      <div className="space-y-4">
        {deudores.map((d) => {
          const meta = SEVERIDAD_META[d.severidad];
          const Icon = meta.icon;
          const isExpanded = expanded === d.id;
          const mail = generarMail(d);
          const f = fin(d);

          return (
            <div
              key={d.id}
              className={`rounded-2xl bg-white border ${meta.border} shadow-soft overflow-hidden transition-shadow hover:shadow-glow`}
            >
              {/* Fila principal */}
              <div className="p-6">
                <div className="flex flex-wrap items-start gap-4">
                  {/* Icono + título */}
                  <div className="flex items-start gap-4 flex-1 min-w-[280px]">
                    <div
                      className={`w-11 h-11 rounded-xl ${meta.bgChip} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${meta.bgChip} ${meta.color} border ${meta.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
                          {d.id}
                        </span>
                      </div>
                      <div className="text-base font-display font-semibold text-ink-900 leading-tight">
                        {d.proyecto}
                      </div>
                      <div className="text-sm text-ink-500 mt-0.5">
                        {d.cliente} · RUT {d.rut}
                      </div>
                    </div>
                  </div>

                  {/* Números */}
                  <div className="flex gap-6 items-start">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                        Esperado
                      </div>
                      <div className="text-sm font-semibold tabular text-ink-700">
                        {fmtCLP(f.esperado)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                        Pagado
                      </div>
                      <div className="text-sm font-semibold tabular text-csl-600">
                        {fmtCLP(f.pagado)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                        Deuda
                      </div>
                      <div className="text-base font-semibold tabular text-red-700">
                        {fmtCLP(f.deuda)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                        Cumplim.
                      </div>
                      <div className="text-sm font-semibold tabular text-ink-700">
                        {fmtPct(f.cumplimiento)}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 items-start flex-wrap">
                    <button
                      onClick={() => setMailOpen(d.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-csl-600 text-white hover:bg-csl-700 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Ver mail
                    </button>
                    {d.archivoExcel && (
                      <a
                        href={d.archivoExcel}
                        download
                        title="Descargar estado de cuenta (Excel)"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Excel
                      </a>
                    )}
                    {d.archivoPpt && (
                      <a
                        href={d.archivoPpt}
                        download
                        title="Descargar presentación (PowerPoint)"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        <Presentation className="w-3.5 h-3.5" />
                        PPT
                      </a>
                    )}
                    <button
                      onClick={() =>
                        setExpanded(isExpanded ? null : d.id)
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg bg-ink-50 text-ink-700 hover:bg-ink-100 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Ocultar <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Detalle <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-5">
                  <div className="h-1.5 w-full bg-ink-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${
                        f.cumplimiento >= 0.9
                          ? "bg-csl-500"
                          : f.cumplimiento >= 0.7
                          ? "bg-amber-500"
                          : f.cumplimiento >= 0.3
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.max(f.cumplimiento * 100, 2)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-mono uppercase tracking-wider text-ink-400">
                    <span>Cuotas {d.cuotasPagadas}</span>
                    <span>Desde {d.inicioFacturacion}</span>
                  </div>
                </div>
              </div>

              {/* Detalle expandible */}
              {isExpanded && (
                <div className="border-t border-black/[0.04] bg-bg-subtle/30 p-6 space-y-5 animate-fade-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" /> Contrato
                      </div>
                      <div className="text-sm text-ink-700 leading-relaxed">
                        {d.rentaTexto}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Representante legal
                      </div>
                      <div className="text-sm text-ink-700">
                        {d.repLegal}
                      </div>
                      <div className="text-xs text-ink-500 mt-1 flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        {d.emailRepLegal}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Detalle del atraso
                    </div>
                    <ul className="space-y-1.5">
                      {d.detalleAtraso.map((b, i) => (
                        <li
                          key={i}
                          className="text-sm text-ink-700 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-ink-300"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {d.notasInternas && d.notasInternas.length > 0 && (
                    <div className="rounded-xl bg-amber-50/50 border border-amber-200/50 p-4">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-700 mb-2">
                        ⚠ Notas internas (no enviar)
                      </div>
                      <ul className="space-y-1.5">
                        {d.notasInternas.map((n, i) => (
                          <li
                            key={i}
                            className="text-xs text-amber-900 leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0"
                          >
                            {n}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-xl bg-ink-50/50 border border-ink-100 p-4">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 mb-1">
                      Diagnóstico
                    </div>
                    <div className="text-sm text-ink-700">
                      {d.diagnostico}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal del mail */}
              {mailOpen === d.id && (
                <div
                  className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                  onClick={() => setMailOpen(null)}
                >
                  <div
                    className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal header */}
                    <div className="border-b border-black/[0.06] p-6 flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-csl-600 mb-1">
                          Mail listo para enviar · {meta.label}
                        </div>
                        <div className="text-base font-display font-semibold text-ink-900">
                          {d.proyecto}
                        </div>
                        <div className="text-xs text-ink-500 mt-1">
                          Para: {d.repLegal} · {d.emailRepLegal}
                        </div>
                      </div>
                      <button
                        onClick={() => setMailOpen(null)}
                        className="text-ink-400 hover:text-ink-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Mail content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
                            Asunto
                          </span>
                          <button
                            onClick={() => copyText(mail.asunto, "asunto")}
                            className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-500 hover:text-csl-600 transition-colors"
                          >
                            {copied === "asunto" ? (
                              <>
                                <Check className="w-3 h-3" /> Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copiar
                              </>
                            )}
                          </button>
                        </div>
                        <div className="text-sm text-ink-800 font-medium bg-ink-50 rounded-lg px-4 py-3">
                          {mail.asunto}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
                            Cuerpo del mensaje
                          </span>
                          <button
                            onClick={() => copyText(mail.cuerpo, "cuerpo")}
                            className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-500 hover:text-csl-600 transition-colors"
                          >
                            {copied === "cuerpo" ? (
                              <>
                                <Check className="w-3 h-3" /> Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copiar
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-xs text-ink-700 bg-ink-50 rounded-lg px-4 py-4 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                          {mail.cuerpo}
                        </pre>
                      </div>

                      {/* Adjuntos descargables */}
                      {(d.archivoExcel || d.archivoPpt) && (
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-2">
                            Adjuntos para enviar
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {d.archivoExcel && (
                              <a
                                href={d.archivoExcel}
                                download
                                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                                  <FileSpreadsheet className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-ink-900 truncate">
                                    Estado de cuenta
                                  </div>
                                  <div className="text-[11px] text-ink-500 truncate">
                                    Excel con todas las cuotas y pagos
                                  </div>
                                </div>
                                <Download className="w-4 h-4 text-emerald-700 shrink-0 group-hover:translate-y-0.5 transition-transform" />
                              </a>
                            )}
                            {d.archivoPpt && (
                              <a
                                href={d.archivoPpt}
                                download
                                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
                                  <Presentation className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-ink-900 truncate">
                                    Presentación
                                  </div>
                                  <div className="text-[11px] text-ink-500 truncate">
                                    PPT para la reunión de regularización
                                  </div>
                                </div>
                                <Download className="w-4 h-4 text-amber-700 shrink-0 group-hover:translate-y-0.5 transition-transform" />
                              </a>
                            )}
                          </div>
                          <div className="text-[10px] text-ink-400 mt-2 italic">
                            Descarga los archivos y adjúntalos manualmente al correo antes de enviarlo.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal footer */}
                    <div className="border-t border-black/[0.06] p-4 flex flex-wrap gap-2 items-center justify-between bg-bg-subtle/40">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
                        Puedes editar el destinatario antes de enviar
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            copyText(
                              `Para: ${d.emailRepLegal}\nAsunto: ${mail.asunto}\n\n${mail.cuerpo}`,
                              "todo"
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-ink-50 text-ink-700 hover:bg-ink-100 transition-colors"
                        >
                          {copied === "todo" ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Copiado todo
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copiar todo
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openMailto(d)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-csl-600 text-white hover:bg-csl-700 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Abrir en cliente de correo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer nota */}
      <div className="mt-10 rounded-2xl bg-csl-50/50 border border-csl-200/50 p-5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-csl-700 mb-2">
          Flujo de cobranza
        </div>
        <p className="text-sm text-ink-700 leading-relaxed">
          Cada deudor cuenta con un mail personalizado en prosa natural
          (sin cuadros ASCII, listo para Gmail u Outlook), un Excel con el
          estado de cuenta completo — todas las cuotas del contrato con
          su pago real conciliado contra la cuenta Santander 9427891-0 — y
          en el caso de Puerta Patagonia, también una presentación para
          la reunión de regularización con dos propuestas de pago.
          Los archivos están listos para descargar y adjuntar al correo.
          Los emails de los destinatarios son provisorios — revísalos antes
          de enviar.
        </p>
      </div>
    </section>
  );
}
