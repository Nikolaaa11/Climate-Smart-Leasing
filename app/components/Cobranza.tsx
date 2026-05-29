"use client";

import { useState } from "react";
import { fmtCLP, fmtPct } from "@/lib/format";
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
// DEUDORES — datos oficiales del Excel CSL_Reconciliacion_Pagos
// Período cubierto: ene-2024 al 12-may-2026
// Fuente: libro contable CSL + cartolas Santander 9427891-0
// ============================================================================
export interface Deudor {
  id: string;
  proyecto: string;
  cliente: string;
  rut: string;
  repLegal: string;
  emailRepLegal: string;       // (placeholder — editable en cada caso)
  emailContacto?: string;
  esperadoClp: number;
  pagadoClp: number;
  deudaClp: number;
  cumplimiento: number;        // 0..1
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

const HOY = "29-Mayo-2026";

export const DEUDORES: Deudor[] = [
  {
    id: "PP",
    proyecto: "Puerta Patagonia — Calderas Vilanova",
    cliente: "Comunidad Edificio Puerta Patagonia Habitacional",
    rut: "53.319.273-4",
    repLegal: "Juan Moisés González Muñoz",
    emailRepLegal: "administracion@puertapatagonia.cl",
    esperadoClp: 10_316_383,
    pagadoClp: 10_316_383,
    deudaClp: 0,
    cumplimiento: 1.0,
    cuotasPagadas: "2 de 2 facturadas (al día)",
    inicioFacturacion: "Cuota 1: abril 2026 (post-recepción definitiva 08-abr-2026)",
    severidad: "leve",
    diagnostico: "CUENTA AL DÍA al 29-may-2026. Cuotas 1 (abril) y 2 (mayo) íntegramente cubiertas: renta + anticipo prorrateado.",
    rentaTexto:
      "Renta mensual: 67,127 UF + IVA (36 cuotas desde abril-2026) · Anticipo $10.000.000 + IVA prorrateado en 6 cuotas de $1.983.334 IVA inc., pagadero junto con cuotas 1-6.",
    detalleAtraso: [
      "Cuota 1 (abril 2026): $5.150.283 — renta $3.166.949 + anticipo $1.983.334. PAGADA (renta 18-mar y anticipo 17-dic-2025).",
      "Cuota 2 (mayo 2026): $5.166.100 — renta $3.182.766 + anticipo $1.983.334. PAGADA (renta 05-may y anticipo 20-feb-2026).",
      "Próximo vencimiento: cuota 3 (junio 2026), ≈$5,2M (incluye anticipo prorrateado c3/6). Vence ~05-jul-2026.",
      "Las cuotas 3 a 6 (jun-sep 2026) llevan anticipo prorrateado (≈$5,2M c/u). Desde cuota 7 (octubre 2026), solo renta (≈$3,2M).",
    ],
    notasInternas: [
      "✅ Recalculado con fechaInicioPagos = 01-abr-2026 (contrato empezó a regir en abril, post-recepción definitiva 08-abr-2026).",
      "PP ha pagado 4 abonos: 2× anticipo prorrateado ($1.983.334) y 2× renta ($3.166.949 y $3.182.766) = $10.316.383.",
      "Los 2 anticipos se aplican FIFO a las cuotas 1 y 2 del anticipo prorrateado del contrato.",
      "Base legal: Cláusula Tercera del contrato + Carta de recepción definitiva del 08-abr-2026 firmada por Juan González Muñoz.",
    ],
    archivoExcel: "/downloads/CSL_EstadoCuenta_PuertaPatagonia.xlsx",
    archivoPpt: "/downloads/CSL_Presentacion_PuertaPatagonia.pptx",
  },
  {
    id: "VK",
    proyecto: "Vikingos — Sistema ACS",
    cliente: "Comunidad Edificio Los Vikingos",
    rut: "53.321.997-7",
    repLegal: "María Pilar Alliende Wielandt",
    emailRepLegal: "administracion@edificiovikingos.cl",
    esperadoClp: 29_857_247,
    pagadoClp: 27_314_934,
    deudaClp: 2_542_313,
    cumplimiento: 0.9149,
    cuotasPagadas: "2 de 4",
    inicioFacturacion: "05-Feb-2026",
    severidad: "leve",
    diagnostico: "Atraso leve — anticipo $20MM pagado completo, faltan rentas regulares de feb-mar-abr-may 2026",
    rentaTexto:
      "Renta mensual: 51,29 UF + IVA · Anticipo $20.000.000 IVA incluido (1 cuota — pagado) · 24 cuotas en total",
    detalleAtraso: [
      "Anticipo de $20.000.000 IVA incluido: PAGADO completo el 03-feb-2026. ✓",
      "Rentas mensuales (51,29 UF + IVA, aprox. $2,4–2,5 millones IVA inc.): pagos detectados en mayo-2026.",
      "Pendiente regularizar el calendario mensual para los próximos meses.",
      "Cumplimiento actual: 91,5% del facturado esperado al 12-may-2026.",
    ],
    notasInternas: [
      "⚠️ RUT en contrato (53.319.273-4) NO COINCIDE con RUT pagador real en cartola (53.321.997-7). Emitir adenda para corregir.",
      "El pago de $20MM llegó como 'Edificio los Vikingos' sin nº transferencia identificable — verificar en libro contable.",
    ],
    archivoExcel: "/downloads/CSL_EstadoCuenta_Vikingos.xlsx",
  },
  {
    id: "F1",
    proyecto: "Flota — Volvo EX30 PLUS",
    cliente: "SCG SpA",
    rut: "78.096.656-4",
    repLegal: "Cristian Eduardo Allende Tapia",
    emailRepLegal: "cristian.allende@scg.cl",
    esperadoClp: 21_940_172,
    pagadoClp: 20_387_713,
    deudaClp: 1_552_459,
    cumplimiento: 0.9292,
    cuotasPagadas: "15 de 16",
    inicioFacturacion: "21-Feb-2025",
    severidad: "leve",
    diagnostico: "Pagador puntual — pequeño saldo arrastrado de la última cuota",
    rentaTexto:
      "Renta mensual: 25,58 UF + IVA · 1ª renta: 82,86 UF · 48 cuotas en total",
    detalleAtraso: [
      "Cliente con historial impecable de pagos mensuales durante todo 2025 y 2026.",
      "Pequeña diferencia de $1.552.459 al cierre del 12-may-2026 (probable cuota en tránsito o ajuste UF).",
      "Cumplimiento actual: 92,9% del facturado esperado.",
    ],
    notasInternas: [
      "Pagos vía RUT pagador 0141831984 (Cristian Eduardo Allende Tapia, persona natural).",
      "Cuotas iniciales de ene-2025 anticipadas — primera renta de 82,86 UF cubrió varios meses.",
    ],
    archivoExcel: "/downloads/CSL_EstadoCuenta_SCG.xlsx",
  },
  {
    id: "F2",
    proyecto: "Flota — Volvo EX30 CORE",
    cliente: "SCG SpA",
    rut: "78.096.656-4",
    repLegal: "Cristian Eduardo Allende Tapia",
    emailRepLegal: "cristian.allende@scg.cl",
    esperadoClp: 15_307_125,
    pagadoClp: 12_788_511,
    deudaClp: 2_518_614,
    cumplimiento: 0.8355,
    cuotasPagadas: "11 de 12",
    inicioFacturacion: "21-Jun-2025",
    severidad: "moderado",
    diagnostico: "Atraso moderado — falta aprox. 1 cuota completa",
    rentaTexto:
      "Renta mensual: 22,93 UF + IVA · 1ª renta: 70,91 UF · 48 cuotas en total",
    detalleAtraso: [
      "Mismo titular que Flota Volvo EX30 PLUS — historial general de pagos puntuales.",
      "Saldo pendiente de $2.518.614 al 12-may-2026, equivalente a aproximadamente 1 cuota mensual completa.",
      "Cumplimiento actual: 83,5% del facturado esperado.",
    ],
    notasInternas: [
      "$3.300.000 pagado en may-2025 cubrió la primera factura adelantada.",
      "Pagos vía RUT pagador 0141831984.",
    ],
    archivoExcel: "/downloads/CSL_EstadoCuenta_SCG.xlsx",
  },
  {
    id: "TK",
    proyecto: "Trongkai — Electroporación ODIN Opticept",
    cliente: "Agrotecnologías e Ingeniería SpA",
    rut: "77.221.203-8",
    repLegal: "José Cuevas Valenzuela",
    emailRepLegal: "jcuevas@trongkai.cl",
    esperadoClp: 476_000,
    pagadoClp: 0,
    deudaClp: 476_000,
    cumplimiento: 0,
    cuotasPagadas: "0 de 1",
    inicioFacturacion: "01-May-2026",
    severidad: "nunca_pago",
    diagnostico: "Nunca ha pagado — primera cuota vencida hace 12 días",
    rentaTexto:
      "Renta: $400.000 netos/mes durante 2026 (pruebas) · Vigencia 5 años + 3 prórrogas · Desde 01-Ene-2027 tarifa por hora",
    detalleAtraso: [
      "Inicio de facturación: 01-may-2026.",
      "Primera cuota de $476.000 (IVA incluido) emitida y pendiente de pago.",
      "Equipo ODIN Opticept ya entregado el 01-mar-2026 — sin pagos a la fecha.",
      "Cumplimiento actual: 0%.",
    ],
    notasInternas: [
      "Contrato vigente por 5 años + 3 prórrogas. Tarifa por hora inicia 01-ene-2027 (mínimo $400.000/mes).",
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
      asunto: "Rectificación estado de cuenta · Contrato Calderas Vilanova — Puerta Patagonia",
      cuerpo: `Estimado Juan Moisés,

Junto con saludar, le escribo desde Climate Smart Leasing SpA para corregir formalmente el estado de cuenta del contrato Calderas Vilanova que les hicimos llegar anteriormente.

Al revisar nuevamente el contrato a la luz de la carta de recepción definitiva del proyecto firmada por usted el 8 de abril de 2026, identifiqué que el cálculo anterior no consideraba correctamente cuándo comenzaba a devengarse la renta mensual del arrendamiento. La Cláusula Tercera del contrato establece que "la primera renta se pagará junto con el inicio de los trabajos", y siendo que la recepción definitiva del proyecto se materializó el 2 de abril de 2026, la renta mensual del leasing corresponde devengarla desde mayo de 2026 en adelante, no desde diciembre de 2025 como se calculó en el primer envío.

Le pido disculpas por la confusión que pudo haber generado el monto enviado anteriormente.

Estado de cuenta rectificado al 12 de mayo de 2026:

Facturado a la fecha: $15.104.851
Recibido a la fecha: $10.316.383
Saldo pendiente total: $4.788.468
Cumplimiento: 68,3%

De ese saldo:
- Vencido (anticipo): $1.583.621 — corresponde a la cuota 2/6 del anticipo prorrateado (enero 2026, sin pago registrado) más una diferencia de la cuota 5/6 (abril 2026, pago parcial).
- En plazo (renta mayo 2026): $3.204.847 — primera renta mensual del leasing. La factura fue emitida los primeros días de mayo y el plazo de pago de 15 días corridos vence aproximadamente el 20 de mayo, por lo que esta cuota todavía no constituye mora.

Le adjunto el Excel con el detalle completo de las 42 cuotas del contrato (6 de anticipo + 36 de renta mensual) y la presentación con el desglose y la base legal del recálculo, para que pueda revisarlo en detalle.

Me gustaría coordinar con usted el pago de los $1.583.621 vencidos del anticipo a la brevedad. Para la renta de mayo simplemente seguiremos el calendario contractual normal. Quedo plenamente disponible para conversar cualquier duda o detalle de la rectificación.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.620.301-4
Cuenta corriente 9427891-0
Confirmación a: nikolasromero@climatesmartleasing.com

Nuevamente le pido disculpas por la confusión generada y agradezco su comprensión.

Saludos cordiales,

Nikolás Romero
Climate Smart Leasing SpA`,
    },
    VK: {
      asunto: "Estado de cuenta · Sistema ACS — Comunidad Edificio Los Vikingos",
      cuerpo: `Estimada María Pilar,

Junto con saludar, le escribo desde Climate Smart Leasing SpA con el estado de cuenta actualizado del contrato del Sistema ACS de la Comunidad Edificio Los Vikingos.

Quiero partir agradeciendo el pago del anticipo de $20.000.000 IVA incluido recibido el 3 de febrero de 2026, que quedó cubierto en su totalidad. También tenemos registradas las primeras rentas mensuales de febrero a mayo en pagos concentrados durante mayo de 2026.

Al conciliar contra los movimientos de la cuenta Santander N° 9427891-0 al 12 de mayo de 2026, queda una pequeña diferencia pendiente respecto al cronograma del contrato.

Estado de cuenta al 12 de mayo de 2026:

Facturado esperado: $29.857.247
Recibido a la fecha: $27.314.934
Saldo pendiente: $2.542.313
Cumplimiento: 91,5% (2 de 4 cuotas regulares)

Le recuerdo que la renta mensual del contrato es de 51,29 UF más IVA (aproximadamente $2,4 a $2,5 millones IVA incluido al valor UF vigente), por 24 cuotas.

Le agradecería mucho si pueden regularizar esta diferencia cuando les sea posible, o avisarme si hay algún pago en tránsito que aún no me figure en los registros. También quería comentarle que estamos preparando una adenda menor al contrato para corregir el RUT del cliente (quedó 53.319.273-4 en el documento original, cuando el correcto y desde el cual ustedes pagan es 53.321.997-7); se la haré llegar en los próximos días para su firma.

Adjunto el estado de cuenta detallado en Excel.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.620.301-4
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

Junto con saludar, te escribo desde Climate Smart Leasing SpA con el estado de cuenta de los dos contratos de arrendamiento de SCG SpA — Flota Volvo EX30 PLUS y Flota Volvo EX30 CORE — conciliado al 12 de mayo de 2026 contra los movimientos de la cuenta Santander N° 9427891-0.

Partir diciendo que SCG ha sido nuestro cliente más puntual en lo que va de los contratos, con un historial impecable de pagos mensuales durante todo 2025 y 2026. Al cierre quedan dos pequeñas diferencias que probablemente corresponden a cuotas en tránsito o ajustes de UF, pero te las paso para que las revisemos en conjunto.

Flota Volvo EX30 PLUS (renta 25,58 UF + IVA, inicio facturación 21 feb 2025):

Facturado esperado: $21.940.172
Recibido a la fecha: $20.387.713
Saldo pendiente: $1.552.459
Cumplimiento: 92,9% (15 de 16 cuotas)

Flota Volvo EX30 CORE (renta 22,93 UF + IVA, inicio facturación 21 jun 2025):

Facturado esperado: $15.307.125
Recibido a la fecha: $12.788.511
Saldo pendiente: $2.518.614
Cumplimiento: 83,5% (11 de 12 cuotas)

Saldo consolidado: $4.071.073

Si de tu lado los pagos están al día, avísame para revisar bien si hay alguna transferencia que no me figura registrada y conciliarlo. Si efectivamente queda esa diferencia, agradezco regularizarla cuando puedas.

Adjunto el estado de cuenta detallado en Excel con las cuotas de ambos contratos.

Los datos de transferencia son los de siempre:

Banco Santander
Climate Smart Leasing SpA
RUT 77.620.301-4
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

Junto con saludar, te escribo desde Climate Smart Leasing SpA con el estado de cuenta de los dos contratos de arrendamiento de SCG SpA — Flota Volvo EX30 PLUS y Flota Volvo EX30 CORE — conciliado al 12 de mayo de 2026 contra los movimientos de la cuenta Santander N° 9427891-0.

Partir diciendo que SCG ha sido nuestro cliente más puntual en lo que va de los contratos, con un historial impecable de pagos mensuales durante todo 2025 y 2026. Al cierre quedan dos pequeñas diferencias que probablemente corresponden a cuotas en tránsito o ajustes de UF, pero te las paso para que las revisemos en conjunto.

Flota Volvo EX30 PLUS (renta 25,58 UF + IVA, inicio facturación 21 feb 2025):

Facturado esperado: $21.940.172
Recibido a la fecha: $20.387.713
Saldo pendiente: $1.552.459
Cumplimiento: 92,9% (15 de 16 cuotas)

Flota Volvo EX30 CORE (renta 22,93 UF + IVA, inicio facturación 21 jun 2025):

Facturado esperado: $15.307.125
Recibido a la fecha: $12.788.511
Saldo pendiente: $2.518.614
Cumplimiento: 83,5% (11 de 12 cuotas)

Saldo consolidado: $4.071.073

Si de tu lado los pagos están al día, avísame para revisar bien si hay alguna transferencia que no me figura registrada y conciliarlo. Si efectivamente queda esa diferencia, agradezco regularizarla cuando puedas.

Adjunto el estado de cuenta detallado en Excel con las cuotas de ambos contratos.

Los datos de transferencia son los de siempre:

Banco Santander
Climate Smart Leasing SpA
RUT 77.620.301-4
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

Según lo establecido en el contrato, la facturación inició el 1 de mayo de 2026 con la primera cuota de $476.000 IVA incluido. Al revisar nuestros registros conciliados con la cuenta Santander N° 9427891-0 al 12 de mayo de 2026, esta primera cuota aún figura pendiente de pago.

Estado de cuenta al 12 de mayo de 2026:

Facturado esperado: $476.000
Recibido a la fecha: $0
Saldo pendiente: $476.000
Cumplimiento: 0% (0 de 1 cuotas)

Le recuerdo que el contrato considera $400.000 netos mensuales durante 2026 como tarifa de prueba, con vigencia de 5 años más 3 prórrogas, cambiando a tarifa por hora desde el 1 de enero de 2027 (mínimo $400.000 mensuales).

Le agradecería coordinar el pago de esta primera cuota a la brevedad. Si hay alguna observación respecto al funcionamiento del equipo o alguna condición del contrato que necesitemos revisar antes de la regularización, avíseme y lo conversamos.

Adjunto el estado de cuenta detallado en Excel.

Los datos para transferencia son:

Banco Santander
Climate Smart Leasing SpA
RUT 77.620.301-4
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
export default function Cobranza() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mailOpen, setMailOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<"asunto" | "cuerpo" | "todo" | null>(null);

  // Ordenar por severidad (más grave primero) y deuda descendente
  const deudores = [...DEUDORES].sort((a, b) => {
    const ap = SEVERIDAD_META[a.severidad].priority;
    const bp = SEVERIDAD_META[b.severidad].priority;
    if (ap !== bp) return ap - bp;
    return b.deudaClp - a.deudaClp;
  });

  const totalEsperado = deudores.reduce((s, d) => s + d.esperadoClp, 0);
  const totalPagado = deudores.reduce((s, d) => s + d.pagadoClp, 0);
  const totalDeuda = deudores.reduce((s, d) => s + d.deudaClp, 0);
  const cumpGlobal = totalPagado / totalEsperado;

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
            {deudores.filter((d) => d.deudaClp > 0).length} deudores activos
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
                        {fmtCLP(d.esperadoClp)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                        Pagado
                      </div>
                      <div className="text-sm font-semibold tabular text-csl-600">
                        {fmtCLP(d.pagadoClp)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                        Deuda
                      </div>
                      <div className="text-base font-semibold tabular text-red-700">
                        {fmtCLP(d.deudaClp)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                        Cumplim.
                      </div>
                      <div className="text-sm font-semibold tabular text-ink-700">
                        {fmtPct(d.cumplimiento)}
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
                        d.cumplimiento >= 0.9
                          ? "bg-csl-500"
                          : d.cumplimiento >= 0.7
                          ? "bg-amber-500"
                          : d.cumplimiento >= 0.3
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.max(d.cumplimiento * 100, 2)}%`,
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
