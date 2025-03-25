/**
 * Funciones utilitarias para manipulación de prioridades
 */

/**
 * Convierte un texto de prioridad en español a su equivalente en inglés
 * @param value Texto de prioridad en español (alta, media, baja)
 * @returns Prioridad en inglés (high, medium, low)
 */
export function mapPriority(value: string): "high" | "medium" | "low" {
  switch (value) {
    case "alta": return "high";
    case "media": return "medium";
    case "baja": return "low";
    default: return "medium";
  }
}

/**
 * Convierte un texto de prioridad en inglés a su equivalente en español
 * @param value Texto de prioridad en inglés (high, medium, low)
 * @returns Prioridad en español (alta, media, baja)
 */
export function mapPriorityToSpanish(value: string): "alta" | "media" | "baja" {
  switch (value) {
    case "high": return "alta";
    case "medium": return "media";
    case "low": return "baja";
    default: return "media";
  }
}