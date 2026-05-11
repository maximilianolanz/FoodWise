import type { RestaurantMatch } from "@/lib/types";
import { RestaurantCard } from "./restaurant-card";

export function ResultsList({ resultados }: { resultados: RestaurantMatch[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {resultados.map((m, i) => (
        <li key={m.restaurante.id}>
          <RestaurantCard match={m} ranking={i + 1} />
        </li>
      ))}
    </ul>
  );
}
