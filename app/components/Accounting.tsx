"use client";

import { useMemo, useState } from "react";
import { LEDGER, CONCEPTOS_GENERALES, PROYECTOS, LedgerEntry } from "@/lib/ledger";
import { fmtCLP, fmtDate } from "@/lib/format";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Filter, BookOpenCheck, Building2, Banknote } from "lucide-react";

const CONCEPTO_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  "Cliente":              { bg: "bg-csl-50", text: "text-csl-700", dot: "bg-csl-500", label: "Cliente" },
  "Pago_de_Acciones":     { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", label: "Acciones" },
  "Abono_Subsidio":       { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Subsidio" },
  "Aumento de Capital":   { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", label: "Capital" },
  "Rescate":              { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500", label: "Rescate FM" },
  "Inversión":            { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Inversión" },
  "Desarrollo_Proyecto":  { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", label: "I+D Proyecto" },
  "Operación":            { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Operación" },
  "Administración":       { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500", label: "Administración" },
  "Recurso_Humano":       { bg: "bg-pink-50", text: "text-pink-700", dot: "bg-pink-500", label: "RR.HH." },
  "Financiamiento":       { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500", label: "Financiamiento" },
  "Co-Ejecutor":          { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500", label: "Co-ejecutor" },
  "JuanPablo":            { bg: "bg-fuchsia-50", text: "text-fuchsia-700", dot: "bg-fuchsia-500", label: "Juan Pablo" },
  "Depósito En Efectivo": { bg: "bg-lime-50", text: "text-lime-700", dot: "bg-lime-500", label: "Efectivo" },
  "Error de Transferencias": { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Error transf." },
  "Transferencias Internas": { bg: "bg-zinc-50", text: "text-zinc-700", dot: "bg-zinc-500", label: "Interna" },
  "Trapaso":              { bg: "bg-zinc-50", text: "text-zinc-700", dot: "bg-zinc-500", label: "Traspaso" },
  "TesoreríaGeneralDeLaRepública": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "TGR" },
};

function colorFor(concepto: string) {
  return CONCEPTO_COLORS[concepto] || { bg: "bg-ink-50", text: "text-ink-500", dot: "bg-ink-300", label: concepto || "—" };
}

export default function Accounting() {
  const [conceptoFilter, setConceptoFilter] = useState<string>("all");
  const [proyectoFilter, setProyectoFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<"all" | "abonos" | "egresos">("all");
  const [search, setSearch] = useState("");

  // Aggregations
  const stats = useMemo(() => {
    const totals = {
      abonos: 0,
      egresos: 0,
      saldoFinal: 0,
      conceptos: {} as Record<string, { abonos: number; egresos: number; count: number }>,
      proyectos: {} as Record<string, { abonos: number; egresos: number; count: number }>,
      porMes: {} as Record<string, { abonos: number; egresos: number; saldo: number | null }>,
    };
    for (const e of LEDGER) {
      totals.abonos += e.abono;
      totals.egresos += e.egreso;
      const c = e.conceptoGeneral || "(sin)";
      if (!totals.conceptos[c]) totals.conceptos[c] = { abonos: 0, egresos: 0, count: 0 };
      totals.conceptos[c].abonos += e.abono;
      totals.conceptos[c].egresos += e.egreso;
      totals.conceptos[c].count += 1;

      const p = e.proyecto || "(sin)";
      if (!totals.proyectos[p]) totals.proyectos[p] = { abonos: 0, egresos: 0, count: 0 };
      totals.proyectos[p].abonos += e.abono;
      totals.proyectos[p].egresos += e.egreso;
      totals.proyectos[p].count += 1;

      const ym = e.fecha.slice(0, 7);
      if (!totals.porMes[ym]) totals.porMes[ym] = { abonos: 0, egresos: 0, saldo: null };
      totals.porMes[ym].abonos += e.abono;
      totals.porMes[ym].egresos += e.egreso;
      if (e.saldoContable !== null) totals.porMes[ym].saldo = e.saldoContable;
    }
    totals.saldoFinal = LEDGER[LEDGER.length - 1]?.saldoContable || 0;
    return totals;
  }, []);

  // Filtered table
  const filtered = useMemo(() => {
    return LEDGER.filter(e => {
      if (conceptoFilter !== "all" && e.conceptoGeneral !== conceptoFilter) return false;
      if (proyectoFilter !== "all" && e.proyecto !== proyectoFilter) return false;
      if (tipoFilter === "abonos" && e.abono === 0) return false;
      if (tipoFilter === "egresos" && e.egreso === 0) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!e.descripcion.toLowerCase().includes(s)
          && !e.fecha.includes(s)
          && !(e.proyecto || "").toLowerCase().includes(s)
          && !(e.conceptoGeneral || "").toLowerCase().includes(s)
          && !(e.conceptoDetallado || "").toLowerCase().includes(s)) return false;
      }
      return true;
    }).reverse(); // most recent first
  }, [conceptoFilter, proyectoFilter, tipoFilter, search]);

  const filteredTotals = useMemo(() => ({
    abonos: filtered.reduce((s, e) => s + e.abono, 0),
    egresos: filtered.reduce((s, e) => s + e.egreso, 0),
  }), [filtered]);

  // Top concepts by abonos (for KPI cards)
  const topAbonos = useMemo(() => {
    return Object.entries(stats.conceptos)
      .map(([k, v]) => ({ concepto: k, ...v }))
      .filter(x => x.abonos > 0)
      .sort((a, b) => b.abonos - a.abonos)
      .slice(0, 6);
  }, [stats]);

  const topEgresos = useMemo(() => {
    return Object.entries(stats.conceptos)
      .map(([k, v]) => ({ concepto: k, ...v }))
      .filter(x => x.egresos > 0)
      .sort((a, b) => b.egresos - a.egresos)
      .slice(0, 6);
  }, [stats]);

  const proyectosRanked = useMemo(() => {
    return Object.entries(stats.proyectos)
      .map(([k, v]) => ({ proyecto: k, ...v, neto: v.abonos - v.egresos }))
      .filter(x => x.proyecto !== "(sin)" && (x.abonos > 0 || x.egresos > 0))
      .sort((a, b) => (b.abonos + b.egresos) - (a.abonos + a.egresos));
  }, [stats]);

  return (
    <section id="contabilidad" className="py-16">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-csl-600 mb-2">
          Libro mayor · 436 movimientos · Mayo 2024 — Mayo 2026
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Contabilidad
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          Vista consolidada de toda la actividad financiera: aportes de capital,
          subsidios CORFO, cobros a clientes, inversiones en I+D y gastos operacionales.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <KpiCard
          label="Total ingresos"
          value={fmtCLP(stats.abonos)}
          icon={<ArrowUpRight className="w-4 h-4" />}
          accent="text-csl-600"
        />
        <KpiCard
          label="Total egresos"
          value={fmtCLP(stats.egresos)}
          icon={<ArrowDownRight className="w-4 h-4" />}
          accent="text-rose-600"
        />
        <KpiCard
          label="Saldo contable"
          value={fmtCLP(stats.saldoFinal)}
          icon={<Wallet className="w-4 h-4" />}
          accent="text-ink-900"
        />
        <KpiCard
          label="Movimientos"
          value={LEDGER.length.toString()}
          icon={<BookOpenCheck className="w-4 h-4" />}
          accent="text-ink-700"
        />
      </div>

      {/* Top ingresos / egresos by concept */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-csl-600" />
            <h3 className="text-sm font-display font-semibold text-ink-900">Ingresos por categoría</h3>
          </div>
          <div className="space-y-2.5">
            {topAbonos.map(c => {
              const col = colorFor(c.concepto);
              const pct = (c.abonos / stats.abonos) * 100;
              return (
                <div key={c.concepto}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                      <span className="text-ink-700 font-medium">{col.label}</span>
                      <span className="text-ink-300 text-[10px] tabular">{c.count}</span>
                    </div>
                    <div className="text-xs tabular font-medium text-ink-900">{fmtCLP(c.abonos)}</div>
                  </div>
                  <div className="w-full h-1 bg-ink-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${col.dot}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-display font-semibold text-ink-900">Egresos por categoría</h3>
          </div>
          <div className="space-y-2.5">
            {topEgresos.map(c => {
              const col = colorFor(c.concepto);
              const pct = (c.egresos / stats.egresos) * 100;
              return (
                <div key={c.concepto}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                      <span className="text-ink-700 font-medium">{col.label}</span>
                      <span className="text-ink-300 text-[10px] tabular">{c.count}</span>
                    </div>
                    <div className="text-xs tabular font-medium text-ink-900">{fmtCLP(c.egresos)}</div>
                  </div>
                  <div className="w-full h-1 bg-ink-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Proyectos */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6 mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-ink-700" />
          <h3 className="text-sm font-display font-semibold text-ink-900">Por proyecto interno</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {proyectosRanked.map(p => (
            <div key={p.proyecto} className="flex items-center justify-between text-xs py-2 px-3 hover:bg-ink-50/50 rounded-lg transition-colors cursor-pointer"
                 onClick={() => setProyectoFilter(p.proyecto)}>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink-900 truncate">{p.proyecto}</div>
                <div className="text-[10px] text-ink-400">{p.count} movs</div>
              </div>
              <div className="text-right ml-3 shrink-0">
                <div className={`tabular font-medium text-[11px] ${p.neto >= 0 ? 'text-csl-600' : 'text-rose-600'}`}>
                  {p.neto >= 0 ? '+' : ''}{fmtCLP(p.neto)}
                </div>
                <div className="text-[9px] text-ink-400 tabular">
                  ↑{fmtCLP(p.abonos)} ↓{fmtCLP(p.egresos)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden">
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-black/[0.04]">
          <input
            type="text"
            placeholder="Buscar en libro mayor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-ink-50/60 border border-transparent focus:bg-white focus:border-ink-200 rounded-lg outline-none transition-all"
          />
          <select
            value={conceptoFilter}
            onChange={e => setConceptoFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-ink-50/60 border border-transparent focus:bg-white focus:border-ink-200 rounded-lg outline-none transition-all min-w-[180px]"
          >
            <option value="all">Todas las categorías</option>
            {CONCEPTOS_GENERALES.map(c => (
              <option key={c} value={c}>{colorFor(c).label}</option>
            ))}
          </select>
          <select
            value={proyectoFilter}
            onChange={e => setProyectoFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-ink-50/60 border border-transparent focus:bg-white focus:border-ink-200 rounded-lg outline-none transition-all min-w-[160px]"
          >
            <option value="all">Todos los proyectos</option>
            {PROYECTOS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="flex gap-1 bg-ink-50/60 rounded-lg p-1">
            {(["all", "abonos", "egresos"] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setTipoFilter(opt)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  tipoFilter === opt
                    ? "bg-white text-ink-900 shadow-soft"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {opt === "all" ? "Todos" : opt === "abonos" ? "Ingresos" : "Egresos"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-ink-50/40 text-xs">
          <div className="text-ink-500">
            <span className="font-medium tabular text-ink-900">{filtered.length}</span> de {LEDGER.length} movimientos
          </div>
          <div className="text-ink-500 flex items-center gap-4">
            <span>Ingresos: <span className="font-medium tabular text-csl-700">{fmtCLP(filteredTotals.abonos)}</span></span>
            <span>Egresos: <span className="font-medium tabular text-rose-700">{fmtCLP(filteredTotals.egresos)}</span></span>
            <span>Neto: <span className={`font-medium tabular ${(filteredTotals.abonos - filteredTotals.egresos) >= 0 ? 'text-csl-700' : 'text-rose-700'}`}>{fmtCLP(filteredTotals.abonos - filteredTotals.egresos)}</span></span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-bg-card border-b border-ink-100">
              <tr className="text-left text-[10px] uppercase tracking-wider text-ink-400">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">Proyecto</th>
                <th className="px-4 py-3 font-medium text-right">Ingreso</th>
                <th className="px-4 py-3 font-medium text-right">Egreso</th>
                <th className="px-4 py-3 font-medium text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 250).map((e, i) => {
                const col = colorFor(e.conceptoGeneral);
                return (
                  <tr key={i} className="border-b border-ink-50 hover:bg-ink-50/40 transition-colors">
                    <td className="px-4 py-2.5 text-ink-700 tabular whitespace-nowrap">{fmtDate(e.fecha)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`pill ${col.bg} ${col.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                        {col.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-ink-700 max-w-md">
                      <div className="truncate" title={e.descripcion}>{e.descripcion}</div>
                      {e.conceptoDetallado && (
                        <div className="text-[10px] text-ink-400 truncate">{e.conceptoDetallado}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ink-500 text-[11px] whitespace-nowrap">{e.proyecto || "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular whitespace-nowrap">
                      {e.abono > 0 ? <span className="text-csl-700 font-medium">{fmtCLP(e.abono)}</span> : <span className="text-ink-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular whitespace-nowrap">
                      {e.egreso > 0 ? <span className="text-rose-700 font-medium">{fmtCLP(e.egreso)}</span> : <span className="text-ink-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular text-ink-500 whitespace-nowrap">
                      {e.saldoContable !== null ? fmtCLP(e.saldoContable) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length > 250 && (
            <div className="text-center text-[11px] text-ink-400 py-3 border-t border-ink-50">
              Mostrando primeros 250 movimientos · usa los filtros para refinar
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function KpiCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
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
    </div>
  );
}
