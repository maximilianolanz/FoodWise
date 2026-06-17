"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ORDENES, ORDEN_DEFECTO, parseOrden } from "@/lib/sort";

export function SortSelect() {
  const router = useRouter();
  const params = useSearchParams();
  const orden = parseOrden(params.get("orden") ?? undefined);

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === ORDEN_DEFECTO) next.delete("orden");
    else next.set("orden", value);
    router.push(`/?${next.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <span className="whitespace-nowrap">Ordenar por</span>
      <select
        value={orden}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {ORDENES.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
