import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Category } from "@shared/schema";

interface TaskFilterProps {
  categories: Category[];
  activeFilter: number | null;
  onFilterChange: (categoryId: number | null) => void;
}

// Get color class based on category color
const getCategoryColor = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-500";
    case "purple":
      return "bg-purple-500";
    case "green":
      return "bg-emerald-500";
    case "red":
      return "bg-rose-500";
    case "orange":
      return "bg-amber-500";
    default:
      return "bg-slate-500";
  }
};

// Get badge and text styles based on active status
const getBadgeStyles = (isActive: boolean, color: string) => {
  const baseClasses = "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors";
  
  if (isActive) {
    return `${baseClasses} bg-neon-accent/20 text-neon-accent border border-neon-accent/40 shadow-[0_0_8px_rgba(0,225,255,0.15)]`;
  }
  
  return `${baseClasses} bg-neon-medium/30 text-neon-text/80 border border-neon-accent/20 hover:border-neon-accent/40 hover:bg-neon-accent/10 hover:text-neon-accent/90`;
};

export function TaskFilter({ categories, activeFilter, onFilterChange }: TaskFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <button
        onClick={() => onFilterChange(null)}
        className={getBadgeStyles(activeFilter === null, "neutral")}
      >
        Todas las tareas
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onFilterChange(category.id)}
          className={getBadgeStyles(activeFilter === category.id, category.color)}
        >
          <span className={`h-2 w-2 rounded-full ${getCategoryColor(category.color)} mr-1.5`}></span>
          {category.name}
        </button>
      ))}
    </div>
  );
}
