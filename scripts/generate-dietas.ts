/**
 * One-off generator: infers dietary tags for every dish in restaurants.ts and
 * persists them inline via a line-by-line transform (preserving formatting).
 * Run: npx tsx scripts/generate-dietas.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inferirDietas, type Diet } from "../lib/diet";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../lib/data/restaurants.ts");

// Matches a dish line with or without an existing `dietas: [...]`, so re-runs
// strip and recompute tags from scratch (idempotent).
const LINE =
  /^(\s*)\{ plato: "(.*?)", descripcion: "(.*?)", precio: (\d+)(?:, dietas: \[[^\]]*\])? \}(,?)\s*$/;

const original = readFileSync(dataPath, "utf8");
const lines = original.split("\n");

const conteo: Record<Diet, number> = {
  vegetariano: 0,
  vegano: 0,
  "sin-gluten": 0,
};
let dishes = 0;
let tagged = 0;

const out = lines.map((line) => {
  const m = LINE.exec(line);
  if (!m) return line;
  dishes += 1;
  const [, indent, plato, descripcion, precio, coma] = m;
  const dietas = inferirDietas(plato, descripcion);
  if (dietas.length === 0) return line;
  tagged += 1;
  for (const d of dietas) conteo[d] += 1;
  const arr = dietas.map((d) => `"${d}"`).join(", ");
  return `${indent}{ plato: "${plato}", descripcion: "${descripcion}", precio: ${precio}, dietas: [${arr}] }${coma}`;
});

writeFileSync(dataPath, out.join("\n"), "utf8");

console.log(`Dishes processed:   ${dishes}`);
console.log(`Dishes tagged:      ${tagged} (${Math.round((tagged / dishes) * 100)}%)`);
console.log(`  vegetariano:      ${conteo.vegetariano}`);
console.log(`  vegano:           ${conteo.vegano}`);
console.log(`  sin-gluten:       ${conteo["sin-gluten"]}`);
