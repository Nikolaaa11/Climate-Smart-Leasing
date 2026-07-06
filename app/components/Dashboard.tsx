"use client";

import { ConciliationResult, estaAtrasada } from "@/lib/conciliation";
import { CONTRACTS } from "@/lib/contracts";
import { fmtCLP, fmtPct } from "@/lib/format";
import { useUfDia } from "@/lib/useUfDia";
import { ArrowUpRight, AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";

interface Props {
  result: ConciliationResult;
}

export default function Dashboard({ result }: Props) {
  const ufDia = useUfDia();
  const today = new Date();
  const cuotasVencidas = result.cuotas.filter(c => {
    const f = new Date(c.fecha + "T00:00:00");
    return f <= today && c.totalFacturado > 0;
  });
  const totalFacturado = cuotasVencidas.reduce((s, c) => s + c.totalFacturado, 0);
  const totalPagado = cuotasVencidas.reduce((s, c) => s + c.totalPagado, 0);
  // "Atrasado" = sólo facturas impagas con 30+ días desde la emisión (regla CSL).
  // Lo emitido en los últimos 30 días y aún impago está "en plazo", no atrasado.
  const totalPendiente = result.cuotas
    .filter((c) => estaAtrasada(c.fecha, today))
    .reduce((s, c) => s + Math.max(0, c.totalFacturado - c.totalPagado), 0);
  const pctCobranza = totalFacturado > 0 ? totalPagado / totalFacturado : 0;

  // Totales de TODOS los contratos (plata comprometida completa, no solo lo vencido)
  const cuotasConValor = result.cuotas.filter(c => c.totalFacturado > 0);
  const totalContratos = cuotasConValor.reduce((s, c) => s + c.totalFacturado, 0);
  const pagadoTotal = cuotasConValor.reduce((s, c) => s + c.totalPagado, 0);
  const deudaVencida = Math.max(0, totalPendiente);
  const porCobrarFuturo = Math.max(0, totalContratos - pagadoTotal - deudaVencida);
  const enUf = (clp: number) => `UF ${(clp / ufDia.valor).toLocaleString("es-CL", { maximumFractionDigits: 1 })}`;

  const alertas = result.cuotas.filter(c => c.estado === "vencida-sin-pago").length;
  const enRiesgo = result.cuotas.filter(c => c.estado === "pagada-parcial").length;

  const perContract = CONTRACTS.map(c => {
    const cu = result.porContrato[c.id].filter(x => {
      const f = new Date(x.fecha + "T00:00:00");
      return f <= today && x.totalFacturado > 0;
    });
    const fact = cu.reduce((s, x) => s + x.totalFacturado, 0);
    const pag = cu.reduce((s, x) => s + x.totalPagado, 0);
    const atrasado = cu
      .filter((x) => estaAtrasada(x.fecha, today))
      .reduce((s, x) => s + Math.max(0, x.totalFacturado - x.totalPagado), 0);
    return {
      ...c,
      facturado: fact,
      pagado: pag,
      pendiente: atrasado,
      pct: fact > 0 ? pag / fact : 0,
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

      {/* Total en contratos — CLP y UF del día */}
      <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink-400">
          Plata total en contratos · CLP y UF del día
        </div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-csl-700 bg-csl-50 border border-csl-200 rounded-full px-2.5 py-1">
          <RefreshCw className="w-3 h-3" />
          UF hoy: ${ufDia.valor.toLocaleString("es-CL", { maximumFractionDigits: 2 })}
          {ufDia.fecha ? ` (${ufDia.fecha}, ${ufDia.fuente})` : ` (${ufDia.fuente})`}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard
          label="Total en contratos"
          value={fmtCLP(totalContratos)}
          sub={`≈ ${enUf(totalContratos)} al valor de hoy`}
          icon={<ArrowUpRight className="w-4 h-4" />}
          accent="text-ink-900"
        />
        <KpiCard
          label="Lo que han pagado"
          value={fmtCLP(pagadoTotal)}
          sub={`≈ ${enUf(pagadoTotal)}`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          accent="text-csl-600"
        />
        <KpiCard
          label="En deuda (atrasado)"
          value={fmtCLP(deudaVencida)}
          sub={`≈ ${enUf(deudaVencida)}`}
          icon={<AlertCircle className="w-4 h-4" />}
          accent="text-rose-600"
        />
        <KpiCard
          label="Por cobrar a futuro"
          value={fmtCLP(porCobrarFuturo)}
          sub={`≈ ${enUf(porCobrarFuturo)}`}
          icon={<Clock className="w-4 h-4" />}
          accent="text-ink-700"
        />
      </div>

      {/* Cobranza KPIs */}
      <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.15em] text-ink-400">
        Cobranza de contratos
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard
          label="Facturado a la fecha"
          value={fmtCLP(totalFacturado)}
          sub={`${cuotasVencidas.length} cuotas vencidas`}
          icon={<ArrowUpRight className="w-4 h-4" />}
          accent="text-ink-900"
        />
        <KpiCard
          label="Cobrado"
          value={fmtCLP(totalPagado)}
          sub={fmtPct(pctCobranza) + " de cobranza"}
          icon={<CheckCircle2 className="w-4 h-4" />}
          accent="text-csl-600"
        />
        <KpiCard
          label="Atrasado (+30 días)"
          value={fmtCLP(totalPendiente)}
          sub={`${alertas} facturas atrasadas sin pago`}
          icon={<AlertCircle className="w-4 h-4" />}
          accent="text-rose-600"
        />
        <KpiCard
          label="En riesgo"
          value={`${enRiesgo}`}
          sub="cuotas con pago parcial"
          icon={<Clock className="w-4 h-4" />}
          accent="text-amber-600"
        />
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
                <div className="text-ink-400">Atrasado</div>
                <div className="font-medium tabular text-rose-600">{fmtCLP(c.pendiente)}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

    </section>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-ink-500">{label}</div>
        <div className={accent}>{icon}</div>
      </div>
      <div className={`text-2xl md:text-3xl font-display font-semibold tabular ${accent} tracking-tight`}>
        {value}
      </div>
      <div className="text-[11px] text-ink-400 mt-1">{sub}</div>
    </div>
  );
}
