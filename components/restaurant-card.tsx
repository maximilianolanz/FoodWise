"use client";

import { DIETAS } from "@/lib/diet";
import type { RestaurantMatch } from "@/lib/types";

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function distanciaTexto(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function RestaurantCard({
  match,
  ranking,
  onAbrir,
}: {
  match: RestaurantMatch;
  ranking?: number;
  onAbrir: () => void;
}) {
  const { restaurante: r, plato, distanciaKm } = match;

  function alPresionar(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAbrir();
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onAbrir}
      onKeyDown={alPresionar}
      aria-label={`Ver información de ${r.nombre}`}
      className="group flex h-full cursor-pointer flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:ring-offset-zinc-950"
    >
      {/* El plato manda: nombre del plato + precio como protagonistas */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-2">
          {ranking !== undefined && (
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
              {ranking}
            </span>
          )}
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
            {plato.plato}
          </h3>
        </div>
        <p className="shrink-0 pt-0.5 text-right text-base font-semibold tabular-nums text-amber-600 dark:text-amber-400">
          {clp.format(plato.precio)}
        </p>
      </div>

      {/* Ingredientes: el segundo protagonista, no el local */}
      <p className="mt-2 border-l-2 border-amber-200 pl-3 text-sm leading-relaxed text-zinc-600 dark:border-amber-900/50 dark:text-zinc-300">
        {plato.descripcion}
      </p>

      {plato.dietas && plato.dietas.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {DIETAS.filter((d) => plato.dietas?.includes(d.key)).map((d) => (
            <li
              key={d.key}
              className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              {d.badge}
            </li>
          ))}
        </ul>
      )}

      {/* Dónde comerlo: el restaurante pasa a segundo plano */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="flex min-w-0 items-center gap-1.5 text-sm">
          <span aria-hidden className="shrink-0 text-zinc-400 dark:text-zinc-500">
            🍴
          </span>
          <p className="truncate">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {r.nombre}
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">
              {" · "}
              {r.comuna}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <span aria-hidden>★</span>
            <span className="font-medium tabular-nums">{r.rating.toFixed(1)}</span>
          </span>
          <span className="inline-flex items-center gap-1" aria-label="Distancia">
            <span aria-hidden>📍</span>
            <span className="tabular-nums">{distanciaTexto(distanciaKm)}</span>
          </span>
        </div>
      </div>

      {/* Pista de interacción: el local pasa a primer plano al abrir */}
      <p
        aria-hidden
        className="mt-3 text-right text-xs font-medium text-zinc-400 transition-colors group-hover:text-amber-600 dark:text-zinc-500 dark:group-hover:text-amber-400"
      >
        Ver local →
      </p>
    </article>
  );
}
