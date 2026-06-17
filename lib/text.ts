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
