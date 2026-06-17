"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { addKeyword, parseKeywords, removeKeyword } from "@/lib/keywords";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [valor, setValor] = useState("");

  const keywords = parseKeywords(params.getAll("q"));

  function navegar(nextKeywords: string[]) {
    const next = new URLSearchParams(params.toString());
    next.delete("q");
    for (const kw of nextKeywords) next.append("q", kw);
    router.push(next.toString() ? `/?${next.toString()}` : "/");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextKeywords = addKeyword(keywords, valor);
    setValor("");
    if (nextKeywords !== keywords) navegar(nextKeywords);
  }

  function onRemove(palabra: string) {
    navegar(removeKeyword(keywords, palabra));
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <form
        onSubmit={onSubmit}
        className="flex w-full gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        role="search"
      >
        <input
          type="search"
          inputMode="search"
          placeholder="Agrega un plato o ingrediente (ej: ceviche, picante...)"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          aria-label="Agregar palabra clave"
          className="flex-1 bg-transparent px-3 py-2 text-base outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Buscar
        </button>
      </form>

      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 py-1 pl-3 pr-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {kw}
              <button
                type="button"
                onClick={() => onRemove(kw)}
                aria-label={`Quitar ${kw}`}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-50"
              >
                <span aria-hidden>×</span>
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => navegar([])}
            className="rounded-full px-3 py-1 text-sm text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
