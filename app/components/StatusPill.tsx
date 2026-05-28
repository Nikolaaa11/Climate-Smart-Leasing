import { EstadoCuota } from "@/lib/conciliation";

const STYLES: Record<EstadoCuota, { bg: string; text: string; dot: string; label: string }> = {
  pagada: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Pagada",
  },
  "pagada-parcial": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Pagada parcial",
  },
  "pagada-diferencia": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    label: "Con diferencia",
  },
  "vencida-sin-pago": {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    label: "Vencida sin pago",
  },
  "por-vencer": {
    bg: "bg-ink-50",
    text: "text-ink-500",
    dot: "bg-ink-300",
    label: "Por vencer",
  },
  "sin-valor": {
    bg: "bg-ink-50",
    text: "text-ink-400",
    dot: "bg-ink-200",
    label: "Sin valor",
  },
};

export default function StatusPill({ estado }: { estado: EstadoCuota }) {
  const s = STYLES[estado];
  return (
    <span className={`pill ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
