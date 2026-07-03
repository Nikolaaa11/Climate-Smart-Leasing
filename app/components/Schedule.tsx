"use client";

import { useState, useMemo } from "react";
import { Cuota, ConciliationResult, EstadoCuota } from "@/lib/conciliation";
import { fmtCLP, fmtDate } from "@/lib/format";
import { Search } from "lucide-react";
import StatusPill from "./StatusPill";

interface Props {
  result: ConciliationResult;
}

export default function Schedule({ result }: Props) {
  const [filter, setFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoCuota | "all">("all");

  const filtered = useMemo(() => {
    return result.cuotas.filter(c => {
      if (estadoFilter !== "all" && c.estado !== estadoFilter) return false;
      if (!filter) return true;
      const f = filter.toLowerCase();
      return (
        c.proyecto.toLowerCase().includes(f) ||
        c.numero.toLowerCase().includes(f) ||
        c.fecha.includes(f)
      );
    });
  }, [result.cuotas, filter, estadoFilter]);

  return (
    <section id="cronograma" className="py-16">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink-400 mb-2">
          Todas las cuotas
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Cronograma maestro
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          {result.cuotas.length} cuotas proyectadas de todos los contratos vigentes, con su estado de conciliación.
        </p>
      </div>

      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden">
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-black/[0.04]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="text"
              placeholder="Buscar por proyecto, cuota o fecha…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-ink-50/60 border border-transparent focus:bg-white focus:border-ink-200 rounded-lg outline-none transition-all"
            />
          </div>
          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-ink-50/60 border border-transparent focus:bg-white focus:border-ink-200 rounded-lg outline-none transition-all"
          >
            <option value="all">Todos los estados</option>
            <option value="pagada">Pagadas</option>
            <option value="pagada-parcial">Pagadas parciales</option>
            <option value="pagada-diferencia">Con diferencia</option>
            <option value="vencida-sin-pago">Vencidas sin pago</option>
            <option value="por-vencer">Por vencer</option>
          </select>
        </div>

        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-bg-card border-b border-ink-100">
              <tr className="text-left text-[10px] uppercase tracking-wider text-ink-400">
                <th className="px-4 py-3 font-medium">Proyecto</th>
                <th className="px-4 py-3 font-medium">Cuota</th>
                <th className="px-4 py-3 font-medium">Factura</th>
                <th className="px-4 py-3 font-medium">Fecha de emisión</th>
                <th className="px-4 py-3 font-medium text-right">UF</th>
                <th className="px-4 py-3 font-medium text-right">Facturado</th>
                <th className="px-4 py-3 font-medium text-right">Pagado</th>
                <th className="px-4 py-3 font-medium">Fecha de pago</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                // Fecha de pago: fecha del último abono conciliado a esta cuota
                // (derivada del motor, no escrita a mano). "—" si aún no se paga.
                const fechasPago = c.matchedAbonos.map(a => a.fecha).sort();
                const fechaPago = fechasPago.length
                  ? fmtDate(fechasPago[fechasPago.length - 1])
                  : "—";
                return (
                <tr key={i} className="border-b border-ink-50 hover:bg-ink-50/40 transition-colors">
                  <td className="px-4 py-2.5 text-ink-700 font-medium whitespace-nowrap">{c.proyecto}</td>
                  <td className="px-4 py-2.5 text-ink-600">{c.numero}</td>
                  <td className="px-4 py-2.5 text-ink-400 tabular">—</td>
                  <td className="px-4 py-2.5 text-ink-500 tabular whitespace-nowrap">{fmtDate(c.fecha)}</td>
                  <td className="px-4 py-2.5 text-right tabular text-ink-500">{c.uf ? c.uf.toFixed(2) : "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular font-medium text-ink-900 whitespace-nowrap">{fmtCLP(c.totalFacturado)}</td>
                  <td className={`px-4 py-2.5 text-right tabular font-medium whitespace-nowrap ${
                    c.totalPagado === 0 ? "text-ink-300" :
                    c.totalPagado >= c.totalFacturado * 0.98 ? "text-emerald-600" :
                    "text-amber-600"
                  }`}>
                    {fmtCLP(c.totalPagado)}
                  </td>
                  <td className={`px-4 py-2.5 tabular whitespace-nowrap ${fechaPago === "—" ? "text-ink-300" : "text-ink-500"}`}>
                    {fechaPago}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusPill estado={c.estado} />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
