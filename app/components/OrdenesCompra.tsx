"use client";

import { Fragment } from "react";
import { ORDENES_COMPRA, FacturaOC } from "@/lib/ordenesCompra";
import { fmtCLP, fmtDate } from "@/lib/format";
import { FileText, Download } from "lucide-react";

function estadoDe(f: FacturaOC): { label: string; cls: string } {
  const pagado = f.pagado ?? 0;
  if (pagado >= f.total * 0.98) return { label: "Pagada", cls: "bg-emerald-50 text-emerald-700" };
  if (pagado > 0) return { label: "Pago parcial", cls: "bg-amber-50 text-amber-700" };
  return { label: "Sin pago", cls: "bg-ink-100 text-ink-500" };
}

export default function OrdenesCompra() {
  const ordenes = ORDENES_COMPRA;
  const total = ordenes.reduce(
    (s, o) => s + o.facturas.reduce((a, f) => a + f.total, 0),
    0
  );

  return (
    <section id="ordenes-compra" className="py-16">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink-400 mb-2">
          Documentos de clientes
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Órdenes de compra
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          Órdenes de compra emitidas por los clientes a CSL, con sus facturas
          asociadas. Cada orden agrupa uno o más trabajos facturados.
        </p>
      </div>

      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden">
        {ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-ink-300" />
            </div>
            <h3 className="text-sm font-display font-semibold text-ink-700">
              Aún no hay órdenes de compra cargadas
            </h3>
            <p className="text-xs text-ink-400 mt-2 max-w-sm">
              Cuando lleguen los documentos, cada orden de compra aparecerá aquí
              con sus facturas, montos y fechas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-bg-card border-b border-ink-100">
                <tr className="text-left text-[10px] uppercase tracking-wider text-ink-400">
                  <th className="px-4 py-3 font-medium">Factura</th>
                  <th className="px-4 py-3 font-medium">Fecha de emisión</th>
                  <th className="px-4 py-3 font-medium text-right">UF</th>
                  <th className="px-4 py-3 font-medium text-right">Neto</th>
                  <th className="px-4 py-3 font-medium text-right">IVA</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Pagado</th>
                  <th className="px-4 py-3 font-medium">Fecha de pago</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <Fragment key={o.id}>
                    <tr className="bg-csl-50/50 border-y border-csl-100/60">
                      <td colSpan={9} className="px-4 py-2.5">
                        <span className="text-ink-800 font-semibold">{o.titulo}</span>
                        <span className="text-ink-400"> · {o.cliente}</span>
                        <span className="text-ink-400">
                          {" · O.C.: "}
                          {o.fechaOrdenCompra ? fmtDate(o.fechaOrdenCompra) : "—"}
                        </span>
                        {o.docUrl && (
                          <a
                            href={o.docUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 ml-3 text-csl-700 hover:text-csl-800 font-medium"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Descargar OC
                          </a>
                        )}
                      </td>
                    </tr>
                    {o.facturas.map((f) => {
                      const iva = f.total - f.neto;
                      const pagado = f.pagado ?? 0;
                      const est = estadoDe(f);
                      return (
                        <tr key={`${o.id}-${f.folio}`} className="border-b border-ink-50 hover:bg-ink-50/40 transition-colors">
                          <td className="px-4 py-2.5 text-ink-700 font-medium tabular">F{f.folio}</td>
                          <td className="px-4 py-2.5 text-ink-500 tabular whitespace-nowrap">{fmtDate(f.fecha)}</td>
                          <td className="px-4 py-2.5 text-right tabular text-ink-500">{f.uf != null ? f.uf.toFixed(2) : "—"}</td>
                          <td className="px-4 py-2.5 text-right tabular text-ink-700 whitespace-nowrap">{fmtCLP(f.neto)}</td>
                          <td className="px-4 py-2.5 text-right tabular text-ink-500 whitespace-nowrap">{fmtCLP(iva)}</td>
                          <td className="px-4 py-2.5 text-right tabular font-medium text-ink-900 whitespace-nowrap">{fmtCLP(f.total)}</td>
                          <td className={`px-4 py-2.5 text-right tabular font-medium whitespace-nowrap ${
                            pagado === 0 ? "text-ink-300" :
                            pagado >= f.total * 0.98 ? "text-emerald-600" :
                            "text-amber-600"
                          }`}>
                            {fmtCLP(pagado)}
                          </td>
                          <td className={`px-4 py-2.5 tabular whitespace-nowrap ${f.fechaPago ? "text-ink-600" : "text-ink-300"}`}>
                            {f.fechaPago ? fmtDate(f.fechaPago) : "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${est.cls}`}>{est.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
              {total > 0 && (
                <tfoot>
                  <tr className="bg-ink-50/40 border-t border-ink-100">
                    <td className="px-4 py-3 text-[11px] uppercase tracking-wider text-ink-400 font-medium" colSpan={5}>
                      Total facturado ({ordenes.length} órdenes)
                    </td>
                    <td className="px-4 py-3 text-right tabular font-semibold text-ink-900 whitespace-nowrap">{fmtCLP(total)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
