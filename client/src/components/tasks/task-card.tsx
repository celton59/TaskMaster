import { useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, MoreHorizontal, Clock, ArrowUpRight, 
  CheckCircle2, AlertCircle, AlertTriangle, Star, 
  FlameKindling, Clock4, CircleCheck, CircleEllipsis, Circle,
  Folders, GripVertical
} from "lucide-react";
import { format, isBefore, addDays, isAfter, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import type { Task, Category, Project } from "@shared/schema";
import { useTheme } from "@/hooks/use-theme";

interface TaskCardProps {
  task: Task;
  categories: Category[];
  projects?: Project[];
  onDragStart: () => void;
}

export function TaskCard({ task, categories, projects = [], onDragStart: parentOnDragStart }: TaskCardProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { isDarkMode } = useTheme();
  
  // Configurar la tarea como un elemento draggable para @dnd-kit
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });
  
  // Notificar al padre cuando comience el arrastre
  useEffect(() => {
    if (isDragging) {
      parentOnDragStart();
    }
  }, [isDragging, parentOnDragStart]);
  
  // Format the date
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Sin fecha";
    return format(new Date(date), "d MMM", { locale: es });
  };
  
  // Check if date is today
  const isToday = (date: Date | string | null) => {
    if (!date) return false;
    const today = new Date();
    const taskDate = new Date(date);
    return (
      today.getDate() === taskDate.getDate() &&
      today.getMonth() === taskDate.getMonth() &&
      today.getFullYear() === taskDate.getFullYear()
    );
  };
  
  // Get deadline status
  const getDeadlineStatus = (deadline: Date | string | null) => {
    if (!deadline) return "none";
    
    const today = new Date();
    const taskDeadline = new Date(deadline);
    const threeDaysFromNow = addDays(today, 3);
    
    if (isBefore(taskDeadline, today)) {
      return "overdue"; // Fecha vencida
    } else if (isBefore(taskDeadline, threeDaysFromNow)) {
      return "soon"; // Próximo a vencer (3 días)
    } else {
      return "ok"; // Fecha normal
    }
  };
  
  // Get days until deadline or days overdue
  const getDaysUntilDeadline = (deadline: Date | string | null) => {
    if (!deadline) return 0;
    
    const today = new Date();
    const taskDeadline = new Date(deadline);
    
    return differenceInDays(taskDeadline, today);
  };
  
  // Get deadline text and style
  const getDeadlineInfo = (deadline: Date | string | null) => {
    if (!deadline) return { text: "Sin fecha", className: "text-neutral-500" };
    
    const status = getDeadlineStatus(deadline);
    const days = getDaysUntilDeadline(deadline);
    
    if (status === "overdue") {
      return { 
        text: `${Math.abs(days)} día${Math.abs(days) > 1 ? 's' : ''} de retraso`, 
        className: "text-rose-600 font-medium"
      };
    } else if (status === "soon") {
      if (isToday(deadline)) {
        return { text: "¡Hoy!", className: "text-amber-600 font-medium" };
      } else {
        return { 
          text: `En ${days} día${days > 1 ? 's' : ''}`, 
          className: "text-amber-600 font-medium" 
        };
      }
    } else {
      return { 
        text: formatDate(deadline), 
        className: "text-neutral-500 font-medium" 
      };
    }
  };
  
  // Get deadline icon
  const getDeadlineIcon = (deadline: Date | string | null) => {
    if (!deadline) return <Clock size={14} className="text-neon-text/50" />;
    
    const status = getDeadlineStatus(deadline);
    
    if (status === "overdue") {
      return <AlertTriangle size={14} className="text-rose-400" />;
    } else if (status === "soon") {
      return <AlertCircle size={14} className="text-amber-300" />;
    } else {
      return <Calendar size={14} className="text-neon-accent" />;
    }
  };
  
  // Get category details
  const getCategory = () => {
    const category = categories.find(c => c.id === task.categoryId);
    if (!category) return { name: "Sin categoría", color: "gray" };
    return category;
  };
  
  // Get project details
  const getProject = () => {
    // Verifica si hay un ID de proyecto asignado
    // Buscar primero como projectId (camelCase en el esquema) o project_id (snake_case en DB)
    const projectId = task.projectId || (task as any).project_id;
    
    if (!projectId) return null;
    
    const project = projects.find(p => p.id === projectId);
    return project || null;
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case "high":
        return (
          <Badge className={cn(
            "font-medium text-xs gap-1",
            isDarkMode 
              ? "bg-rose-900/30 text-rose-400 hover:bg-rose-900/40 border-rose-500/30"
              : "bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
          )}>
            <FlameKindling className="h-3 w-3" />
            Alta
          </Badge>
        );
      case "medium":
        return (
          <Badge className={cn(
            "font-medium text-xs gap-1",
            isDarkMode 
              ? "bg-amber-900/30 text-amber-300 hover:bg-amber-900/40 border-amber-500/30"
              : "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200"
          )}>
            <Star className="h-3 w-3" />
            Media
          </Badge>
        );
      case "low":
        return (
          <Badge className={cn(
            "font-medium text-xs gap-1",
            isDarkMode 
              ? "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/40 border-emerald-500/30"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
          )}>
            <Clock4 className="h-3 w-3" />
            Baja
          </Badge>
        );
      default:
        return (
          <Badge className={cn(
            "font-medium text-xs gap-1",
            isDarkMode 
              ? "bg-neon-medium/30 text-neon-text/80 hover:bg-neon-medium/40 border-neon-accent/20"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
          )}>
            <Circle className="h-3 w-3" />
            Normal
          </Badge>
        );
    }
  };
  
  // Get priority color for indicator
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-rose-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-emerald-500";
      default:
        return "bg-neutral-300";
    }
  };
  
  // Get status icon and style
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: <CircleCheck className={`h-5 w-5 ${isDarkMode ? "text-emerald-400" : "text-emerald-500"}`} />,
          label: "Completada",
          className: isDarkMode 
            ? "bg-emerald-900/30 text-emerald-400 border-emerald-600/30"
            : "bg-emerald-50 text-emerald-600 border-emerald-200"
        };
      case "pending":
        return {
          icon: <Circle className={`h-5 w-5 ${isDarkMode ? "text-amber-300" : "text-amber-500"}`} />,
          label: "Pendiente",
          className: isDarkMode
            ? "bg-amber-900/30 text-amber-300 border-amber-600/30"
            : "bg-amber-50 text-amber-600 border-amber-200"
        };
      case "review":
        return {
          icon: <AlertCircle className={`h-5 w-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />,
          label: "Revisión",
          className: isDarkMode
            ? "bg-purple-900/30 text-purple-400 border-purple-600/30"
            : "bg-purple-50 text-purple-600 border-purple-200"
        };
      case "in_progress":
      case "in-progress":
        return {
          icon: <CircleEllipsis className={`h-5 w-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />,
          label: "En progreso",
          className: isDarkMode
            ? "bg-blue-900/30 text-blue-400 border-blue-600/30"
            : "bg-blue-50 text-blue-600 border-blue-200"
        };
      default:
        return {
          icon: <ArrowUpRight className={`h-5 w-5 ${isDarkMode ? "text-neon-text/70" : "text-gray-500"}`} />,
          label: status,
          className: isDarkMode
            ? "bg-neon-medium/30 text-neon-text/80 border-neon-accent/20"
            : "bg-gray-50 text-gray-600 border-gray-200"
        };
    }
  };
  
  // Delete task
  const deleteTask = async () => {
    try {
      // Hacemos la solicitud DELETE directamente con fetch para manejar el status 204
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (response.ok) {
        // Invalidamos las consultas relacionadas
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
        
        toast({
          title: "Tarea eliminada",
          description: "La tarea ha sido eliminada correctamente."
        });
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea.",
        variant: "destructive"
      });
    }
  };
  
  // Edit task
  const editTask = () => {
    navigate(`/tasks/${task.id}`);
  };
  
  const category = getCategory();
  const project = getProject();
  const statusInfo = getStatusInfo(task.status);
  const deadlineInfo = getDeadlineInfo(task.deadline);
  
  // Get card border and background styles
  const getCardStyles = () => {
    // Aplica estilo basado en estado
    if (task.status === "completed") {
      return "border-l-emerald-500 bg-neon-darker/50 shadow-[0_0_8px_rgba(16,185,129,0.15)]";
    } else if (getDeadlineStatus(task.deadline) === "overdue" && task.status !== "completed") {
      return "border-l-rose-500 bg-neon-darker/50 shadow-[0_0_8px_rgba(244,63,94,0.15)]";
    } else if (getDeadlineStatus(task.deadline) === "soon" && task.status !== "completed") {
      return "border-l-amber-500 bg-neon-darker/50 shadow-[0_0_8px_rgba(245,158,11,0.15)]";
    } else if (task.status === "in_progress" || task.status === "in-progress") {
      return "border-l-blue-500 bg-neon-darker/50 shadow-[0_0_8px_rgba(59,130,246,0.15)]";
    } else if (task.status === "review") {
      return "border-l-purple-500 bg-neon-darker/50 shadow-[0_0_8px_rgba(168,85,247,0.15)]";
    }
    
    // Por defecto, estilo basado en prioridad
    switch (task.priority) {
      case "high": 
        return "border-l-rose-500 bg-neon-darker/50 shadow-[0_0_8px_rgba(244,63,94,0.15)]";
      case "medium": 
        return "border-l-amber-500 bg-neon-darker/50 shadow-[0_0_8px_rgba(245,158,11,0.15)]";
      case "low": 
        return "border-l-emerald-500 bg-neon-darker/50 shadow-[0_0_8px_rgba(16,185,129,0.15)]";
      default: 
        return "border-l-neon-accent bg-neon-darker/50 shadow-[0_0_8px_rgba(0,225,255,0.15)]";
    }
  };
  
  // Calculate progress (mock value for visualization)
  const getProgress = () => {
    if (task.status === "completed") return 100;
    if (task.status === "review") return 75;
    if (task.status === "in_progress" || task.status === "in-progress") return 50;
    if (task.status === "pending") return 0;
    return 0;
  };
  
  return (
    <motion.div
      ref={setNodeRef}
      className={cn(
        "task-card p-4 rounded-lg cursor-grab group border-l-4",
        isDarkMode 
          ? "shadow-md border border-neon-accent/20" 
          : "shadow-sm border border-gray-200 bg-white",
        getCardStyles(),
        isDragging ? 'opacity-50 scale-95' : ''
      )}
      {...attributes}
      {...listeners}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={!isDragging ? { 
        y: -2, 
        boxShadow: isDarkMode 
          ? "0 8px 24px -4px rgba(0, 225, 255, 0.15)" 
          : "0 8px 24px -4px rgba(0, 0, 0, 0.08)"
      } : undefined}
      data-task-id={task.id}
      data-priority={task.priority}
      data-status={task.status}
    >
      <div className="flex items-center mb-3 justify-between">
        <div className="flex items-center gap-2">
          {getPriorityBadge(task.priority)}
          
          <Badge 
            variant="outline" 
            className={cn(
              "border text-xs font-medium rounded-md py-0 px-2 gap-1 flex items-center h-6",
              statusInfo.className
            )}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={isDarkMode
              ? "text-neon-text/50 hover:text-neon-accent opacity-0 group-hover:opacity-100 transition-opacity"
              : "text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
            }>
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={isDarkMode
            ? "w-48 rounded-xl border border-neon-accent/30 bg-neon-darker shadow-[0_0_15px_rgba(0,225,255,0.15)] p-1"
            : "w-48 rounded-xl border border-gray-200 bg-white shadow-md p-1"
          }>
            <DropdownMenuLabel className={isDarkMode
              ? "text-xs font-medium text-neon-accent px-2 py-1.5"
              : "text-xs font-medium text-blue-700 px-2 py-1.5"
            }>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator className={isDarkMode 
              ? "my-1 bg-neon-accent/20" 
              : "my-1 bg-gray-200"
            } />
            <DropdownMenuItem onClick={editTask} className={isDarkMode
              ? "text-xs rounded-md text-neon-text hover:text-neon-accent focus:bg-neon-medium/20 focus:text-neon-accent px-2 py-1.5 cursor-pointer"
              : "text-xs rounded-md text-gray-700 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 px-2 py-1.5 cursor-pointer"
            }>
              Editar tarea
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className={isDarkMode
              ? "text-xs rounded-md text-neon-text hover:text-neon-accent focus:bg-neon-medium/20 focus:text-neon-accent px-2 py-1.5 cursor-pointer"
              : "text-xs rounded-md text-gray-700 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 px-2 py-1.5 cursor-pointer"
            }>
              Cambiar estado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className={isDarkMode
              ? "text-xs rounded-md text-neon-text hover:text-neon-accent focus:bg-neon-medium/20 focus:text-neon-accent px-2 py-1.5 cursor-pointer"
              : "text-xs rounded-md text-gray-700 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 px-2 py-1.5 cursor-pointer"
            }>
              Asignar usuario
            </DropdownMenuItem>
            <DropdownMenuSeparator className={isDarkMode 
              ? "my-1 bg-neon-accent/20" 
              : "my-1 bg-gray-200"
            } />
            <DropdownMenuItem onClick={deleteTask} className={isDarkMode
              ? "text-xs text-rose-400 rounded-md hover:text-rose-300 focus:bg-rose-950/30 focus:text-rose-300 px-2 py-1.5 cursor-pointer"
              : "text-xs text-rose-600 rounded-md hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700 px-2 py-1.5 cursor-pointer"
            }>
              Eliminar tarea
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <h4 className={isDarkMode 
        ? "font-semibold text-sm text-neon-text line-clamp-1 leading-relaxed"
        : "font-semibold text-sm text-gray-800 line-clamp-1 leading-relaxed"
      }>{task.title}</h4>
      
      {task.description && (
        <p className={isDarkMode
          ? "text-xs text-neon-text/70 mt-1 line-clamp-2 leading-relaxed"
          : "text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed"
        }>{task.description}</p>
      )}
      
      <div className="flex items-center flex-wrap gap-2 mt-3">
        <Badge 
          variant="outline" 
          className={`rounded-md border py-0 h-5 font-normal text-xs ${
            isDarkMode ? (
              category.color === "blue" ? "border-blue-500/30 bg-blue-900/20 hover:bg-blue-900/30 hover:border-blue-500/40 text-blue-400" : 
              category.color === "green" ? "border-emerald-500/30 bg-emerald-900/20 hover:bg-emerald-900/30 hover:border-emerald-500/40 text-emerald-400" :
              category.color === "red" ? "border-rose-500/30 bg-rose-900/20 hover:bg-rose-900/30 hover:border-rose-500/40 text-rose-400" :
              category.color === "purple" ? "border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/30 hover:border-purple-500/40 text-purple-400" :
              category.color === "orange" ? "border-amber-500/30 bg-amber-900/20 hover:bg-amber-900/30 hover:border-amber-500/40 text-amber-300" :
              "border-neon-accent/30 bg-neon-medium/20 hover:bg-neon-medium/30 hover:border-neon-accent/40 text-neon-text/90"
            ) : (
              category.color === "blue" ? "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-blue-700" : 
              category.color === "green" ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-700" :
              category.color === "red" ? "border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 text-rose-700" :
              category.color === "purple" ? "border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 text-purple-700" :
              category.color === "orange" ? "border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 text-amber-700" :
              "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 text-gray-700"
            )
          }`}
        >
          <div className={`h-2 w-2 rounded-full mr-1.5 ${
            category.color === "blue" ? "bg-blue-500" :
            category.color === "green" ? "bg-emerald-500" :
            category.color === "red" ? "bg-rose-500" :
            category.color === "purple" ? "bg-purple-500" :
            category.color === "orange" ? "bg-amber-500" : "bg-slate-500"
          }`}></div>
          {category.name}
        </Badge>
        
        {project && (
          <Badge 
            variant="outline" 
            className={`rounded-md border py-0 h-5 font-normal text-xs flex items-center max-w-[140px] ${
              isDarkMode ? (
                project.color === "blue" ? "border-blue-500/30 bg-blue-900/20 hover:bg-blue-900/30 hover:border-blue-500/40 text-blue-400" : 
                project.color === "green" ? "border-emerald-500/30 bg-emerald-900/20 hover:bg-emerald-900/30 hover:border-emerald-500/40 text-emerald-400" :
                project.color === "red" ? "border-rose-500/30 bg-rose-900/20 hover:bg-rose-900/30 hover:border-rose-500/40 text-rose-400" :
                project.color === "purple" ? "border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/30 hover:border-purple-500/40 text-purple-400" :
                project.color === "orange" ? "border-amber-500/30 bg-amber-900/20 hover:bg-amber-900/30 hover:border-amber-500/40 text-amber-300" :
                project.color === "cyan" ? "border-cyan-500/30 bg-cyan-900/20 hover:bg-cyan-900/30 hover:border-cyan-500/40 text-cyan-400" :
                project.color === "pink" ? "border-pink-500/30 bg-pink-900/20 hover:bg-pink-900/30 hover:border-pink-500/40 text-pink-400" :
                project.color === "yellow" ? "border-yellow-500/30 bg-yellow-900/20 hover:bg-yellow-900/30 hover:border-yellow-500/40 text-yellow-300" :
                "border-neon-accent/30 bg-neon-medium/20 hover:bg-neon-medium/30 hover:border-neon-accent/40 text-neon-accent"
              ) : (
                project.color === "blue" ? "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-blue-700" : 
                project.color === "green" ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-700" :
                project.color === "red" ? "border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 text-rose-700" :
                project.color === "purple" ? "border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 text-purple-700" :
                project.color === "orange" ? "border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 text-amber-700" :
                project.color === "cyan" ? "border-cyan-200 bg-cyan-50 hover:bg-cyan-100 hover:border-cyan-300 text-cyan-700" :
                project.color === "pink" ? "border-pink-200 bg-pink-50 hover:bg-pink-100 hover:border-pink-300 text-pink-700" :
                project.color === "yellow" ? "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 text-yellow-700" :
                "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 text-gray-700"
              )
            }`}
          >
            <Folders className={isDarkMode ? "h-3 w-3 mr-1.5 flex-shrink-0" : "h-3 w-3 mr-1.5 text-gray-500 flex-shrink-0"} />
            <span className="truncate">{project.name}</span>
          </Badge>
        )}
      </div>
      
      {/* Barra de progreso */}
      <div className="mt-3">
        <Progress 
          value={getProgress()} 
          className={cn(
            isDarkMode ? "h-1.5 bg-neon-medium/30" : "h-1.5 bg-gray-100",
            isDarkMode ? (
              task.status === "completed" ? "progress-green" :
              task.status === "review" ? "progress-purple" :
              task.status === "in_progress" || task.status === "in-progress" ? "progress-blue" :
              getDeadlineStatus(task.deadline) === "overdue" ? "progress-rose" :
              getDeadlineStatus(task.deadline) === "soon" ? "progress-amber" : ""
            ) : (
              task.status === "completed" ? "progress-light-green" :
              task.status === "review" ? "progress-light-purple" :
              task.status === "in_progress" || task.status === "in-progress" ? "progress-light-blue" :
              getDeadlineStatus(task.deadline) === "overdue" ? "progress-light-rose" :
              getDeadlineStatus(task.deadline) === "soon" ? "progress-light-amber" : ""
            )
          )}
          indicatorClassName="progress-value"
        />
      </div>
      
      <div className={isDarkMode
        ? "mt-3 pt-3 border-t border-neon-accent/10 flex items-center justify-between"
        : "mt-3 pt-3 border-t border-gray-200 flex items-center justify-between"
      }>
        <div className="flex items-center text-xs">
          <div className="flex items-center gap-1">
            {getDeadlineIcon(task.deadline)}
            <span className={isDarkMode 
              ? deadlineInfo.className.replace('text-neutral-500', 'text-neon-text/60')
              : deadlineInfo.className.replace('text-neutral-500', 'text-gray-500')
            }>{deadlineInfo.text}</span>
          </div>
        </div>
        
        <div>
          {task.assignedTo && (
            <Avatar className={isDarkMode
              ? "h-7 w-7 border-2 border-neon-darker ring-1 ring-neon-accent/20 shadow-[0_0_5px_rgba(0,225,255,0.15)]"
              : "h-7 w-7 border-2 border-white ring-1 ring-blue-100 shadow-sm"
            }>
              <AvatarFallback className={isDarkMode
                ? "text-[10px] bg-neon-accent/20 text-neon-accent font-medium"
                : "text-[10px] bg-blue-100 text-blue-600 font-medium"
              }>
                {task.assignedTo === 1 ? 'AD' : 'US'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </motion.div>
  );
}
