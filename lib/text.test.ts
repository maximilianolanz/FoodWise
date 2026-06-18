import { describe, expect, it } from "vitest";
import { STOPWORDS, tokens, tokensSignificativos } from "./text";

describe("tokensSignificativos", () => {
  it("drops Spanish connective stopwords", () => {
    expect(tokensSignificativos("Pastel de choclo")).toEqual([
      "pastel",
      "choclo",
    ]);
    expect(tokensSignificativos("Cazuela de ave")).toEqual(["cazuela", "ave"]);
  });

  it("keeps meaningful words and normalizes accents/casing", () => {
    expect(tokensSignificativos("Ají de gallina")).toEqual(["aji", "gallina"]);
  });

  it("returns an empty list when every word is a stopword", () => {
    expect(tokensSignificativos("de la el")).toEqual([]);
  });

  it("only removes stopwords from the full token list", () => {
    const todos = tokens("Empanada de pino");
    expect(todos).toContain("de");
    expect(tokensSignificativos("Empanada de pino")).not.toContain("de");
  });

  it("treats 'de' as a stopword", () => {
    expect(STOPWORDS.has("de")).toBe(true);
  });
});
