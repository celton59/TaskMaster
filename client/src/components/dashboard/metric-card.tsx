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
    <div className="bg-white overflow-hidden shadow-md border border-neutral-100 rounded-xl hover:shadow-lg transition-all duration-200 group">
      <div className="relative p-6">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-neutral-50 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div 
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-lg drop-shadow-sm",
                iconBgColor,
                iconColor
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            
            <Link to={linkHref}>
              <div className="h-8 w-8 rounded-full border border-neutral-200 bg-white text-neutral-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2 flex items-center justify-center hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-300 shadow-sm">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
          
          <div className="flex flex-col">
            <div className="text-sm font-medium text-neutral-600 mb-1 tracking-tight">{title}</div>
            
            <div className="flex items-center justify-between mb-1">
              <div className="text-3xl font-bold text-neutral-900 tracking-tight">
                {value}
              </div>
            </div>
              
            {trend && (
              <div className="flex items-center mt-1 mb-2">
                <span className={cn(
                  "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border shadow-sm",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                )}>
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {trend.value}
                </span>
                <span className="ml-2 text-xs text-neutral-500">
                  vs. período anterior
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <Link to={linkHref} className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              {linkText}
              <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-50/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-full group-hover:translate-x-0"></div>
      </div>
    </div>
  );
}
