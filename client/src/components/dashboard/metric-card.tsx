import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
  return (
    <div className="neon-card overflow-hidden shadow-[0_0_15px_rgba(0,225,255,0.15)] rounded-xl hover:shadow-[0_0_25px_rgba(0,225,255,0.25)] transition-all duration-300 group animate-fade-in border border-neon-accent/30 bg-neon-dark">
      <div className="relative p-6">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-darker to-neon-dark opacity-80"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div 
              className={cn(
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
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            
            <Link to={linkHref}>
              <div className={cn(
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
              )}>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
          
          <div className="flex flex-col">
            <div className="text-sm font-medium text-neon-accent/90 mb-1 tracking-tight neon-text">{title}</div>
            
            <div className="flex items-center justify-between mb-1">
              <div className="text-3xl font-bold text-neon-text tracking-tight font-mono">
                {value}
              </div>
            </div>
              
            {trend && (
              <div className="flex items-center mt-1 mb-2">
                <span className={cn(
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
                )}>
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {trend.value}
                </span>
                <span className="ml-2 text-xs text-neon-text/70">
                  vs. período anterior
                </span>
              </div>
            )}
          </div>
          
          <div className={cn("mt-4 pt-4 border-t",
            iconColor === "text-neon-purple" ? "border-neon-purple/30" :
            iconColor === "text-neon-pink" ? "border-neon-pink/30" :
            iconColor === "text-neon-green" ? "border-neon-green/30" :
            iconColor === "text-neon-yellow" ? "border-neon-yellow/30" :
            "border-neon-accent/30"
          )}>
            <Link to={linkHref} className={cn(
              "inline-flex items-center text-sm font-medium transition-colors",
              iconColor === "text-neon-purple" ? "text-neon-purple hover:text-neon-purple/90" :
              iconColor === "text-neon-pink" ? "text-neon-pink hover:text-neon-pink/90" :
              iconColor === "text-neon-green" ? "text-neon-green hover:text-neon-green/90" :
              iconColor === "text-neon-yellow" ? "text-neon-yellow hover:text-neon-yellow/90" :
              "text-neon-accent hover:text-neon-accent/90"
            )}>
              {linkText}
              <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-full group-hover:translate-x-0 animate-pulse"></div>
      </div>
    </div>
  );
}
