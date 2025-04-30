import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Task, Category } from '@shared/schema';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SimpleTaskCardProps {
  task: Task;
  categories: Category[];
}

// Get badge color based on priority
const getPriorityColor = (priority: string | null) => {
  switch (priority) {
    case 'alta':
      return 'bg-red-500/20 text-red-300 border-red-500/40';
    case 'media':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'baja':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    default:
      return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40';
  }
};

// Get category badge color
const getCategoryColor = (color: string) => {
  switch (color) {
    case 'blue':
      return 'bg-blue-500';
    case 'purple':
      return 'bg-purple-500';
    case 'green':
      return 'bg-emerald-500';
    case 'red':
      return 'bg-rose-500';
    case 'orange':
      return 'bg-amber-500';
    default:
      return 'bg-slate-500';
  }
};

export function SimpleTaskCard({ task, categories }: SimpleTaskCardProps) {
  // Configure task as sortable item for @dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id.toString(),
    data: {
      type: 'task',
      task,
    },
  });

  // Get the task's category
  const category = categories.find(c => c.id === task.categoryId);
  
  // Format date for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return format(new Date(date), "d MMM", { locale: es });
  };

  // Apply styles based on dragging state
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-neon-medium/10 p-3 rounded-lg border border-neon-accent/30 shadow-md",
        "hover:shadow-[0_0_8px_rgba(0,225,255,0.2)] hover:border-neon-accent/50 transition-all duration-200",
        "cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center">
          {category && (
            <div className="flex items-center mr-2">
              <div className={`h-2.5 w-2.5 rounded-full ${getCategoryColor(category.color)}`}></div>
              <span className="text-xs text-neon-text/70 ml-1">{category.name}</span>
            </div>
          )}
        </div>
        
        {task.priority && (
          <Badge variant="outline" className={cn("text-[0.65rem] py-0 px-1.5 h-4", getPriorityColor(task.priority))}>
            {task.priority}
          </Badge>
        )}
      </div>
      
      <h3 className="font-medium text-neon-text mb-1 text-sm">{task.title}</h3>
      
      {task.description && (
        <p className="text-xs text-neon-text/60 line-clamp-2 mb-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between mt-2">
        {task.deadline && (
          <div className="flex items-center text-[0.65rem] text-neon-text/60">
            <Clock className="h-3 w-3 mr-1 text-neon-text/50" />
            {formatDate(task.deadline)}
          </div>
        )}
      </div>
    </div>
  );
}