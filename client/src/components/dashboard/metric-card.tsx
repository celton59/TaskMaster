import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  linkText: string;
  linkHref: string;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  linkText,
  linkHref,
  iconColor,
  iconBgColor,
  trend,
}: MetricCardProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Preparar clases para el footer según el tema
  const footerBorderClass = isDarkMode
    ? (iconColor === "text-neon-purple" ? "border-neon-purple/30" :
       iconColor === "text-neon-pink" ? "border-neon-pink/30" :
       iconColor === "text-neon-green" ? "border-neon-green/30" :
       iconColor === "text-neon-yellow" ? "border-neon-yellow/30" :
       "border-neon-accent/30")
    : "border-gray-200";
  
  // Preparar clases para el link según el tema
  const linkClass = isDarkMode
    ? (iconColor === "text-neon-purple" ? "text-neon-purple hover:text-neon-purple/90" :
       iconColor === "text-neon-pink" ? "text-neon-pink hover:text-neon-pink/90" :
       iconColor === "text-neon-green" ? "text-neon-green hover:text-neon-green/90" :
       iconColor === "text-neon-yellow" ? "text-neon-yellow hover:text-neon-yellow/90" :
       "text-neon-accent hover:text-neon-accent/90")
    : (iconColor === "text-neon-purple" ? "text-purple-600 hover:text-purple-700" :
       iconColor === "text-neon-green" ? "text-green-600 hover:text-green-700" :
       iconColor === "text-neon-yellow" ? "text-amber-600 hover:text-amber-700" :
       "text-blue-600 hover:text-blue-700");

  return (
    <motion.div 
      className={isDarkMode 
        ? "overflow-hidden rounded-xl group animate-fade-in border border-neon-accent/30 bg-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.15)] hover:shadow-[0_0_25px_rgba(0,225,255,0.25)] animate-card-glow"
        : "overflow-hidden rounded-xl group animate-fade-in border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
      }
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative p-6">
        {/* Background gradient effect */}
        <div className={isDarkMode 
          ? "absolute inset-0 bg-gradient-to-r from-neon-darker via-neon-medium/20 to-neon-dark bg-[length:200%_100%] animate-flow-gradient"
          : "absolute inset-0 bg-gradient-to-b from-white to-gray-50"
        }></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            {/* Icon container */}
            <div 
              className={isDarkMode
                ? cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg",
                  iconBgColor === "bg-neon-dark" ? "bg-neon-darker" : iconBgColor,
                  iconColor === "text-neon-purple" 
                    ? "text-neon-purple shadow-[0_0_10px_rgba(187,0,255,0.3)] border border-neon-purple/30" 
                    : iconColor === "text-neon-pink" 
                    ? "text-neon-pink shadow-[0_0_10px_rgba(255,0,230,0.3)] border border-neon-pink/30"
                    : iconColor === "text-neon-green" 
                    ? "text-neon-green shadow-[0_0_10px_rgba(0,255,157,0.3)] border border-neon-green/30"
                    : iconColor === "text-neon-yellow" 
                    ? "text-neon-yellow shadow-[0_0_10px_rgba(255,234,0,0.3)] border border-neon-yellow/30"
                    : "text-neon-accent shadow-[0_0_10px_rgba(0,225,255,0.3)] border border-neon-accent/30"
                )
                : cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg border shadow-sm",
                  iconColor === "text-neon-purple" ? "text-purple-600 border-purple-200 bg-purple-50" :
                  iconColor === "text-neon-green" ? "text-green-600 border-green-200 bg-green-50" :
                  iconColor === "text-neon-yellow" ? "text-amber-600 border-amber-200 bg-amber-50" :
                  "text-blue-600 border-blue-200 bg-blue-50"
                )
              }
            >
              <Icon className="h-6 w-6" />
            </div>
            
            {/* Arrow icon */}
            <Link to={linkHref}>
              <div className={isDarkMode 
                ? cn(
                  "h-8 w-8 rounded-full bg-neon-medium/50 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2 flex items-center justify-center shadow-[0_0_8px_rgba(0,225,255,0.2)]",
                  iconColor === "text-neon-purple" 
                    ? "border border-neon-purple/50 text-neon-purple/80 hover:bg-neon-purple/20 hover:text-neon-purple hover:border-neon-purple/70" 
                    : iconColor === "text-neon-pink" 
                    ? "border border-neon-pink/50 text-neon-pink/80 hover:bg-neon-pink/20 hover:text-neon-pink hover:border-neon-pink/70"
                    : iconColor === "text-neon-green" 
                    ? "border border-neon-green/50 text-neon-green/80 hover:bg-neon-green/20 hover:text-neon-green hover:border-neon-green/70"
                    : iconColor === "text-neon-yellow" 
                    ? "border border-neon-yellow/50 text-neon-yellow/80 hover:bg-neon-yellow/20 hover:text-neon-yellow hover:border-neon-yellow/70"
                    : "border border-neon-accent/50 text-neon-accent/80 hover:bg-neon-accent/20 hover:text-neon-accent hover:border-neon-accent/70"
                )
                : cn(
                  "h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2 flex items-center justify-center",
                  iconColor === "text-neon-purple" ? "text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100" :
                  iconColor === "text-neon-green" ? "text-green-600 border border-green-200 bg-green-50 hover:bg-green-100" :
                  iconColor === "text-neon-yellow" ? "text-amber-600 border border-amber-200 bg-amber-50 hover:bg-amber-100" :
                  "text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100"
                )
              }>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
          
          {/* Content area */}
          <div className="flex flex-col">
            {/* Title */}
            <div className={isDarkMode 
              ? "text-sm font-medium text-neon-accent/90 mb-1 tracking-tight neon-text"
              : "text-sm font-medium text-gray-600 mb-1 tracking-tight"
            }>{title}</div>
            
            {/* Value */}
            <div className="flex items-center justify-between mb-1">
              <div className={isDarkMode
                ? "text-3xl font-bold text-neon-text tracking-tight font-mono"
                : "text-3xl font-bold text-gray-800 tracking-tight"
              }>
                {value}
              </div>
            </div>
            
            {/* Trend indicator */}
            {trend && (
              <div className="flex items-center mt-1 mb-2">
                <span 
                  className={
                    isDarkMode
                      ? cn(
                          "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border",
                          trend.isPositive && iconColor === "text-neon-purple"
                            ? "bg-neon-purple/20 text-neon-purple border-neon-purple/50 shadow-[0_0_5px_rgba(187,0,255,0.2)]"
                            : trend.isPositive && iconColor === "text-neon-pink"
                            ? "bg-neon-pink/20 text-neon-pink border-neon-pink/50 shadow-[0_0_5px_rgba(255,0,230,0.2)]"
                            : trend.isPositive && iconColor === "text-neon-green"
                            ? "bg-neon-green/20 text-neon-green border-neon-green/50 shadow-[0_0_5px_rgba(0,255,157,0.2)]"
                            : trend.isPositive && iconColor === "text-neon-yellow"
                            ? "bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50 shadow-[0_0_5px_rgba(255,234,0,0.2)]"
                            : trend.isPositive
                            ? "bg-neon-accent/20 text-neon-accent border-neon-accent/50 shadow-[0_0_5px_rgba(0,225,255,0.2)]"
                            : "bg-neon-red/20 text-neon-red border-neon-red/50 shadow-[0_0_5px_rgba(255,45,109,0.2)]"
                        )
                      : cn(
                          "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border",
                          trend.isPositive && iconColor === "text-neon-purple" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          trend.isPositive && iconColor === "text-neon-green" ? "bg-green-50 text-green-700 border-green-200" :
                          trend.isPositive && iconColor === "text-neon-yellow" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          trend.isPositive ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        )
                  }
                >
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {trend.value}
                </span>
                <span className={isDarkMode ? "ml-2 text-xs text-neon-text/70" : "ml-2 text-xs text-gray-500"}>
                  vs. período anterior
                </span>
              </div>
            )}
          </div>
          
          {/* Footer with link */}
          <div className={cn("mt-4 pt-4 border-t", footerBorderClass)}>
            <Link to={linkHref} className={cn(
              "inline-flex items-center text-sm font-medium transition-colors",
              linkClass
            )}>
              {linkText}
              <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Hover effect overlay - only in dark mode */}
        {isDarkMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-full group-hover:translate-x-0 animate-pulse"></div>
        )}
      </div>
    </motion.div>
  );
}
