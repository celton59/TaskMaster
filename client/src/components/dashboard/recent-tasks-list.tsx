import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Mail, Calendar, Bug, Clipboard, Clock, ArrowUpRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Task } from "@shared/schema";

interface RecentTasksListProps {
  tasks: Task[];
  onViewAll: () => void;
}

export function RecentTasksList({ tasks, onViewAll }: RecentTasksListProps) {
  // Status badge color variants
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
            <span className="text-xs font-medium">Pendiente</span>
          </div>
        );
      case "in-progress":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs font-medium">En progreso</span>
          </div>
        );
      case "review":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-xs font-medium">Revisión</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
            <span className="text-xs font-medium">Completado</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-rose-500 mr-2"></div>
            <span className="text-xs font-medium">Atrasado</span>
          </div>
        );
    }
  };
  
  // Icon for task priority
  const getTaskIcon = (priority: string | null) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">Alta</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Media</Badge>;
      case "low":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Baja</Badge>;
      default:
        return <Badge className="bg-neutral-100 text-neutral-700 hover:bg-neutral-100 border-neutral-200">Normal</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const taskDate = new Date(date);
    
    if (now.toDateString() === taskDate.toDateString()) {
      return "Hoy, " + format(taskDate, "HH:mm");
    }
    
    // If within one week
    if (now.getTime() - taskDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(taskDate, { locale: es, addSuffix: true });
    }
    
    return format(taskDate, "d MMM, yyyy", { locale: es });
  };
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Clipboard className="mx-auto h-12 w-12 text-neutral-300" />
        <h3 className="mt-2 text-sm font-semibold text-neutral-900">No hay tareas recientes</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Comienza creando una nueva tarea para tu proyecto.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        {tasks.map((task, index) => (
          <div key={task.id} className="group relative hover:bg-neutral-50 px-3 py-3 -mx-3 rounded-md transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-neutral-900 group-hover:text-primary-700 transition-colors pr-4">
                  {task.title}
                </h3>
                <div className="flex items-center text-xs text-neutral-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.createdAt && formatDate(task.createdAt)}
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center">
                {getStatusBadge(task.status)}
              </div>
              <div className="flex items-center gap-2">
                {getTaskIcon(task.priority)}
                
                {task.assignedTo && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-primary-100 text-primary-700">
                      {task.assignedTo === 1 ? 'AD' : 'US'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <Button 
          variant="outline" 
          className="w-full text-center text-sm h-9" 
          onClick={onViewAll}
        >
          Ver todas las tareas
        </Button>
      </div>
    </>
  );
}
