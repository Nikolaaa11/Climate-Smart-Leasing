"use client";

import { useMemo } from "react";
import { DESEMBOLSOS_GEIST, GEIST, EstadoRespaldo } from "@/lib/geist";
import { fmtCLP, fmtDate } from "@/lib/format";
import {
  Wrench,
  FileCheck2,
  FileWarning,
  AlertTriangle,
  Building2,
  Banknote,
  Hash,
} from "lucide-react";

const RESPALDO_STYLES: Record<EstadoRespaldo, { bg: string; text: string; dot: string; label: string }> = {
  "con-factura":        { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Con factura" },
  "factura-por-emitir": { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   label: "Factura por emitir" },
  "sin-documentar":     { bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-500",    label: "Sin documentar" },
};

export default function GeistReconciliation() {
  const stats = useMemo(() => {
    let total = 0;
    let conFactura = 0;
    let sinFactura = 0;
    let sinFactura6 = 0;
    const porProyecto: Record<string, { total: number; conFactura: number; sinFactura: number; count: number }> = {};

    for (const d of DESEMBOLSOS_GEIST) {
      total += d.monto;
      if (d.conFactura) conFactura += d.monto;
      else {
        sinFactura += d.monto;
        if (d.grupo === "6-pagos") sinFactura6 += d.monto;
      }
      if (!porProyecto[d.proyecto]) porProyecto[d.proyecto] = { total: 0, conFactura: 0, sinFactura: 0, count: 0 };
      porProyecto[d.proyecto].total += d.monto;
      porProyecto[d.proyecto].count += 1;
      if (d.conFactura) porProyecto[d.proyecto].conFactura += d.monto;
      else porProyecto[d.proyecto].sinFactura += d.monto;
    }

    const proyectos = Object.entries(porProyecto)
      .map(([proyecto, v]) => ({ proyecto, ...v }))
      .sort((a, b) => b.total - a.total);

    return { total, conFactura, sinFactura, sinFactura6, proyectos };
  }, []);

  return (
    <section id="conciliacion-geist" className="py-16 scroll-mt-20">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-csl-600 mb-2 flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5" />
          Desembolsos a proveedor · {GEIST.razonSocial} · {GEIST.rut}
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Conciliación Geist
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          Estado de pago de los desembolsos realizados a Geist, cruzados contra el libro mayor
          y su respaldo tributario. El monto sin factura es el pendiente de regularización para auditoría.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard label="Total desembolsado" value={fmtCLP(stats.total)} icon={<Banknote className="w-4 h-4" />} accent="text-ink-900" />
        <KpiCard label="Con factura" value={fmtCLP(stats.conFactura)} icon={<FileCheck2 className="w-4 h-4" />} accent="text-emerald-600" />
        <KpiCard label="Sin factura" value={fmtCLP(stats.sinFactura)} icon={<FileWarning className="w-4 h-4" />} accent="text-rose-600" />
        <KpiCard label="Desembolsos" value={DESEMBOLSOS_GEIST.length.toString()} icon={<Hash className="w-4 h-4" />} accent="text-ink-700" />
      </div>

      {/* Audit alert */}
      <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-display font-semibold text-rose-900 mb-1">
              Pendiente de respaldo para auditoría
            </h3>
            <p className="text-xs text-ink-700 leading-relaxed">
              De los 6 pagos conciliados, <span className="font-semibold tabular">{fmtCLP(stats.sinFactura6)}</span> no
              cuentan con factura de Geist (Sensores $26.677.682 + Los Vikingos $20.000.000).
              Incluyendo los egresos posteriores de abril-2026, el total sin factura asciende a{" "}
              <span className="font-semibold tabular">{fmtCLP(stats.sinFactura)}</span>.
              Estos montos están imputados contablemente como I+D / Estudios Técnicos, pero requieren
              la emisión de la factura correspondiente (o documentación equivalente) para su regularización tributaria.
            </p>
          </div>
        </div>
      </div>

      {/* Por proyecto */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-ink-700" />
          <h3 className="text-sm font-display font-semibold text-ink-900">Por proyecto</h3>
        </div>
        <div className="space-y-3">
          {stats.proyectos.map((p) => {
            const pctCon = p.total > 0 ? (p.conFactura / p.total) * 100 : 0;
            return (
              <div key={p.proyecto}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-ink-800 font-medium">{p.proyecto}</span>
                    <span className="text-ink-300 text-[10px] tabular">{p.count} pagos</span>
                  </div>
                  <div className="tabular text-ink-900 font-medium">{fmtCLP(p.total)}</div>
                </div>
                <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctCon}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-ink-400 tabular">
                  <span className="text-emerald-600">Con factura {fmtCLP(p.conFactura)}</span>
                  <span className="text-rose-600">Sin factura {fmtCLP(p.sinFactura)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla de desembolsos */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.04]">
          <h3 className="text-sm font-display font-semibold text-ink-900">Detalle de desembolsos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-ink-100">
              <tr className="text-left text-[10px] uppercase tracking-wider text-ink-400">
                <th className="px-6 py-3 font-medium">Pago</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Proyecto</th>
                <th className="px-4 py-3 font-medium">Factura</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium text-right">En ledger</th>
                <th className="px-4 py-3 font-medium">Respaldo</th>
              </tr>
            </thead>
            <tbody>
              {DESEMBOLSOS_GEIST.map((d) => {
                const s = RESPALDO_STYLES[d.estadoRespaldo];
                const dif = d.monto - d.ledgerMonto;
                return (
                  <tr key={d.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40 transition-colors align-top">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="font-medium text-ink-900">{d.pago}</div>
                      <div className="text-[10px] text-ink-300 font-mono">{d.id}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-600 tabular whitespace-nowrap">{fmtDate(d.fecha)}</td>
                    <td className="px-4 py-3 text-ink-700 whitespace-nowrap">{d.proyecto}</td>
                    <td className="px-4 py-3 text-ink-700 tabular whitespace-nowrap">
                      {d.factura ? d.factura : <span className="text-ink-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular font-medium text-ink-900 whitespace-nowrap">{fmtCLP(d.monto)}</td>
                    <td className="px-4 py-3 text-right tabular whitespace-nowrap">
                      <span className="text-ink-600">{fmtCLP(d.ledgerMonto)}</span>
                      {dif !== 0 && (
                        <div className="text-[10px] text-amber-600 tabular">
                          {dif > 0 ? "+" : ""}{fmtCLP(dif)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`pill ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      {d.nota && (
                        <div className="text-[10px] text-ink-400 leading-relaxed mt-1 max-w-xs">{d.nota}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-3 bg-ink-50/40 text-xs">
          <span className="text-ink-500">{DESEMBOLSOS_GEIST.length} desembolsos</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700">Con factura: <span className="font-medium tabular">{fmtCLP(stats.conFactura)}</span></span>
            <span className="text-rose-700">Sin factura: <span className="font-medium tabular">{fmtCLP(stats.sinFactura)}</span></span>
            <span className="text-ink-900">Total: <span className="font-medium tabular">{fmtCLP(stats.total)}</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-ink-500">{label}</div>
        <div className={accent}>{icon}</div>
      </div>
      <div className={`text-2xl md:text-3xl font-display font-semibold tabular ${accent} tracking-tight`}>
        {value}
      </div>
    </div>
  );
}
