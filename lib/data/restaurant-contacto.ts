/**
 * Datos de contacto adicionales por restaurante (CR FW-GPTI-2026-1).
 *
 * - `horarioConcurrido`: estimación de las horas de mayor concurrencia,
 *   derivada de los horarios típicos de apertura y los peaks de almuerzo/cena.
 *   NO proviene de datos reales de afluencia (no existe fuente pública).
 * - `sitioWeb`: URL del sitio oficial. Solo se incluye para locales con
 *   presencia web conocida; el resto queda sin dato (placeholder en la UI).
 *   Las URLs requieren verificación manual de QA (riesgo de enlaces rotos).
 */

export type ContactoExtra = {
  horarioConcurrido?: string;
  sitioWeb?: string;
};

export const contactoPorId: Record<string, ContactoExtra> = {
  "r-001": { horarioConcurrido: "Almuerzo 13:00–15:00 y after office 19:00–21:00", sitioWeb: "https://liguria.cl" },
  "r-002": { horarioConcurrido: "Cena 20:30–23:00; fines de semana llenos", sitioWeb: "https://galindo.cl" },
  "r-003": { horarioConcurrido: "Cena 20:00–22:30, reserva recomendada", sitioWeb: "https://peumayen.cl" },
  "r-004": { horarioConcurrido: "Almuerzo ejecutivo 13:00–15:00" },
  "r-005": { horarioConcurrido: "Cena 20:00–22:00, viernes y sábado peak" },
  "r-006": { horarioConcurrido: "Viernes a domingo 20:30–22:30" },
  "r-007": { horarioConcurrido: "Almuerzo 13:30–15:30, especialmente domingos", sitioWeb: "https://lamarcebicheria.cl" },
  "r-008": { horarioConcurrido: "Cena 20:30–22:30, reserva indispensable", sitioWeb: "https://astridygaston.com" },
  "r-009": { horarioConcurrido: "Almuerzo 13:00–15:30, viernes muy concurrido", sitioWeb: "https://elhoyo.cl" },
  "r-010": { horarioConcurrido: "Mediodía 12:30–15:00, alta rotación", sitioWeb: "https://fuentealemana.cl" },
  "r-011": { horarioConcurrido: "Almuerzo 12:30–15:00, horario laboral", sitioWeb: "https://domino.cl" },
  "r-012": { horarioConcurrido: "After office 19:00–22:00, jueves a sábado", sitioWeb: "https://bocanariz.cl" },
  "r-013": { horarioConcurrido: "Almuerzo 13:00–15:00 y cena 20:30–22:30", sitioWeb: "https://aquiestacoco.cl" },
  "r-014": { horarioConcurrido: "Cena 20:00–22:00" },
  "r-015": { horarioConcurrido: "Brunch fines de semana 11:00–14:00", sitioWeb: "https://holm.cl" },
  "r-016": { horarioConcurrido: "Almuerzo 13:00–15:00, alta demanda vegetariana", sitioWeb: "https://elhuerto.cl" },
  "r-017": { horarioConcurrido: "Cena 20:00–22:00, reserva recomendada" },
  "r-018": { horarioConcurrido: "Cena 20:30–22:30, fines de semana" },
  "r-019": { horarioConcurrido: "Almuerzo 13:30–16:00, sábados llenos", sitioWeb: "https://lasvacasgordas.cl" },
  "r-020": { horarioConcurrido: "Cena 21:00–23:00 con show en vivo", sitioWeb: "https://balihai.cl" },
  "r-021": { horarioConcurrido: "Brunch sábado y domingo 10:30–13:30", sitioWeb: "https://silvestrebistro.cl" },
  "r-022": { horarioConcurrido: "Almuerzo 13:00–15:30, clásico de mediodía", sitioWeb: "https://confiteriatorres.cl" },
  "r-023": { horarioConcurrido: "Cena 20:30–22:30", sitioWeb: "https://sukalde.cl" },
  "r-024": { horarioConcurrido: "Cena 21:00–23:30, ambiente de bar", sitioWeb: "https://etniko.cl" },
  "r-025": { horarioConcurrido: "Almuerzo saludable 13:00–15:00", sitioWeb: "https://quinoarestaurant.cl" },
  "r-026": { horarioConcurrido: "Cena 20:30–22:30, turistas y locales", sitioWeb: "https://mesonnerudiano.cl" },
  "r-027": { horarioConcurrido: "Cena 20:00–22:30, fines de semana peak", sitioWeb: "https://rishtedar.com" },
  "r-028": { horarioConcurrido: "Noche 22:00–01:00, viernes y sábado" },
  "r-029": { horarioConcurrido: "Cena 20:00–23:00, jueves a sábado" },
  "r-030": { horarioConcurrido: "Almuerzo 13:00–15:30, especialidad marina", sitioWeb: "https://pinpilinpausha.cl" },
  "r-031": { horarioConcurrido: "Almuerzo 13:00–15:00, clásico santiaguino", sitioWeb: "https://barnacional.cl" },
  "r-032": { horarioConcurrido: "Almuerzo 13:00–15:00 y tarde en terraza", sitioWeb: "https://castilloforestal.cl" },
  "r-033": { horarioConcurrido: "Almuerzo 13:30–15:30 con vista, reserva", sitioWeb: "https://mestizorestaurant.cl" },
  "r-034": { horarioConcurrido: "Cena 20:30–22:30, reserva recomendada", sitioWeb: "https://hanzo.cl" },
  "r-035": { horarioConcurrido: "Cena 20:30–22:30", sitioWeb: "https://bocca.cl" },
  "r-036": { horarioConcurrido: "Cena 20:30–23:00, parrilla muy pedida", sitioWeb: "https://lascabras.cl" },
  "r-037": { horarioConcurrido: "Brunch fines de semana 10:00–13:00", sitioWeb: "https://cafemelba.cl" },
  "r-038": { horarioConcurrido: "Almuerzo 13:00–15:00 y cena 20:00–22:00", sitioWeb: "https://streatburger.cl" },
  "r-039": { horarioConcurrido: "Almuerzo 13:00–15:00, fin de semana familiar" },
  "r-040": { horarioConcurrido: "Brunch sábado y domingo 10:30–13:30", sitioWeb: "https://cafetriciclo.cl" },
  "r-041": { horarioConcurrido: "Cena 20:00–22:00, dim sum los domingos", sitioWeb: "https://mrjiao.cl" },
  "r-042": { horarioConcurrido: "Almuerzo 13:00–15:30, fin de semana lleno" },
  "r-043": { horarioConcurrido: "Cena 20:00–22:30, delivery en horario peak" },
  "r-044": { horarioConcurrido: "Cena 20:00–22:30, jueves a sábado" },
  "r-045": { horarioConcurrido: "Almuerzo 13:00–16:00, domingos campestres", sitioWeb: "https://donatina.cl" },
  "r-046": { horarioConcurrido: "Almuerzo 13:00–15:30, sazón peruana" },
  "r-047": { horarioConcurrido: "Desayuno y almuerzo 09:00–14:00" },
  "r-048": { horarioConcurrido: "Almuerzo 13:00–15:00, fin de semana en familia" },
  "r-049": { horarioConcurrido: "Almuerzo 13:30–15:30, pescados y mariscos" },
  "r-050": { horarioConcurrido: "Cena 20:00–22:30, pastas caseras" },
  "r-051": { horarioConcurrido: "Almuerzo 13:00–15:00 y once 17:00–19:00" },
  "r-052": { horarioConcurrido: "Almuerzo 13:00–15:00, comida coreana" },
  "r-053": { horarioConcurrido: "Almuerzo 13:00–15:30, sabor colombiano" },
  "r-054": { horarioConcurrido: "Almuerzo 13:00–15:00, alta rotación" },
  "r-055": { horarioConcurrido: "Almuerzo 13:00–15:00, opciones saludables" },
  "r-056": { horarioConcurrido: "Cena 20:30–23:00, parrilla los fines de semana" },
  "r-057": { horarioConcurrido: "Once 16:30–19:30, repostería" },
  "r-058": { horarioConcurrido: "Cena 20:00–22:30, jueves a sábado" },
  "r-059": { horarioConcurrido: "Cena 20:00–22:30, fuerte en delivery" },
  "r-060": { horarioConcurrido: "Almuerzo 13:00–15:30, cocina casera" },
  "r-061": { horarioConcurrido: "Cena 20:00–22:30, viernes y sábado peak" },
  "r-062": { horarioConcurrido: "Cena 20:30–23:00, cordero al palo" },
  "r-063": { horarioConcurrido: "Almuerzo 13:00–15:00, cocina vietnamita" },
  "r-064": { horarioConcurrido: "Tarde y noche 18:00–23:00, completos" },
  "r-065": { horarioConcurrido: "Cena 20:00–22:30, trattoria familiar" },
  "r-066": { horarioConcurrido: "Tarde 16:00–20:00, café y música" },
  "r-067": { horarioConcurrido: "Almuerzo 13:00–16:00, mariscos frescos" },
  "r-068": { horarioConcurrido: "Almuerzo 13:00–15:00, cocina vegana" },
  "r-069": { horarioConcurrido: "Cena 20:00–22:30, fusión asiática" },
  "r-070": { horarioConcurrido: "Tarde 16:00–20:00, fin de semana lleno" },
};
