// ============================================================================
// CUADRATURA — verificación automática de que TODOS los números de la
// plataforma cuadran entre sí. Correr antes de cada push:
//
//   npm run cuadratura
//
// Falla (exit 1) si alguna identidad aritmética no se cumple.
// ============================================================================

import { buildConciliation } from "../lib/conciliation";
import { CONTRACTS } from "../lib/contracts";
import { totalesContrato, totalesGlobales, verificarIdentidades, Totales } from "../lib/totales";

const hoy = new Date();
const r = buildConciliation(undefined, hoy);
const errores: string[] = [];

const f = (n: number) => "$" + Math.round(n).toLocaleString("es-CL").padStart(14);

console.log(`CUADRATURA al ${hoy.toISOString().slice(0, 10)}`);
console.log("=".repeat(110));
console.log(
  "Contrato".padEnd(9) +
  "Total contrato".padStart(16) + "Emitido".padStart(16) + "Pagado".padStart(16) +
  "Atrasado".padStart(14) + "En plazo".padStart(14) + "Por facturar".padStart(16)
);

const suma: Totales = {
  totalContrato: 0, emitido: 0, pagado: 0, pagadoEmitido: 0, atrasado: 0,
  enPlazo: 0, saldoEmitido: 0, porFacturar: 0, porFacturarNeto: 0,
  porPagarTotal: 0, cumplimiento: 0,
};

for (const c of CONTRACTS) {
  const t = totalesContrato(r, c.id, hoy);
  errores.push(...verificarIdentidades(t, c.id));
  suma.totalContrato += t.totalContrato;
  suma.emitido += t.emitido;
  suma.pagado += t.pagado;
  suma.pagadoEmitido += t.pagadoEmitido;
  suma.atrasado += t.atrasado;
  suma.enPlazo += t.enPlazo;
  suma.saldoEmitido += t.saldoEmitido;
  suma.porFacturar += t.porFacturar;
  console.log(
    c.id.padEnd(9) +
    f(t.totalContrato).padStart(16) + f(t.emitido).padStart(16) + f(t.pagado).padStart(16) +
    f(t.atrasado).padStart(14) + f(t.enPlazo).padStart(14) + f(t.porFacturar).padStart(16)
  );
}

const g = totalesGlobales(r, hoy);
errores.push(...verificarIdentidades(g, "GLOBAL"));

console.log("-".repeat(110));
console.log(
  "GLOBAL".padEnd(9) +
  f(g.totalContrato).padStart(16) + f(g.emitido).padStart(16) + f(g.pagado).padStart(16) +
  f(g.atrasado).padStart(14) + f(g.enPlazo).padStart(14) + f(g.porFacturar).padStart(16)
);

// El global debe ser exactamente la suma de los contratos
const ok = (a: number, b: number) => Math.abs(a - b) <= CONTRACTS.length; // $1 por contrato de tolerancia
const campos: Array<[keyof Totales, string]> = [
  ["totalContrato", "Total contrato"], ["emitido", "Emitido"], ["pagado", "Pagado"],
  ["pagadoEmitido", "Pagado emitido"], ["atrasado", "Atrasado"], ["enPlazo", "En plazo"],
  ["saldoEmitido", "Saldo emitido"], ["porFacturar", "Por facturar"],
];
for (const [k, nombre] of campos) {
  if (!ok(suma[k] as number, g[k] as number)) {
    errores.push(`GLOBAL ≠ suma de contratos en "${nombre}": global=${g[k]} vs suma=${suma[k]}`);
  }
}

// Identidades visibles al usuario
console.log("\nIDENTIDADES:");
console.log(`  Emitido (${f(g.emitido)}) = Pagado emitido (${f(g.pagadoEmitido)}) + Atrasado (${f(g.atrasado)}) + En plazo (${f(g.enPlazo)})`);
console.log(`  Total (${f(g.totalContrato)}) = Emitido (${f(g.emitido)}) + Por facturar (${f(g.porFacturar)})`);

if (errores.length) {
  console.error("\n❌ CUADRATURA FALLIDA:");
  errores.forEach(e => console.error("  - " + e));
  process.exit(1);
} else {
  console.log("\n✅ TODO CUADRA — " + CONTRACTS.length + " contratos + global verificados.");
}
