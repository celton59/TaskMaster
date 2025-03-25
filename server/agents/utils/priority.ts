/**
 * Funciones utilitarias para manipulación de prioridades
 */

/**
 * Convierte un texto de prioridad en español a su equivalente en inglés
 * @param value Texto de prioridad en español (alta, media, baja)
 * @returns Prioridad en inglés (high, medium, low)
 */
export function mapPriority(value: string): "high" | "medium" | "low" {
  const lowercaseValue = value.toLowerCase().trim();
  
  if (lowercaseValue === 'alta') return 'high';
  if (lowercaseValue === 'media') return 'medium';
  if (lowercaseValue === 'baja') return 'low';
  
  // Si no coincide exactamente, intentar coincidir parcialmente
  if (lowercaseValue.includes('alt')) return 'high';
  if (lowercaseValue.includes('med')) return 'medium';
  if (lowercaseValue.includes('baj')) return 'low';
  
  // Si no se puede determinar, usar prioridad media por defecto
  return 'medium';
}

/**
 * Convierte un texto de prioridad en inglés a su equivalente en español
 * @param value Texto de prioridad en inglés (high, medium, low)
 * @returns Prioridad en español (alta, media, baja)
 */
export function mapPriorityToSpanish(value: string): "alta" | "media" | "baja" {
  const lowercaseValue = value.toLowerCase().trim();
  
  if (lowercaseValue === 'high') return 'alta';
  if (lowercaseValue === 'medium') return 'media';
  if (lowercaseValue === 'low') return 'baja';
  
  // Si no coincide exactamente, intentar coincidir parcialmente
  if (lowercaseValue.includes('high') || lowercaseValue.includes('alt')) return 'alta';
  if (lowercaseValue.includes('med')) return 'media';
  if (lowercaseValue.includes('low') || lowercaseValue.includes('baj')) return 'baja';
  
  // Si no se puede determinar, usar prioridad media por defecto
  return 'media';
}