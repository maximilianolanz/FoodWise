# FoodWise
#### [IIC3113-2] Grupo 1: Vicente Sajuria - Miguel Mujica - Maximiliano Lanz - Matías Cruz


Mockup web app para encontrar restaurantes en Santiago de Chile a partir del **plato** o **ingredientes** que quieres comer. Los resultados se ordenan por coincidencia con lo buscado y por **cercanía** a tu ubicación, y se pueden afinar con filtros (precio, comuna, evaluación, distancia y restricciones alimentarias).

> Estado Actual: prototipo

## Stack
- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript
- Tailwind CSS v4
- [react-leaflet](https://react-leaflet.js.org/) + [Leaflet](https://leafletjs.com/) sobre tiles de [OpenStreetMap](https://www.openstreetmap.org)
- [Vitest](https://vitest.dev/) para tests unitarios (+ `tsx` para scripts de datos)
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
pnpm test    # tests unitarios (vitest)
```

## Cómo funciona

### Búsqueda multi-keyword
La búsqueda acumula **palabras clave** como badges removibles bajo el input: cada palabra (plato o ingrediente) se agrega con Enter o "Buscar" y se elimina desde su badge o con "Limpiar". Las keywords viven en la URL como parámetros `q` repetidos.

`lib/search.ts` recibe la lista de consultas y la ubicación del usuario y devuelve los restaurantes que matchean, rankeados.

Score por resultado:

```
puntaje = 0.7 * matchScore + 0.3 * proximityScore(distanciaKm)
```

- `matchScore` (multi-keyword, semántica **AND**): un plato solo matchea si **todas** las keywords aparecen en su nombre o descripción; el score final es el promedio de los scores por keyword.
- `platoMatchScore` por keyword: normaliza acentos/mayúsculas (`ají` matchea con `aji`), favorece coincidencia exacta en el nombre del plato, luego prefijo, luego substring, luego tokens en la descripción (ingredientes).
- `proximityScore`: 1 si estás encima del restaurante, 0 si está a 10 km o más, lineal entre medio.
- `distanciaKm`: haversine en `lib/geo.ts`.
- `lib/keywords.ts`: operaciones inmutables sobre la lista de keywords (agregar/quitar/parsear), deduplicadas sin distinguir acentos/mayúsculas y con un tope de 8.

Cada restaurante aporta **su mejor plato compatible** (respetando las restricciones alimentarias). `buscar` devuelve el set completo rankeado; el filtrado, el orden y el límite de visualización (24) se aplican después en `app/page.tsx`.

### Filtros y orden
La barra lateral (`components/filters-sidebar.tsx`) afina los resultados. Todo vive en la URL, así que cualquier combinación es compartible:

- **Precio** y **Evaluación**: rangos min/max definidos por el usuario, con placeholders derivados de los datos; cualquiera de los límites es opcional.
- **Comuna**: multi-select cuyas opciones salen de los matches de la consulta actual.
- **Distancia**: radios preset (≤ 1 / 3 / 5 km) relativos a tu ubicación.
- **Restricciones alimentarias**: ver más abajo.

Semántica: **AND entre facetas**, **OR dentro de comunas**. `lib/filters.ts` parsea los parámetros y aplica el pipeline de filtrado de forma inmutable.

El control de orden (`components/sort-select.tsx`, `lib/sort.ts`) ofrece: relevancia (por defecto), precio asc/desc, mejor evaluados y más cercanos, con desempate por relevancia.

### Restricciones alimentarias
Filtro multi-select **vegetariano / vegano / sin gluten** (`lib/diet.ts`). Los platos se etiquetan con `dietas` y la selección refina a los platos que cumplen **todas** las restricciones marcadas (AND); vegano se almacena como superconjunto de vegetariano.

Las etiquetas se infieren de forma conservadora y por **evidencia positiva** (`inferirDietas`): la carne/pescado nunca es vegetariano, las keywords con gluten nunca son sin-gluten, y vegano requiere una señal explícita o un plato base vegano-seguro. Los platos dudosos quedan sin etiqueta (y por lo tanto ocultos bajo ese filtro), que es la dirección segura para restricciones alimentarias. `scripts/generate-dietas.ts` persiste las etiquetas inferidas en `lib/data/restaurants.ts`.

La barra lateral muestra conteos faceteados por dieta que respetan los otros filtros activos, y el estado vacío distingue "ningún plato matchea" de "los filtros lo dejaron en cero".

### Vista de contacto del restaurante
Desde cada tarjeta de la lista (modal) y desde el popup del marcador en el mapa se accede a una vista de contacto simplificada (`lib/restaurant-contact.ts`, `components/restaurant-detail-modal.tsx`):

- **Dirección**, **horario más concurrido** (estimado) y enlace al **sitio web** oficial cuando existe.
- `infoContacto()` centraliza la lógica de placeholders ("No disponible") y del texto del enlace, compartida por el modal y el popup.
- El modal es accesible: cierre con Esc/backdrop, manejo de foco y bloqueo de scroll. Los enlaces externos se abren con `rel="noopener noreferrer"`.

### Datos
La "base de datos" es un seed estático (`lib/data/restaurants.ts`) con **~70 restaurantes** ficticios y **~382 platos** distribuidos en **23 comunas** de Santiago, con datos de contacto en `lib/data/restaurant-contacto.ts`. Los datos están moldeados para ejercitar cada filtro (rango amplio de precios, ratings bajo 4.0, una ubicación lejana para el filtro de distancia, descripciones ricas en ingredientes). La idea es reemplazarlo más adelante por un backend real con una BBDD basada en menús reales.

### Ubicación
- Por defecto se usa el centro de Santiago (Plaza de Armas: `-33.4378, -70.6504`).
- El componente `LocationPrompt` pide `navigator.geolocation` y al obtenerla la persiste en la URL (`?lat=...&lng=...`), lo que la hace compartible y SSR-friendly.
- Si el usuario deniega o no soporta geolocalización, se mantiene el fallback con un aviso.

### Vistas: lista y mapa
El toggle vive en la URL como `?vista=lista|mapa`:

- **Lista**: renderizada en servidor (RSC). Tarjeta **dish-first**: el plato y sus ingredientes lideran, con el restaurante (comuna, rating, distancia) demovido a metadata secundaria; badges de dieta sobre el plato matcheado. La tarjeta abre el modal de contacto.
- **Mapa**: cliente (`react-leaflet`, `ssr: false` vía `next/dynamic`). Tiles de OSM, marcadores con popup que repite la info de la tarjeta (mismo orden plato → ingredientes → precio → restaurante) más dirección, horario y enlace al sitio web, y `fitBounds` automático sobre tu ubicación + los resultados.

### Estado en la URL
Todos los parámetros relevantes viven en search params, así cualquier URL es compartible:

```
/?q=ceviche&q=picante&vista=mapa&lat=-33.42&lng=-70.61&comuna=Providencia&precioMax=12000&dieta=sin-gluten&orden=precio-asc
```

## Estructura
```
app/
  layout.tsx              # lang=es-CL, metadata en español
  page.tsx                # server component; pipeline buscar -> filtros -> orden -> slice
  globals.css
components/
  search-bar.tsx          # input + badges de keywords, escribe ?q= (repetido) en la URL
  filters-sidebar.tsx     # filtros de precio, comuna, evaluación, distancia y dieta
  sort-select.tsx         # control de orden, escribe ?orden=
  view-toggle.tsx         # pestaña Lista / Mapa, escribe ?vista=
  location-prompt.tsx     # solicita geolocalización
  restaurant-card.tsx     # tarjeta dish-first; abre el modal de contacto
  restaurant-detail-modal.tsx  # modal accesible con datos de contacto
  results-list.tsx        # grilla de tarjetas
  results-map.tsx         # react-leaflet + markers con popup de contacto
  results-map-loader.tsx  # dynamic import con ssr:false
lib/
  types.ts                # Restaurant, MenuItem, RestaurantMatch, LatLng
  text.ts                 # normalizar + tokens (acentos/mayúsculas)
  geo.ts                  # haversine + proximityScore
  keywords.ts             # operaciones inmutables sobre la lista de keywords (cap 8)
  search.ts               # ranking multi-keyword (AND) consciente de dietas
  filters.ts              # parseFiltros + pipeline de filtrado (rango/comuna/distancia)
  sort.ts                 # OrdenKey + ordenar inmutable
  diet.ts                 # tags de dieta + inferirDietas (evidencia positiva)
  restaurant-contact.ts   # infoContacto: placeholders + enlace externo
  search.test.ts          # tests de buscar (multi-keyword + dietas)
  diet.test.ts            # tests de inferencia y cumpleDietas
  data/
    restaurants.ts        # seed: ~70 restaurantes / ~382 platos con dietas
    restaurant-contacto.ts # horarios concurridos + sitios web
scripts/
  generate-dietas.ts      # persiste las dietas inferidas en restaurants.ts
```

## Cambios en esta rama (`feat/multi-keyword-search`)
De más reciente a más antiguo:

- **`354eefc` feat: restaurant contact view (address, busy hours, website link)** — Vista de contacto simplificada accesible desde las tarjetas (modal) y los popups del mapa: dirección, horario más concurrido y enlace al sitio web. Agrega `horarioConcurrido`/`sitioWeb` opcionales a `Restaurant`, datos para los 70 restaurantes (sitios reales para 33), el helper `infoContacto()` y un modal accesible (Esc/backdrop, foco, scroll lock). _(CR FW-GPTI-2026-1)_
- **`116c605` feat: dietary-restrictions filter (CR FW-GPTI-2026-1)** — Filtro multi-select de dieta (vegetariano/vegano/sin gluten). Suma `MenuItem.dietas`, la inferencia conservadora de `lib/diet.ts`, `scripts/generate-dietas.ts` (115/382 platos etiquetados), `buscar` consciente de dietas, conteos faceteados en la barra lateral, badges en las tarjetas y tests con vitest.
- **`95f2ca6` feat: expand restaurant database with 20 new restaurants and dishes** — Agrega `r-051..r-070` (50 → 70 restaurantes, ~382 platos), 6 comunas nuevas y datos moldeados para ejercitar todos los filtros (rango de precios CLP 1.900–34.900, ratings bajo 4.0, una ubicación lejana, descripciones ricas en ingredientes).
- **`487e892` feat: filter sidebar with custom ranges and result sorting** — Barra lateral de filtros (precio/evaluación como rangos min/max, comuna multi-select, distancia preset) y control de orden (relevancia, precio asc/desc, mejor evaluados, más cercanos). `lib/filters.ts` y `lib/sort.ts`; `buscar` devuelve el set completo y el filtrado/orden/slice se mueven a `page.tsx`.
- **`456e01f` feat: multi-keyword badge search by dish name and ingredients** — La barra de búsqueda acumula keywords como badges removibles; los resultados se refinan con semántica AND (cada keyword debe matchear nombre o descripción). Agrega `lib/text.ts`, `lib/keywords.ts` (cap 8) y `platoMatchScoreMulti`; keywords como parámetros `q` repetidos en la URL.
- **`ff8c920` feat: dish-first result cards** — Rediseño de tarjetas y popups para que el plato y sus ingredientes lideren, con el restaurante demovido a metadata secundaria. Solo UI; sin cambios en el modelo de datos, la búsqueda ni el ranking.

## Roadmap (cuando deje de ser mockup)
- Reemplazar `lib/data/restaurants.ts` por un backend real (Postgres + búsqueda full-text, o un índice tipo Meilisearch/Typesense para fuzzy matching).
- Página de detalle por restaurante con menú completo (la vista de contacto actual es un primer paso).
- Reseñas / fotos.
- PWA + caché offline del último resultado.

## Atribución
Mapas © contribuyentes de [OpenStreetMap](https://www.openstreetmap.org/copyright).  
Los datos de restaurantes en este repo son ficticios y solo sirven para demostrar la búsqueda.
