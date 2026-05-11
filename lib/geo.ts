import type { LatLng } from "./types";

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

const PROXIMITY_WINDOW_KM = 10;

export function proximityScore(distanciaKm: number): number {
  if (distanciaKm <= 0) return 1;
  if (distanciaKm >= PROXIMITY_WINDOW_KM) return 0;
  return 1 - distanciaKm / PROXIMITY_WINDOW_KM;
}
