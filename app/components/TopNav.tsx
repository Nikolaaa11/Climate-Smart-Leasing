"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "#dashboard", label: "Resumen" },
  { href: "#contratos", label: "Contratos" },
  { href: "#ordenes-compra", label: "Órdenes de compra" },
  { href: "#cobranza", label: "Cobranza" },
  { href: "#conciliacion-geist", label: "Geist" },
  { href: "#cronograma", label: "Cronograma" },
  { href: "#movimientos", label: "Movimientos" },
  { href: "#verificacion", label: "Verificación" },
  { href: "#subir", label: "Subir cartola" },
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-black/[0.04]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 relative">
            <Image
              src="/logos/csl-icon-green.png"
              alt="Climate Smart Leasing"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="text-[13px] font-display font-medium text-ink-900 leading-none">
              Climate Smart Leasing
            </div>
            <div className="text-[10px] text-ink-400 mt-0.5 tabular">
              Control financiero · 77.868.887-5
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className="px-2.5 py-1.5 text-[12px] text-ink-700 hover:text-csl-700 hover:bg-csl-50 rounded-md transition-colors duration-150"
            >
              {it.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
