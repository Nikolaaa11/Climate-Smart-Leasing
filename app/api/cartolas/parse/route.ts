import { NextRequest, NextResponse } from "next/server";
import { identifyContract } from "@/lib/conciliation";
import type { Abono } from "@/lib/abonos";

// Parse Santander cartola PDF text into Abono[]
// Santander cartola format:
//   "DD/MM/YYYY  $ AMOUNT  Glosa text  $ Saldo  N° Doc  Sucursal"
//   Abonos appear in the second money column (between cargo and saldo)
//
// Heuristics:
//  - Identify "Detalle movimientos" section
//  - Each line starts with date DD/MM/YYYY
//  - Two money fields per line: cargo or abono
//  - The cartola has CARGO and ABONO columns; abonos go in ABONO column
//  - We need to differentiate by the structure of the line

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ParsedAbono extends Abono {
  identifiedContract?: string;
  identifiedReason: string;
}

async function extractPdfText(buf: ArrayBuffer): Promise<string> {
  // Use pdf-parse for server-side extraction
  // We'll use dynamic import to avoid build-time complexity
  // @ts-ignore
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(Buffer.from(buf));
  return data.text;
}

function parseMonthFromHeader(text: string): string {
  // Look for "Fecha desde: DD/MM/YYYY   Fecha hasta: DD/MM/YYYY"
  const m = text.match(/Fecha\s+hasta:\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (m) {
    const [d, mo, y] = m[1].split("/");
    const monthName = new Date(parseInt(y), parseInt(mo) - 1, 1).toLocaleString("es-CL", { month: "long", year: "numeric" });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  }
  return "Cartola subida";
}

/**
 * Parse the text from a Santander cartola PDF and extract abono lines.
 * Strategy: each line in the "Detalle movimientos" section is structured.
 * We rely on the fact that abonos have a specific pattern in the layout.
 */
function parseAbonos(text: string, cartolaMes: string): Abono[] {
  const abonos: Abono[] = [];

  // Find the "Detalle movimientos" section
  const detalleIdx = text.toLowerCase().indexOf("detalle movimientos");
  if (detalleIdx === -1) return [];
  const endIdx = (() => {
    const candidates = [
      text.toLowerCase().indexOf("resumen comisiones", detalleIdx),
      text.toLowerCase().indexOf("saldos diarios", detalleIdx),
      text.toLowerCase().indexOf("nota: información provisoria", detalleIdx),
    ].filter(i => i > -1);
    return candidates.length > 0 ? Math.min(...candidates) : text.length;
  })();
  const section = text.slice(detalleIdx, endIdx);

  // Pattern: a line that starts with DD/MM/YYYY and has 2 amounts ($ N.NNN.NNN)
  // Santander text extraction tends to put the abono amount in a specific position.
  // We use a regex that captures all amounts and the description in between.
  const lineRegex = /(\d{2}\/\d{2}\/\d{4})\s+([\s\S]*?)(?=\d{2}\/\d{2}\/\d{4}|$)/g;
  const matches = Array.from(section.matchAll(lineRegex));

  // Heuristic for abono vs cargo:
  // In the cartola text rendering (PDF -> text), columns can be mangled, BUT:
  //  - Lines that include "Rescate Fondos Mutuos" → abono
  //  - Lines that include "Transf de" or "Transf." with a RUT prefix → can be abono or cargo
  //  - We classify by checking if the LAST amount (which is saldo) is GREATER than the saldo of the previous line → abono
  //
  // Simpler: we parse all amount tokens and assume the structure
  //   "fecha amount1 [amount2 ...] description saldo docNum sucursal"
  // The saldo column comes after the description. Since text extraction loses
  // column alignment, we look for KNOWN ABONO KEYWORDS to classify:

  const ABONO_KEYWORDS = [
    /transf\.\s+cristian\s+eduard/i,
    /transf\s+de\s+/i,
    /transf\.\s+edificio/i,
    /transf\.\s+codominio/i,
    /transf\.\s+condominio/i,
    /transf\.\s+bebidas/i,
    /transf\.\s+cg\s+metrics/i,
    /transf\.\s+cicla/i,
    /rescate fondos mutuos/i,
    /depósito documento otros bancos/i,
    /deposito documento otros bancos/i,
    /traspaso con la cuenta/i,
    /reintegro factura/i,
    /\d{8,11}k?\s+transf/i,
  ];

  const CARGO_KEYWORDS = [
    /pago de asigna/i,
    /pago de provee/i,
    /pago en linea t\.g\.r/i,
    /pago factura/i,
    /pago bh/i,
    /pago prestamo/i,
    /pago mensual/i,
    /pago inscripcio/i,
    /pago equipos/i,
    /factura \d/i,
    /^bh \d/i,
    /com\.mantencion plan/i,
    /intereses linea de crédito/i,
    /intereses línea de crédito/i,
    /impuesto sobregiro/i,
    /impuestos f\d/i,
    /amortización periódica lca/i,
    /amortizacion periodica lca/i,
    /fondo a rendir caja chica/i,
    /inversión en fondo mutuo/i,
    /inversion en fondo mutuo/i,
    /reintegro factura/i,
    /asesoria desarrollo/i,
    /asesori.a desarrollo/i,
    /servicio de administracio.n/i,
    /servicio de administración/i,
    /viaje santiago/i,
    /regalos corporativos/i,
    /cotizaci.n \d/i,
    /transf\.internet/i,
    /sensor yalitech/i,
    /compra centrifuga/i,
    /pago bh\d/i,
    /certificado de/i,
    /contrato mutuo/i,
    /reintegro invoice/i,
    /cuota \d+ /i,
    /pago factura por emitir/i,
  ];

  for (const m of matches) {
    const fechaStr = m[1];
    const rest = m[2].trim();
    // Extract all $ amounts: "$ N.NNN.NNN" or "$ -N"
    const amountRegex = /\$\s*-?\s*([\d.,]+)/g;
    const amounts: number[] = [];
    let am;
    while ((am = amountRegex.exec(rest)) !== null) {
      const numStr = am[1].replace(/\./g, "").replace(/,/g, "");
      const n = parseInt(numStr, 10);
      if (!isNaN(n)) amounts.push(n);
    }
    if (amounts.length === 0) continue;

    // Clean description: take text between first amount and last amount
    const firstAmtIdx = rest.search(/\$\s*-?\s*[\d.,]+/);
    let desc = rest.slice(firstAmtIdx).replace(/\$\s*-?\s*[\d.,]+/g, " ").replace(/\s+/g, " ").trim();
    // Remove doc number (long digits at the end) and sucursal token
    desc = desc.replace(/\b\d{6,12}\b\s*[A-Za-z.]*$/, "").trim();
    // Remove trailing sucursal short words
    desc = desc.replace(/\s+(OPER\.?|OPER\.CENTRALES|CENTRO|Agustinas|O\.Gerencia|G\.Finanzas|Apoquindo|Catedral|Providenci\.?)\s*$/i, "").trim();

    if (!desc) continue;

    // Clean trailing isolated digits (residual doc/sucursal numbers)
    desc = desc.replace(/\s+0+\s*$/, "").trim();
    desc = desc.replace(/\s+\d{1,3}\s*$/, "").trim();

    // Decide if it's an abono
    const isAbono = ABONO_KEYWORDS.some(rx => rx.test(desc));
    const isCargo = CARGO_KEYWORDS.some(rx => rx.test(desc));

    if (isCargo && !isAbono) continue;

    // Pure ambiguous lines: skip if no abono keyword matches
    if (!isAbono) continue;

    // The abono amount is typically the FIRST amount in the line for an abono row
    // (cargo column would be empty)
    const monto = amounts[0];

    // Convert fecha
    const [d, mo, y] = fechaStr.split("/");
    const fechaIso = `${y}-${mo}-${d}`;

    // Doc number: look for a long digit sequence
    const docMatch = m[2].match(/\b(\d{6,12})\s+(OPER|Agustinas|Centro|O\.Gerencia|Catedral|Apoquindo)/i);
    const doc = docMatch ? docMatch[1] : "0";

    abonos.push({
      fecha: fechaIso,
      monto,
      glosa: desc,
      doc,
      cartolaMes,
    });
  }

  return abonos;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }
    const buf = await file.arrayBuffer();
    const text = await extractPdfText(buf);

    if (!text || text.length < 50) {
      return NextResponse.json({
        error: "No se pudo extraer texto del PDF. Verifica que sea una cartola Santander oficial.",
      }, { status: 400 });
    }

    const cartolaMes = parseMonthFromHeader(text);
    const abonos = parseAbonos(text, cartolaMes);

    // Identify each abono
    const enriched: ParsedAbono[] = abonos.map(ab => {
      const { contract, reason } = identifyContract(ab);
      return {
        ...ab,
        identifiedContract: contract?.proyecto,
        identifiedReason: reason,
      };
    });

    return NextResponse.json({ abonos: enriched, cartolaMes });
  } catch (e: any) {
    console.error("Cartola parse error:", e);
    return NextResponse.json({
      error: e.message || "Error procesando el archivo",
    }, { status: 500 });
  }
}
