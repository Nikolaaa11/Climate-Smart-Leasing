"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import TopNav from "./components/TopNav";
import Dashboard from "./components/Dashboard";
import Contracts from "./components/Contracts";
import Schedule from "./components/Schedule";
import Movements from "./components/Movements";
import AccountVerification from "./components/AccountVerification";
import CartolaUpload from "./components/CartolaUpload";
import Accounting from "./components/Accounting";
import GeistReconciliation from "./components/GeistReconciliation";
import Cobranza from "./components/Cobranza";
import { ABONOS, Abono } from "@/lib/abonos";
import { CONTRACTS } from "@/lib/contracts";
import { buildConciliation } from "@/lib/conciliation";

export default function Home() {
  const [extraAbonos, setExtraAbonos] = useState<Abono[]>([]);

  const allAbonos = useMemo(() => [...ABONOS, ...extraAbonos], [extraAbonos]);
  const result = useMemo(() => buildConciliation(allAbonos), [allAbonos]);

  return (
    <main className="min-h-screen bg-bg">
      <TopNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/[0.04]">
        <div className="absolute inset-0 dot-pattern opacity-[0.4]" />
        <div className="absolute inset-0 bg-gradient-to-b from-csl-50/40 via-white/40 to-white" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-28">
          <div className="flex items-start gap-8 mb-8">
            <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
              <Image
                src="/logos/csl-icon-green.png"
                alt="Climate Smart Leasing"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-csl-600 mb-2">
                Climate Smart Leasing SpA
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-ink-900 tracking-tighter leading-[0.95]">
                Control
                <br />
                <span className="text-csl-600">financiero.</span>
              </h1>
            </div>
          </div>
          <p className="text-lg text-ink-500 mt-6 max-w-2xl leading-relaxed">
            Plataforma de consolidación financiera para CSL. Contratos vigentes,
            cobranza, libro mayor completo y conciliación con la cuenta Santander N° 9427-8910.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-10 text-xs text-ink-400">
            <span className="tabular">{result.cuotas.length} cuotas modeladas</span>
            <span>·</span>
            <span className="tabular">{allAbonos.length} abonos conciliados</span>
            <span>·</span>
            <span className="tabular">436 movimientos contables</span>
            <span>·</span>
            <span className="tabular">{CONTRACTS.length} contratos vigentes</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Dashboard result={result} />
        <Contracts result={result} />
        <Cobranza />
        <Accounting />
        <GeistReconciliation />
        <Schedule result={result} />
        <Movements abonos={allAbonos} />
        <AccountVerification />
        <CartolaUpload
          onApply={(newAbonos) => {
            const toAdd: Abono[] = newAbonos.map(({ identifiedContract, identifiedReason, ...rest }) => rest);
            setExtraAbonos(prev => [...prev, ...toAdd]);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      <footer className="border-t border-black/[0.04] mt-20 py-12 bg-csl-50/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/logos/csl-icon-gray.png"
                  alt="CSL"
                  fill
                  sizes="32px"
                  className="object-contain opacity-60"
                />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink-400 mb-1">
                  CSL · 77.868.887-5
                </div>
                <div className="text-xs text-ink-500">
                  Climate Smart Leasing SpA · Avenida Chacabuco 485, Of. 302, Concepción
                </div>
              </div>
            </div>
            <div className="text-[11px] text-ink-400">
              Datos verificados al {new Intl.DateTimeFormat("es-CL", { dateStyle: "long" }).format(new Date())}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
