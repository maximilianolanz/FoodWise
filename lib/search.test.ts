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
