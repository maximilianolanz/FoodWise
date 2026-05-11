"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Estado = "idle" | "solicitando" | "ok" | "denegado" | "no-soportado";

export function LocationPrompt({
  lat,
  lng,
  usandoFallback,
}: {
  lat: number;
  lng: number;
  usandoFallback: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [estado, setEstado] = useState<Estado>(usandoFallback ? "idle" : "ok");

  useEffect(() => {
    setEstado(usandoFallback ? "idle" : "ok");
  }, [usandoFallback]);

  function solicitar() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setEstado("no-soportado");
      return;
    }
    setEstado("solicitando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = new URLSearchParams(params.toString());
        next.set("lat", pos.coords.latitude.toFixed(5));
        next.set("lng", pos.coords.longitude.toFixed(5));
        router.push(`/?${next.toString()}`);
        setEstado("ok");
      },
      () => setEstado("denegado"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }

  function limpiar() {
    const next = new URLSearchParams(params.toString());
    next.delete("lat");
    next.delete("lng");
    router.push(`/?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">
        Ubicación:{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {usandoFallback ? "Centro de Santiago" : `${lat.toFixed(3)}, ${lng.toFixed(3)}`}
        </span>
      </span>
      {usandoFallback ? (
        <button
          onClick={solicitar}
          disabled={estado === "solicitando"}
          className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {estado === "solicitando" ? "Solicitando..." : "Usar mi ubicación"}
        </button>
      ) : (
        <button
          onClick={limpiar}
          className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Volver al centro de Santiago
        </button>
      )}
      {estado === "denegado" && (
        <span className="text-amber-600 dark:text-amber-400">
          Permiso denegado. Mostrando resultados desde el centro de Santiago.
        </span>
      )}
      {estado === "no-soportado" && (
        <span className="text-amber-600 dark:text-amber-400">
          Tu navegador no soporta geolocalización.
        </span>
      )}
    </div>
  );
}
