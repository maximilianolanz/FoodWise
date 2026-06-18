export type LatLng = {
  lat: number;
  lng: number;
};

import type { Diet } from "./diet";

export type MenuItem = {
  plato: string;
  descripcion: string;
  precio: number;
  dietas?: ReadonlyArray<Diet>;
};

export type Restaurant = {
  id: string;
  nombre: string;
  comuna: string;
  direccion: string;
  rating: number;
  lat: number;
  lng: number;
  menu: ReadonlyArray<MenuItem>;
  /** Texto libre con las horas de mayor concurrencia (estimado). */
  horarioConcurrido?: string;
  /** URL del sitio web oficial del restaurante. */
  sitioWeb?: string;
};

export type RestaurantMatch = {
  restaurante: Restaurant;
  plato: MenuItem;
  distanciaKm: number;
  puntaje: number;
};

export const SANTIAGO_CENTRO: LatLng = {
  lat: -33.4378,
  lng: -70.6504,
};
