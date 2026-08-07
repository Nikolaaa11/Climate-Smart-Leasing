"use client";

import { useState } from "react";
import { fmtCLP, fmtPct } from "@/lib/format";
import { descargarExcelEstadoCuenta, descargarPptEstadoCuenta, DatosEstadoCuenta } from "@/lib/exports";
import { ConciliationResult } from "@/lib/conciliation";
import { totalesContrato, Totales } from "@/lib/totales";
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
  Building2,
  User,
  FileText,
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
}

const HOY = new Intl.DateTimeFormat("es-CL", { dateStyle: "long" }).format(new Date());

export const DEUDORES: Deudor[] = [
  {
    id: "PP",
    contractId: "C-001",
    proyecto: "Puerta Patagonia — Calderas Vilanova",
    cliente: "Comunidad Edificio Puerta Patagonia Habitacional",
    rut: "53.319.273-4",
    repLegal: "Juan Moisés González Muñoz",
    emailRepLegal: "administracion@puertapatagonia.cl",
    esperadoClp: 31_236_851,
    pagadoClp: 21_461_084,
    deudaClp: 9_775_767,
    cumplimiento: 0.687,
    cuotasPagadas: "9 de 12 facturas pagadas",
    inicioFacturacion: "Anticipo: dic-2025 · Rentas: mar-2026",
    severidad: "grave",
    diagnostico:
      "MEJORA al 07-ago-2026: la cartola N°28 trae dos pagos por $5.194.699 que cierran el ANTICIPO COMPLETO (N°63) y la renta 3/36 (N°64), ambos por el monto exacto. La deuda vencida baja de $8.446.965 a $6.513.039 y por primera vez es 100% renta — el capítulo del anticipo de $10MM queda cerrado. Quedan VENCIDAS las rentas 4/36 (N°69, $3.252.266) y 5/36 ($3.260.773). La renta de agosto (cuota 6/36, $3.262.728, emitida el 06-ago) está impaga pero aún en plazo. Deuda total pendiente: $9.775.767. Verificado contra facturas SII reales y cartolas Santander N°21-28 (hasta 07-ago-2026).",
    rentaTexto:
      "Renta mensual: 67,127 UF + IVA × 36 cuotas facturadas desde marzo-2026 · Anticipo $10.000.000 + IVA en 6 facturas mensuales independientes de $1.983.334 IVA inc. (dic-2025 → may-2026) — ANTICIPO PAGADO EN SU TOTALIDAD.",
    detalleAtraso: [
      "Factura N°63 (06-may-2026, anticipo 6/6): $1.983.334 — PAGADA el 03-ago-2026 por el monto exacto. Con esto el anticipo de $10.000.000 + IVA queda cubierto en sus 6 cuotas. ✓",
      "Factura N°64 (06-may-2026, renta 3/36): $3.211.365 — PAGADA el 10-ago-2026 por el monto exacto. ✓",
      "Factura N°69 (06-jun-2026, renta 4/36): $3.252.266 — IMPAGA, vencida (>30 días) desde el 06-jul-2026. Es la más antigua pendiente.",
      "Renta 5/36 (06-jul-2026, $3.260.773): IMPAGA, vencida (>30 días) desde el 05-ago-2026.",
      "Renta 6/36 (06-ago-2026, $3.262.728): impaga, aún EN PLAZO; pasa a vencida el 05-sep-2026.",
      "Pagos recibidos: anticipos 1 a 6 ($1.983.334 el 17-dic-2025, 20-feb, 11-jun, 10-jul, 13-jul y 03-ago-2026) + rentas 1/36 a 3/36 ($3.166.949 el 18-mar, $3.182.766 el 05-may y $3.211.365 el 10-ago-2026). Total: $21.461.084.",
    ],
    notasInternas: [
      "✅ Recalculado el 07-ago-2026 contra las facturas SII reales + cartolas oficiales N°21-28.",
      "✅ Cartola N°28: dos abonos por el monto EXACTO de las facturas ($1.983.334 y $3.211.365). PP mantiene el patrón de pagar factura por factura sin fraccionar.",
      "✅ Hito: el anticipo de $10MM quedó 100% cobrado. Toda la deuda restante es renta corriente, que es el escenario normal de un leasing.",
      "⚠️ El rezago sigue en ~2 meses: en agosto pagan lo emitido en mayo. A ese ritmo la mora no crece, pero tampoco se reduce — conviene fijar un calendario que adelante una cuota.",
      "⚠️ El abono de $3.211.365 viene fechado 10-ago-2026 en la cartola N°28, posterior al corte declarado (07-ago), pero el banco ya lo incluye en el saldo final. Confirmar contra la histórica N°28 cuando esté disponible.",
      "La facturación real difiere del contrato: anticipo facturado en 6 facturas mensuales separadas (dic-may) y rentas desde marzo — el sistema ya refleja este esquema.",
    ],
  },
  {
    id: "VK",
    contractId: "C-002",
    proyecto: "Vikingos — Sistema ACS",
    cliente: "Comunidad Edificio Los Vikingos",
    rut: "53.321.997-7",
    repLegal: "María Pilar Alliende Wielandt",
    emailRepLegal: "administracion@edificiovikingos.cl",
    esperadoClp: 32_291_065,
    pagadoClp: 32_291_065,
    deudaClp: 0,
    cumplimiento: 1.0,
    cuotasPagadas: "Anticipo + 5 de 5 rentas",
    inicioFacturacion: "Anticipo: ene-2026 · Rentas: abr-2026",
    severidad: "leve",
    diagnostico:
      "AL DÍA al 07-ago-2026 — deuda $0. Anticipo $20MM pagado completo y las 5 rentas emitidas (abr-ago) cubiertas: la de agosto (N°83, $2.492.307) la pagaron ANTICIPADA el 17-jul. La cartola N°28 no registra movimientos suyos porque no tienen nada que pagar hasta el 01-sep. Conciliado contra las facturas reales N°54/55/65/70/83, sin diferencias.",
    rentaTexto:
      "Renta mensual: 51,29 UF + IVA · Anticipo $20.000.000 IVA incluido (pagado) · 24 cuotas en total",
    detalleAtraso: [
      "Anticipo de $20.000.000 IVA incluido: PAGADO completo en 4 transferencias de $5MM (29-ene, 02-feb ×2 y 03-feb-2026). ✓",
      "Rentas abril a julio 2026 (facturas N°54/55/65/70): PAGADAS ($2.431.760 y $2.430.357 el 06-may; $2.452.817 el 12-may; $2.483.824 el 16-jun). ✓",
      "Renta agosto 2026 (factura N°83, $2.492.307): PAGADA el 17-jul-2026, anticipada. ✓",
      "Sin saldo pendiente: lo facturado coincide con lo pagado (la cuota 2/24 cerró con $1.403 de diferencia por redondeo de UF, bajo el umbral de $5.000 que el sistema trata como ruido).",
    ],
    notasInternas: [
      "⚠️ RUT en contrato (53.319.273-4) NO COINCIDE con RUT pagador real en cartola (53.321.997-7). Emitir adenda para corregir.",
      "✅ Cartolas oficiales N°21-22 confirman el anticipo: 4 transferencias de $5MM (no 1 de $20MM como estaba registrado).",
    ],
  },
  {
    id: "F1",
    contractId: "C-004",
    proyecto: "Flota — Volvo EX30 PLUS",
    cliente: "SCG SpA",
    rut: "78.096.656-4",
    repLegal: "Cristian Eduardo Allende Tapia",
    emailRepLegal: "cristian.allende@scg.cl",
    esperadoClp: 24_634_287,
    pagadoClp: 23_501_144,
    deudaClp: 1_133_143,
    cumplimiento: 0.954,
    cuotasPagadas: "17 de 19",
    inicioFacturacion: "21-Feb-2025",
    severidad: "leve",
    diagnostico: "Pagador puntual — pagó la cuota 17/48 en dos parcialidades y sólo arrastra $84.870",
    rentaTexto:
      "Renta mensual: 25,58 UF + IVA (rebajada a 21,58 UF desde la cuota 15, may-2026, por reducción de costo de garantías) · 1ª renta: 82,86 UF · 48 cuotas en total",
    detalleAtraso: [
      "Cliente con historial impecable de pagos mensuales durante todo 2025 y 2026.",
      "Cuota 17/48 (factura N°81, $1.047.650): PAGADA en dos parcialidades — $300.000 el 27-jul y $747.650 el 28-jul-2026. ✓",
      "Saldo VENCIDO al 07-ago-2026: $84.870 — arrastre histórico de redondeos, menos de un 10% de una cuota.",
      "Cuota 18/48 ($1.048.273, emitida el 21-jul-2026): impaga, aún EN PLAZO; pasa a vencida el 20-ago-2026.",
      "Cumplimiento actual: 95,4% del facturado esperado.",
    ],
    notasInternas: [
      "Pagos vía RUT pagador 0141831984 (Cristian Eduardo Allende Tapia, persona natural).",
      "Cuotas iniciales de ene-2025 anticipadas — primera renta de 82,86 UF cubrió varios meses.",
      "⚠️ Cartola N°27: SCG partió la cuota en dos transferencias ($300.000 + $747.650). El identificador automático no puede desambiguar parcialidades por monto (RUT compartido con Flota 2), por lo que quedan fijadas en la tabla IMPUTACION_MANUAL de lib/conciliation.ts. Si el cliente repite el patrón, agregar la entrada correspondiente.",
    ],
  },
  {
    id: "F2",
    contractId: "C-005",
    proyecto: "Flota — Volvo EX30 CORE",
    cliente: "SCG SpA",
    rut: "78.096.656-4",
    repLegal: "Cristian Eduardo Allende Tapia",
    emailRepLegal: "cristian.allende@scg.cl",
    esperadoClp: 16_450_354,
    pagadoClp: 15_527_892,
    deudaClp: 922_462,
    cumplimiento: 0.944,
    cuotasPagadas: "14 de 15",
    inicioFacturacion: "21-Jun-2025",
    severidad: "leve",
    diagnostico: "Pagador puntual — sin nada vencido; sólo la cuota de julio, aún en plazo",
    rentaTexto:
      "Renta mensual: 22,93 UF + IVA (rebajada a 18,99 UF desde la cuota 4, sep-2025, por reducción de costo de garantías) · 1ª renta: 70,91 UF · 48 cuotas en total",
    detalleAtraso: [
      "Mismo titular que Flota Volvo EX30 PLUS — historial general de pagos puntuales.",
      "Cuota 13/48 (factura N°82, $921.912): PAGADA el 28-jul-2026 por el monto exacto. ✓",
      "Saldo VENCIDO al 07-ago-2026: $0 — no hay nada atrasado.",
      "Cuota 14/48 ($922.462, emitida el 21-jul-2026): impaga, aún EN PLAZO; pasa a vencida el 20-ago-2026.",
      "Cumplimiento actual: 94,4% del facturado esperado.",
    ],
    notasInternas: [
      "$3.300.000 pagado en may-2025 cubrió la primera factura adelantada.",
      "Pagos vía RUT pagador 0141831984.",
    ],
  },
  {
    id: "TK",
    contractId: "C-003",
    proyecto: "Trongkai — Electroporación ODIN Opticept",
    cliente: "Agrotecnologías e Ingeniería SpA",
    rut: "77.221.203-8",
    repLegal: "José Cuevas Valenzuela",
    emailRepLegal: "jcuevas@trongkai.cl",
    esperadoClp: 1_428_000,
    pagadoClp: 0,
    deudaClp: 1_428_000,
    cumplimiento: 0,
    cuotasPagadas: "0 de 3",
    inicioFacturacion: "01-Jun-2026",
    severidad: "nunca_pago",
    diagnostico: "Nunca ha pagado — al 07-ago-2026 hay TRES cuotas emitidas y ninguna pagada. Dos están VENCIDAS (junio y julio, $476.000 cada una, $952.000) y la de agosto está por vencer. Saldo total $1.428.000, cumplimiento 0%. Es el único cliente de la cartera sin un solo pago registrado.",
    rentaTexto:
      "Renta: $400.000 netos/mes durante 2026 (pruebas) · Vigencia 5 años + 3 prórrogas · Desde 01-Ene-2027 tarifa por hora",
    detalleAtraso: [
      "Inicio de facturación: 01-jun-2026 (primera cuota).",
      "Cuota junio 2026 ($476.000 IVA inc.): ATRASADA (más de 30 días desde emisión), sin pago.",
      "Cuota julio 2026 ($476.000 IVA inc.): emitida el 01-jul, ATRASADA desde el 31-jul, sin pago.",
      "Cuota agosto 2026 ($476.000 IVA inc.): emitida el 01-ago, impaga, aún EN PLAZO; pasa a vencida el 31-ago-2026.",
      "Equipo ODIN Opticept ya entregado el 01-mar-2026 — sin ningún pago a la fecha (verificado contra cartolas hasta el 07-ago-2026).",
    ],
    notasInternas: [
      "Contrato vigente por 5 años + 3 prórrogas. Tarifa por hora inicia 01-ene-2027 (mínimo $400.000/mes).",
      "⚠️ Tercer mes consecutivo sin pago y el equipo lleva 5 meses entregado. El monto es bajo ($476.000/mes), pero el patrón es el peor de la cartera: conviene escalar por la vía contractual antes de que sume un cuarto mes.",
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
    esperadoClp: 175_690_914,
    pagadoClp: 168_121_124,
    deudaClp: 7_569_790,
    cumplimiento: 0.957,
    cuotasPagadas: "Pago inicial + 3 de 4 cuotas pagadas",
    inicioFacturacion: "Pago inicial: 01-may-2026 · Cuotas: 05-may-2026",
    severidad: "leve",
    diagnostico:
      "SIN NADA VENCIDO al 07-ago-2026. El pago inicial (factura N°58, 3.051,93 UF = $145.563.464) fue pagado mediante el 'Traspaso de cuenta' de $145.563.465 del 28-abr-2026. Las tres primeras cuotas (may, jun, jul) están pagadas: la de julio (N°84, $7.567.790) se pagó el 06-jul, al día siguiente de emitida. La cuota de agosto ($7.569.790, emitida el 05-ago) está impaga pero recién dentro del plazo. Sigue siendo el mejor pagador de la cartera.",
    rentaTexto:
      "Pago inicial: 3.051,93 UF + IVA = $145.563.464 (factura N°58) · Renta mensual: 155,74 UF + IVA × 24 cuotas anticipadas (primeros 5 días del mes) · Interés penal 1,5% mensual",
    detalleAtraso: [
      "Pago inicial (factura N°58, $145.563.464): PAGADO vía 'Traspaso de cuenta' de $145.563.465 el 28-abr-2026. ✓",
      "Cuota 1/24 mayo 2026 (factura N°62, $7.447.842): PAGADA el 01-jun-2026. ✓",
      "Cuota 2/24 junio 2026 (factura N°71, $7.542.028): PAGADA el 15-jun-2026. ✓",
      "Cuota 3/24 julio 2026 (factura N°84, $7.567.790): PAGADA el 06-jul-2026. ✓",
      "Cuota 4/24 agosto 2026 ($7.569.790, emitida el 05-ago): impaga, aún EN PLAZO; pasa a vencida el 04-sep-2026.",
      "Sin saldo VENCIDO: todo lo que cumplió plazo está pagado exacto.",
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
    esperadoClp: 12_205_767,
    pagadoClp: 8_925_000,
    deudaClp: 3_280_767,
    cumplimiento: 0.731,
    cuotasPagadas: "1 de 4 facturas",
    inicioFacturacion: "Pago inicial + cuotas 1-2: 30-jun-2026",
    severidad: "moderado",
    diagnostico:
      "Al 07-ago-2026 el pago inicial está cursado pero NINGUNA renta se ha pagado. La factura N°79 ($8.925.000) se pagó el 27-jul-2026 en dos transferencias de $5.000.000 y $3.925.000 que suman el monto exacto (confirmado en cartola N°27). Siguen VENCIDAS las dos primeras rentas: N°77 ($1.082.931) y N°78 ($1.096.440), total $2.179.371, sin movimiento en la cartola N°28. La renta de agosto ($1.101.396) está por vencer. Cumplimiento 73,1%.",
    rentaTexto:
      "Pago inicial: $7.500.000 neto + IVA · Renta mensual: 22,66 UF + IVA × 48 cuotas (primeros 5 días de cada mes desde jun-2026)",
    detalleAtraso: [
      "Pago inicial (factura N°79, 30-jun-2026): $8.925.000 — PAGADO el 27-jul-2026 ($5.000.000 + $3.925.000). ✓",
      "Cuota 1/48 (factura N°77, 30-jun-2026): $1.082.931 — IMPAGA, vencida (>30 días) desde el 30-jul-2026.",
      "Cuota 2/48 (factura N°78, 30-jun-2026): $1.096.440 — IMPAGA, vencida (>30 días) desde el 30-jul-2026.",
      "Cuota 3/48 (05-ago-2026): $1.101.396 — impaga, aún EN PLAZO; pasa a vencida el 04-sep-2026.",
      "Saldo VENCIDO a cobrar: $2.179.371 (las dos primeras rentas). El pago inicial ya está cursado.",
    ],
    notasInternas: [
      "Equipo Axopur (Axolot, 55 L/h) entregado el 01-jun-2026. Contacto: Sebastián Riquelme, s.riquelme@udt.cl.",
      "⚠️ Pagaron el inicial de $8,9MM sin problema pero llevan dos rentas sin pagar. Suele indicar que el pago recurrente no quedó domiciliado — vale la pena preguntar por el mecanismo de pago, no sólo por la deuda.",
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

Junto con saludar, le escribo desde Climate Smart Leasing SpA respecto del estado de cuenta del contrato de solución energética del Edificio Puerta Patagonia, conciliado al 7 de agosto de 2026 contra nuestra cuenta Santander N° 9427891-0 y las facturas electrónicas emitidas.

Primero, y muy especialmente: con los dos pagos recibidos estos días —$1.983.334 el 3 de agosto y $3.211.365 el 10 de agosto— el anticipo de $10.000.000 más IVA quedó pagado en su totalidad, en sus seis cuotas. Se lo agradezco, y quería dejarlo consignado porque cierra la etapa inicial del contrato. Esos mismos pagos saldaron además la renta de mayo (factura N°64). Con ello, el registro completo a la fecha es: las seis cuotas del anticipo y las rentas 1, 2 y 3 de 36, por un total recibido de $21.461.084.

Dicho eso, quedan tres facturas de renta pendientes de pago. Dos ya están vencidas y la tercera, emitida este mes, está por vencer:

Vencidas (más de 30 días desde su emisión):
- Factura N°69 (06-jun-2026) — Renta mensual cuota 4 de 36: $3.252.266
- Renta mensual cuota 5 de 36 (06-jul-2026): $3.260.773

Por vencer (emitida en agosto):
- Renta mensual cuota 6 de 36: $3.262.728

Total vencido: $6.513.039 · Total pendiente (incluida la renta de agosto por vencer): $9.775.767

Ambas facturas vencidas superan los 30 días desde su emisión, sin perjuicio de que el plazo de pago contractual es de 15 días corridos (Cláusula Tercera del contrato).

El proyecto fue recepcionado definitivamente por ustedes el 8 de abril de 2026 sin observaciones, por lo que no existen pendientes de obra asociados a estos pagos.

Con el anticipo ya cerrado, lo que queda por delante es únicamente la renta mensual, y ahí hay un punto que me gustaría conversar: los pagos vienen corriendo con alrededor de dos meses de rezago respecto de la emisión, de modo que la mora se mantiene estable pero no se reduce, y sigue devengando interés máximo convencional conforme al contrato. Le propongo coordinar un calendario que permita adelantar una cuota y dejar el contrato al día; quedo disponible para conversarlo cuando le acomode. Si alguno de estos pagos ya fue cursado y no figura aún en nuestra cuenta, le agradezco avisarme.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: jgonzalez@climatesmartleasing.com

Quedo atento a sus comentarios.

Saludos cordiales,

Juan Pablo González Jaramillo
Gerente General · Climate Smart Leasing SpA`,
    },
    VK: {
      asunto: "Estado de cuenta · Sistema ACS — Comunidad Edificio Los Vikingos",
      cuerpo: `Estimada María Pilar,

Junto con saludar, le escribo desde Climate Smart Leasing SpA con el estado de cuenta actualizado del contrato del Sistema ACS de la Comunidad Edificio Los Vikingos.

Quiero partir agradeciendo la excelente puntualidad de la comunidad: el anticipo de $20.000.000 IVA incluido quedó cubierto en su totalidad (recibido en cuatro transferencias entre el 29 de enero y el 3 de febrero de 2026) y las rentas de abril a agosto están todas pagadas — la de agosto incluso de forma anticipada, el 17 de julio.

Al conciliar contra los movimientos de la cuenta Santander N° 9427891-0 al 7 de agosto de 2026, la cuenta está completamente al día, sin saldo pendiente.

Estado de cuenta al 7 de agosto de 2026:

Facturado esperado: $32.291.065
Recibido a la fecha: $32.291.065
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
Confirmación a: jgonzalez@climatesmartleasing.com

Muchas gracias por su buena disposición.

Saludos cordiales,

Juan Pablo González Jaramillo
Gerente General · Climate Smart Leasing SpA`,
    },
    F1: {
      asunto: "Estado de cuenta SCG · Flota Volvo EX30 PLUS y CORE — conciliación al 07-ago-2026",
      cuerpo: `Estimado Cristian,

Junto con saludar, te escribo desde Climate Smart Leasing SpA con el estado de cuenta de los dos contratos de arrendamiento de SCG SpA — Flota Volvo EX30 PLUS y Flota Volvo EX30 CORE — conciliado al 7 de agosto de 2026 contra los movimientos de la cuenta Santander N° 9427891-0.

Partir agradeciendo los pagos de fin de julio: recibimos $300.000 el 27 y $747.650 el 28, que sumados cubren exactamente la factura N°81 del EX30 PLUS, y $921.912 el 28 por la factura N°82 del EX30 CORE. Con eso ambos contratos quedan prácticamente al día — SCG sigue siendo nuestro cliente más puntual.

Flota Volvo EX30 PLUS (renta 25,58 UF + IVA, rebajada a 21,58 UF desde may-2026, inicio facturación 21 feb 2025):

Facturado esperado: $24.634.287
Recibido a la fecha: $23.501.144
Saldo vencido: $84.870
Cuota de julio, aún en plazo: $1.048.273
Cumplimiento: 95,4%

Flota Volvo EX30 CORE (renta 22,93 UF + IVA, rebajada a 18,99 UF desde sep-2025, inicio facturación 21 jun 2025):

Facturado esperado: $16.450.354
Recibido a la fecha: $15.527.892
Saldo vencido: $0
Cuota de julio, aún en plazo: $922.462
Cumplimiento: 94,4%

Saldo consolidado pendiente: $2.055.605, de los cuales sólo $84.870 están vencidos.

El único punto a regularizar es esa diferencia de $84.870 en el EX30 PLUS, que viene arrastrándose de ajustes de UF de meses anteriores. Si te parece, la sumamos a la cuota de agosto y la dejamos cerrada. Las cuotas de julio de ambos contratos vencen el 20 de agosto.

Adjunto el estado de cuenta detallado en Excel con las cuotas de ambos contratos.

Los datos de transferencia son los de siempre:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: jgonzalez@climatesmartleasing.com

Muchas gracias por la puntualidad de siempre, Cristian. Cualquier duda, conversemos.

Saludos,

Juan Pablo González Jaramillo
Gerente General · Climate Smart Leasing SpA`,
    },
    F2: {
      asunto: "Estado de cuenta SCG · Flota Volvo EX30 PLUS y CORE — conciliación al 07-ago-2026",
      cuerpo: `Estimado Cristian,

Junto con saludar, te escribo desde Climate Smart Leasing SpA con el estado de cuenta de los dos contratos de arrendamiento de SCG SpA — Flota Volvo EX30 PLUS y Flota Volvo EX30 CORE — conciliado al 7 de agosto de 2026 contra los movimientos de la cuenta Santander N° 9427891-0.

Partir agradeciendo los pagos de fin de julio: recibimos $300.000 el 27 y $747.650 el 28, que sumados cubren exactamente la factura N°81 del EX30 PLUS, y $921.912 el 28 por la factura N°82 del EX30 CORE. Con eso ambos contratos quedan prácticamente al día — SCG sigue siendo nuestro cliente más puntual.

Flota Volvo EX30 PLUS (renta 25,58 UF + IVA, rebajada a 21,58 UF desde may-2026, inicio facturación 21 feb 2025):

Facturado esperado: $24.634.287
Recibido a la fecha: $23.501.144
Saldo vencido: $84.870
Cuota de julio, aún en plazo: $1.048.273
Cumplimiento: 95,4%

Flota Volvo EX30 CORE (renta 22,93 UF + IVA, rebajada a 18,99 UF desde sep-2025, inicio facturación 21 jun 2025):

Facturado esperado: $16.450.354
Recibido a la fecha: $15.527.892
Saldo vencido: $0
Cuota de julio, aún en plazo: $922.462
Cumplimiento: 94,4%

Saldo consolidado pendiente: $2.055.605, de los cuales sólo $84.870 están vencidos.

El único punto a regularizar es esa diferencia de $84.870 en el EX30 PLUS, que viene arrastrándose de ajustes de UF de meses anteriores. Si te parece, la sumamos a la cuota de agosto y la dejamos cerrada. Las cuotas de julio de ambos contratos vencen el 20 de agosto.

Adjunto el estado de cuenta detallado en Excel con las cuotas de ambos contratos.

Los datos de transferencia son los de siempre:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: jgonzalez@climatesmartleasing.com

Muchas gracias por la puntualidad de siempre, Cristian. Cualquier duda, conversemos.

Saludos,

Juan Pablo González Jaramillo
Gerente General · Climate Smart Leasing SpA`,
    },
    TK: {
      asunto: "Primera cuota pendiente · Contrato ODIN Opticept — Agrotecnologías e Ingeniería",
      cuerpo: `Estimado José,

Junto con saludar, le escribo desde Climate Smart Leasing SpA en relación al contrato de arrendamiento del equipo de electroporación ODIN Opticept entregado a Agrotecnologías e Ingeniería SpA el 1 de marzo de 2026.

Según lo establecido en el contrato, la facturación inició el 1 de junio de 2026. Al revisar nuestros registros conciliados con la cuenta Santander N° 9427891-0 al 7 de agosto de 2026, las cuotas de junio y julio figuran pendientes de pago, y ambas ya superaron los 30 días desde su emisión.

Estado de cuenta al 7 de agosto de 2026:

Facturado esperado: $952.000
Recibido a la fecha: $0
Saldo pendiente: $952.000 (100% vencido)
Cumplimiento: 0% (0 de 2 cuotas)

Le recuerdo que el contrato considera $400.000 netos mensuales durante 2026 como tarifa de prueba, con vigencia de 5 años más 3 prórrogas, cambiando a tarifa por hora desde el 1 de enero de 2027 (mínimo $400.000 mensuales).

Le agradecería coordinar el pago de estas dos cuotas a la brevedad. Si hay alguna observación respecto al funcionamiento del equipo o alguna condición del contrato que necesitemos revisar antes de la regularización, avíseme y lo conversamos.

Adjunto el estado de cuenta detallado en Excel.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: jgonzalez@climatesmartleasing.com

Quedo atento a sus comentarios.

Saludos cordiales,

Juan Pablo González Jaramillo
Gerente General · Climate Smart Leasing SpA`,
    },
    AX: {
      asunto: "Rentas de junio y julio pendientes · Contrato Axopur — Bebidas Funcionales Caelum",
      cuerpo: `Estimado Sebastián,

Junto con saludar, le escribo desde Climate Smart Leasing SpA en relación al contrato de arriendo del equipo Axopur, firmado el 26 de mayo de 2026.

Primero, agradecer el pago inicial: el 27 de julio recibimos dos transferencias por $5.000.000 y $3.925.000, que suman exactamente los $8.925.000 de la factura N°79. Queda conciliado y cerrado.

De las tres facturas emitidas el 30 de junio de 2026, quedan pendientes las dos rentas, que ya superaron los 30 días desde su emisión:

- Factura N°77 — Cuota 1/48: $1.082.931 (vencida)
- Factura N°78 — Cuota 2/48: $1.096.440 (vencida)

Saldo pendiente: $2.179.371 · Pago inicial (N°79, $8.925.000): PAGADO ✓

Le agradecería coordinar el pago de estas dos rentas a la brevedad. Si ya las cursaron y no figuran aún en nuestra cuenta, avíseme y lo revisamos.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: jgonzalez@climatesmartleasing.com

Quedo atento a sus comentarios.

Saludos cordiales,

Juan Pablo González Jaramillo
Gerente General · Climate Smart Leasing SpA`,
    },
    BA: {
      asunto: "Estado de cuenta al día · Planta de hielo y proceso — Procesadora Barranco Amarillo",
      cuerpo: `Estimado Washington,

Junto con saludar, le escribo desde Climate Smart Leasing SpA con el estado de cuenta del contrato de arriendo de equipos de la planta (generador de hielo, Baader 200, unidad condensadora y tablero), conciliado contra nuestra cuenta Santander N° 9427891-0 con cartolas al 31 de julio de 2026.

Le agradezco la puntualidad: tenemos correctamente recibidos el pago inicial (factura N°58 por $145.563.464, recibido el 28 de abril) y las tres cuotas emitidas — mayo (factura N°62, $7.447.842), junio (factura N°71, $7.542.028) y julio (factura N°84, $7.567.790, pagada el 6 de julio, al día siguiente de emitida).

La cuenta está completamente al día: $168.121.124 facturados y $168.121.124 recibidos, sin saldo pendiente ni atrasos. Es, por lejos, el mejor comportamiento de pago de nuestra cartera y se lo quiero reconocer.

La próxima cuota (agosto, ~$7,5 millones IVA incluido) se factura dentro de los primeros días del mes.

Adjunto el estado de cuenta detallado en Excel con las 24 cuotas del contrato.

Los datos para transferencia son los de siempre:

Banco Santander
Climate Smart Leasing SpA
RUT 77.868.887-5
Cuenta corriente 9427891-0
Confirmación a: jgonzalez@climatesmartleasing.com

Muchas gracias por la buena disposición.

Saludos cordiales,

Juan Pablo González Jaramillo
Gerente General · Climate Smart Leasing SpA`,
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

  // Cifras derivadas de lib/totales.ts (fuente canónica — misma que Dashboard,
  // Contratos y Consolidado, para que TODO cuadre siempre).
  const today = new Date();
  const finByContract: Record<string, Totales> = {};
  for (const cid of Object.keys(result.porContrato)) {
    finByContract[cid] = totalesContrato(result, cid, today);
  }
  const FIN_VACIO: Totales = { totalContrato: 0, emitido: 0, pagado: 0, pagadoEmitido: 0, atrasado: 0, enPlazo: 0, saldoEmitido: 0, porFacturar: 0, porFacturarNeto: 0, porPagarTotal: 0, cumplimiento: 1 };
  const fin = (d: Deudor) => finByContract[d.contractId] || FIN_VACIO;

  // Datos para generar Excel/PPT EN EL MOMENTO con las cifras vivas (nunca archivos estáticos)
  const datosExport = (d: Deudor): DatosEstadoCuenta => {
    const esSCG = d.contractId === "C-004" || d.contractId === "C-005";
    // SCG: el Excel/PPT lleva las hojas de AMBOS contratos → el resumen debe
    // sumar ambos para que cuadre con las hojas adjuntas.
    const ids = esSCG ? ["C-004", "C-005"] : [d.contractId];
    const fs = ids.map(id => finByContract[id] || FIN_VACIO);
    const f = {
      emitido: fs.reduce((s, x) => s + x.emitido, 0),
      pagadoEmitido: fs.reduce((s, x) => s + x.pagadoEmitido, 0),
      saldoEmitido: fs.reduce((s, x) => s + x.saldoEmitido, 0),
    };
    const cumplimiento = f.emitido > 0 ? f.pagadoEmitido / f.emitido : 1;
    return {
      nombreArchivo: d.proyecto.split("—")[0].trim().normalize("NFD").replace(/[^A-Za-z0-9]/g, ""),
      proyecto: d.proyecto,
      cliente: d.cliente,
      rut: d.rut,
      contractIds: ids,
      esperado: f.emitido,
      pagado: f.pagadoEmitido,
      deuda: f.saldoEmitido,
      cumplimiento,
      detalle: d.detalleAtraso,
    };
  };
  const [generando, setGenerando] = useState<string | null>(null);
  const genExcel = async (d: Deudor) => {
    setGenerando(d.id + "-xls");
    try { await descargarExcelEstadoCuenta(datosExport(d), result.porContrato); } finally { setGenerando(null); }
  };
  const genPpt = async (d: Deudor) => {
    setGenerando(d.id + "-ppt");
    try { await descargarPptEstadoCuenta(datosExport(d)); } finally { setGenerando(null); }
  };

  // Ordenar por severidad (más grave primero) y deuda descendente
  const deudores = [...DEUDORES].sort((a, b) => {
    const ap = SEVERIDAD_META[a.severidad].priority;
    const bp = SEVERIDAD_META[b.severidad].priority;
    if (ap !== bp) return ap - bp;
    return fin(b).saldoEmitido - fin(a).saldoEmitido;
  });

  const totalEsperado = deudores.reduce((s, d) => s + fin(d).emitido, 0);
  const totalPagado = deudores.reduce((s, d) => s + fin(d).pagadoEmitido, 0);
  const totalSaldo = deudores.reduce((s, d) => s + fin(d).saldoEmitido, 0);
  const totalAtrasado = deudores.reduce((s, d) => s + fin(d).atrasado, 0);
  const totalEnPlazo = deudores.reduce((s, d) => s + fin(d).enPlazo, 0);
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
            {fmtCLP(totalSaldo)}
          </div>
          <div className="text-xs mt-1">
            <span className="text-red-500 font-medium tabular">{fmtCLP(totalAtrasado)} atrasado (30+ días)</span>
            <span className="text-ink-300"> · </span>
            <span className="text-amber-600 tabular">{fmtCLP(totalEnPlazo)} en plazo</span>
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
                        {fmtCLP(f.emitido)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                        Pagado
                      </div>
                      <div className="text-sm font-semibold tabular text-csl-600">
                        {fmtCLP(f.pagadoEmitido)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                        Saldo
                      </div>
                      <div className="text-base font-semibold tabular text-red-700">
                        {fmtCLP(f.saldoEmitido)}
                      </div>
                      <div className="text-[10px] tabular text-ink-400">
                        {f.atrasado > 0 ? `atrasado: ${fmtCLP(f.atrasado)}` : "sin atraso"}
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
                    <button
                      onClick={() => genExcel(d)}
                      disabled={generando === d.id + "-xls"}
                      title="Genera el Excel al momento con los datos conciliados al día"
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      {generando === d.id + "-xls" ? "Generando…" : "Excel al día"}
                    </button>
                    <button
                      onClick={() => genPpt(d)}
                      disabled={generando === d.id + "-ppt"}
                      title="Genera la presentación al momento con los datos conciliados al día"
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
                    >
                      <Presentation className="w-3.5 h-3.5" />
                      {generando === d.id + "-ppt" ? "Generando…" : "PPT al día"}
                    </button>
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

                      <div className="text-[10px] text-ink-400 italic">
                        Los adjuntos (Excel y PPT) se generan con los botones de la tarjeta del deudor — siempre con los datos conciliados al día.
                      </div>
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
          (listo para Gmail u Outlook), un Excel y una presentación que se
          GENERAN EN EL MOMENTO con todas las cuotas del contrato y su pago
          real conciliado contra la cuenta Santander 9427891-0 — siempre con
          los datos al día, nunca archivos guardados. Descárgalos y adjúntalos
          al correo. Los emails de los destinatarios son provisorios —
          revísalos antes de enviar.
        </p>
      </div>
    </section>
  );
}
