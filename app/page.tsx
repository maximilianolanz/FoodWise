import Link from "next/link";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { LocationPrompt } from "@/components/location-prompt";
import { ResultsList } from "@/components/results-list";
import { ResultsMapLoader } from "@/components/results-map-loader";
import { SearchBar } from "@/components/search-bar";
import { SortSelect } from "@/components/sort-select";
import { ViewToggle } from "@/components/view-toggle";
import { type Diet, DIETAS_KEYS } from "@/lib/diet";
import {
  aplicarFiltros,
  comunasDisponibles,
  type Filtros,
  hayFiltrosActivos,
  parseFiltros,
  rangoPrecios,
  rangoRatings,
} from "@/lib/filters";
import { parseKeywords } from "@/lib/keywords";
import { buscar } from "@/lib/search";
import { ordenar, parseOrden } from "@/lib/sort";
import { SANTIAGO_CENTRO, type LatLng } from "@/lib/types";

type Vista = "lista" | "mapa";

const LIMITE_RESULTADOS = 24;

type RawSearchParams = {
  q?: string | string[];
  vista?: string | string[];
  lat?: string | string[];
  lng?: string | string[];
  precioMin?: string | string[];
  precioMax?: string | string[];
  comuna?: string | string[];
  ratingMin?: string | string[];
  ratingMax?: string | string[];
  dist?: string | string[];
  dieta?: string | string[];
  orden?: string | string[];
};

/**
 * Per-diet result count for the sidebar facet: how many results if this diet
 * were the only one ticked, with the other active filters applied.
 */
function contarDietas(
  keywords: string[],
  ubicacion: LatLng,
  filtros: Filtros,
): Record<Diet, number> {
  const entries = DIETAS_KEYS.map((d) => {
    if (keywords.length === 0) return [d, 0] as const;
    const res = aplicarFiltros(
      buscar({ consultas: keywords, ubicacion, dietas: [d] }),
      filtros,
    );
    return [d, res.length] as const;
  });
  return Object.fromEntries(entries) as Record<Diet, number>;
}

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
  const keywords = parseKeywords(sp.q);
  const vista = parseVista(primero(sp.vista));
  const { ubicacion, usandoFallback } = parseUbicacion(
    primero(sp.lat),
    primero(sp.lng),
  );

  const filtros = parseFiltros(sp);
  const orden = parseOrden(sp.orden);

  const base =
    keywords.length > 0
      ? buscar({ consultas: keywords, ubicacion, dietas: filtros.dietas })
      : [];
  // Total keyword matches ignoring every filter — used to tell "no dish matches"
  // apart from "filters (incl. diet) removed everything".
  const totalSinFiltros =
    filtros.dietas.length === 0
      ? base.length
      : keywords.length > 0
        ? buscar({ consultas: keywords, ubicacion }).length
        : 0;
  const comunas = comunasDisponibles(base);
  const rangoPrecio = rangoPrecios(base);
  const rangoRating = rangoRatings(base);
  const conteoDietas = contarDietas(keywords, ubicacion, filtros);
  const filtrados = aplicarFiltros(base, filtros);
  const visibles = ordenar(filtrados, orden).slice(0, LIMITE_RESULTADOS);

  const consultaTexto = keywords.join(", ");
  const filtrosActivos = hayFiltrosActivos(filtros);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Santiago, Chile
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          FoodWise
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Encuentra restaurantes por el plato que quieres comer.
        </p>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Ordenamos por coincidencia con el plato y cercanía a tu ubicación.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <LocationPrompt
          lat={ubicacion.lat}
          lng={ubicacion.lng}
          usandoFallback={usandoFallback}
        />
        <SearchBar />
      </section>

      {keywords.length === 0 ? (
        <Sugerencias />
      ) : totalSinFiltros === 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Sin resultados para &quot;{consultaTexto}&quot;
          </h2>
          <EmptyBusqueda consulta={consultaTexto} keywords={keywords} />
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {filtrosActivos
                ? `${filtrados.length} de ${totalSinFiltros} resultados para "${consultaTexto}"`
                : `${totalSinFiltros} resultados para "${consultaTexto}"`}
            </h2>
            <div className="flex items-center gap-3">
              <SortSelect />
              {filtrados.length > 0 && <ViewToggle vista={vista} />}
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <FiltersSidebar
              comunas={comunas}
              rangoPrecio={rangoPrecio}
              rangoRating={rangoRating}
              conteoDietas={conteoDietas}
            />
            <div className="min-w-0 flex-1">
              {filtrados.length === 0 ? (
                <EmptyFiltros dietasActivas={filtros.dietas.length > 0} />
              ) : vista === "mapa" ? (
                <ResultsMapLoader
                  resultados={visibles}
                  ubicacion={ubicacion}
                />
              ) : (
                <ResultsList resultados={visibles} />
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="mt-auto pt-8">
        <p className="text-m text-zinc-500 dark:text-zinc-500 font-bold">
          Gestión de Proyectos de Tecnologías de la Información [IIC3113-2]
        </p>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-500">
          Grupo 1: Vicente Sajuria - Miguel Mujica - Maximiliano Lanz - Matías Cruz
        </p>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
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
        </p>
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

function EmptyBusqueda({
  consulta,
  keywords,
}: {
  consulta: string;
  keywords: string[];
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-zinc-700 dark:text-zinc-300">
        No encontramos restaurantes con{" "}
        <span className="font-medium">&quot;{consulta}&quot;</span> en su menú.
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {keywords.length > 1
          ? "Quita alguna palabra clave o prueba términos más generales."
          : "Intenta con otro plato o un término más general."}
      </p>
    </div>
  );
}

function EmptyFiltros({ dietasActivas }: { dietasActivas: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-zinc-700 dark:text-zinc-300">
        Ningún resultado coincide con los filtros seleccionados.
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {dietasActivas
          ? "Aún hay pocos platos etiquetados con restricciones alimentarias. Prueba quitar alguna restricción u otro filtro."
          : "Ajusta o limpia los filtros para ver más opciones."}
      </p>
    </div>
  );
}
