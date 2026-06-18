import { type Diet, DIETAS_KEYS } from "./diet";
import { normalizar } from "./text";
import type { RestaurantMatch } from "./types";

export type DistanciaOption = { key: string; label: string; max: number };

export const DISTANCIAS_MAX: ReadonlyArray<DistanciaOption> = [
  { key: "1", label: "≤ 1 km", max: 1 },
  { key: "3", label: "≤ 3 km", max: 3 },
  { key: "5", label: "≤ 5 km", max: 5 },
];

export const RATING_MIN = 0;
export const RATING_MAX = 5;

/** A user-defined numeric range; either bound may be open (null). */
export type Rango = { min: number | null; max: number | null };

export type RangoNumerico = { min: number; max: number };

export type Filtros = {
  precio: Rango;
  comunas: string[];
  rating: Rango;
  distanciaMax: number | null;
  dietas: Diet[];
};

function primero(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function parseNumero(
  raw: string | string[] | undefined,
  lo: number,
  hi: number,
): number | null {
  const s = primero(raw);
  if (s === undefined || s.trim() === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(n, lo), hi);
}

type RawParams = {
  precioMin?: string | string[];
  precioMax?: string | string[];
  comuna?: string | string[];
  ratingMin?: string | string[];
  ratingMax?: string | string[];
  dist?: string | string[];
  dieta?: string | string[];
};

function parseDietas(raw: string | string[] | undefined): Diet[] {
  const lista = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw];
  const vistos = new Set<string>();
  const dietas: Diet[] = [];
  for (const item of lista) {
    const key = item.trim() as Diet;
    if (!DIETAS_KEYS.includes(key) || vistos.has(key)) continue;
    vistos.add(key);
    dietas.push(key);
  }
  return dietas;
}

export function parseFiltros(sp: RawParams): Filtros {
  const comunasRaw = Array.isArray(sp.comuna)
    ? sp.comuna
    : sp.comuna === undefined
      ? []
      : [sp.comuna];
  const vistos = new Set<string>();
  const comunas: string[] = [];
  for (const c of comunasRaw) {
    const clave = normalizar(c);
    if (!clave || vistos.has(clave)) continue;
    vistos.add(clave);
    comunas.push(c);
  }

  const distKey = primero(sp.dist);
  const distanciaMax =
    DISTANCIAS_MAX.find((d) => d.key === distKey)?.max ?? null;

  return {
    precio: {
      min: parseNumero(sp.precioMin, 0, Infinity),
      max: parseNumero(sp.precioMax, 0, Infinity),
    },
    comunas,
    rating: {
      min: parseNumero(sp.ratingMin, RATING_MIN, RATING_MAX),
      max: parseNumero(sp.ratingMax, RATING_MIN, RATING_MAX),
    },
    distanciaMax,
    dietas: parseDietas(sp.dieta),
  };
}

function rangoActivo(r: Rango): boolean {
  return r.min !== null || r.max !== null;
}

export function hayFiltrosActivos(filtros: Filtros): boolean {
  return (
    rangoActivo(filtros.precio) ||
    filtros.comunas.length > 0 ||
    rangoActivo(filtros.rating) ||
    filtros.distanciaMax !== null ||
    filtros.dietas.length > 0
  );
}

/** Unique comunas present in the given matches, alphabetically sorted. */
export function comunasDisponibles(matches: RestaurantMatch[]): string[] {
  const set = new Set<string>();
  for (const m of matches) set.add(m.restaurante.comuna);
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

/** Min/max dish price across matches, for input hints. Null if empty. */
export function rangoPrecios(matches: RestaurantMatch[]): RangoNumerico | null {
  if (matches.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const m of matches) {
    min = Math.min(min, m.plato.precio);
    max = Math.max(max, m.plato.precio);
  }
  return { min, max };
}

/** Min/max restaurant rating across matches, for input hints. Null if empty. */
export function rangoRatings(matches: RestaurantMatch[]): RangoNumerico | null {
  if (matches.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const m of matches) {
    min = Math.min(min, m.restaurante.rating);
    max = Math.max(max, m.restaurante.rating);
  }
  return { min, max };
}

function dentroDeRango(valor: number, rango: Rango): boolean {
  if (rango.min !== null && valor < rango.min) return false;
  if (rango.max !== null && valor > rango.max) return false;
  return true;
}

/** Immutable, AND-across-facets / OR-within-comunas filter pipeline. */
export function aplicarFiltros(
  matches: RestaurantMatch[],
  filtros: Filtros,
): RestaurantMatch[] {
  const comunasClave = new Set(filtros.comunas.map(normalizar));

  return matches.filter((m) => {
    if (!dentroDeRango(m.plato.precio, filtros.precio)) return false;
    if (!dentroDeRango(m.restaurante.rating, filtros.rating)) return false;
    if (
      comunasClave.size > 0 &&
      !comunasClave.has(normalizar(m.restaurante.comuna))
    ) {
      return false;
    }
    if (filtros.distanciaMax !== null && m.distanciaKm > filtros.distanciaMax) {
      return false;
    }
    return true;
  });
}
