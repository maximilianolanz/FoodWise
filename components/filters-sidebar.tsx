"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  DISTANCIAS_MAX,
  RATING_MAX,
  RATING_MIN,
  type RangoNumerico,
} from "@/lib/filters";
import { normalizar } from "@/lib/text";

const FILTER_KEYS = [
  "precioMin",
  "precioMax",
  "comuna",
  "ratingMin",
  "ratingMax",
  "dist",
] as const;

export function FiltersSidebar({
  comunas,
  rangoPrecio,
  rangoRating,
}: {
  comunas: string[];
  rangoPrecio: RangoNumerico | null;
  rangoRating: RangoNumerico | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [abierto, setAbierto] = useState(false);

  const comunasSel = new Set(params.getAll("comuna").map(normalizar));
  const activos = FILTER_KEYS.reduce((n, k) => n + params.getAll(k).length, 0);

  function navegar(next: URLSearchParams) {
    router.push(next.toString() ? `/?${next.toString()}` : "/");
  }

  function setUnico(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null) next.delete(key);
    else next.set(key, value);
    navegar(next);
  }

  function setRango(
    keyMin: string,
    keyMax: string,
    rawMin: string,
    rawMax: string,
  ) {
    const curMin = params.get(keyMin) ?? "";
    const curMax = params.get(keyMax) ?? "";
    if (rawMin === curMin && rawMax === curMax) return;
    const next = new URLSearchParams(params.toString());
    aplicarParam(next, keyMin, rawMin);
    aplicarParam(next, keyMax, rawMax);
    navegar(next);
  }

  function toggleComuna(comuna: string) {
    const next = new URLSearchParams(params.toString());
    next.delete("comuna");
    const clave = normalizar(comuna);
    const restantes = params
      .getAll("comuna")
      .filter((c) => normalizar(c) !== clave);
    const finales = comunasSel.has(clave) ? restantes : [...restantes, comuna];
    for (const c of finales) next.append("comuna", c);
    navegar(next);
  }

  function limpiar() {
    const next = new URLSearchParams(params.toString());
    for (const k of FILTER_KEYS) next.delete(k);
    navegar(next);
  }

  return (
    <aside className="w-full md:w-60 md:shrink-0">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 md:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <span>Filtros{activos > 0 ? ` (${activos})` : ""}</span>
        <span aria-hidden>{abierto ? "▲" : "▼"}</span>
      </button>

      <div
        className={`${abierto ? "mt-3 block" : "hidden"} space-y-6 md:mt-0 md:block`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Filtros
          </h2>
          {activos > 0 && (
            <button
              type="button"
              onClick={limpiar}
              className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Limpiar
            </button>
          )}
        </div>

        <Grupo titulo="Precio (CLP)">
          <RangoFiltro
            key={`precio-${params.get("precioMin") ?? ""}-${params.get("precioMax") ?? ""}`}
            valorMin={params.get("precioMin") ?? ""}
            valorMax={params.get("precioMax") ?? ""}
            onCommit={(min, max) =>
              setRango("precioMin", "precioMax", min, max)
            }
            step={500}
            hardMin={0}
            prefijo="$"
            phMin={rangoPrecio ? String(rangoPrecio.min) : "Mín"}
            phMax={rangoPrecio ? String(rangoPrecio.max) : "Máx"}
          />
        </Grupo>

        {comunas.length > 0 && (
          <Grupo titulo="Comuna">
            {comunas.map((c) => (
              <Check
                key={c}
                label={c}
                seleccionado={comunasSel.has(normalizar(c))}
                onToggle={() => toggleComuna(c)}
              />
            ))}
          </Grupo>
        )}

        <Grupo titulo="Evaluación (★)">
          <RangoFiltro
            key={`rating-${params.get("ratingMin") ?? ""}-${params.get("ratingMax") ?? ""}`}
            valorMin={params.get("ratingMin") ?? ""}
            valorMax={params.get("ratingMax") ?? ""}
            onCommit={(min, max) =>
              setRango("ratingMin", "ratingMax", min, max)
            }
            step={0.1}
            hardMin={RATING_MIN}
            hardMax={RATING_MAX}
            phMin={rangoRating ? rangoRating.min.toFixed(1) : "0.0"}
            phMax={rangoRating ? rangoRating.max.toFixed(1) : "5.0"}
          />
        </Grupo>

        <Grupo titulo="Distancia">
          <Radio
            nombre="dist"
            label="Cualquiera"
            seleccionado={!params.get("dist")}
            onSelect={() => setUnico("dist", null)}
          />
          {DISTANCIAS_MAX.map((d) => (
            <Radio
              key={d.key}
              nombre="dist"
              label={d.label}
              seleccionado={params.get("dist") === d.key}
              onSelect={() => setUnico("dist", d.key)}
            />
          ))}
        </Grupo>
      </div>
    </aside>
  );
}

function aplicarParam(next: URLSearchParams, key: string, raw: string) {
  if (raw === "") next.delete(key);
  else next.set(key, raw);
}

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {titulo}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function RangoFiltro({
  valorMin,
  valorMax,
  onCommit,
  step,
  hardMin,
  hardMax,
  prefijo,
  phMin,
  phMax,
}: {
  valorMin: string;
  valorMax: string;
  onCommit: (min: string, max: string) => void;
  step: number;
  hardMin: number;
  hardMax?: number;
  prefijo?: string;
  phMin?: string;
  phMax?: string;
}) {
  function commit(form: HTMLFormElement) {
    const data = new FormData(form);
    const min = String(data.get("min") ?? "").trim();
    const max = String(data.get("max") ?? "").trim();
    onCommit(min, max);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commit(e.currentTarget);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          commit(e.currentTarget);
        }
      }}
      className="flex items-center gap-1.5"
    >
      <CampoNumero
        name="min"
        defaultValue={valorMin}
        step={step}
        min={hardMin}
        max={hardMax}
        prefijo={prefijo}
        placeholder={phMin}
        aria="Mínimo"
      />
      <span className="text-zinc-400">–</span>
      <CampoNumero
        name="max"
        defaultValue={valorMax}
        step={step}
        min={hardMin}
        max={hardMax}
        prefijo={prefijo}
        placeholder={phMax}
        aria="Máximo"
      />
    </form>
  );
}

function CampoNumero({
  name,
  defaultValue,
  step,
  min,
  max,
  prefijo,
  placeholder,
  aria,
}: {
  name: string;
  defaultValue: string;
  step: number;
  min: number;
  max?: number;
  prefijo?: string;
  placeholder?: string;
  aria: string;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-white pl-2 transition-colors focus-within:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
      {prefijo && (
        <span className="text-sm text-zinc-400" aria-hidden>
          {prefijo}
        </span>
      )}
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        step={step}
        min={min}
        max={max}
        inputMode="decimal"
        placeholder={placeholder}
        aria-label={aria}
        className="w-full min-w-0 bg-transparent px-1 py-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
      />
    </span>
  );
}

function Radio({
  nombre,
  label,
  seleccionado,
  onSelect,
}: {
  nombre: string;
  label: string;
  seleccionado: boolean;
  onSelect: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <input
        type="radio"
        name={nombre}
        checked={seleccionado}
        onChange={onSelect}
        className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100"
      />
      {label}
    </label>
  );
}

function Check({
  label,
  seleccionado,
  onToggle,
}: {
  label: string;
  seleccionado: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <input
        type="checkbox"
        checked={seleccionado}
        onChange={onToggle}
        className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100"
      />
      {label}
    </label>
  );
}
