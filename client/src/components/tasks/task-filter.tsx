import { Button } from "@/components/ui/button";
import { Category } from "@shared/schema";

interface TaskFilterProps {
  categories: Category[];
  activeFilter: number | null;
  onFilterChange: (categoryId: number | null) => void;
}

export function TaskFilter({ categories, activeFilter, onFilterChange }: TaskFilterProps) {
  return (
    <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
      <Button
        variant={activeFilter === null ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange(null)}
        className="whitespace-nowrap"
      >
        Todas
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeFilter === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(category.id)}
          className="whitespace-nowrap"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
