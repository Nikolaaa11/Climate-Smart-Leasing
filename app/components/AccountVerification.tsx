"use client";

import { useMemo } from "react";
import { CONTRACTS } from "@/lib/contracts";
import { ABONOS } from "@/lib/abonos";
import { identifyContract } from "@/lib/conciliation";
import { fmtCLP } from "@/lib/format";
import { ShieldCheck, AlertTriangle, Wallet } from "lucide-react";

export default function AccountVerification() {
  // Build per-contract verification: list of unique RUTs seen in cartolas
  const verification = useMemo(() => {
    return CONTRACTS.map(c => {
      const matches: Array<{ rut: string; glosa: string; total: number; count: number }> = [];
      const byRut = new Map<string, { rut: string; glosa: string; total: number; count: number }>();
      let mismatches: Array<{ fecha: string; monto: number; glosa: string }> = [];

      for (const ab of ABONOS) {
        const { contract } = identifyContract(ab);
        if (contract && contract.id === c.id) {
          // Extract RUT-like token from glosa
          const rutMatch = ab.glosa.match(/^(\d{8,11}K?)/);
          const rut = rutMatch ? rutMatch[1] : "(sin RUT en glosa)";
          const exists = byRut.get(rut);
          if (exists) {
            exists.total += ab.monto;
            exists.count += 1;
          } else {
            byRut.set(rut, { rut, glosa: ab.glosa, total: ab.monto, count: 1 });
          }
          // Flag mismatch: RUT in glosa doesn't match expected
          if (rut !== c.rutPagadorBanco && rut !== "(sin RUT en glosa)") {
            mismatches.push({ fecha: ab.fecha, monto: ab.monto, glosa: ab.glosa });
          }
        }
      }
      return {
        contract: c,
        payers: Array.from(byRut.values()).sort((a, b) => b.total - a.total),
        mismatches,
      };
    });
  }, []);

  return (
    <section id="verificacion" className="py-16">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink-400 mb-2">
          Seguridad financiera
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Verificación de cuentas
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          Cada contrato declara un RUT pagador esperado. Aquí se contrastan los pagos
          recibidos con las cuentas de origen para detectar inconsistencias.
        </p>
      </div>

      <div className="space-y-4">
        {verification.map(({ contract: c, payers, mismatches }) => {
          const okPayers = payers.filter(p => p.rut === c.rutPagadorBanco);
          const otherPayers = payers.filter(p => p.rut !== c.rutPagadorBanco);
          const allOk = mismatches.length === 0 && payers.length > 0;
          const noPayments = payers.length === 0;

          return (
            <div
              key={c.id}
              className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-mono text-ink-400">{c.id}</div>
                  <h3 className="text-lg font-display font-semibold text-ink-900">{c.proyecto}</h3>
                  <p className="text-xs text-ink-500 mt-0.5">{c.cliente}</p>
                </div>
                <div>
                  {allOk && (
                    <div className="pill bg-emerald-50 text-emerald-700">
                      <ShieldCheck className="w-3 h-3" />
                      Verificado
                    </div>
                  )}
                  {!allOk && !noPayments && (
                    <div className="pill bg-amber-50 text-amber-700">
                      <AlertTriangle className="w-3 h-3" />
                      Revisar
                    </div>
                  )}
                  {noPayments && (
                    <div className="pill bg-ink-50 text-ink-500">
                      <Wallet className="w-3 h-3" />
                      Sin pagos aún
                    </div>
                  )}
                </div>
              </div>

              {/* Expected payer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <Field label="RUT cliente (contrato)">
                  <span className="tabular text-ink-900">{c.rutCliente}</span>
                </Field>
                <Field label="RUT pagador esperado (en cartola)">
                  <span className="tabular text-ink-900">{c.rutPagadorBanco}</span>
                </Field>
                <Field label="Representante legal">
                  <span className="text-ink-700">{c.repLegal}</span>
                </Field>
              </div>

              {/* Detected payers */}
              {payers.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-2">
                    Pagadores detectados en cartolas
                  </div>
                  <div className="space-y-1.5">
                    {okPayers.map((p, i) => (
                      <PayerRow key={i} p={p} expected />
                    ))}
                    {otherPayers.map((p, i) => (
                      <PayerRow key={i} p={p} expected={false} />
                    ))}
                  </div>
                </div>
              )}

              {noPayments && (
                <div className="bg-ink-50/60 rounded-xl p-4 text-center">
                  <p className="text-xs text-ink-500">
                    No se han recibido pagos en las cartolas analizadas
                    {(c.id === "C-003") && " — Trongkai debió iniciar pagos el 01/05/2026 (impago temprano)"}
                  </p>
                </div>
              )}

              {mismatches.length > 0 && (
                <div className="mt-4 bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-ink-800">
                      <p className="font-medium mb-1">
                        Detectados {mismatches.length} pagos desde una cuenta distinta a la esperada
                      </p>
                      <p className="text-ink-600">
                        Verificar si proviene de un pagador autorizado o si requiere actualización contractual.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PayerRow({ p, expected }: { p: { rut: string; glosa: string; total: number; count: number }; expected: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg ${
      expected ? "bg-emerald-50/50 border border-emerald-100" : "bg-amber-50/40 border border-amber-100"
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full ${expected ? "bg-emerald-500" : "bg-amber-500"}`} />
        <div className="min-w-0">
          <div className="text-xs font-medium text-ink-900 tabular">
            {p.rut}
            {expected && <span className="ml-2 text-[10px] text-emerald-700 font-normal">esperado</span>}
            {!expected && <span className="ml-2 text-[10px] text-amber-700 font-normal">no esperado</span>}
          </div>
          <div className="text-[10px] text-ink-500 truncate max-w-xs">{p.glosa}</div>
        </div>
      </div>
      <div className="text-right ml-4 shrink-0">
        <div className="text-xs font-medium tabular text-ink-900">{fmtCLP(p.total)}</div>
        <div className="text-[10px] text-ink-400">{p.count} {p.count === 1 ? "abono" : "abonos"}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
