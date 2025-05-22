import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Mail, Calendar, Bug, Clipboard, Clock, ArrowUpRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Task } from "@shared/schema";
import { useTheme } from "@/hooks/use-theme";

interface RecentTasksListProps {
  tasks: Task[];
  onViewAll: () => void;
}

export function RecentTasksList({ tasks, onViewAll }: RecentTasksListProps) {
  const { isDarkMode } = useTheme();
  
  // Status badge color variants adaptados para modo claro y oscuro
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center">
            <div className={isDarkMode 
              ? "h-2 w-2 rounded-full bg-neon-yellow animation-pulse-yellow shadow-[0_0_8px_rgba(255,234,0,0.7)] mr-2"
              : "h-2 w-2 rounded-full bg-amber-400 mr-2"
            }></div>
            <span className={isDarkMode 
              ? "text-xs font-medium text-neon-yellow text-glow-yellow"
              : "text-xs font-medium text-amber-600"
            }>Pendiente</span>
          </div>
        );
      case "in-progress":
        return (
          <div className="flex items-center">
            <div className={isDarkMode 
              ? "h-2 w-2 rounded-full bg-neon-purple animation-pulse-purple shadow-[0_0_8px_rgba(187,0,255,0.7)] mr-2"
              : "h-2 w-2 rounded-full bg-purple-400 mr-2"
            }></div>
            <span className={isDarkMode 
              ? "text-xs font-medium text-neon-purple text-glow-purple"
              : "text-xs font-medium text-purple-600"
            }>En progreso</span>
          </div>
        );
      case "review":
        return (
          <div className="flex items-center">
            <div className={isDarkMode 
              ? "h-2 w-2 rounded-full bg-neon-pink animation-pulse-pink shadow-[0_0_8px_rgba(255,0,170,0.7)] mr-2"
              : "h-2 w-2 rounded-full bg-pink-400 mr-2"
            }></div>
            <span className={isDarkMode 
              ? "text-xs font-medium text-neon-pink text-glow-pink"
              : "text-xs font-medium text-pink-600"
            }>Revisión</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center">
            <div className={isDarkMode 
              ? "h-2 w-2 rounded-full bg-neon-green animation-pulse-green shadow-[0_0_8px_rgba(0,255,157,0.7)] mr-2"
              : "h-2 w-2 rounded-full bg-emerald-400 mr-2"
            }></div>
            <span className={isDarkMode 
              ? "text-xs font-medium text-neon-green text-glow-green"
              : "text-xs font-medium text-emerald-600"
            }>Completado</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className={isDarkMode 
              ? "h-2 w-2 rounded-full bg-neon-red animation-pulse-red shadow-[0_0_8px_rgba(255,45,109,0.7)] mr-2"
              : "h-2 w-2 rounded-full bg-red-400 mr-2"
            }></div>
            <span className={isDarkMode 
              ? "text-xs font-medium text-neon-red text-glow-red"
              : "text-xs font-medium text-red-600"
            }>Atrasado</span>
          </div>
        );
    }
  };
  
  // Icon for task priority adaptado para tema claro y oscuro
  const getTaskIcon = (priority: string | null) => {
    switch (priority) {
      case "high":
      case "alta":
        return <Badge className={isDarkMode
          ? "bg-neon-darker text-neon-red hover:bg-neon-dark border border-neon-red/40 shadow-[0_0_8px_rgba(255,45,109,0.4)] text-glow-red"
          : "bg-white text-red-600 hover:bg-red-50 border border-red-300"
        }>Alta</Badge>;
      case "medium":
      case "media":
        return <Badge className={isDarkMode
          ? "bg-neon-darker text-neon-yellow hover:bg-neon-dark border border-neon-yellow/40 shadow-[0_0_8px_rgba(255,234,0,0.4)] text-glow-yellow"
          : "bg-white text-amber-600 hover:bg-amber-50 border border-amber-300"
        }>Media</Badge>;
      case "low":
      case "baja":
        return <Badge className={isDarkMode
          ? "bg-neon-darker text-neon-green hover:bg-neon-dark border border-neon-green/40 shadow-[0_0_8px_rgba(0,255,157,0.4)] text-glow-green"
          : "bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-300"
        }>Baja</Badge>;
      default:
        return <Badge className={isDarkMode
          ? "bg-neon-darker text-neon-purple hover:bg-neon-dark border border-neon-purple/40 shadow-[0_0_8px_rgba(187,0,255,0.4)] text-glow-purple"
          : "bg-white text-purple-600 hover:bg-purple-50 border border-purple-300"
        }>Normal</Badge>;
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
        <Clipboard className={isDarkMode 
          ? "mx-auto h-12 w-12 text-neon-accent/40"
          : "mx-auto h-12 w-12 text-blue-400/40"
        } />
        <h3 className={isDarkMode
          ? "mt-2 text-sm font-semibold text-neon-text"
          : "mt-2 text-sm font-semibold text-gray-800"
        }>No hay tareas recientes</h3>
        <p className={isDarkMode
          ? "mt-1 text-sm text-neon-text/60"
          : "mt-1 text-sm text-gray-500"
        }>
          Comienza creando una nueva tarea para tu proyecto.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        {tasks.map((task, index) => (
          <div key={task.id} className={isDarkMode 
            ? "group relative hover:bg-neon-medium/10 px-4 py-3 -mx-3 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-neon-accent/20 mb-3 shadow-sm hover:shadow-[0_0_10px_rgba(0,225,255,0.15)] duration-300"
            : "group relative hover:bg-blue-50/50 px-4 py-3 -mx-3 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200 mb-3 shadow-sm hover:shadow-sm duration-300"
          }>
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-1">
                <h3 className={isDarkMode
                  ? "text-sm font-medium text-neon-text group-hover:text-neon-accent transition-colors pr-4 line-clamp-1"
                  : "text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors pr-4 line-clamp-1"
                }>
                  {task.title}
                </h3>
                <div className={isDarkMode
                  ? "flex items-center text-xs text-neon-text/60"
                  : "flex items-center text-xs text-gray-500"
                }>
                  <Clock className={isDarkMode
                    ? "h-3 w-3 mr-1 text-neon-accent/60"
                    : "h-3 w-3 mr-1 text-blue-500/60"
                  } />
                  <span className="font-medium">{task.createdAt && formatDate(task.createdAt)}</span>
                </div>
              </div>
              <ArrowUpRight className={isDarkMode
                ? "h-4 w-4 text-neon-accent/40 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                : "h-4 w-4 text-blue-500/40 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              } />
            </div>
            
            <div className={isDarkMode
              ? "flex gap-2 items-center justify-between mt-2 pt-2 border-t border-neon-accent/10"
              : "flex gap-2 items-center justify-between mt-2 pt-2 border-t border-gray-200"
            }>
              <div className="flex items-center">
                {getStatusBadge(task.status)}
              </div>
              <div className="flex items-center gap-2">
                {getTaskIcon(task.priority)}
                
                {task.assignedTo && (
                  <Avatar className={isDarkMode
                    ? `h-6 w-6 border ${
                        task.assignedTo === 1 
                          ? 'border-neon-purple/50 shadow-[0_0_8px_rgba(187,0,255,0.3)]' 
                          : 'border-neon-pink/50 shadow-[0_0_8px_rgba(255,0,170,0.3)]'
                        }`
                    : `h-6 w-6 border ${
                        task.assignedTo === 1 
                          ? 'border-purple-200' 
                          : 'border-pink-200'
                        }`
                  }>
                    <AvatarFallback className={isDarkMode
                      ? `text-[10px] ${
                          task.assignedTo === 1 
                            ? 'bg-gradient-to-br from-neon-purple/30 to-neon-darker text-neon-purple text-glow-purple' 
                            : 'bg-gradient-to-br from-neon-pink/30 to-neon-darker text-neon-pink text-glow-pink'
                          }`
                      : `text-[10px] ${
                          task.assignedTo === 1 
                            ? 'bg-purple-50 text-purple-600' 
                            : 'bg-pink-50 text-pink-600'
                          }`
                    }>
                      {task.assignedTo === 1 ? 'AD' : 'US'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={isDarkMode
        ? "mt-6 pt-4 border-t border-neon-accent/30"
        : "mt-6 pt-4 border-t border-gray-200"
      }>
        <Button 
          variant="outline" 
          className={isDarkMode
            ? "w-full text-center text-sm h-9 bg-transparent border border-neon-accent/40 text-neon-accent/90 hover:bg-gradient-to-r hover:from-neon-darker hover:to-neon-accent/20 hover:text-neon-accent hover:border-neon-accent/80 transition-all duration-300 relative overflow-hidden group neon-button"
            : "w-full text-center text-sm h-9 bg-transparent border border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-300 relative overflow-hidden group"
          }
          onClick={onViewAll}
        >
          <span className="z-10 relative">Ver todas las tareas</span>
          {isDarkMode && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-accent/10 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
          )}
        </Button>
      </div>
    </>
  );
}
