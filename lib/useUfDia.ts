"use client";

// UF del día, actualizada automáticamente: al cargar la página se consulta la
// API pública mindicador.cl (Banco Central / SII). Si no hay conexión, se usa
// la última UF conocida de lib/uf.ts como respaldo.

import { useEffect, useState } from "react";
import { UF_END_OF_MONTH } from "./uf";

const lastKey = Object.keys(UF_END_OF_MONTH).sort().pop()!;
const UF_FALLBACK = UF_END_OF_MONTH[lastKey];

export interface UfDia {
  valor: number;
  fecha: string; // ISO yyyy-mm-dd del valor (vacío si es fallback)
  fuente: "mindicador.cl" | "último valor conocido";
}

export function useUfDia(): UfDia {
  const [uf, setUf] = useState<UfDia>({
    valor: UF_FALLBACK,
    fecha: "",
    fuente: "último valor conocido",
  });

  useEffect(() => {
    let alive = true;
    fetch("https://mindicador.cl/api/uf")
      .then(r => r.json())
      .then(j => {
        const serie = j?.serie?.[0];
        if (alive && serie && typeof serie.valor === "number" && serie.valor > 0) {
          setUf({
            valor: serie.valor,
            fecha: String(serie.fecha).slice(0, 10),
            fuente: "mindicador.cl",
          });
        }
      })
      .catch(() => {
        // sin conexión: se mantiene el fallback
      });
    return () => {
      alive = false;
    };
  }, []);

  return uf;
}
