/**
 * Biblioteca de efectos de neón para mejorar la experiencia visual de la aplicación
 */

// Variantes para componentes con efecto neón
export const neonCardVariants = {
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

// Clases CSS para efectos de neón
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

// Efectos combinados por componente
export const componentEffects = {
  statCard: `${neonEffectClasses.neonCard} ${neonEffectClasses.glowOnHover}`,
  projectCard: `${neonEffectClasses.pulsingBorder} ${neonEffectClasses.glowOnHover}`,
  dashboardWidget: `${neonEffectClasses.neonCard} ${neonEffectClasses.flowingGradient}`,
  actionButton: `${neonEffectClasses.neonButton}`,
};