import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="bg-white overflow-hidden shadow-sm border border-neutral-100 rounded-xl hover:shadow-md transition-all duration-200 group">
      <div className="p-5">
        <div className="flex items-center justify-between mb-2.5">
          <div 
            className={cn(
              "flex-shrink-0 p-2.5 rounded-lg",
              iconBgColor,
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => window.location.href = linkHref}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex flex-col">
          <div className="text-sm font-medium text-neutral-500 mb-1">{title}</div>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-neutral-900">
              {value}
            </div>
            
            {trend && (
              <div className={cn(
                "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}>
                {trend.isPositive ? (
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {trend.value}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <Button 
            variant="ghost" 
            className="w-full justify-start px-0 h-8 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-transparent" 
            onClick={() => window.location.href = linkHref}
          >
            {linkText}
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
