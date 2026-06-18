import { normalizar } from "./text";

export type Diet = "vegetariano" | "vegano" | "sin-gluten";

export type DietInfo = {
  key: Diet;
  label: string;
  badge: string;
};

export const DIETAS: ReadonlyArray<DietInfo> = [
  { key: "vegetariano", label: "Vegetariano", badge: "🌿 Vegetariano" },
  { key: "vegano", label: "Vegano", badge: "🌱 Vegano" },
  { key: "sin-gluten", label: "Sin gluten", badge: "🚫🌾 Sin gluten" },
];

export const DIETAS_KEYS: ReadonlyArray<Diet> = DIETAS.map((d) => d.key);

/**
 * A dish satisfies a selection only if it carries every selected diet tag
 * (AND semantics). An empty selection matches everything.
 */
export function cumpleDietas(
  dietasPlato: ReadonlyArray<Diet> | undefined,
  seleccionadas: ReadonlyArray<Diet>,
): boolean {
  if (seleccionadas.length === 0) return true;
  if (!dietasPlato || dietasPlato.length === 0) return false;
  const set = new Set(dietasPlato);
  return seleccionadas.every((d) => set.has(d));
}

// --- Inference dictionaries (normalized, accent-insensitive) ---

// Disqualifies vegetariano AND vegano.
const CARNE_PESCADO = [
  "carne", "vacuno", "res", "lomo", "posta", "asado", "asada", "bife",
  "churrasco", "mechada", "pino", "pollo", "ave", "pavo", "cerdo", "chancho",
  "costillar", "costilla", "longaniza", "chorizo", "tocino", "jamon", "salame",
  "prosciutto", "panceta", "cordero", "conejo", "pato", "pavita",
  "completo", "completos", "vienesa", "vienesas", "hotdog", "hot dog",
  "pescado", "reineta", "salmon", "atun", "merluza", "congrio", "corvina",
  "marisco", "mariscos", "camaron", "camarones", "jaiba", "machas", "ostion",
  "ostiones", "choro", "choros", "almeja", "pulpo", "calamar", "ceviche",
  "anchoa", "locos", "erizo", "centolla", "albacora",
];

// Disqualifies vegano only (animal-derived, not flesh).
const PRODUCTO_ANIMAL = [
  "queso", "quesos", "leche", "crema", "mantequilla", "mayo", "mayonesa",
  "huevo", "huevos", "miel", "yogur", "parmesano", "parmesana", "manjar",
  "helado", "nata", "mozzarella", "burrata", "caprese", "ricotta", "gorgonzola",
  "margarita",
];

// Vegan-safe mains: positive evidence a vegetarian dish is also vegano.
// Deliberately narrow (legumes / quinoa / tofu / avocado / hummus / falafel) so
// that dairy-prone vegetarian dishes (pizza, lasaña, pesto) do NOT become vegano.
const SENAL_VEGANA_INGREDIENTE = [
  "hummus", "falafel", "tofu", "lenteja", "lentejas", "poroto", "porotos",
  "garbanzo", "garbanzos", "quinoa", "palta",
];

// Positive signal that a dish is plant-forward (needed to assert vegetariano).
const SENAL_VEGETARIANA = [
  "ensalada", "verdura", "verduras", "vegetal", "vegetales", "palta",
  "champinon", "champinones", "tofu", "lenteja", "lentejas", "poroto",
  "porotos", "garbanzo", "garbanzos", "hummus", "falafel", "quinoa",
  "berenjena", "zapallo italiano", "espinaca", "espinacas", "rucula",
  "caprese", "margarita", "pomodoro", "pesto", "ratatouille", "vegetariano",
  "vegetariana", "vegano", "vegana", "veggie",
];

// Explicit plant-based declaration (asserts vegano directly).
const SENAL_VEGANA = ["vegano", "vegana", "plant based", "plant-based"];

// Disqualifies sin-gluten.
const CON_GLUTEN = [
  "pan", "masa", "empanada", "empanadas", "sandwich", "completo", "completos",
  "pizza", "pasta", "fideos", "tallarines", "ravioles", "raviol", "noqui",
  "noquis", "lasagna", "lasana", "ramen", "udon", "gyoza", "sopaipilla",
  "sopaipillas", "marraqueta", "hallulla", "tostada", "tostadas", "croissant",
  "kuchen", "torta", "pie", "brownie", "galleta", "galletas", "cerveza",
  "milanesa", "apanado", "apanada", "rebozado", "rebozada", "waffle",
  "panqueque", "panqueques", "crepe", "choripan", "chacarero", "barros luco",
  "harina", "cuchuflies", "strudel", "donut", "dona", "tabbouleh", "tabule",
  "bulgur", "cuscus", "couscous", "semola", "cruton", "crutones",
];

// Positive signal a dish is naturally gluten-free (needed to assert sin-gluten).
const SENAL_SIN_GLUTEN = [
  "ceviche", "sashimi", "ensalada", "parrilla", "a la plancha", "plancha",
  "asado", "asada", "grillado", "grillada", "a la parrilla", "arroz",
  "risotto", "causa", "quinoa", "porotos", "lentejas", "tortilla de papas",
  "mariscos", "machas", "ostiones",
];

function contiene(texto: string, palabras: ReadonlyArray<string>): boolean {
  return palabras.some((p) => texto.includes(p));
}

/**
 * Conservatively infer dietary tags from a dish name + description. A tag is
 * only assigned on positive evidence with no disqualifier — uncertain dishes
 * stay untagged (and are therefore hidden under that filter), which is the safe
 * direction for dietary restrictions. Vegano dishes also receive vegetariano.
 */
export function inferirDietas(plato: string, descripcion: string): Diet[] {
  const texto = normalizar(`${plato} ${descripcion}`);

  const tieneCarnePescado = contiene(texto, CARNE_PESCADO);
  const tieneProductoAnimal = contiene(texto, PRODUCTO_ANIMAL);
  const senalVegetariana = contiene(texto, SENAL_VEGETARIANA);
  const senalVeganaExplicita = contiene(texto, SENAL_VEGANA);
  const senalVeganaIngrediente = contiene(texto, SENAL_VEGANA_INGREDIENTE);
  const tieneGluten = contiene(texto, CON_GLUTEN);
  const senalSinGluten = contiene(texto, SENAL_SIN_GLUTEN);

  const dietas: Diet[] = [];

  const esVegetariano = !tieneCarnePescado && senalVegetariana;
  if (esVegetariano) dietas.push("vegetariano");

  // Conservative: vegano requires an explicit declaration or a vegan-safe
  // main, not merely the absence of a dairy/egg keyword.
  const esVegano =
    esVegetariano &&
    !tieneProductoAnimal &&
    (senalVeganaExplicita || senalVeganaIngrediente);
  if (esVegano) dietas.push("vegano");

  const esSinGluten = !tieneGluten && senalSinGluten;
  if (esSinGluten) dietas.push("sin-gluten");

  return dietas;
}
