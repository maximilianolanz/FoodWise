import { normalizar } from "./text";

export const MAX_KEYWORDS = 8;

/**
 * Coerce a raw search param (string | string[] | undefined) into a clean
 * keyword list: trimmed, no empties, deduped case/accent-insensitively, and
 * capped at MAX_KEYWORDS. Display text (with accents/casing) is preserved.
 */
export function parseKeywords(raw: string | string[] | undefined): string[] {
  const lista = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw];
  const vistos = new Set<string>();
  const resultado: string[] = [];

  for (const item of lista) {
    const palabra = item.trim();
    if (!palabra) continue;
    const clave = normalizar(palabra);
    if (!clave || vistos.has(clave)) continue;
    vistos.add(clave);
    resultado.push(palabra);
    if (resultado.length >= MAX_KEYWORDS) break;
  }

  return resultado;
}

/** Immutably append a keyword if non-empty, not a duplicate, and under the cap. */
export function addKeyword(keywords: string[], word: string): string[] {
  const palabra = word.trim();
  if (!palabra || keywords.length >= MAX_KEYWORDS) return keywords;
  const clave = normalizar(palabra);
  if (!clave) return keywords;
  if (keywords.some((k) => normalizar(k) === clave)) return keywords;
  return [...keywords, palabra];
}

/** Immutably remove a keyword (matched case/accent-insensitively). */
export function removeKeyword(keywords: string[], word: string): string[] {
  const clave = normalizar(word);
  return keywords.filter((k) => normalizar(k) !== clave);
}
