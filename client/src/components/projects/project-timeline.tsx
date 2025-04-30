import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Task } from "@shared/schema";
import { cn } from "@/lib/utils";
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react";

type TimelineProps = {
  tasks: Task[];
};

export function ProjectTimeline({ tasks = [] }: TimelineProps) {
  // Ordenar las tareas por fecha de inicio
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      return aDate - bDate;
    });
  }, [tasks]);

  // Formatear fecha
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "Sin fecha";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return format(date, "d MMM yyyy", { locale: es });
  };

  // Si no hay tareas, mostrar mensaje
  if (!sortedTasks.length) {
    return (
      <div className="text-center py-6 text-neon-text/70">
        No hay tareas para mostrar en la línea de tiempo.
      </div>
    );
  }

  return (
    <div className="relative mt-4">
      {/* Línea vertical de la timeline */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-neon-accent/30" />

      {/* Tareas en timeline */}
      <div className="space-y-8 relative">
        {sortedTasks.map((task, index) => {
          // Determinar el color según el estado
          const statusColor = 
            task.status === 'completed' ? 'bg-emerald-500 border-emerald-500/30' :
            task.status === 'in_progress' || task.status === 'in-progress' ? 'bg-amber-500 border-amber-500/30' :
            task.status === 'review' ? 'bg-blue-500 border-blue-500/30' :
            'bg-rose-500 border-rose-500/30';
          
          // Ícono según el estado
          const StatusIcon = 
            task.status === 'completed' ? CheckCircle :
            task.status === 'in_progress' || task.status === 'in-progress' ? Clock :
            task.status === 'review' ? Clock :
            AlertCircle;
          
          return (
            <div key={task.id} className="relative pl-12">
              {/* Círculo de la línea temporal */}
              <div className={cn(
                "absolute left-3.5 top-1.5 w-3 h-3 rounded-full -translate-x-1/2",
                statusColor
              )} />
              
              {/* Contenido de la tarea */}
              <div className={cn(
                "p-4 rounded-lg border",
                "bg-neon-medium/20 border-neon-accent/20",
                "hover:border-neon-accent/40 transition-all duration-300",
                "shadow-[0_0_15px_rgba(0,225,255,0.1)]",
                "cursor-pointer"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-neon-text">{task.title}</h3>
                  <StatusIcon className={cn(
                    "h-5 w-5",
                    task.status === 'completed' ? "text-emerald-400" :
                    task.status === 'in_progress' || task.status === 'in-progress' ? "text-amber-400" :
                    task.status === 'review' ? "text-blue-400" :
                    "text-rose-400"
                  )} />
                </div>
                
                {task.description && (
                  <p className="text-sm text-neon-text/70 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  {/* Fecha de inicio */}
                  <div className="flex items-center text-neon-text/80">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1 text-neon-accent/70" />
                    <span>Inicio: {formatDate(task.startDate)}</span>
                  </div>
                  
                  {/* Fecha límite */}
                  {task.deadline && (
                    <div className="flex items-center text-neon-text/80">
                      <Clock className="h-3.5 w-3.5 mr-1 text-neon-accent/70" />
                      <span>Límite: {formatDate(task.deadline)}</span>
                    </div>
                  )}
                  
                  {/* Prioridad */}
                  <div className="ml-auto">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      task.priority === 'alta' ? "bg-rose-500/20 text-rose-300" :
                      task.priority === 'media' ? "bg-amber-500/20 text-amber-300" :
                      "bg-blue-500/20 text-blue-300"
                    )}>
                      {task.priority || "Normal"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}