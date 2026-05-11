"use client";

import dynamic from "next/dynamic";
import type { LatLng, RestaurantMatch } from "@/lib/types";

const ResultsMap = dynamic(() => import("./results-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] min-h-[420px] items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      Cargando mapa…
    </div>
  ),
});

export function ResultsMapLoader({
  resultados,
  ubicacion,
}: {
  resultados: RestaurantMatch[];
  ubicacion: LatLng;
}) {
  return <ResultsMap resultados={resultados} ubicacion={ubicacion} />;
}
