/**
 * Biblioteca de efectos de neón para mejorar la experiencia visual de la aplicación
 */
import { useTheme } from "@/hooks/use-theme";

// Utilidad para obtener las variantes según el tema
export function useThemeVariants() {
  const { theme } = useTheme();
  
  return {
    isDark: theme === 'dark',
    neonCardVariants: theme === 'dark' ? darkNeonCardVariants : lightCardVariants
  };
}

// Variantes para componentes con efecto neón (modo oscuro)
export const darkNeonCardVariants = {
  default: {
    borderColor: "rgba(0, 225, 255, 0.3)",
    transition: { duration: 0.3 }
  },
  hover: {
    borderColor: "rgba(0, 225, 255, 0.7)",
    boxShadow: "0 0 15px rgba(0, 225, 255, 0.4), 0 0 30px rgba(0, 225, 255, 0.2)",
    transition: { duration: 0.2 }
  },
  active: {
    borderColor: "rgba(0, 225, 255, 0.9)",
    boxShadow: "0 0 20px rgba(0, 225, 255, 0.5), 0 0 40px rgba(0, 225, 255, 0.3)",
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// Variantes para componentes en modo claro (más tradicional)
export const lightCardVariants = {
  default: {
    borderColor: "rgba(220, 220, 220, 1)",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 }
  },
  hover: {
    borderColor: "rgba(200, 200, 200, 1)",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  },
  active: {
    borderColor: "rgba(180, 180, 180, 1)",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// Para compatibilidad con código existente
export const neonCardVariants = darkNeonCardVariants;

// Clases CSS para efectos de neón (modo oscuro)
export const neonEffectClasses = {
  // Borde pulsante de neón
  pulsingBorder: "animate-pulse-neon border border-neon-accent/30",
  
  // Gradiente fluido
  flowingGradient: "bg-gradient-to-r from-neon-dark via-neon-medium/20 to-neon-dark bg-[length:200%_100%] animate-flow-gradient",
  
  // Clase para hover con glow
  glowOnHover: "transition-all duration-300 hover:border-neon-accent/70 hover:shadow-[0_0_15px_rgba(0,225,255,0.4)]",
  
  // Texto con efecto neón
  neonText: "text-neon-accent [text-shadow:0_0_10px_rgba(0,225,255,0.7)]",
  
  // Botón con efecto neón
  neonButton: "border border-neon-accent/30 bg-neon-darker hover:bg-neon-accent/20 hover:border-neon-accent/80 hover:shadow-[0_0_15px_rgba(0,225,255,0.5)] transition-all duration-300",
  
  // Card con efecto neón
  neonCard: "border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.15)] animate-card-glow rounded-xl",
};

// Clases CSS para modo claro (tradicional)
export const lightEffectClasses = {
  // Borde simple
  pulsingBorder: "border border-gray-200",
  
  // Fondo simple
  flowingGradient: "bg-gradient-to-b from-white to-gray-50",
  
  // Hover suave
  glowOnHover: "transition-all duration-300 hover:border-gray-300 hover:shadow-md",
  
  // Texto normal
  neonText: "text-gray-800",
  
  // Botón normal
  neonButton: "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-300",
  
  // Card normal
  neonCard: "border border-gray-200 bg-white shadow-sm rounded-xl",
};

// Función para obtener las clases según el tema
export function useThemeClasses() {
  const { theme } = useTheme();
  
  return {
    effectClasses: theme === 'dark' ? neonEffectClasses : lightEffectClasses,
  };
}

// Efectos combinados por componente
export const componentEffects = {
  statCard: `${neonEffectClasses.neonCard} ${neonEffectClasses.glowOnHover}`,
  projectCard: `${neonEffectClasses.pulsingBorder} ${neonEffectClasses.glowOnHover}`,
  dashboardWidget: `${neonEffectClasses.neonCard} ${neonEffectClasses.flowingGradient}`,
  actionButton: `${neonEffectClasses.neonButton}`,
};