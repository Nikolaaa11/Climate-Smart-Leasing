"use client";

import { ConciliationResult } from "@/lib/conciliation";
import { totalesContrato } from "@/lib/totales";
import { CONTRACTS } from "@/lib/contracts";
import { fmtCLP, fmtPct } from "@/lib/format";

interface Props {
  result: ConciliationResult;
}

export default function Dashboard({ result }: Props) {
  const today = new Date();
  const perContract = CONTRACTS.map(c => {
    // Totales canónicos (lib/totales.ts) — mismas cifras que Contratos y Cobranza
    const t = totalesContrato(result, c.id, today);
    return {
      ...c,
      facturado: t.emitido,
      pendiente: t.saldoEmitido,
      atrasado: t.atrasado,
      pct: t.cumplimiento,
    };
  });

  return (
    <section id="dashboard" className="py-16">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-csl-600 mb-2">
          Resumen ejecutivo · {new Intl.DateTimeFormat("es-CL", { dateStyle: "long" }).format(today)}
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Estado financiero
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          Vista consolidada al día de hoy: contratos vigentes con clientes y
          conciliación con la cuenta Santander 9427-8910.
        </p>
      </div>

      {/* Per-contract grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-12">
        {perContract.map((c) => (
          <a
            key={c.id}
            href={`#contrato-${c.id}`}
            className="card-interactive bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6 block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono text-ink-400 mb-1">{c.id}</div>
                <h3 className="text-base font-display font-semibold text-ink-900 leading-tight truncate">
                  {c.proyecto}
                </h3>
                <p className="text-xs text-ink-500 mt-0.5 truncate">{c.cliente}</p>
              </div>
              <div className="text-right ml-3 shrink-0">
                <div className={`text-xl font-display font-semibold tabular ${
                  c.pct >= 0.9 ? "text-csl-600" :
                  c.pct >= 0.5 ? "text-amber-600" :
                  "text-rose-600"
                }`}>
                  {fmtPct(c.pct, 0)}
                </div>
                <div className="text-[10px] text-ink-400">cobrado</div>
              </div>
            </div>

            <div className="w-full h-1 bg-ink-50 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  c.pct >= 0.9 ? "bg-csl-500" :
                  c.pct >= 0.5 ? "bg-amber-500" :
                  "bg-rose-500"
                }`}
                style={{ width: `${Math.min(c.pct * 100, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-ink-400">Facturado</div>
                <div className="font-medium tabular text-ink-900">{fmtCLP(c.facturado)}</div>
              </div>
              <div className="text-right">
                <div className="text-ink-400">Saldo por cobrar</div>
                <div className={`font-medium tabular ${c.atrasado > 0 ? "text-rose-600" : "text-ink-500"}`}>{fmtCLP(c.pendiente)}</div>
                <div className={`text-[10px] tabular ${c.atrasado > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                  {c.atrasado > 0 ? `atrasado: ${fmtCLP(c.atrasado)}` : "sin atraso"}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

    </section>
  );
}
