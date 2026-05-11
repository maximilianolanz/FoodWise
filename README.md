# BuscaPlato

Mockup web app para encontrar restaurantes en Santiago de Chile a partir del **plato** que quieres comer. Los resultados se ordenan por coincidencia con el plato buscado y por **cercanía** a tu ubicación.

> Estado: prototipo. La "base de datos" es un seed estático (`lib/data/restaurants.ts`) con ~50 restaurantes ficticios distribuidos en 14+ comunas de Santiago. La idea es reemplazarlo más adelante por un backend real con menús reales.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript
- Tailwind CSS v4
- [react-leaflet](https://react-leaflet.js.org/) + [Leaflet](https://leafletjs.com/) sobre tiles de [OpenStreetMap](https://www.openstreetmap.org)
- `pnpm` como package manager

## Cómo correrlo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

Otros comandos:

```bash
pnpm build   # build de producción
pnpm start   # servidor de producción
pnpm lint
```

## Cómo funciona

### Búsqueda

`lib/search.ts` recibe una consulta y la ubicación del usuario y devuelve los mejores matches.

Score por resultado:

```
puntaje = 0.7 * matchScore(plato, consulta) + 0.3 * proximityScore(distanciaKm)
```

- `matchScore`: normaliza acentos/mayúsculas (`ají` matchea con `aji`), favorece coincidencia exacta en el nombre del plato, luego prefijo, luego substring, luego tokens en la descripción.
- `proximityScore`: 1 si estás encima del restaurante, 0 si está a 10 km o más, lineal entre medio.
- `distanciaKm`: haversine en `lib/geo.ts`.

Solo se devuelve **el mejor plato** de cada restaurante que matchee, hasta 12 resultados.

### Ubicación

- Por defecto se usa el centro de Santiago (Plaza de Armas: `-33.4378, -70.6504`).
- El componente `LocationPrompt` pide `navigator.geolocation` y al obtenerla la persiste en la URL (`?lat=...&lng=...`), lo que la hace compartible y SSR-friendly.
- Si el usuario deniega o no soporta geolocalización, se mantiene el fallback con un aviso.

### Vistas: lista y mapa

El toggle vive en la URL como `?vista=lista|mapa`:

- **Lista**: renderizada en servidor (RSC). Tarjeta por resultado con plato encontrado, precio en CLP, distancia, comuna y rating.
- **Mapa**: cliente (`react-leaflet`, `ssr: false` vía `next/dynamic`). Tiles de OSM, marcadores con popup que repite la info de la tarjeta y `fitBounds` automático sobre tu ubicación + los resultados.

### Estado en la URL

Todos los parámetros relevantes viven en search params, así cualquier URL es compartible:

```
/?q=pastel+de+choclo&vista=mapa&lat=-33.42&lng=-70.61
```

## Estructura

```
app/
  layout.tsx              # lang=es-CL, metadata en español
  page.tsx                # server component, async searchParams
  globals.css
components/
  search-bar.tsx          # input controlado, escribe ?q= en la URL
  view-toggle.tsx         # pestaña Lista / Mapa, escribe ?vista=
  location-prompt.tsx     # solicita geolocalización
  restaurant-card.tsx     # tarjeta de resultado
  results-list.tsx        # grilla de tarjetas
  results-map.tsx         # react-leaflet + markers
  results-map-loader.tsx  # dynamic import con ssr:false
lib/
  types.ts                # Restaurant, MenuItem, RestaurantMatch, LatLng
  geo.ts                  # haversine + proximityScore
  search.ts               # ranking y normalización
  data/restaurants.ts     # seed: ~50 restaurantes con menús
```

## Cosas que se ven en la demo

- Búsquedas que aprovechan la normalización: `aji`, `ñoqui`, `cebiche` vs `ceviche`.
- Búsquedas que reparten por comuna: `pastel de choclo`, `sushi`, `empanada`, `pizza`, `ramen`, `lomo saltado`.
- Cambiar tu ubicación afecta el ranking: prueba sin geolocalización y luego con ella activada.

## Roadmap (cuando deje de ser mockup)

- Reemplazar `lib/data/restaurants.ts` por un backend real (Postgres + búsqueda full-text, o un índice tipo Meilisearch/Typesense para fuzzy matching).
- Página de detalle por restaurante con menú completo.
- Filtros: comuna, rating mínimo, rango de precio.
- Reseñas / fotos.
- PWA + caché offline del último resultado.

## Atribución

Mapas © contribuyentes de [OpenStreetMap](https://www.openstreetmap.org/copyright). Los datos de restaurantes en este repo son ficticios y solo sirven para demostrar la búsqueda.
