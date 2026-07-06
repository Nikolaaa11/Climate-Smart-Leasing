"use client";

import { useState, useMemo } from "react";
import { Abono } from "@/lib/abonos";
import { CARGOS } from "@/lib/cargos";
import { identifyContract } from "@/lib/conciliation";
import { fmtCLP, fmtDate } from "@/lib/format";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  abonos: Abono[];
}

export default function Movements({ abonos }: Props) {
  const [tab, setTab] = useState<"abonos" | "cargos">("abonos");
  const [filter, setFilter] = useState("");
  const [showOnly, setShowOnly] = useState<"all" | "identified" | "unidentified">("all");

  const rows = useMemo(() => {
    return abonos.map(ab => {
      const { contract, reason } = identifyContract(ab);
      return { abono: ab, contract: contract?.proyecto || null, reason };
    });
  }, [abonos]);

  const filteredAbonos = useMemo(() => {
    return rows.filter(r => {
      if (showOnly === "identified" && !r.contract) return false;
      if (showOnly === "unidentified" && r.contract) return false;
      if (!filter) return true;
      const f = filter.toLowerCase();
      return (
        r.abono.glosa.toLowerCase().includes(f) ||
        r.abono.fecha.includes(f) ||
        (r.contract && r.contract.toLowerCase().includes(f)) ||
        String(r.abono.monto).includes(f)
      );
    });
  }, [rows, filter, showOnly]);

  const filteredCargos = useMemo(() => {
    return CARGOS.filter(c => {
      if (!filter) return true;
      const f = filter.toLowerCase();
      return (
        c.glosa.toLowerCase().includes(f) ||
        c.fecha.includes(f) ||
        String(c.monto).includes(f)
      );
    });
  }, [filter]);

  const totalAbonos = abonos.reduce((s, a) => s + a.monto, 0);
  const totalCargos = CARGOS.reduce((s, c) => s + c.monto, 0);
  const totalFiltrado =
    tab === "abonos"
      ? filteredAbonos.reduce((s, r) => s + r.abono.monto, 0)
      : filteredCargos.reduce((s, c) => s + c.monto, 0);

  return (
    <section id="movimientos" className="py-16">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink-400 mb-2">
          Cuenta Santander · 9427-8910
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Movimientos bancarios
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          Lo que han pagado (abonos) y lo que se ha gastado (cargos), extraídos de las
          cartolas oficiales. Cada abono se asigna automáticamente al contrato por RUT pagador.
        </p>
      </div>

      {/* Totales: pagado vs gastado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setTab("abonos")}
          className={`text-left rounded-2xl border shadow-soft p-5 transition-all ${
            tab === "abonos" ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300" : "bg-white border-black/[0.06] hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-emerald-700 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Lo que han pagado (abonos)
          </div>
          <div className="text-2xl font-display font-semibold tabular text-emerald-600">{fmtCLP(totalAbonos)}</div>
          <div className="text-xs text-ink-400 mt-1">{abonos.length} abonos · clic para ver el detalle</div>
        </button>
        <button
          onClick={() => setTab("cargos")}
          className={`text-left rounded-2xl border shadow-soft p-5 transition-all ${
            tab === "cargos" ? "bg-red-50/60 border-red-300 ring-1 ring-red-300" : "bg-white border-black/[0.06] hover:border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-red-700 mb-2">
            <TrendingDown className="w-3.5 h-3.5" />
            Lo que se ha gastado (cargos)
          </div>
          <div className="text-2xl font-display font-semibold tabular text-red-700">{fmtCLP(totalCargos)}</div>
          <div className="text-xs text-ink-400 mt-1">{CARGOS.length} cargos (cartolas N°20-26, dic-2025 → jun-2026) · clic para ver el detalle</div>
        </button>
      </div>

      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-black/[0.04]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="text"
              placeholder="Buscar por fecha, glosa, cliente o monto…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-ink-50/60 border border-transparent focus:bg-white focus:border-ink-200 rounded-lg outline-none transition-all"
            />
          </div>
          {tab === "abonos" && (
            <div className="flex gap-1 bg-ink-50/60 rounded-lg p-1">
              {(["all", "identified", "unidentified"] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setShowOnly(opt)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    showOnly === opt
                      ? "bg-white text-ink-900 shadow-soft"
                      : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {opt === "all" ? "Todos" : opt === "identified" ? "Identificados" : "Sin identificar"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between px-4 py-3 bg-ink-50/40 text-xs">
          <div className="text-ink-500">
            <span className="font-medium tabular text-ink-900">
              {tab === "abonos" ? filteredAbonos.length : filteredCargos.length}
            </span>{" "}
            de {tab === "abonos" ? rows.length : CARGOS.length} {tab}
          </div>
          <div className="text-ink-500">
            Suma mostrada:{" "}
            <span className={`font-medium tabular ${tab === "abonos" ? "text-emerald-600" : "text-red-700"}`}>
              {fmtCLP(totalFiltrado)}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[600px]">
          {tab === "abonos" ? (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-bg-card border-b border-ink-100">
                <tr className="text-left text-[10px] uppercase tracking-wider text-ink-400">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Cartola</th>
                  <th className="px-4 py-3 font-medium text-right">Monto</th>
                  <th className="px-4 py-3 font-medium">Glosa</th>
                  <th className="px-4 py-3 font-medium">Asignado a</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbonos.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-b border-ink-50 hover:bg-ink-50/40 transition-colors ${
                      !r.contract ? "bg-ink-50/20" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5 text-ink-700 tabular whitespace-nowrap">{fmtDate(r.abono.fecha)}</td>
                    <td className="px-4 py-2.5 text-ink-500 text-[11px]">{r.abono.cartolaMes}</td>
                    <td className="px-4 py-2.5 text-right tabular font-medium text-emerald-600 whitespace-nowrap">+{fmtCLP(r.abono.monto)}</td>
                    <td className="px-4 py-2.5 text-ink-600 max-w-md truncate" title={r.abono.glosa}>{r.abono.glosa}</td>
                    <td className="px-4 py-2.5">
                      {r.contract ? (
                        <span className="text-ink-900 font-medium text-[11px]">{r.contract}</span>
                      ) : (
                        <span className="text-ink-400 italic text-[11px]" title={r.reason}>{r.reason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-bg-card border-b border-ink-100">
                <tr className="text-left text-[10px] uppercase tracking-wider text-ink-400">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Cartola</th>
                  <th className="px-4 py-3 font-medium text-right">Monto</th>
                  <th className="px-4 py-3 font-medium">Glosa</th>
                </tr>
              </thead>
              <tbody>
                {filteredCargos.map((c, i) => (
                  <tr key={i} className="border-b border-ink-50 hover:bg-ink-50/40 transition-colors">
                    <td className="px-4 py-2.5 text-ink-700 tabular whitespace-nowrap">{fmtDate(c.fecha)}</td>
                    <td className="px-4 py-2.5 text-ink-500 text-[11px]">{c.cartolaMes}</td>
                    <td className="px-4 py-2.5 text-right tabular font-medium text-red-700 whitespace-nowrap">−{fmtCLP(c.monto)}</td>
                    <td className="px-4 py-2.5 text-ink-600 max-w-md truncate" title={c.glosa}>{c.glosa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
