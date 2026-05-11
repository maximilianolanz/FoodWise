import Link from "next/link";
import { LocationPrompt } from "@/components/location-prompt";
import { ResultsList } from "@/components/results-list";
import { ResultsMapLoader } from "@/components/results-map-loader";
import { SearchBar } from "@/components/search-bar";
import { ViewToggle } from "@/components/view-toggle";
import { buscar } from "@/lib/search";
import { SANTIAGO_CENTRO, type LatLng } from "@/lib/types";

type Vista = "lista" | "mapa";

type RawSearchParams = {
  q?: string | string[];
  vista?: string | string[];
  lat?: string | string[];
  lng?: string | string[];
};

const SUGERENCIAS = [
  "Pastel de choclo",
  "Sushi",
  "Ceviche",
  "Empanada",
  "Pizza",
  "Ramen",
  "Lomo saltado",
  "Hamburguesa",
  "Chorrillana",
];

function primero(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseVista(v: string | undefined): Vista {
  return v === "mapa" ? "mapa" : "lista";
}

function parseUbicacion(
  rawLat: string | undefined,
  rawLng: string | undefined,
): { ubicacion: LatLng; usandoFallback: boolean } {
  const lat = rawLat ? Number(rawLat) : NaN;
  const lng = rawLng ? Number(rawLng) : NaN;
  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  ) {
    return { ubicacion: { lat, lng }, usandoFallback: false };
  }
  return { ubicacion: SANTIAGO_CENTRO, usandoFallback: true };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const consulta = (primero(sp.q) ?? "").trim();
  const vista = parseVista(primero(sp.vista));
  const { ubicacion, usandoFallback } = parseUbicacion(
    primero(sp.lat),
    primero(sp.lng),
  );

  const resultados = consulta
    ? buscar({ consulta, ubicacion, limite: 12 })
    : [];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Santiago, Chile
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          BuscaPlato
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Encuentra restaurantes por el plato que quieres comer. Ordenamos por
          coincidencia con el plato y cercanía a tu ubicación.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <SearchBar />
        <LocationPrompt
          lat={ubicacion.lat}
          lng={ubicacion.lng}
          usandoFallback={usandoFallback}
        />
      </section>

      {consulta ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {resultados.length > 0
                ? `${resultados.length} resultados para "${consulta}"`
                : `Sin resultados para "${consulta}"`}
            </h2>
            {resultados.length > 0 && <ViewToggle vista={vista} />}
          </div>

          {resultados.length === 0 ? (
            <EmptyState consulta={consulta} />
          ) : vista === "mapa" ? (
            <ResultsMapLoader resultados={resultados} ubicacion={ubicacion} />
          ) : (
            <ResultsList resultados={resultados} />
          )}
        </section>
      ) : (
        <Sugerencias />
      )}

      <footer className="mt-auto pt-8 text-xs text-zinc-400 dark:text-zinc-500">
        Mapa © contribuyentes de{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          OpenStreetMap
        </a>
        . Datos de restaurantes de muestra.
      </footer>
    </main>
  );
}

function Sugerencias() {
  return (
    <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Prueba con
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {SUGERENCIAS.map((s) => (
          <li key={s}>
            <Link
              href={`/?q=${encodeURIComponent(s)}`}
              className="inline-block rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-500"
            >
              {s}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyState({ consulta }: { consulta: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-zinc-700 dark:text-zinc-300">
        No encontramos restaurantes con{" "}
        <span className="font-medium">&quot;{consulta}&quot;</span> en su menú.
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Intenta con otro plato o un término más general.
      </p>
    </div>
  );
}
