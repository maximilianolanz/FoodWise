"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LatLng, RestaurantMatch } from "@/lib/types";

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const iconoResultado = L.divIcon({
  className: "",
  html: `<div style="
    width: 28px; height: 28px;
    border-radius: 9999px;
    background: #18181b;
    color: white;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 12px;
    font-family: ui-sans-serif, system-ui, sans-serif;
  ">●</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const iconoUsuario = L.divIcon({
  className: "",
  html: `<div style="
    width: 18px; height: 18px;
    border-radius: 9999px;
    background: #2563eb;
    border: 3px solid white;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.25);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({
  puntos,
}: {
  puntos: Array<[number, number]>;
}) {
  const map = useMap();
  useEffect(() => {
    if (puntos.length === 0) return;
    if (puntos.length === 1) {
      map.setView(puntos[0], 14);
      return;
    }
    const bounds = L.latLngBounds(puntos);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, puntos]);
  return null;
}

export default function ResultsMap({
  resultados,
  ubicacion,
}: {
  resultados: RestaurantMatch[];
  ubicacion: LatLng;
}) {
  const puntos = useMemo<Array<[number, number]>>(() => {
    const pts: Array<[number, number]> = resultados.map((m) => [
      m.restaurante.lat,
      m.restaurante.lng,
    ]);
    pts.push([ubicacion.lat, ubicacion.lng]);
    return pts;
  }, [resultados, ubicacion]);

  return (
    <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
      <MapContainer
        center={[ubicacion.lat, ubicacion.lng]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[ubicacion.lat, ubicacion.lng]}
          icon={iconoUsuario}
        >
          <Popup>Tu ubicación</Popup>
        </Marker>
        {resultados.map((m, i) => (
          <Marker
            key={m.restaurante.id}
            position={[m.restaurante.lat, m.restaurante.lng]}
            icon={iconoResultado}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontSize: 12, color: "#71717a" }}>#{i + 1}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {m.restaurante.nombre}
                </div>
                <div style={{ fontSize: 12, color: "#52525b" }}>
                  {m.restaurante.comuna} · ★ {m.restaurante.rating.toFixed(1)}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #e4e4e7",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {m.plato.plato}
                  </div>
                  <div style={{ fontSize: 12, color: "#52525b" }}>
                    {m.plato.descripcion}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {clp.format(m.plato.precio)} ·{" "}
                    {m.distanciaKm < 1
                      ? `${Math.round(m.distanciaKm * 1000)} m`
                      : `${m.distanciaKm.toFixed(1)} km`}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <FitBounds puntos={puntos} />
      </MapContainer>
    </div>
  );
}
