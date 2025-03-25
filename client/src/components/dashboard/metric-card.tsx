import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  linkText: string;
  linkHref: string;
  iconColor: string;
  iconBgColor: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  linkText,
  linkHref,
  iconColor,
  iconBgColor,
}: MetricCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div 
            className={cn(
              "flex-shrink-0 p-3 rounded-md",
              iconBgColor,
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-neutral-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 px-5 py-3">
        <div className="text-sm">
          <a 
            href={linkHref}
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            {linkText}
          </a>
        </div>
      </div>
    </div>
  );
}
