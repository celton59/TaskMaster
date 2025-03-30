import React, { useMemo } from "react";
import { 
  getUserGradient, 
  getNeonGradient, 
  GradientType 
} from "@/lib/gradient-generator";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface GradientAvatarProps {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gradientType?: GradientType;
  neon?: boolean;
  role?: 'admin' | 'manager' | 'user' | string;
  className?: string;
  animate?: boolean;
  border?: boolean;
  glow?: boolean;
  pulse?: boolean;
  interactive?: boolean;
}

// Definición de efectos de animación para cada rol
const roleAnimations: Record<string, string> = {
  admin: 'animate-pulse-slow',
  manager: 'animate-border-flow',
  user: '',
};

/**
 * Un avatar con fondo de gradiente generado dinámicamente a partir del nombre de usuario
 */
export function GradientAvatar({ 
  name,
  image,
  size = 'md', 
  gradientType = 'linear',
  neon = true,
  role = 'user',
  className,
  animate = true,
  border = true,
  glow = true,
  pulse = false,
  interactive = false,
}: GradientAvatarProps) {
  // Generar las iniciales del nombre
  const initials = useMemo(() => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [name]);

  // Generar el gradient background según el nombre
  const gradient = useMemo(() => {
    if (neon) {
      return getNeonGradient(name, gradientType);
    }
    return getUserGradient(name, gradientType);
  }, [name, gradientType, neon]);

  // Mapear tamaños a clases de Tailwind
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  // Efectos de glow según el rol
  const glowEffects: Record<string, string> = {
    admin: "shadow-[0_0_12px_rgba(149,76,233,0.5)]",
    manager: "shadow-[0_0_12px_rgba(0,225,255,0.5)]",
    user: "shadow-[0_0_12px_rgba(74,222,128,0.5)]", 
  };

  // Efectos de borde según el rol
  const borderEffects: Record<string, string> = {
    admin: "border-2 border-neon-purple/70",
    manager: "border-2 border-neon-accent/70",
    user: "border-2 border-neon-green/70",
  };

  // Estilos base del avatar
  const avatarStyles = cn(
    sizeClasses[size],
    "rounded-full overflow-hidden relative",
    // Aplicar borde si está habilitado
    border && (borderEffects[role] || "border-2 border-neon-accent/70"),
    // Aplicar glow si está habilitado
    glow && (glowEffects[role] || "shadow-[0_0_12px_rgba(0,225,255,0.4)]"),
    // Aplicar animación de pulso si está habilitada
    pulse && "animate-pulse-slow",
    // Aplicar animación específica del rol si está habilitada
    animate && (roleAnimations[role] || ""),
    // Añadir efectos de interactividad si está habilitado
    interactive && "transition-all duration-300 hover:scale-110 cursor-pointer hover:z-10",
    className
  );

  // Estilo para el fondo con gradiente
  const gradientStyle = {
    background: gradient,
  };

  return (
    <Avatar className={avatarStyles}>
      {image ? (
        <AvatarImage src={image} alt={name} className="object-cover" />
      ) : (
        <>
          {/* Fondo con gradiente */}
          <div 
            className="absolute inset-0 z-0" 
            style={gradientStyle} 
          />
          
          {/* Iniciales del usuario */}
          <AvatarFallback className="relative z-10 bg-transparent font-medium">
            {initials}
          </AvatarFallback>
        </>
      )}
    </Avatar>
  );
}

/**
 * Grupo de avatares con gradiente
 */
export interface GradientAvatarGroupProps {
  users: Array<{
    name: string;
    image?: string;
    role?: 'admin' | 'manager' | 'user' | string;
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GradientAvatarGroup({ 
  users, 
  max = 3,
  size = 'sm', 
  className 
}: GradientAvatarGroupProps) {
  const displayedUsers = users.slice(0, max);
  const extraUsers = users.length - max;
  
  // Mapear tamaños a clases de Tailwind
  const sizeClasses: Record<string, string> = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };
  
  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayedUsers.map((user, i) => (
        <GradientAvatar
          key={i}
          name={user.name}
          image={user.image}
          role={user.role}
          size={size}
          className="border-2 border-neon-darker"
          interactive
        />
      ))}
      
      {extraUsers > 0 && (
        <div className={cn(
          "flex items-center justify-center text-xs font-medium border-2 border-neon-darker rounded-full bg-neon-medium text-neon-text",
          sizeClasses[size]
        )}>
          +{extraUsers}
        </div>
      )}
    </div>
  );
}