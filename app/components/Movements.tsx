"use client";

import { useState, useMemo } from "react";
import { Abono } from "@/lib/abonos";
import { identifyContract } from "@/lib/conciliation";
import { fmtCLP, fmtDate } from "@/lib/format";
import { Search } from "lucide-react";

interface Props {
  abonos: Abono[];
}

export default function Movements({ abonos }: Props) {
  const [filter, setFilter] = useState("");
  const [showOnly, setShowOnly] = useState<"all" | "identified" | "unidentified">("all");

  const rows = useMemo(() => {
    return abonos.map(ab => {
      const { contract, reason } = identifyContract(ab);
      return { abono: ab, contract: contract?.proyecto || null, reason };
    });
  }, [abonos]);

  const filtered = useMemo(() => {
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

  const total = filtered.reduce((s, r) => s + r.abono.monto, 0);

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
          {abonos.length} abonos extraídos de 12 cartolas mensuales (Ene–Dic 2025) más cartola
          provisoria de Mayo 2026. Cada abono se asigna automáticamente al contrato por RUT pagador.
        </p>
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
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between px-4 py-3 bg-ink-50/40 text-xs">
          <div className="text-ink-500">
            <span className="font-medium tabular text-ink-900">{filtered.length}</span> de {rows.length} abonos
          </div>
          <div className="text-ink-500">
            Suma total: <span className="font-medium tabular text-ink-900">{fmtCLP(total)}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[600px]">
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
              {filtered.map((r, i) => (
                <tr
                  key={i}
                  className={`border-b border-ink-50 hover:bg-ink-50/40 transition-colors ${
                    !r.contract ? "bg-ink-50/20" : ""
                  }`}
                >
                  <td className="px-4 py-2.5 text-ink-700 tabular whitespace-nowrap">{fmtDate(r.abono.fecha)}</td>
                  <td className="px-4 py-2.5 text-ink-500 text-[11px]">{r.abono.cartolaMes}</td>
                  <td className="px-4 py-2.5 text-right tabular font-medium text-ink-900 whitespace-nowrap">{fmtCLP(r.abono.monto)}</td>
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
        </div>
      </div>
    </section>
  );
}
