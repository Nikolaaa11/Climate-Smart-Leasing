"use client";

import { useMemo, useState } from "react";
import {
  PROYECTOS,
  PROYECTOS_BANDAS,
  PROYECTOS_KPIS,
  PROYECTOS_META,
  PROYECTOS_PIVOT,
  PROYECTOS_CORFO,
  PROYECTOS_CONTROL,
  type BandaId,
  type Proyecto,
} from "@/lib/proyectos";
import { fmtCLP, fmtPct } from "@/lib/format";

/* Clases literales por banda: Tailwind necesita el nombre completo en el fuente,
   por eso no se construyen concatenando. */
const BANDA_ESTILO: Record<BandaId, { barra: string; punto: string; texto: string; suave: string }> = {
  A: { barra: "bg-csl-500",       punto: "bg-csl-500",       texto: "text-csl-700",     suave: "bg-csl-50" },
  B: { barra: "bg-[#0071e3]",     punto: "bg-[#0071e3]",     texto: "text-[#0071e3]",   suave: "bg-[#0071e3]/5" },
  C: { barra: "bg-[#5e5ce6]",     punto: "bg-[#5e5ce6]",     texto: "text-[#5e5ce6]",   suave: "bg-[#5e5ce6]/5" },
  D: { barra: "bg-[#ff9500]",     punto: "bg-[#ff9500]",     texto: "text-[#ff9500]",   suave: "bg-[#ff9500]/5" },
};

/** Monto compacto en millones. El signo va antes del peso, no pegado al número. */
const mm = (n: number) => {
  if (n === 0) return "—";
  const abs = Math.abs(n) / 1_000_000;
  const cifra = abs < 1
    ? abs.toLocaleString("es-CL", { maximumFractionDigits: 1 })
    : abs.toLocaleString("es-CL", { maximumFractionDigits: 0 });
  return `${n < 0 ? "−" : ""}$${cifra} MM`;
};

const soloFecha = (iso: string) => {
  const [y, m] = iso.split("-");
  return `${m}/${y.slice(2)}`;
};

export default function Proyectos() {
  const [banda, setBanda] = useState<BandaId | null>(null);
  const [abierto, setAbierto] = useState<Set<string>>(new Set());

  const [anioA, anioB] = PROYECTOS_META.anios;
  const k = PROYECTOS_KPIS;

  const visibles = useMemo(
    () => PROYECTOS.filter(p => (banda ? p.banda === banda : true) && (p.egreso > 0 || p.abono > 0)),
    [banda]
  );

  const alternar = (nombre: string) =>
    setAbierto(prev => {
      const s = new Set(prev);
      s.has(nombre) ? s.delete(nombre) : s.add(nombre);
      return s;
    });

  return (
    <section id="proyectos" className="py-16">
      {/* ---------------------------------------------------------------- encabezado */}
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-csl-600 mb-2">
          Cuadro maestro · corte {PROYECTOS_META.corte.split("-").reverse().join("-")}
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Proyectos
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          Egresos e ingresos por proyecto reconstruidos desde la cuenta{" "}
          {PROYECTOS_META.cuenta}. {k.movimientos} movimientos entre{" "}
          {PROYECTOS_META.desde.split("-").reverse().join("-")} y{" "}
          {PROYECTOS_META.corte.split("-").reverse().join("-")}.
        </p>
      </div>

      {/* ---------------------------------------------------------------- KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {[
          { l: "Cartera de proyectos", v: fmtCLP(k.carteraTotal), s: `${k.proyectos} proyectos · ${fmtPct(PROYECTOS_BANDAS[0].share, 1)} del egreso`, destacado: true },
          { l: "Egreso total",  v: fmtCLP(k.egresoTotal), s: `${k.movimientos} movimientos` },
          { l: "Ingreso total", v: fmtCLP(k.abonoTotal),  s: `neto ${fmtCLP(k.abonoTotal - k.egresoTotal)}` },
          { l: "Aportes CORFO en banco", v: fmtCLP(PROYECTOS_CORFO.totalEnBanco), s: "hitos 2, 3 y 4 · verificados" },
        ].map(x => (
          <div
            key={x.l}
            className={`rounded-2xl border border-black/[0.04] p-5 ${x.destacado ? "bg-csl-50" : "bg-bg-card shadow-soft"}`}
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-ink-400">{x.l}</div>
            <div className={`text-xl md:text-2xl font-display font-semibold tabular mt-1.5 ${x.destacado ? "text-csl-700" : "text-ink-900"}`}>
              {x.v}
            </div>
            <div className="text-[11px] text-ink-400 mt-1">{x.s}</div>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------------- espectro de composición */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6 mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-sm font-display font-semibold text-ink-900">Composición del egreso</h3>
          {banda && (
            <button
              onClick={() => setBanda(null)}
              className="text-[11px] text-csl-700 hover:text-csl-800 underline underline-offset-2"
            >
              ver todo
            </button>
          )}
        </div>

        {/* barra apilada: cada segmento es una banda y filtra al hacer clic */}
        <div className="flex w-full h-9 rounded-lg overflow-hidden mb-4">
          {PROYECTOS_BANDAS.map(b => (
            <button
              key={b.id}
              onClick={() => setBanda(banda === b.id ? null : b.id)}
              title={`${b.nombre} · ${fmtCLP(b.egreso)}`}
              style={{ width: `${b.share * 100}%` }}
              className={`${BANDA_ESTILO[b.id].barra} relative group transition-opacity duration-200 ${
                banda && banda !== b.id ? "opacity-25" : "opacity-100 hover:opacity-90"
              }`}
            >
              {b.share > 0.07 && (
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-white tabular">
                  {fmtPct(b.share, 0)}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {PROYECTOS_BANDAS.map(b => (
            <button
              key={b.id}
              onClick={() => setBanda(banda === b.id ? null : b.id)}
              className={`text-left rounded-xl p-3 border transition-colors duration-150 ${
                banda === b.id ? "border-ink-200 bg-bg-subtle" : "border-transparent hover:bg-bg-subtle"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${BANDA_ESTILO[b.id].punto}`} />
                <span className="text-xs font-medium text-ink-900">{b.nombre}</span>
              </div>
              <div className="text-sm font-display font-semibold tabular text-ink-900 mt-1.5">{fmtCLP(b.egreso)}</div>
              <p className="text-[11px] text-ink-400 mt-1 leading-snug">{b.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- fichas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-12">
        {visibles.map(p => (
          <FichaProyecto key={p.nombre} p={p} anioA={anioA} anioB={anioB} maximo={visibles[0]?.egreso ?? 1} />
        ))}
      </div>

      {/* ---------------------------------------------------------------- tabla jerárquica */}
      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden mb-10">
        <div className="px-6 py-5 border-b border-black/[0.04]">
          <h3 className="text-sm font-display font-semibold text-ink-900">Detalle por concepto</h3>
          <p className="text-[11px] text-ink-400 mt-0.5">
            Tocá un proyecto para abrir sus conceptos. {anioB} es un año parcial: la columna Δ
            compara un año completo contra uno en curso.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 border-b border-black/[0.04]">
                <th className="text-left font-normal px-6 py-2.5">Proyecto / concepto</th>
                <th className="text-right font-normal px-3 py-2.5">{anioA}</th>
                <th className="text-right font-normal px-3 py-2.5">{anioB}</th>
                <th className="text-right font-normal px-3 py-2.5">Total</th>
                <th className="text-right font-normal px-3 py-2.5">Δ</th>
                <th className="text-right font-normal px-6 py-2.5">% tot</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(p => {
                const esta = abierto.has(p.nombre);
                const conceptos = agruparConceptos(p.nombre);
                return (
                  <FilasProyecto
                    key={p.nombre}
                    p={p}
                    abierto={esta}
                    conceptos={conceptos}
                    onToggle={() => alternar(p.nombre)}
                  />
                );
              })}
              <tr className="bg-ink-900 text-white">
                <td className="px-6 py-3 text-sm font-display font-semibold">
                  {banda ? `Subtotal · banda ${banda}` : "Total general"}
                </td>
                {[
                  visibles.reduce((s, p) => s + p.ea, 0),
                  visibles.reduce((s, p) => s + p.eb, 0),
                  visibles.reduce((s, p) => s + p.egreso, 0),
                ].map((v, i) => (
                  <td key={i} className="px-3 py-3 text-right tabular font-semibold">{fmtCLP(v)}</td>
                ))}
                <td className="px-3 py-3 text-right tabular font-semibold">
                  {(() => {
                    const d = visibles.reduce((s, p) => s + p.delta, 0);
                    return d === 0 ? "—" : `${d > 0 ? "▲" : "▼"} ${mm(Math.abs(d))}`;
                  })()}
                </td>
                <td className="px-6 py-3 text-right tabular font-semibold">
                  {fmtPct(visibles.reduce((s, p) => s + p.share, 0), 1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------------------- control */}
      <PanelControl />
    </section>
  );
}

/* ====================================================================== ficha */
function FichaProyecto({
  p, anioA, anioB, maximo,
}: { p: Proyecto; anioA: number; anioB: number; maximo: number }) {
  const e = BANDA_ESTILO[p.banda];
  const topCp = p.contrapartes[0]?.v ?? 1;

  return (
    <div className="card-interactive bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-6 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.punto}`} />
            <span className="text-[10px] font-mono text-ink-400 truncate">{p.tag}</span>
          </div>
          <h3 className="text-base font-display font-semibold text-ink-900 leading-tight">{p.nombre}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-xl font-display font-semibold tabular ${e.texto}`}>{fmtPct(p.share, 1)}</div>
          <div className="text-[10px] text-ink-400">del egreso</div>
        </div>
      </div>

      <p className="text-xs text-ink-500 leading-relaxed mb-4">{p.desc}</p>

      {/* barra partida por año */}
      <div className="mb-1.5">
        <div className="flex w-full h-1.5 bg-ink-50 rounded-full overflow-hidden">
          <div className={`${e.barra} h-full`} style={{ width: `${(p.ea / maximo) * 100}%` }} />
          <div className={`${e.barra} h-full opacity-45`} style={{ width: `${(p.eb / maximo) * 100}%` }} />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-ink-400 tabular mb-4">
        <span>{anioA} · {mm(p.ea)}</span>
        <span>{anioB} · {mm(p.eb)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
        <div>
          <div className="text-ink-400 text-[10px]">Egreso</div>
          <div className="font-medium tabular text-ink-900">{mm(p.egreso)}</div>
        </div>
        <div>
          <div className="text-ink-400 text-[10px]">Ingreso</div>
          <div className="font-medium tabular text-ink-900">{p.abono ? mm(p.abono) : "—"}</div>
        </div>
        <div>
          <div className="text-ink-400 text-[10px]">Neto</div>
          <div className={`font-medium tabular ${p.neto < 0 ? "text-rose-600" : "text-csl-600"}`}>
            {mm(p.neto)}
          </div>
        </div>
      </div>

      {p.contrapartes.length > 0 && (
        <div className="mt-auto pt-4 border-t border-black/[0.04]">
          <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 mb-2">
            Principales contrapartes
          </div>
          <div className="space-y-1.5">
            {p.contrapartes.slice(0, 3).map(c => (
              <div key={c.n} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-ink-700 truncate">{c.n}</div>
                  <div className="h-0.5 bg-ink-50 rounded-full mt-0.5 overflow-hidden">
                    <div className={`${e.barra} h-full opacity-70`} style={{ width: `${(c.v / topCp) * 100}%` }} />
                  </div>
                </div>
                <div className="text-[11px] tabular text-ink-500 shrink-0">{mm(c.v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[10px] text-ink-300 tabular mt-3">
        {p.movs} movimientos · {soloFecha(p.desde)} – {soloFecha(p.hasta)}
      </div>
    </div>
  );
}

/* =============================================================== filas tabla */
type Concepto = { cg: string; a: number; b: number; total: number; detalle: typeof PROYECTOS_PIVOT };

function agruparConceptos(proyecto: string): Concepto[] {
  const filas = PROYECTOS_PIVOT.filter(x => x.proyecto === proyecto);
  const mapa = new Map<string, Concepto>();
  for (const f of filas) {
    const actual = mapa.get(f.cg) ?? { cg: f.cg, a: 0, b: 0, total: 0, detalle: [] as typeof PROYECTOS_PIVOT };
    actual.a += f.a;
    actual.b += f.b;
    actual.total += f.total;
    actual.detalle.push(f);
    mapa.set(f.cg, actual);
  }
  return [...mapa.values()].sort((x, y) => y.total - x.total);
}

function FilasProyecto({
  p, abierto, conceptos, onToggle,
}: { p: Proyecto; abierto: boolean; conceptos: Concepto[]; onToggle: () => void }) {
  const e = BANDA_ESTILO[p.banda];
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-black/[0.03] hover:bg-bg-subtle cursor-pointer transition-colors duration-150"
      >
        <td className="px-6 py-2.5">
          <div className="flex items-center gap-2">
            <span className={`text-ink-300 text-[10px] w-3 transition-transform duration-200 ${abierto ? "rotate-90" : ""}`}>
              ▶
            </span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.punto}`} />
            <span className="font-medium text-ink-900">{p.nombre}</span>
          </div>
        </td>
        <td className="px-3 py-2.5 text-right tabular text-ink-700">{p.ea ? fmtCLP(p.ea) : "—"}</td>
        <td className="px-3 py-2.5 text-right tabular text-ink-700">{p.eb ? fmtCLP(p.eb) : "—"}</td>
        <td className="px-3 py-2.5 text-right tabular font-medium text-ink-900">{fmtCLP(p.egreso)}</td>
        <td className={`px-3 py-2.5 text-right tabular ${p.delta > 0 ? "text-csl-600" : p.delta < 0 ? "text-ink-400" : "text-ink-300"}`}>
          {p.delta === 0 ? "—" : `${p.delta > 0 ? "▲" : "▼"} ${mm(Math.abs(p.delta))}`}
        </td>
        <td className="px-6 py-2.5 text-right tabular text-ink-500">{fmtPct(p.share, 1)}</td>
      </tr>

      {abierto &&
        conceptos.map(c => (
          <tr key={c.cg} className="bg-bg-subtle/50 border-b border-black/[0.02]">
            <td className="px-6 py-1.5 pl-14 text-xs text-ink-600">{c.cg.replace(/_/g, " ")}</td>
            <td className="px-3 py-1.5 text-right tabular text-xs text-ink-500">{c.a ? fmtCLP(c.a) : "—"}</td>
            <td className="px-3 py-1.5 text-right tabular text-xs text-ink-500">{c.b ? fmtCLP(c.b) : "—"}</td>
            <td className="px-3 py-1.5 text-right tabular text-xs text-ink-600">{fmtCLP(c.total)}</td>
            <td colSpan={2} className="px-6 py-1.5 text-right text-[11px] text-ink-300">
              {c.detalle.map(d => d.cd).join(" · ")}
            </td>
          </tr>
        ))}
    </>
  );
}

/* ================================================================== control */
function PanelControl() {
  const c = PROYECTOS_CONTROL;
  const [abierto, setAbierto] = useState(false);

  const hallazgos = [
    { nivel: "alto",  t: `${c.sinProyecto.movs} movimientos sin proyecto asignado`, v: c.sinProyecto.egreso, a: "Etiquetar en el Excel de banco" },
    { nivel: "alto",  t: `${c.cajaChica.movs} fondos a rendir de caja chica`,       v: c.cajaChica.egreso,   a: "Rendir y reclasificar" },
    { nivel: "medio", t: `${c.nula.movs} movimientos anulados o rechazados`,        v: c.nula.egreso,        a: "Confirmar exclusión del total" },
    { nivel: "alto",  t: "Año 2024 ausente — Hito 1 CORFO no visible",              v: 426933132,            a: "Conseguir cartola 2024" },
  ];

  return (
    <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] overflow-hidden">
      <button
        onClick={() => setAbierto(v => !v)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-bg-subtle transition-colors duration-150"
      >
        <div>
          <h3 className="text-sm font-display font-semibold text-ink-900">Control de calidad</h3>
          <p className="text-[11px] text-ink-400 mt-0.5">
            {c.filasValidas} filas válidas de {c.filasLeidas} leídas · {hallazgos.length} hallazgos abiertos
          </p>
        </div>
        <span className={`text-ink-300 text-xs transition-transform duration-200 ${abierto ? "rotate-90" : ""}`}>▶</span>
      </button>

      {abierto && (
        <div className="px-6 pb-6 border-t border-black/[0.04] pt-5 space-y-5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 mb-2">
              Aportes CORFO · banco contra plan de hitos
            </div>
            <div className="space-y-1">
              {PROYECTOS_CORFO.hitos.map(h => {
                const enBanco: Record<string, number> = { "2": 213466566, "3": 169506610, "4": 298033596 };
                const v = enBanco[h.hito];
                return (
                  <div key={h.hito} className="flex items-center justify-between text-xs py-1 border-b border-black/[0.02]">
                    <span className="text-ink-600">
                      Hito {h.hito} · {h.acciones.toLocaleString("es-CL")} acciones · plan {h.plan}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="tabular text-ink-500">{v ? fmtCLP(v) : "sin dato"}</span>
                      <span className={`text-[11px] ${v === h.teorico ? "text-csl-600" : "text-amber-600"}`}>
                        {v == null
                          ? "fuera de rango"
                          : v === h.teorico
                            ? "✓ calza"
                            : `Δ ${v - h.teorico < 0 ? "−" : "+"}${fmtCLP(Math.abs(v - h.teorico))} · redondeo`}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400 mb-2">
              Hallazgos abiertos
            </div>
            <div className="space-y-1">
              {hallazgos.map(h => (
                <div key={h.t} className="flex items-center justify-between text-xs py-1.5 border-b border-black/[0.02]">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.nivel === "alto" ? "bg-rose-500" : "bg-amber-500"}`} />
                    <span className="text-ink-700 truncate">{h.t}</span>
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className="tabular text-ink-500">{fmtCLP(h.v)}</span>
                    <span className="text-[11px] text-ink-400 hidden sm:inline">{h.a}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-ink-400 leading-relaxed">
            Reglas de normalización, bandas e invariantes en{" "}
            <span className="font-mono">0. SUPER PROMPT - Cuadro Maestro Proyectos CSL.md</span>.
            Los datos de esta sección se regeneran con{" "}
            <span className="font-mono">0. generar_cuadro_maestro.py</span> +{" "}
            <span className="font-mono">0. generar_plataforma.py</span>.
          </p>
        </div>
      )}
    </div>
  );
}
