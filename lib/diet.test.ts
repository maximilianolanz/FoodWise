import { describe, expect, it } from "vitest";
import { cumpleDietas, type Diet, inferirDietas } from "./diet";

describe("inferirDietas — safety (no dangerous false positives)", () => {
  it("never tags a meat/fish dish as vegetariano", () => {
    expect(inferirDietas("Lomo a lo pobre", "Con huevo, cebolla y papas fritas")).not.toContain("vegetariano");
    expect(inferirDietas("Ceviche de reineta", "Pescado del día, cilantro y limón")).not.toContain("vegetariano");
    expect(inferirDietas("Pastel de choclo", "Pino jugoso con presas de pollo")).not.toContain("vegetariano");
  });

  it("treats a completo (hot dog) as non-vegetarian", () => {
    expect(inferirDietas("Completo italiano", "Con palta machacada")).toEqual([]);
    expect(inferirDietas("Completo italiano", "Vienesa, palta, tomate, mayo")).toEqual([]);
  });

  it("never tags a gluten dish as sin-gluten", () => {
    expect(inferirDietas("Empanada de pino", "Horneada, masa casera")).not.toContain("sin-gluten");
    expect(inferirDietas("Pizza margarita", "Tomate, mozzarella, albahaca")).not.toContain("sin-gluten");
    expect(inferirDietas("Bowl mediterráneo", "Quínoa, falafel, hummus, tabbouleh")).not.toContain("sin-gluten");
  });
});

describe("inferirDietas — positive cases", () => {
  it("tags naturally gluten-free dishes", () => {
    expect(inferirDietas("Ceviche de reineta", "Pescado del día, cilantro y limón")).toEqual(["sin-gluten"]);
  });

  it("tags a clearly vegan dish as both vegetariano and vegano", () => {
    const r = inferirDietas("Falafel", "Con hummus y ensalada");
    expect(r).toContain("vegetariano");
    expect(r).toContain("vegano");
  });

  it("tags a cheese-bearing dish as vegetariano but NOT vegano", () => {
    const r = inferirDietas("Pizza margarita", "Tomate, mozzarella, albahaca");
    expect(r).toContain("vegetariano");
    expect(r).not.toContain("vegano");
  });

  it("leaves ambiguous dishes untagged (conservative)", () => {
    expect(inferirDietas("Pastel de choclo", "Receta clásica al horno de barro")).toEqual([]);
  });

  it("keeps vegano a subset of vegetariano", () => {
    const dishes: Array<[string, string]> = [
      ["Falafel", "Con hummus"],
      ["Hamburguesa de quínoa", "Lenteja y betarraga"],
      ["Bowl buddha", "Quínoa, palta, garbanzos"],
    ];
    for (const [p, d] of dishes) {
      const r = inferirDietas(p, d);
      if (r.includes("vegano")) expect(r).toContain("vegetariano");
    }
  });
});

describe("cumpleDietas — AND semantics", () => {
  const veganoGf: ReadonlyArray<Diet> = ["vegetariano", "vegano", "sin-gluten"];

  it("matches everything when nothing is selected", () => {
    expect(cumpleDietas(undefined, [])).toBe(true);
    expect(cumpleDietas(["vegetariano"], [])).toBe(true);
  });

  it("requires every selected diet to be present (AND)", () => {
    expect(cumpleDietas(veganoGf, ["vegano", "sin-gluten"])).toBe(true);
    expect(cumpleDietas(["sin-gluten"], ["vegano", "sin-gluten"])).toBe(false);
  });

  it("respects the vegano⊆vegetariano superset", () => {
    expect(cumpleDietas(["vegetariano", "vegano"], ["vegetariano"])).toBe(true);
    expect(cumpleDietas(["vegetariano"], ["vegano"])).toBe(false);
  });

  it("excludes untagged dishes when a diet is selected", () => {
    expect(cumpleDietas(undefined, ["vegano"])).toBe(false);
    expect(cumpleDietas([], ["vegano"])).toBe(false);
  });
});
