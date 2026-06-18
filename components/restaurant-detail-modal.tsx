"use client";

import { useEffect, useRef } from "react";
import {
  ENLACE_EXTERNO,
  infoContacto,
  SIN_DATO,
} from "@/lib/restaurant-contact";
import type { Restaurant } from "@/lib/types";

function Fila({
  icono,
  etiqueta,
  children,
}: {
  icono: string;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-t border-zinc-100 py-3 first:border-t-0 dark:border-zinc-800">
      <span aria-hidden className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500">
        {icono}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {etiqueta}
        </p>
        <div className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export function RestaurantDetailModal({
  restaurante,
  onCerrar,
}: {
  restaurante: Restaurant | null;
  onCerrar: () => void;
}) {
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!restaurante) return;

    const previo = document.activeElement as HTMLElement | null;
    cerrarRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", onKey);

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
      previo?.focus();
    };
  }, [restaurante, onCerrar]);

  if (!restaurante) return null;

  const contacto = infoContacto(restaurante);
  const tituloId = `detalle-${restaurante.id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id={tituloId}
              className="text-lg font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              {restaurante.nombre}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">
              {restaurante.comuna}
            </p>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <span aria-hidden className="text-lg leading-none">
              ✕
            </span>
          </button>
        </div>

        <div className="mt-4">
          <Fila icono="📍" etiqueta="Dirección">
            {contacto.direccion}
          </Fila>
          <Fila icono="🕐" etiqueta="Horario más concurrido">
            {contacto.horario}
          </Fila>
          <Fila icono="🔗" etiqueta="Sitio web">
            {contacto.sitioWebUrl ? (
              <a
                href={contacto.sitioWebUrl}
                {...ENLACE_EXTERNO}
                className="font-medium text-amber-600 underline-offset-2 hover:underline dark:text-amber-400"
              >
                {contacto.sitioWebTexto} ↗
              </a>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">{SIN_DATO}</span>
            )}
          </Fila>
        </div>
      </div>
    </div>
  );
}
