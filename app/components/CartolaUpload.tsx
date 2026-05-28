"use client";

import { useState } from "react";
import { Upload, FileCheck2, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { fmtCLP, fmtDate } from "@/lib/format";

interface ParsedAbono {
  fecha: string;
  monto: number;
  glosa: string;
  doc: string;
  cartolaMes: string;
  identifiedContract?: string;
  identifiedReason: string;
}

export default function CartolaUpload({
  onApply,
}: {
  onApply: (newAbonos: ParsedAbono[]) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "parsed" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [parsedAbonos, setParsedAbonos] = useState<ParsedAbono[]>([]);
  const [fileName, setFileName] = useState<string>("");

  async function handleFile(file: File) {
    setStatus("uploading");
    setError("");
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cartolas/parse", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: "Error del servidor" }));
        throw new Error(e.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setParsedAbonos(data.abonos);
      setStatus("parsed");
    } catch (e: any) {
      setError(e.message || String(e));
      setStatus("error");
    }
  }

  function applyAndClose() {
    onApply(parsedAbonos);
    setStatus("idle");
    setParsedAbonos([]);
    setFileName("");
  }

  function reset() {
    setStatus("idle");
    setParsedAbonos([]);
    setError("");
    setFileName("");
  }

  return (
    <section id="subir" className="py-16">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink-400 mb-2">
          Cartola nueva
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink-900 tracking-tight">
          Subir cartola
        </h2>
        <p className="text-ink-500 mt-3 max-w-2xl">
          Sube un PDF de cartola Santander (cuenta 9427-8910). El sistema extraerá
          los abonos y los asignará automáticamente a cada contrato por RUT pagador.
        </p>
      </div>

      <div className="bg-bg-card rounded-2xl shadow-soft border border-black/[0.04] p-8">
        {status === "idle" && (
          <label
            htmlFor="cartola-upload"
            className="block border-2 border-dashed border-ink-100 rounded-2xl p-12 text-center cursor-pointer hover:border-ink-200 hover:bg-ink-50/30 transition-all"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
          >
            <input
              id="cartola-upload"
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-ink-900 text-white flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-semibold text-ink-900 mb-1">
              Arrastra una cartola PDF aquí
            </h3>
            <p className="text-xs text-ink-500">
              o haz clic para seleccionar un archivo
            </p>
            <div className="mt-6 text-[10px] text-ink-400">
              Formatos soportados: cartola Santander oficial (.pdf)
            </div>
          </label>
        )}

        {status === "uploading" && (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-ink-400 mx-auto mb-4 animate-spin" />
            <p className="text-sm text-ink-600">Procesando {fileName}…</p>
            <p className="text-[11px] text-ink-400 mt-2">Extrayendo abonos y conciliando con contratos</p>
          </div>
        )}

        {status === "error" && (
          <div className="py-10">
            <div className="flex items-start gap-3 max-w-xl mx-auto bg-rose-50 border border-rose-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900 mb-1">No fue posible procesar el archivo</p>
                <p className="text-xs text-ink-600">{error}</p>
              </div>
              <button onClick={reset} className="text-ink-400 hover:text-ink-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {status === "parsed" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-semibold text-ink-900">
                    {parsedAbonos.length} abonos detectados
                  </h3>
                  <p className="text-xs text-ink-500">{fileName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  className="px-4 py-2 text-xs font-medium text-ink-600 hover:bg-ink-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyAndClose}
                  className="px-4 py-2 text-xs font-medium text-white bg-ink-900 rounded-lg hover:bg-ink-700 transition-colors"
                >
                  Aplicar a conciliación
                </button>
              </div>
            </div>

            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-ink-400 border-b border-ink-100">
                    <th className="py-2 pr-3 font-medium">Fecha</th>
                    <th className="py-2 pr-3 font-medium text-right">Monto</th>
                    <th className="py-2 pr-3 font-medium">Glosa</th>
                    <th className="py-2 font-medium">Asignado a</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedAbonos.map((ab, i) => (
                    <tr key={i} className="border-b border-ink-50">
                      <td className="py-2.5 pr-3 text-ink-700 tabular">{fmtDate(ab.fecha)}</td>
                      <td className="py-2.5 pr-3 text-right tabular font-medium text-ink-900">{fmtCLP(ab.monto)}</td>
                      <td className="py-2.5 pr-3 text-ink-600 truncate max-w-xs">{ab.glosa}</td>
                      <td className="py-2.5">
                        {ab.identifiedContract ? (
                          <span className="pill bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            {ab.identifiedContract}
                          </span>
                        ) : (
                          <span className="pill bg-ink-50 text-ink-500" title={ab.identifiedReason}>
                            No identificado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-ink-400 mt-4">
        Nota: el procesamiento es local — el archivo no se guarda en servidores externos.
        Los abonos aplicados se mantienen en sesión hasta recargar la página.
      </p>
    </section>
  );
}
