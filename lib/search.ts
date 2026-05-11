import { restaurantes } from "./data/restaurants";
import { haversineKm, proximityScore } from "./geo";
import type { LatLng, MenuItem, Restaurant, RestaurantMatch } from "./types";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function tokens(texto: string): string[] {
  return normalizar(texto)
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}

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

function mejorPlato(
  restaurante: Restaurant,
  consulta: string,
): { plato: MenuItem; matchScore: number } | null {
  let mejor: { plato: MenuItem; matchScore: number } | null = null;
  for (const plato of restaurante.menu) {
    const matchScore = platoMatchScore(plato, consulta);
    if (matchScore <= 0) continue;
    if (!mejor || matchScore > mejor.matchScore) {
      mejor = { plato, matchScore };
    }
  }
  return mejor;
}

export type BuscarOpciones = {
  consulta: string;
  ubicacion: LatLng;
  limite?: number;
};

export function buscar({
  consulta,
  ubicacion,
  limite = 12,
}: BuscarOpciones): RestaurantMatch[] {
  const q = consulta.trim();
  if (!q) return [];

  const resultados: RestaurantMatch[] = [];
  for (const r of restaurantes) {
    const mejor = mejorPlato(r, q);
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

  return resultados
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, limite);
}
