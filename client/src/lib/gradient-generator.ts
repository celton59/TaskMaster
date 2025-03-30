/**
 * Utilidades para generar gradientes dinámicos para avatares de usuario
 */

// Tipos de gradientes disponibles
export type GradientType = 'linear' | 'radial' | 'conic';

// Configuración del gradiente
export interface GradientConfig {
  type: GradientType;
  colors: string[];
  angle?: number; // Para gradientes lineales (en grados)
  startPosition?: [number, number]; // Para gradientes radiales y cónicos (como porcentajes)
  stops?: number[]; // Posiciones de parada (de 0 a 100)
}

/**
 * Genera un valor hash numérico a partir de una cadena
 */
export function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  return Math.abs(hash);
}

/**
 * Genera un color hexadecimal basado en un valor hash
 */
export function hashToColor(hash: number, saturation = 80, lightness = 60): string {
  // Usamos el hash para generar un valor de tono entre 0 y 360
  const hue = hash % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Genera colores para un gradiente basados en un nombre o ID de usuario
 */
export function generateColorsFromUsername(username: string, colorCount = 3): string[] {
  const baseHash = stringToHash(username);
  
  return Array(colorCount).fill(0).map((_, index) => {
    // Modificamos el hash base para cada color
    const colorHash = baseHash + (index * 1000);
    
    // Ajustamos la saturación y brillo para colores futuristas de neón
    const saturation = 80 + (index * 5) % 20; // Entre 80 y 100
    const lightness = 50 + (index * 7) % 20; // Entre 50 y 70
    
    return hashToColor(colorHash, saturation, lightness);
  });
}

/**
 * Genera una configuración de gradiente completa basada en un nombre de usuario
 */
export function generateGradientFromUsername(
  username: string,
  type: GradientType = 'linear'
): GradientConfig {
  const hash = stringToHash(username);
  const colors = generateColorsFromUsername(username);
  
  // La dirección del gradiente se determinará por el hash
  const angle = (hash % 360);
  
  // Configuración por defecto
  const config: GradientConfig = {
    type,
    colors,
    angle,
  };
  
  // Ajustes específicos basados en el tipo de gradiente
  if (type === 'radial' || type === 'conic') {
    // Posición de inicio para gradientes radiales y cónicos
    config.startPosition = [
      50 + (hash % 40) - 20, // Entre 30% y 70%
      50 + ((hash / 100) % 40) - 20 // Entre 30% y 70%
    ];
  }
  
  return config;
}

/**
 * Convierte una configuración de gradiente a una cadena CSS
 */
export function gradientConfigToCss(config: GradientConfig): string {
  const { type, colors, angle = 0, startPosition = [50, 50], stops } = config;
  
  // Formatear los colores con paradas si están definidas
  const colorStops = colors.map((color, index) => {
    if (stops && stops[index] !== undefined) {
      return `${color} ${stops[index]}%`;
    }
    // Si no hay paradas definidas, las distribuimos uniformemente
    const percentage = (index / (colors.length - 1)) * 100;
    return `${color} ${percentage}%`;
  }).join(', ');

  switch (type) {
    case 'linear':
      return `linear-gradient(${angle}deg, ${colorStops})`;
    case 'radial':
      return `radial-gradient(circle at ${startPosition[0]}% ${startPosition[1]}%, ${colorStops})`;
    case 'conic':
      return `conic-gradient(from ${angle}deg at ${startPosition[0]}% ${startPosition[1]}%, ${colorStops})`;
    default:
      return `linear-gradient(${angle}deg, ${colorStops})`;
  }
}

/**
 * Genera una cadena CSS de gradiente directamente desde un nombre de usuario
 */
export function getUserGradient(
  username: string,
  type: GradientType = 'linear'
): string {
  const config = generateGradientFromUsername(username, type);
  return gradientConfigToCss(config);
}

/**
 * Ajustar los colores para que sean más neón
 */
export function makeNeonColors(colors: string[]): string[] {
  return colors.map(color => {
    // Convertir a HSL si es hex
    if (color.startsWith('#')) {
      // Esta es una implementación simplificada, en producción se usaría una librería
      // para manejar la conversión de colores
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // acromático
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }

      h = Math.round(h * 360);
      s = Math.round(s * 100);
      l = Math.round(l * 100);
      
      // Aumentar saturación y brillo para efecto neón
      s = Math.min(100, s + 20);
      l = Math.min(70, l + 10); // No demasiado brillante
      
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    // Si ya es HSL, incrementar saturación y brillo
    if (color.startsWith('hsl')) {
      const matches = color.match(/\d+/g);
      if (matches) {
        const [h, s, l] = matches.map(Number);
        return `hsl(${h}, ${Math.min(100, s + 20)}%, ${Math.min(70, l + 10)}%)`;
      }
    }
    
    return color;
  });
}

/**
 * Generar un gradiente neón desde un nombre de usuario
 */
export function getNeonGradient(
  username: string,
  type: GradientType = 'linear'
): string {
  const config = generateGradientFromUsername(username, type);
  config.colors = makeNeonColors(config.colors);
  return gradientConfigToCss(config);
}