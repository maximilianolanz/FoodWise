import { restaurantes } from "./data/restaurants";
import { haversineKm, proximityScore } from "./geo";
import { normalizar, tokens } from "./text";
import type { LatLng, MenuItem, Restaurant, RestaurantMatch } from "./types";

function platoMatchScore(plato: MenuItem, consulta: string): number {
  if (!consulta) return 0;
  const nombre = normalizar(plato.plato);
  const descripcion = normalizar(plato.descripcion);
  const q = normalizar(consulta);

  if (nombre === q) return 1;
  if (nombre.startsWith(q)) return 0.95;
  if (nombre.includes(q)) return 0.85;
  if (descripcion.includes(q)) return 0.55;

  const qTokens = tokens(consulta);
  const nTokens = new Set(tokens(plato.plato));
  const dTokens = new Set(tokens(plato.descripcion));
  if (qTokens.length === 0) return 0;

  let coincidencias = 0;
  for (const t of qTokens) {
    if (nTokens.has(t)) coincidencias += 1;
    else if (dTokens.has(t)) coincidencias += 0.4;
  }
  return Math.min(coincidencias / qTokens.length, 0.8);
}

/**
 * Score a dish against every keyword (AND semantics): a dish only matches if
 * each keyword is found in its name or description. Returns 0 if any keyword
 * is missing, otherwise the average of the per-keyword scores.
 */
function platoMatchScoreMulti(plato: MenuItem, consultas: string[]): number {
  if (consultas.length === 0) return 0;
  let suma = 0;
  for (const consulta of consultas) {
    const score = platoMatchScore(plato, consulta);
    if (score <= 0) return 0;
    suma += score;
  }
  return suma / consultas.length;
}

function mejorPlato(
  restaurante: Restaurant,
  consultas: string[],
): { plato: MenuItem; matchScore: number } | null {
  let mejor: { plato: MenuItem; matchScore: number } | null = null;
  for (const plato of restaurante.menu) {
    const matchScore = platoMatchScoreMulti(plato, consultas);
    if (matchScore <= 0) continue;
    if (!mejor || matchScore > mejor.matchScore) {
      mejor = { plato, matchScore };
    }
  }
  return mejor;
}

export type BuscarOpciones = {
  consultas: string[];
  ubicacion: LatLng;
};

/**
 * Returns every matching restaurant ranked by relevance (puntaje). Filtering,
 * sorting, and display limits are applied downstream so they operate on the
 * complete match set.
 */
export function buscar({
  consultas,
  ubicacion,
}: BuscarOpciones): RestaurantMatch[] {
  const keywords = consultas.map((c) => c.trim()).filter(Boolean);
  if (keywords.length === 0) return [];

  const resultados: RestaurantMatch[] = [];
  for (const r of restaurantes) {
    const mejor = mejorPlato(r, keywords);
    if (!mejor) continue;
    const distanciaKm = haversineKm(ubicacion, { lat: r.lat, lng: r.lng });
    const puntaje =
      0.7 * mejor.matchScore + 0.3 * proximityScore(distanciaKm);
    resultados.push({
      restaurante: r,
      plato: mejor.plato,
      distanciaKm,
      puntaje,
    });
  }

  return resultados.sort((a, b) => b.puntaje - a.puntaje);
}
