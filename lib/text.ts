export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function tokens(texto: string): string[] {
  return normalizar(texto)
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}

/**
 * Spanish connective words that carry no search intent. They appear in a large
 * fraction of dish names ("Cazuela DE ave", "Empanada DE pino"), so matching on
 * them in the token fallback surfaces unrelated dishes. Excluded from fuzzy
 * token matching — substring/phrase matching is unaffected.
 */
export const STOPWORDS: ReadonlySet<string> = new Set([
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "un",
  "una",
  "unos",
  "unas",
  "con",
  "sin",
  "y",
  "o",
  "u",
  "a",
  "al",
  "en",
  "para",
  "por",
  "su",
  "lo",
]);

/** Tokens with Spanish stopwords removed — the meaningful words of a phrase. */
export function tokensSignificativos(texto: string): string[] {
  return tokens(texto).filter((t) => !STOPWORDS.has(t));
}
