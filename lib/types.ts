export type LatLng = {
  lat: number;
  lng: number;
};

export type MenuItem = {
  plato: string;
  descripcion: string;
  precio: number;
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
