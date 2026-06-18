"use client";

import { useState } from "react";
import type { Restaurant, RestaurantMatch } from "@/lib/types";
import { RestaurantCard } from "./restaurant-card";
import { RestaurantDetailModal } from "./restaurant-detail-modal";

export function ResultsList({ resultados }: { resultados: RestaurantMatch[] }) {
  const [abierto, setAbierto] = useState<Restaurant | null>(null);

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {resultados.map((m, i) => (
          <li key={m.restaurante.id}>
            <RestaurantCard
              match={m}
              ranking={i + 1}
              onAbrir={() => setAbierto(m.restaurante)}
            />
          </li>
        ))}
      </ul>
      <RestaurantDetailModal
        restaurante={abierto}
        onCerrar={() => setAbierto(null)}
      />
    </>
  );
}
