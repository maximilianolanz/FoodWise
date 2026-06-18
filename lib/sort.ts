import type { RestaurantMatch } from "./types";

export type OrdenKey =
  | "relevancia"
  | "precio-asc"
  | "precio-desc"
  | "rating"
  | "distancia";

export type OrdenOption = { key: OrdenKey; label: string };

export const ORDENES: ReadonlyArray<OrdenOption> = [
  { key: "relevancia", label: "Relevancia" },
  { key: "precio-asc", label: "Precio: menor a mayor" },
  { key: "precio-desc", label: "Precio: mayor a menor" },
  { key: "rating", label: "Mejor evaluados" },
  { key: "distancia", label: "Más cercanos" },
];

export const ORDEN_DEFECTO: OrdenKey = "relevancia";

export function parseOrden(raw: string | string[] | undefined): OrdenKey {
  const key = Array.isArray(raw) ? raw[0] : raw;
  return ORDENES.some((o) => o.key === key) ? (key as OrdenKey) : ORDEN_DEFECTO;
}

const comparadores: Record<
  OrdenKey,
  (a: RestaurantMatch, b: RestaurantMatch) => number
> = {
  relevancia: (a, b) => b.puntaje - a.puntaje,
  "precio-asc": (a, b) => a.plato.precio - b.plato.precio,
  "precio-desc": (a, b) => b.plato.precio - a.plato.precio,
  rating: (a, b) => b.restaurante.rating - a.restaurante.rating,
  distancia: (a, b) => a.distanciaKm - b.distanciaKm,
};

/** Immutable sort; ties fall back to relevance for a stable, sensible order. */
export function ordenar(
  matches: RestaurantMatch[],
  orden: OrdenKey,
): RestaurantMatch[] {
  const comparar = comparadores[orden];
  return [...matches].sort((a, b) => {
    const primario = comparar(a, b);
    return primario !== 0 ? primario : b.puntaje - a.puntaje;
  });
}
