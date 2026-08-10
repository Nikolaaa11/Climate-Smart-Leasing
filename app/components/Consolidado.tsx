"use client";

import { Fragment, useMemo, useState } from "react";
import { fmtCLP, fmtPct } from "@/lib/format";
import { ConciliationResult } from "@/lib/conciliation";
import { buildConsolidado, buildOrigen, FilaPuente } from "@/lib/consolidado";
import {
  PROYECTOS_META,
  PROYECTOS_KPIS,
  PROYECTOS_BANDAS,
  PROYECTOS,
  PROYECTOS_CONTROL,
  PROYECTOS_CORFO,
} from "@/lib/proyectos";
import { ArrowRight, AlertTriangle, CircleSlash, ChevronDown, ChevronUp } from "lucide-react";

const dmy = (iso: string) => iso.split("-").reverse().join("-");

/** Semáforo de cobertura: cuánto contrato respalda al capital puesto. */
function coberturaMeta(c: number | null) {
  if (c === null) return { label: "Sin contrato", tone: "text-ink-400", bar: "bg-ink-200", chip: "bg-ink-50 text-ink-500" };
  if (c >= 1) return { label: "Respaldado", tone: "text-csl-700", bar: "bg-csl-500", chip: "bg-csl-50 text-csl-700" };
  if (c >= 0.5) return { label: "Parcial", tone: "text-amber-700", bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700" };
  return { label: "Descubierto", tone: "text-red-700", bar: "bg-red-500", chip: "bg-red-50 text-red-700" };
}

export default function Consolidado({ result }: { result: ConciliationResult }) {
  const k = useMemo(() => buildConsolidado(result), [result]);
  const origen = useMemo(() => buildOrigen(result), [result]);
  const [abierto, setAbierto] = useState<string | null>(null);

  const t = k.totales;

  return (
    <section id="consolidado" className="py-16 border-t border-black/[0.04]">
      {/* ---------------------------------------------------------------- encabezado */}
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-csl-600 mb-2">
          Consolidado · capital y negocio en una vista
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Todo junto.
        </h2>
        <p className="text-ink-500 mt-3 max-w-3xl leading-relaxed">
          Las secciones anteriores miran dos mundos separados: en qué se gastó la plata
          (cuadro maestro, {PROYECTOS_KPIS.movimientos} movimientos de banco) y cuánto se
          contrató y cobró (conciliación de contratos). Acá se cruzan, para responder la
          pregunta que ninguna responde sola:{" "}
          <span className="text-ink-900 font-medium">
            por cada peso puesto en un activo, ¿cuánto contrato lo respalda?
          </span>
        </p>
      </div>

      {/* ---------------------------------------------------------------- KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { l: "Capital en la cartera", v: fmtCLP(t.invertido), s: `${k.filas.length} proyectos · banda A` },
          { l: "Respaldo contractual", v: fmtCLP(t.contratado), s: "valor total de los contratos firmados" },
          { l: "Cobrado a la fecha", v: fmtCLP(t.cobrado), s: `${fmtPct(t.cobrado / t.contratado, 1)} de lo contratado` },
          {
            l: "Cobertura",
            v: fmtPct(t.cobertura, 0),
            s: `faltan ${fmtCLP(t.brecha)} por contratar`,
            destacado: true,
          },
        ].map(x => (
          <div
            key={x.l}
            className={`rounded-2xl border border-black/[0.04] p-5 ${
              x.destacado ? "bg-csl-50" : "bg-bg-card shadow-soft"
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-ink-400">{x.l}</div>
            <div
              className={`text-xl md:text-2xl font-display font-semibold tabular mt-1.5 ${
                x.destacado ? "text-csl-700" : "text-ink-900"
              }`}
            >
              {x.v}
            </div>
            <div className="text-[11px] text-ink-400 mt-1">{x.s}</div>
          </div>
        ))}
      </div>

      {/* lectura del número */}
      <div className="rounded-2xl border border-black/[0.04] bg-bg-card shadow-soft p-6 mb-10">
        <p className="text-sm text-ink-600 leading-relaxed">
          De los <span className="tabular font-medium text-ink-900">{fmtCLP(t.invertido)}</span>{" "}
          desplegados en activos, hay contratos firmados por{" "}
          <span className="tabular font-medium text-ink-900">{fmtCLP(t.contratado)}</span>: una
          cobertura del <span className="font-medium text-ink-900">{fmtPct(t.cobertura, 0)}</span>.
          Los tres proyectos maduros —Barranco Amarillo, Calderas y Flota— están sobre el 100%: el
          contrato genera más de lo que costó el activo, que es como debe funcionar una arrendadora.
          La brecha de <span className="tabular font-medium text-ink-900">{fmtCLP(t.brecha)}</span>{" "}
          se concentra en dos activos grandes todavía sin monetizar y en{" "}
          <span className="tabular font-medium text-ink-900">{fmtCLP(t.sinContrato)}</span> de
          proyectos sin ningún contrato asociado.
        </p>
      </div>

      {/* ---------------------------------------------------------------- puente */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden mb-10">
        <div className="px-6 py-5 border-b border-black/[0.04]">
          <h3 className="text-sm font-display font-semibold text-ink-900">
            Puente inversión → contrato → cobranza
          </h3>
          <p className="text-[12px] text-ink-400 mt-1">
            Ordenado por capital comprometido. Hacé clic en una fila para ver por qué ese proyecto
            se asocia a ese contrato.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 border-b border-black/[0.04]">
                <th className="text-left font-normal px-6 py-3">Proyecto</th>
                <th className="text-right font-normal px-3 py-3">Invertido</th>
                <th className="text-right font-normal px-3 py-3">Contratado</th>
                <th className="text-right font-normal px-3 py-3">Emitido</th>
                <th className="text-right font-normal px-3 py-3">Cobrado</th>
                <th className="text-left font-normal px-6 py-3 w-[190px]">Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {k.filas.map((f: FilaPuente) => {
                const m = coberturaMeta(f.cobertura);
                const open = abierto === f.proyecto;
                return (
                  <Fragment key={f.proyecto}>
                    <tr
                      onClick={() => setAbierto(open ? null : f.proyecto)}
                      className="border-b border-black/[0.03] hover:bg-csl-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink-900">{f.proyecto}</span>
                          {open ? (
                            <ChevronUp className="w-3.5 h-3.5 text-ink-300" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-ink-300" />
                          )}
                        </div>
                        <div className="text-[11px] text-ink-400 mt-0.5">
                          {f.contratos.length ? f.contratos.join(" · ") : "sin contrato asociado"}
                          {" · "}
                          {f.movs} movimientos
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right tabular text-ink-900">{fmtCLP(f.invertido)}</td>
                      <td className="px-3 py-3.5 text-right tabular text-ink-700">
                        {f.contratos.length ? fmtCLP(f.contratado) : <span className="text-ink-300">—</span>}
                      </td>
                      <td className="px-3 py-3.5 text-right tabular text-ink-500">
                        {f.contratos.length ? fmtCLP(f.emitido) : <span className="text-ink-300">—</span>}
                      </td>
                      <td className="px-3 py-3.5 text-right tabular text-ink-500">
                        {f.contratos.length ? fmtCLP(f.cobrado) : <span className="text-ink-300">—</span>}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-1.5 rounded-full bg-ink-50 overflow-hidden min-w-[70px]">
                            <div
                              className={`h-full rounded-full ${m.bar}`}
                              style={{ width: `${Math.min(100, (f.cobertura ?? 0) * 100)}%` }}
                            />
                          </div>
                          <span className={`text-[12px] tabular font-medium ${m.tone} w-11 text-right`}>
                            {f.cobertura === null ? "—" : fmtPct(f.cobertura, 0)}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {open && (
                      <tr className="bg-ink-50/40 border-b border-black/[0.03]">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid md:grid-cols-3 gap-5 text-[12px]">
                            <div className="md:col-span-2">
                              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 mb-1.5">
                                Por qué se asocian
                              </div>
                              <p className="text-ink-600 leading-relaxed">{f.razon}</p>
                              <p className="text-ink-400 mt-2">{f.desc}</p>
                              {f.clientes.length > 0 && (
                                <p className="text-ink-500 mt-2">
                                  Arrendatario: {f.clientes.join(" · ")}
                                </p>
                              )}
                            </div>
                            <div>
                              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 mb-1.5">
                                Actividad bancaria
                              </div>
                              <p className="text-ink-600 tabular">
                                {f.movs} movimientos
                                <br />
                                {dmy(f.desde)} → {dmy(f.hasta)}
                              </p>
                              <span
                                className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[11px] font-medium ${m.chip}`}
                              >
                                {m.label}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-csl-50 font-medium">
                <td className="px-6 py-3.5 text-ink-900">Cartera completa</td>
                <td className="px-3 py-3.5 text-right tabular text-ink-900">{fmtCLP(t.invertido)}</td>
                <td className="px-3 py-3.5 text-right tabular text-ink-900">{fmtCLP(t.contratado)}</td>
                <td className="px-3 py-3.5 text-right tabular text-ink-700">{fmtCLP(t.emitido)}</td>
                <td className="px-3 py-3.5 text-right tabular text-ink-700">{fmtCLP(t.cobrado)}</td>
                <td className="px-6 py-3.5 tabular text-csl-700">{fmtPct(t.cobertura, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* reventa: no es cartera */}
        <div className="px-6 py-4 border-t border-black/[0.04] bg-bg-card">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12px]">
            <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400">
              Fuera de cartera
            </span>
            <span className="text-ink-600">
              <span className="font-medium text-ink-900">{k.reventa.contrato}</span> no es un
              arriendo sino una compraventa back-to-back: costó{" "}
              <span className="tabular">{fmtCLP(k.reventa.costo)}</span> (registrado en la banda
              Estructura) y se vendió en{" "}
              <span className="tabular">{fmtCLP(k.reventa.venta)}</span> —{" "}
              <span className="tabular font-medium text-csl-700">
                {fmtCLP(k.reventa.margen)} de margen, {fmtPct(k.reventa.margenPct, 1)} sobre venta
              </span>
              . Cobrado al 100%.
            </span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- origen y destino */}
      <div className="grid lg:grid-cols-2 gap-4 mb-10">
        {/* origen */}
        <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6">
          <h3 className="text-sm font-display font-semibold text-ink-900">De dónde salió</h3>
          <p className="text-[12px] text-ink-400 mt-1 mb-4">
            Los aportes CORFO entran por el FIP: se cuentan una sola vez para no duplicar.
          </p>
          <div className="space-y-2.5">
            {origen.fuentes.map(f => (
              <div
                key={f.nombre}
                className={`flex items-start justify-between gap-4 pb-2.5 border-b border-black/[0.03] last:border-0 ${
                  f.ausente ? "opacity-70" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[13px] text-ink-900 flex items-center gap-1.5">
                    {f.ausente && <CircleSlash className="w-3 h-3 text-red-500 shrink-0" />}
                    {f.nombre}
                  </div>
                  <div className="text-[11px] text-ink-400 mt-0.5 leading-snug">{f.nota}</div>
                </div>
                <div
                  className={`text-[13px] tabular font-medium shrink-0 ${
                    f.ausente ? "text-red-600" : f.neutro ? "text-ink-400" : "text-ink-900"
                  }`}
                >
                  {f.ausente ? "sin dato" : fmtCLP(f.monto)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-baseline justify-between">
            <span className="text-[12px] text-ink-500">Financiamiento efectivo</span>
            <span className="text-base font-display font-semibold tabular text-csl-700">
              {fmtCLP(origen.totalFinanciamiento)}
            </span>
          </div>
        </div>

        {/* destino */}
        <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6">
          <h3 className="text-sm font-display font-semibold text-ink-900">A dónde fue</h3>
          <p className="text-[12px] text-ink-400 mt-1 mb-4">
            Egreso total {fmtCLP(PROYECTOS_KPIS.egresoTotal)} entre{" "}
            {dmy(PROYECTOS_META.desde)} y {dmy(PROYECTOS_META.corte)}.
          </p>
          <div className="space-y-3">
            {PROYECTOS_BANDAS.map(b => (
              <div key={b.id}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <div className="text-[13px] text-ink-900">
                    <span className="font-mono text-ink-400 mr-1.5">{b.id}</span>
                    {b.nombre}
                  </div>
                  <div className="text-[13px] tabular text-ink-900 shrink-0">{fmtCLP(b.egreso)}</div>
                </div>
                <div className="h-1.5 rounded-full bg-ink-50 overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${
                      b.id === "A" ? "bg-csl-500" : b.id === "B" ? "bg-csl-300" : b.id === "C" ? "bg-ink-300" : "bg-amber-400"
                    }`}
                    style={{ width: `${b.share * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-ink-400 leading-snug">
                  {fmtPct(b.share, 1)} · {b.desc}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-400 mt-4 pt-3 border-t border-black/[0.06] leading-relaxed">
            La banda C no es gasto: son movimientos con el FIP y la AFIS que netean cerca de cero.
            Leerla como consumo sobreestima el gasto real en {fmtCLP(PROYECTOS_BANDAS[2]?.egreso ?? 0)}.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------------- hitos CORFO */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden mb-10">
        <div className="px-6 py-5 border-b border-black/[0.04]">
          <h3 className="text-sm font-display font-semibold text-ink-900">Aportes CORFO por hito</h3>
          <p className="text-[12px] text-ink-400 mt-1">
            Valor de la acción ${PROYECTOS_CORFO.valorAccion.toLocaleString("es-CL")}. Contrastado
            contra lo efectivamente depositado en la cuenta.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 border-b border-black/[0.04]">
                <th className="text-left font-normal px-6 py-3">Hito</th>
                <th className="text-right font-normal px-3 py-3">Acciones</th>
                <th className="text-left font-normal px-3 py-3">Plan</th>
                <th className="text-right font-normal px-3 py-3">Teórico</th>
                <th className="text-right font-normal px-3 py-3">En banco</th>
                <th className="text-left font-normal px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {PROYECTOS_CORFO.hitos.map((h, i) => {
                const dep = PROYECTOS_CORFO.enBanco[i - 1];
                const enBanco = h.hito === "1" ? null : dep?.monto ?? null;
                const delta = enBanco === null ? null : enBanco - h.teorico;
                return (
                  <tr key={h.hito} className="border-b border-black/[0.03] last:border-0">
                    <td className="px-6 py-3 text-ink-900">Hito {h.hito}</td>
                    <td className="px-3 py-3 text-right tabular text-ink-600">{h.acciones.toLocaleString("es-CL")}</td>
                    <td className="px-3 py-3 text-ink-500 text-[12px]">{h.plan}</td>
                    <td className="px-3 py-3 text-right tabular text-ink-600">{fmtCLP(h.teorico)}</td>
                    <td className="px-3 py-3 text-right tabular text-ink-900">
                      {enBanco === null ? <span className="text-red-600">sin dato</span> : fmtCLP(enBanco)}
                    </td>
                    <td className="px-6 py-3 text-[12px]">
                      {enBanco === null ? (
                        <span className="text-red-700">Fuera del archivo — falta cartola 2024</span>
                      ) : delta === 0 ? (
                        <span className="text-csl-700">Calza exacto</span>
                      ) : (
                        <span className="text-amber-700">
                          Δ {fmtCLP(delta ?? 0)} · redondeo conocido
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------------------- movimientos consolidados */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden mb-10">
        <div className="px-6 py-5 border-b border-black/[0.04]">
          <h3 className="text-sm font-display font-semibold text-ink-900">
            Movimientos por proyecto
          </h3>
          <p className="text-[12px] text-ink-400 mt-1">
            {PROYECTOS_CONTROL.filasValidas} movimientos válidos de{" "}
            {PROYECTOS_CONTROL.filasLeidas} filas leídas ({PROYECTOS_CONTROL.filasExcluidas}{" "}
            excluidas: vacías y saldo inicial). Todos los proyectos, incluidos los que no son cartera.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 border-b border-black/[0.04]">
                <th className="text-left font-normal px-6 py-3">Proyecto</th>
                <th className="text-left font-normal px-3 py-3">Banda</th>
                <th className="text-right font-normal px-3 py-3">Movs</th>
                <th className="text-left font-normal px-3 py-3">Período</th>
                <th className="text-right font-normal px-3 py-3">Egreso</th>
                <th className="text-right font-normal px-3 py-3">Ingreso</th>
                <th className="text-right font-normal px-6 py-3">Neto</th>
              </tr>
            </thead>
            <tbody>
              {PROYECTOS.map(p => (
                <tr key={p.nombre} className="border-b border-black/[0.03] last:border-0 hover:bg-csl-50/40">
                  <td className="px-6 py-3">
                    <div className="text-ink-900">{p.nombre}</div>
                    {p.contrapartes.length > 0 && (
                      <div className="text-[11px] text-ink-400 mt-0.5 truncate max-w-[280px]">
                        {p.contrapartes.slice(0, 3).map(c => c.n).join(" · ")}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-ink-50 text-ink-500">
                      {p.banda}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular text-ink-600">{p.movs}</td>
                  <td className="px-3 py-3 text-[12px] tabular text-ink-500 whitespace-nowrap">
                    {p.desde ? `${dmy(p.desde)} → ${dmy(p.hasta)}` : "—"}
                  </td>
                  <td className="px-3 py-3 text-right tabular text-ink-700">{fmtCLP(p.egreso)}</td>
                  <td className="px-3 py-3 text-right tabular text-ink-700">{fmtCLP(p.abono)}</td>
                  <td
                    className={`px-6 py-3 text-right tabular font-medium ${
                      p.neto >= 0 ? "text-csl-700" : "text-ink-500"
                    }`}
                  >
                    {fmtCLP(p.neto)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-csl-50 font-medium">
                <td className="px-6 py-3.5 text-ink-900" colSpan={2}>
                  Total
                </td>
                <td className="px-3 py-3.5 text-right tabular text-ink-900">
                  {PROYECTOS_KPIS.movimientos}
                </td>
                <td className="px-3 py-3.5 text-[12px] tabular text-ink-600 whitespace-nowrap">
                  {dmy(PROYECTOS_META.desde)} → {dmy(PROYECTOS_META.corte)}
                </td>
                <td className="px-3 py-3.5 text-right tabular text-ink-900">
                  {fmtCLP(PROYECTOS_KPIS.egresoTotal)}
                </td>
                <td className="px-3 py-3.5 text-right tabular text-ink-900">
                  {fmtCLP(PROYECTOS_KPIS.abonoTotal)}
                </td>
                <td className="px-6 py-3.5 text-right tabular text-csl-700">
                  {fmtCLP(PROYECTOS_KPIS.abonoTotal - PROYECTOS_KPIS.egresoTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------------------- lo que falta cerrar */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-display font-semibold text-ink-900">Lo que falta cerrar</h3>
        </div>
        <p className="text-[12px] text-ink-400 mb-5">
          Esto no se arregla en la plataforma: se arregla etiquetando filas en el Excel de banco
          y consiguiendo la cartola que falta.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            {
              l: "Movimientos sin proyecto",
              v: fmtCLP(PROYECTOS_CONTROL.sinProyecto.egreso),
              s: `${PROYECTOS_CONTROL.sinProyecto.movs} movimientos por etiquetar`,
              grave: true,
            },
            {
              l: "Fondos a rendir",
              v: fmtCLP(PROYECTOS_CONTROL.cajaChica.egreso),
              s: `${PROYECTOS_CONTROL.cajaChica.movs} giros de caja chica sin rendir`,
              grave: true,
            },
            {
              l: "Anulados o rechazados",
              v: fmtCLP(PROYECTOS_CONTROL.nula.egreso),
              s: `${PROYECTOS_CONTROL.nula.movs} movimientos · confirmar exclusión`,
            },
            {
              l: "Año 2024 ausente",
              v: fmtCLP(PROYECTOS_CORFO.hitos[0].teorico),
              s: "Hito 1 CORFO fuera del archivo de banco",
              grave: true,
            },
          ].map(x => (
            <div
              key={x.l}
              className={`rounded-xl border p-4 ${
                x.grave ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50"
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-ink-400">{x.l}</div>
              <div
                className={`text-base font-display font-semibold tabular mt-1 ${
                  x.grave ? "text-red-700" : "text-amber-700"
                }`}
              >
                {x.v}
              </div>
              <div className="text-[11px] text-ink-500 mt-1 leading-snug">{x.s}</div>
            </div>
          ))}
        </div>

        <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 mb-2">
          Mayores egresos sin proyecto asignado
        </div>
        <div className="space-y-1.5">
          {PROYECTOS_CONTROL.mayoresSinProyecto.slice(0, 6).map(m => (
            <div
              key={`${m.fila}-${m.fecha}`}
              className="flex items-baseline justify-between gap-4 text-[12px] py-1.5 border-b border-black/[0.03] last:border-0"
            >
              <div className="min-w-0 flex items-baseline gap-2">
                <span className="tabular text-ink-400 shrink-0">{dmy(m.fecha)}</span>
                <span className="text-ink-600 truncate">{m.desc}</span>
              </div>
              <span className="tabular text-ink-900 shrink-0">{fmtCLP(m.egreso)}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-black/[0.06] flex items-start gap-2 text-[12px] text-ink-500 leading-relaxed">
          <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-csl-600" />
          <span>
            El cuadro maestro se regenera con{" "}
            <code className="font-mono text-[11px] bg-ink-50 px-1 py-0.5 rounded">
              python &quot;0. generar_cuadro_maestro.py&quot; &amp;&amp; python &quot;0. generar_plataforma.py&quot;
            </code>{" "}
            desde la carpeta 1. Desembolsos CSL. Corte actual: {dmy(PROYECTOS_META.corte)} ·
            generado el {dmy(PROYECTOS_META.generado)}.
          </span>
        </div>
      </div>
    </section>
  );
}
