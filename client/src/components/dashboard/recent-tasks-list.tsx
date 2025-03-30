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
            <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)] mr-2"></div>
            <span className="text-xs font-medium text-neon-text">Pendiente</span>
          </div>
        );
      case "in-progress":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)] mr-2"></div>
            <span className="text-xs font-medium text-neon-text">En progreso</span>
          </div>
        );
      case "review":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)] mr-2"></div>
            <span className="text-xs font-medium text-neon-text">Revisión</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] mr-2"></div>
            <span className="text-xs font-medium text-neon-text">Completado</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)] mr-2"></div>
            <span className="text-xs font-medium text-neon-text">Atrasado</span>
          </div>
        );
    }
  };
  
  // Icon for task priority
  const getTaskIcon = (priority: string | null) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-rose-900/30 text-rose-300 hover:bg-rose-900/40 border-rose-800/50 shadow-[0_0_5px_rgba(244,63,94,0.3)]">Alta</Badge>;
      case "medium":
        return <Badge className="bg-amber-900/30 text-amber-300 hover:bg-amber-900/40 border-amber-800/50 shadow-[0_0_5px_rgba(245,158,11,0.3)]">Media</Badge>;
      case "low":
        return <Badge className="bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/40 border-emerald-800/50 shadow-[0_0_5px_rgba(16,185,129,0.3)]">Baja</Badge>;
      default:
        return <Badge className="bg-neon-medium/30 text-neon-text hover:bg-neon-medium/40 border-neon-accent/30 shadow-[0_0_5px_rgba(0,225,255,0.3)]">Normal</Badge>;
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
        <Clipboard className="mx-auto h-12 w-12 text-neon-accent/40" />
        <h3 className="mt-2 text-sm font-semibold text-neon-text">No hay tareas recientes</h3>
        <p className="mt-1 text-sm text-neon-text/60">
          Comienza creando una nueva tarea para tu proyecto.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        {tasks.map((task, index) => (
          <div key={task.id} className="group relative hover:bg-neon-medium/10 px-3 py-3 -mx-3 rounded-md transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-neon-text group-hover:text-neon-accent transition-colors pr-4">
                  {task.title}
                </h3>
                <div className="flex items-center text-xs text-neon-text/60">
                  <Clock className="h-3 w-3 mr-1 text-neon-accent/60" />
                  {task.createdAt && formatDate(task.createdAt)}
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-neon-accent/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center">
                {getStatusBadge(task.status)}
              </div>
              <div className="flex items-center gap-2">
                {getTaskIcon(task.priority)}
                
                {task.assignedTo && (
                  <Avatar className="h-6 w-6 border border-neon-accent/30 shadow-[0_0_5px_rgba(0,225,255,0.2)]">
                    <AvatarFallback className="text-[10px] bg-neon-medium/50 text-neon-accent">
                      {task.assignedTo === 1 ? 'AD' : 'US'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-neon-accent/30">
        <Button 
          variant="outline" 
          className="w-full text-center text-sm h-9 bg-transparent border border-neon-accent/40 text-neon-text hover:bg-neon-accent/10 hover:text-neon-accent transition-colors neon-button" 
          onClick={onViewAll}
        >
          Ver todas las tareas
        </Button>
      </div>
    </>
  );
}
