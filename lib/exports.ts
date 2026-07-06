"use client";

// Generación de Excel y PPT EN EL MOMENTO, con los datos vivos del motor de
// conciliación — reemplaza los archivos estáticos de /public/downloads que
// quedaban desactualizados. Las librerías (xlsx, pptxgenjs) se cargan solo
// cuando el usuario descarga (dynamic import).

import { Cuota } from "./conciliation";
import { CSL } from "./contracts";

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

export interface DatosEstadoCuenta {
  nombreArchivo: string; // ej. "PuertaPatagonia"
  proyecto: string;
  cliente: string;
  rut: string;
  contractIds: string[]; // contratos a incluir (SCG tiene 2)
  esperado: number;
  pagado: number;
  deuda: number;
  cumplimiento: number; // 0..1
  detalle: string[]; // bullets de detalleAtraso
}

export async function descargarExcelEstadoCuenta(
  datos: DatosEstadoCuenta,
  porContrato: Record<string, Cuota[]>
): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Hoja resumen
  const resumen = [
    ["CLIMATE SMART LEASING SpA", ""],
    ["RUT", CSL.rut],
    ["Estado de cuenta", datos.proyecto],
    ["Cliente", datos.cliente],
    ["RUT cliente", datos.rut],
    ["Generado el", hoyIso()],
    ["", ""],
    ["Facturado esperado a la fecha", datos.esperado],
    ["Pagado a la fecha", datos.pagado],
    ["Saldo por cobrar (facturado)", datos.deuda],
    ["Cumplimiento", `${(datos.cumplimiento * 100).toFixed(1)}%`],
    ["", ""],
    ["Cuenta para transferencias", `${CSL.cuentaBancaria.banco} Cta. Cte. ${CSL.cuentaBancaria.numero}`],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), "Resumen");

  // Una hoja por contrato con TODAS las cuotas conciliadas
  for (const cid of datos.contractIds) {
    const cuotas = porContrato[cid] || [];
    const rows = cuotas.map(cu => ({
      Cuota: cu.numero,
      "Fecha emisión": cu.fecha,
      UF: cu.uf ?? "",
      "Neto CLP": cu.netoClp,
      "IVA CLP": cu.ivaClp,
      "Total facturado": cu.totalFacturado,
      Pagado: cu.totalPagado,
      Saldo: cu.totalFacturado - cu.totalPagado,
      Estado: cu.estado,
      "Fecha último pago": cu.matchedAbonos.length
        ? cu.matchedAbonos.map(a => a.fecha).sort()[cu.matchedAbonos.length - 1]
        : "",
      Notas: cu.notas,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 22 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 11 },
      { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 60 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, cid);
  }

  XLSX.writeFile(wb, `CSL_EstadoCuenta_${datos.nombreArchivo}_${hoyIso()}.xlsx`);
}

export async function descargarPptEstadoCuenta(datos: DatosEstadoCuenta): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "W", width: 13.33, height: 7.5 });
  pptx.layout = "W";

  const VERDE = "16A34A";
  const TINTA = "111827";
  const GRIS = "6B7280";
  const ROJO = "B91C1C";

  // Slide 1 — Portada
  let s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  s.addText("Climate Smart Leasing SpA", { x: 0.8, y: 1.6, w: 11.7, h: 0.5, fontSize: 16, color: VERDE, bold: true });
  s.addText("Estado de cuenta", { x: 0.8, y: 2.1, w: 11.7, h: 1.0, fontSize: 44, color: TINTA, bold: true });
  s.addText(datos.proyecto, { x: 0.8, y: 3.2, w: 11.7, h: 0.7, fontSize: 26, color: GRIS });
  s.addText(`${datos.cliente} · RUT ${datos.rut}`, { x: 0.8, y: 4.0, w: 11.7, h: 0.5, fontSize: 16, color: GRIS });
  s.addText(`Conciliado contra cuenta ${CSL.cuentaBancaria.banco} ${CSL.cuentaBancaria.numero} · ${hoyIso()}`, {
    x: 0.8, y: 6.5, w: 11.7, h: 0.4, fontSize: 12, color: GRIS,
  });

  // Slide 2 — Resumen de cifras
  s = pptx.addSlide();
  s.addText("Resumen al " + hoyIso(), { x: 0.8, y: 0.6, w: 11.7, h: 0.6, fontSize: 28, color: TINTA, bold: true });
  const kpis: Array<[string, string, string]> = [
    ["Facturado esperado", fmt(datos.esperado), TINTA],
    ["Pagado a la fecha", fmt(datos.pagado), VERDE],
    ["Saldo por cobrar", fmt(datos.deuda), ROJO],
    ["Cumplimiento", `${(datos.cumplimiento * 100).toFixed(1)}%`, TINTA],
  ];
  kpis.forEach(([label, valor, color], i) => {
    const x = 0.8 + i * 3.0;
    s.addShape("roundRect", { x, y: 1.6, w: 2.8, h: 1.8, fill: { color: "F9FAFB" }, line: { color: "E5E7EB" }, rectRadius: 0.08 });
    s.addText(label, { x: x + 0.15, y: 1.75, w: 2.5, h: 0.4, fontSize: 12, color: GRIS });
    s.addText(valor, { x: x + 0.15, y: 2.2, w: 2.5, h: 0.7, fontSize: 22, color, bold: true });
  });
  s.addText(
    datos.detalle.map(d => ({ text: d, options: { bullet: true, fontSize: 13, color: TINTA, breakLine: true } })),
    { x: 0.8, y: 3.9, w: 11.7, h: 3.0, valign: "top" }
  );

  // Slide 3 — Datos de pago
  s = pptx.addSlide();
  s.addText("Datos para transferencia", { x: 0.8, y: 0.6, w: 11.7, h: 0.6, fontSize: 28, color: TINTA, bold: true });
  s.addText(
    [
      { text: CSL.cuentaBancaria.banco, options: { fontSize: 18, color: TINTA, bold: true, breakLine: true } },
      { text: `${CSL.razonSocial} · RUT ${CSL.rut}`, options: { fontSize: 16, color: TINTA, breakLine: true } },
      { text: `Cuenta corriente ${CSL.cuentaBancaria.numero}`, options: { fontSize: 16, color: TINTA, breakLine: true } },
      { text: "", options: { breakLine: true } },
      { text: "Este documento se generó automáticamente desde la plataforma de control financiero de CSL con los datos conciliados al día.", options: { fontSize: 11, color: GRIS } },
    ],
    { x: 0.8, y: 1.8, w: 11.7, h: 3.5, valign: "top" }
  );

  await pptx.writeFile({ fileName: `CSL_EstadoCuenta_${datos.nombreArchivo}_${hoyIso()}.pptx` });
}
