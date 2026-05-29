"use client";

import { useState } from "react";
import { CONTRACTS, EstadoObra } from "@/lib/contracts";
import { ConciliationResult } from "@/lib/conciliation";
import { fmtCLP, fmtUF, fmtDate, fmtDateLong, fmtPct } from "@/lib/format";
import StatusPill from "./StatusPill";
import { ChevronDown, FileText, MapPin, User, Calendar, CreditCard, AlertTriangle, CheckCircle2, Circle, Clock } from "lucide-react";

interface Props {
  result: ConciliationResult;
}

export default function Contracts({ result }: Props) {
  const [expanded, setExpanded] = useState<string | null>(CONTRACTS[0]?.id || null);

  return (
    <section id="contratos" className="py-16">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink-400 mb-2">
          Detalle por contrato
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Contratos
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          {CONTRACTS.length} contratos vigentes. Toca cualquier tarjeta para ver las cuotas y los pagos conciliados.
        </p>
      </div>

      <div className="space-y-3">
        {CONTRACTS.map((c) => {
          const cuotas = result.porContrato[c.id];
          const today = new Date();
          const cuotasVencidas = cuotas.filter(x => {
            const f = new Date(x.fecha + "T00:00:00");
            return f <= today && x.totalFacturado > 0;
          });
          const fact = cuotasVencidas.reduce((s, x) => s + x.totalFacturado, 0);
          const pag = cuotasVencidas.reduce((s, x) => s + x.totalPagado, 0);
          const pct = fact > 0 ? pag / fact : 0;
          const isOpen = expanded === c.id;
          const hasObra = !!(c.recepciones?.length || c.pendientesObra?.length);

          return (
            <div
              key={c.id}
              id={`contrato-${c.id}`}
              className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden scroll-mt-20"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : c.id)}
                className="w-full text-left p-6 flex items-center justify-between hover:bg-ink-50/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono text-ink-400">{c.id}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">
                      {c.monedaRenta === "UF" ? `${fmtUF(c.rentaUf, 2)} + IVA` : fmtCLP(c.rentaClpNeta) + " neto/mes"}
                    </span>
                    <span className="text-[10px] text-ink-400">·</span>
                    <span className="text-[10px] text-ink-400">{c.nCuotas} cuotas</span>
                    {c.estadoObra && <ObraPill estado={c.estadoObra} />}
                  </div>
                  <h3 className="text-lg font-display font-semibold text-ink-900 truncate">
                    {c.proyecto}
                  </h3>
                  <p className="text-sm text-ink-500 mt-0.5">{c.cliente}</p>
                </div>
                <div className="flex items-center gap-6 ml-6">
                  <div className="text-right">
                    <div className={`text-lg font-display font-semibold tabular ${
                      pct >= 0.9 ? "text-emerald-600" :
                      pct >= 0.5 ? "text-amber-600" :
                      "text-rose-600"
                    }`}>
                      {fmtPct(pct, 0)}
                    </div>
                    <div className="text-[10px] text-ink-400">{fmtCLP(pag)} / {fmtCLP(fact)}</div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-ink-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-black/[0.04] animate-fade-up">
                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-ink-50/40">
                    <Meta icon={<User className="w-3.5 h-3.5" />} label="RUT cliente">
                      <span className="tabular">{c.rutCliente}</span>
                    </Meta>
                    <Meta icon={<User className="w-3.5 h-3.5" />} label="Representante">
                      {c.repLegal}
                    </Meta>
                    <Meta icon={<MapPin className="w-3.5 h-3.5" />} label="Dirección">
                      {c.direccion}
                    </Meta>
                    <Meta icon={<Calendar className="w-3.5 h-3.5" />} label="Firma → Inicio pagos">
                      <span className="tabular">{fmtDate(c.fechaFirma)} → {fmtDate(c.fechaInicioPagos)}</span>
                    </Meta>
                    <Meta icon={<CreditCard className="w-3.5 h-3.5" />} label="Cuenta destino">
                      {c.cuentaDestino}
                    </Meta>
                    <Meta icon={<FileText className="w-3.5 h-3.5" />} label="Facturación">
                      {c.facturacionDia}
                    </Meta>
                    <Meta icon={<Calendar className="w-3.5 h-3.5" />} label="Plazo de pago">
                      {c.plazoPagoDias}
                    </Meta>
                    <Meta icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Mora">
                      {c.interesMora}
                    </Meta>
                  </div>

                  {c.obs && (
                    <div className="px-6 py-4 bg-amber-50/40 border-t border-amber-100/60">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-ink-700 leading-relaxed">{c.obs}</p>
                      </div>
                    </div>
                  )}

                  {/* Recepción de obra */}
                  {hasObra && (
                    <div className="px-6 py-5 border-t border-black/[0.04]">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-display font-semibold text-ink-900">
                          Recepción de obra
                        </h4>
                        {c.estadoObra && <ObraPill estado={c.estadoObra} />}
                      </div>

                      {c.recepciones && c.recepciones.length > 0 && (
                        <div className="space-y-3 mb-5">
                          {c.recepciones.map((r, i) => (
                            <div key={i} className="flex items-start gap-3">
                              {r.tipo === "definitiva" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-ink-800 capitalize">
                                  Recepción {r.tipo} · {fmtDateLong(r.fecha)}
                                </div>
                                <div className="text-[11px] text-ink-500 leading-relaxed">{r.doc}</div>
                                <div className="text-[11px] text-ink-400">{r.firmante}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {c.pendientesObra && c.pendientesObra.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-2">
                            Partidas observadas en recepción provisoria
                          </div>
                          <ul className="space-y-2">
                            {c.pendientesObra.map((p, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs">
                                {p.resuelto ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                )}
                                <span>
                                  <span className={p.resuelto ? "text-ink-500" : "text-ink-800 font-medium"}>
                                    {p.item}
                                  </span>
                                  {p.nota && (
                                    <span className="block text-[11px] text-ink-400 leading-relaxed">{p.nota}</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cuotas table */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-display font-semibold text-ink-900">
                        Cronograma de cuotas
                      </h4>
                      <div className="text-[10px] text-ink-400">
                        {cuotas.length} cuotas totales
                      </div>
                    </div>
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-[10px] uppercase tracking-wider text-ink-400 border-b border-ink-100">
                            <th className="py-2 pr-3 font-medium">N°</th>
                            <th className="py-2 pr-3 font-medium">Fecha</th>
                            <th className="py-2 pr-3 font-medium">UF</th>
                            <th className="py-2 pr-3 font-medium text-right">Neto</th>
                            <th className="py-2 pr-3 font-medium text-right">IVA</th>
                            <th className="py-2 pr-3 font-medium text-right">Total</th>
                            <th className="py-2 pr-3 font-medium text-right">Pagado</th>
                            <th className="py-2 font-medium">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cuotas.slice(0, 30).map((cu, i) => (
                            <tr key={i} className="border-b border-ink-50 last:border-0">
                              <td className="py-2.5 pr-3 text-ink-700 font-medium">{cu.numero}</td>
                              <td className="py-2.5 pr-3 text-ink-600 tabular">{fmtDate(cu.fecha)}</td>
                              <td className="py-2.5 pr-3 text-ink-500 tabular">
                                {cu.uf ? `${cu.uf.toFixed(2)}` : "—"}
                              </td>
                              <td className="py-2.5 pr-3 text-right tabular text-ink-700">{fmtCLP(cu.netoClp)}</td>
                              <td className="py-2.5 pr-3 text-right tabular text-ink-500">{fmtCLP(cu.ivaClp)}</td>
                              <td className="py-2.5 pr-3 text-right tabular font-medium text-ink-900">{fmtCLP(cu.totalFacturado)}</td>
                              <td className={`py-2.5 pr-3 text-right tabular font-medium ${
                                cu.totalPagado === 0 ? "text-ink-300" :
                                cu.totalPagado >= cu.totalFacturado * 0.98 ? "text-emerald-600" :
                                "text-amber-600"
                              }`}>
                                {fmtCLP(cu.totalPagado)}
                              </td>
                              <td className="py-2.5">
                                <StatusPill estado={cu.estado} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {cuotas.length > 30 && (
                        <div className="text-center text-[11px] text-ink-400 mt-3">
                          + {cuotas.length - 30} cuotas adicionales (descarga el Excel para ver todas)
                        </div>
                      )}
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

const OBRA_STYLES: Record<EstadoObra, { bg: string; text: string; dot: string; label: string }> = {
  "en-ejecucion": { bg: "bg-ink-50", text: "text-ink-500", dot: "bg-ink-300", label: "Obra en ejecución" },
  "recepcion-provisoria": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Recepción provisoria" },
  "recepcion-definitiva": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Obra recepcionada" },
};

function ObraPill({ estado }: { estado: EstadoObra }) {
  const s = OBRA_STYLES[estado];
  return (
    <span className={`pill ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function Meta({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-400 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-xs text-ink-800 leading-relaxed">{children}</div>
    </div>
  );
}
