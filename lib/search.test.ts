import { describe, expect, it } from "vitest";
import { buscar } from "./search";
import { SANTIAGO_CENTRO } from "./types";

const opts = { consultas: ["ensalada"], ubicacion: SANTIAGO_CENTRO };

describe("buscar — diet-aware selection", () => {
  it("returns all matches when no diet is selected", () => {
    const r = buscar(opts);
    expect(r.length).toBeGreaterThan(0);
  });

  it("only surfaces dishes that satisfy the selected diet", () => {
    const r = buscar({ ...opts, dietas: ["vegano"] });
    expect(r.length).toBeGreaterThan(0);
    for (const m of r) {
      expect(m.plato.dietas ?? []).toContain("vegano");
    }
  });

  it("applies AND across multiple selected diets", () => {
    const r = buscar({ ...opts, dietas: ["vegano", "sin-gluten"] });
    for (const m of r) {
      expect(m.plato.dietas ?? []).toContain("vegano");
      expect(m.plato.dietas ?? []).toContain("sin-gluten");
    }
  });

  it("never widens results when a diet is added", () => {
    const sin = buscar(opts).length;
    const con = buscar({ ...opts, dietas: ["sin-gluten"] }).length;
    expect(con).toBeLessThanOrEqual(sin);
  });

  it("returns nothing without keywords", () => {
    expect(buscar({ consultas: [], ubicacion: SANTIAGO_CENTRO, dietas: ["vegano"] })).toEqual([]);
  });
});

describe("buscar — multi-word relevance (stopwords + AND)", () => {
  const platos = (consulta: string) =>
    buscar({ consultas: [consulta], ubicacion: SANTIAGO_CENTRO }).map(
      (m) => m.plato.plato,
    );

  it("still finds the dish the query names", () => {
    expect(platos("Pastel de choclo")).toContain("Pastel de choclo");
  });

  it("does not surface a dish that only shares an ingredient in its description", () => {
    // "Cazuela de ave" is described "Con choclo y zapallo": it shares the word
    // "choclo" but not "pastel", so it must not match "Pastel de choclo".
    expect(platos("Pastel de choclo")).not.toContain("Cazuela de ave");
  });

  it("does not match on the connective word 'de' alone", () => {
    // Pre-fix, every dish with "de" in its name surfaced (Risotto de hongos,
    // Bife de chorizo, ...). Stopword filtering must keep them out.
    const resultado = platos("Pastel de choclo");
    expect(resultado).not.toContain("Risotto de hongos");
    expect(resultado).not.toContain("Bife de chorizo");
  });

  it("requires every significant query word, not just one", () => {
    // "Pastel de jaiba" shares only "pastel"; with AND semantics it should not
    // appear for "Pastel de choclo".
    expect(platos("Pastel de choclo")).not.toContain("Pastel de jaiba");
  });
});
