import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
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
    <div className="bg-white overflow-hidden shadow-sm border border-neutral-200 rounded-lg hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-neutral-500">{title}</div>
          <div 
            className={cn(
              "flex-shrink-0 p-2 rounded-md",
              iconBgColor,
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-neutral-900 mb-1">
            {value}
          </div>
          
          {trend && (
            <div className="flex items-center text-xs mb-2">
              <span className={cn(
                "font-medium",
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              )}>
                {trend.value}{" "}
                {trend.isPositive ? (
                  <span className="inline-block">↑</span>
                ) : (
                  <span className="inline-block">↓</span>
                )}
              </span>
              <span className="text-neutral-500 ml-1">
                desde el mes pasado
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-2 pt-3 border-t border-neutral-100">
          <Link href={linkHref}>
            <a className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              {linkText}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
