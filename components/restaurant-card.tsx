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
}: {
  match: RestaurantMatch;
  ranking?: number;
}) {
  const { restaurante: r, plato, distanciaKm } = match;
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {ranking !== undefined && (
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
                {ranking}
              </span>
            )}
            {r.nombre}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {r.comuna} · {r.direccion}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <span aria-hidden>★</span>
          <span className="font-medium">{r.rating.toFixed(1)}</span>
        </div>
      </header>

      <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Plato encontrado
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {plato.plato}
          </p>
          <p className="shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {clp.format(plato.precio)}
          </p>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {plato.descripcion}
        </p>
      </div>

      <footer className="mt-3 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <span aria-label="Distancia">📍 {distanciaTexto(distanciaKm)}</span>
      </footer>
    </article>
  );
}
