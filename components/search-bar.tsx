"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [valor, setValor] = useState(params.get("q") ?? "");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    const q = valor.trim();
    if (q) next.set("q", q);
    else next.delete("q");
    router.push(`/?${next.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      role="search"
    >
      <input
        type="search"
        inputMode="search"
        placeholder="Busca un plato (ej: pastel de choclo, sushi, ceviche...)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        aria-label="Buscar plato"
        className="flex-1 bg-transparent px-3 py-2 text-base outline-none placeholder:text-zinc-400 dark:text-zinc-100"
      />
      <button
        type="submit"
        className="rounded-xl bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Buscar
      </button>
    </form>
  );
}
