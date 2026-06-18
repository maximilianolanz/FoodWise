import type { Restaurant } from "./types";

/** Texto mostrado cuando un campo de contacto no tiene datos. */
export const SIN_DATO = "No disponible";

/** Atributos seguros para abrir un enlace externo en una pestaña nueva. */
export const ENLACE_EXTERNO = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export type ContactoRestaurante = {
  direccion: string;
  horario: string;
  tieneHorario: boolean;
  sitioWebUrl: string | null;
  sitioWebTexto: string;
  tieneSitio: boolean;
};

function limpio(valor: string | undefined): string {
  return valor?.trim() ?? "";
}

/** Quita el protocolo y la barra final para mostrar la URL de forma compacta. */
function etiquetaUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/**
 * Normaliza los datos de contacto de un restaurante para mostrarlos.
 * Fuente única de la lógica de placeholders y del texto del enlace,
 * compartida por el modal de detalle y el popup del mapa.
 */
export function infoContacto(r: Restaurant): ContactoRestaurante {
  const direccion = limpio(r.direccion);
  const horario = limpio(r.horarioConcurrido);
  const sitio = limpio(r.sitioWeb);

  return {
    direccion: direccion.length > 0 ? direccion : SIN_DATO,
    horario: horario.length > 0 ? horario : SIN_DATO,
    tieneHorario: horario.length > 0,
    sitioWebUrl: sitio.length > 0 ? sitio : null,
    sitioWebTexto: sitio.length > 0 ? etiquetaUrl(sitio) : SIN_DATO,
    tieneSitio: sitio.length > 0,
  };
}
