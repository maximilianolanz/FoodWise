"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Vista = "lista" | "mapa";

export function ViewToggle({ vista }: { vista: Vista }) {
  const router = useRouter();
  const params = useSearchParams();

  function cambiar(siguiente: Vista) {
    if (siguiente === vista) return;
    const next = new URLSearchParams(params.toString());
    next.set("vista", siguiente);
    router.push(`/?${next.toString()}`);
  }

  return (
    <div
      role="tablist"
      aria-label="Cambiar vista"
      className="inline-flex rounded-full border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <Boton activo={vista === "lista"} onClick={() => cambiar("lista")} label="Lista" />
      <Boton activo={vista === "mapa"} onClick={() => cambiar("mapa")} label="Mapa" />
    </div>
  );
}

function Boton({
  activo,
  onClick,
  label,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={activo}
      onClick={onClick}
      className={
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
        (activo
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100")
      }
    >
      {label}
    </button>
  );
}
