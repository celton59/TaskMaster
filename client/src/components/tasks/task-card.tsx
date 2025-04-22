import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, MoreHorizontal, Clock, ArrowUpRight, 
  CheckCircle2, AlertCircle, AlertTriangle, Star, 
  FlameKindling, Clock4, CircleCheck, CircleEllipsis, Circle
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
import type { Task, Category } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onDragStart: () => void;
}

export function TaskCard({ task, categories, onDragStart }: TaskCardProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  
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
  
  // Get priority badge
  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-rose-900/30 text-rose-400 hover:bg-rose-900/40 border-rose-500/30 font-medium text-xs gap-1">
            <FlameKindling className="h-3 w-3" />
            Alta
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-900/30 text-amber-300 hover:bg-amber-900/40 border-amber-500/30 font-medium text-xs gap-1">
            <Star className="h-3 w-3" />
            Media
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/40 border-emerald-500/30 font-medium text-xs gap-1">
            <Clock4 className="h-3 w-3" />
            Baja
          </Badge>
        );
      default:
        return (
          <Badge className="bg-neon-medium/30 text-neon-text/80 hover:bg-neon-medium/40 border-neon-accent/20 font-medium text-xs gap-1">
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
          icon: <CircleCheck className="h-5 w-5 text-emerald-400" />,
          label: "Completada",
          className: "bg-emerald-900/30 text-emerald-400 border-emerald-600/30"
        };
      case "pending":
        return {
          icon: <Circle className="h-5 w-5 text-amber-300" />,
          label: "Pendiente",
          className: "bg-amber-900/30 text-amber-300 border-amber-600/30"
        };
      case "review":
        return {
          icon: <AlertCircle className="h-5 w-5 text-purple-400" />,
          label: "Revisión",
          className: "bg-purple-900/30 text-purple-400 border-purple-600/30"
        };
      case "in_progress":
      case "in-progress":
        return {
          icon: <CircleEllipsis className="h-5 w-5 text-blue-400" />,
          label: "En progreso",
          className: "bg-blue-900/30 text-blue-400 border-blue-600/30"
        };
      default:
        return {
          icon: <ArrowUpRight className="h-5 w-5 text-neon-text/70" />,
          label: status,
          className: "bg-neon-medium/30 text-neon-text/80 border-neon-accent/20"
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
  const statusInfo = getStatusInfo(task.status);
  const deadlineInfo = getDeadlineInfo(task.deadline);
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id.toString());
    setIsDragging(true);
    onDragStart();
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
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
      ref={dragRef}
      className={cn(
        "task-card p-4 rounded-lg shadow-md border border-neon-accent/20 cursor-grab group",
        "border-l-4",
        getCardStyles(),
        isDragging ? 'opacity-50 scale-95' : ''
      )}
      draggable
      onDragStart={(e) => handleDragStart(e)}
      onDragEnd={() => handleDragEnd()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ 
        y: -2, 
        boxShadow: "0 8px 24px -4px rgba(0, 225, 255, 0.15)"
      }}
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
            <button className="text-neon-text/50 hover:text-neon-accent opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border border-neon-accent/30 bg-neon-darker shadow-[0_0_15px_rgba(0,225,255,0.15)] p-1">
            <DropdownMenuLabel className="text-xs font-medium text-neon-accent px-2 py-1.5">Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-neon-accent/20" />
            <DropdownMenuItem onClick={editTask} className="text-xs rounded-md text-neon-text hover:text-neon-accent focus:bg-neon-medium/20 focus:text-neon-accent px-2 py-1.5 cursor-pointer">
              Editar tarea
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="text-xs rounded-md text-neon-text hover:text-neon-accent focus:bg-neon-medium/20 focus:text-neon-accent px-2 py-1.5 cursor-pointer">
              Cambiar estado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="text-xs rounded-md text-neon-text hover:text-neon-accent focus:bg-neon-medium/20 focus:text-neon-accent px-2 py-1.5 cursor-pointer">
              Asignar usuario
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-neon-accent/20" />
            <DropdownMenuItem onClick={deleteTask} className="text-xs text-rose-400 rounded-md hover:text-rose-300 focus:bg-rose-950/30 focus:text-rose-300 px-2 py-1.5 cursor-pointer">
              Eliminar tarea
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <h4 className="font-semibold text-sm text-neon-text line-clamp-1 leading-relaxed">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs text-neon-text/70 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      
      <div className="flex items-center space-x-2 mt-3">
        <Badge 
          variant="outline" 
          className="rounded-md border border-neon-accent/30 bg-neon-medium/20 hover:bg-neon-medium/30 hover:border-neon-accent/40 text-neon-text/90 font-normal text-xs py-0 h-5"
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
      </div>
      
      {/* Barra de progreso */}
      <div className="mt-3">
        <Progress 
          value={getProgress()} 
          className={cn(
            "h-1.5 bg-neon-medium/30",
            task.status === "completed" ? "progress-green" :
            task.status === "review" ? "progress-purple" :
            task.status === "in_progress" || task.status === "in-progress" ? "progress-blue" :
            getDeadlineStatus(task.deadline) === "overdue" ? "progress-rose" :
            getDeadlineStatus(task.deadline) === "soon" ? "progress-amber" :
            ""
          )}
          indicatorClassName="progress-value"
        />
      </div>
      
      <div className="mt-3 pt-3 border-t border-neon-accent/10 flex items-center justify-between">
        <div className="flex items-center text-xs">
          <div className="flex items-center gap-1">
            {getDeadlineIcon(task.deadline)}
            <span className={deadlineInfo.className.replace('text-neutral-500', 'text-neon-text/60')}>{deadlineInfo.text}</span>
          </div>
        </div>
        
        <div>
          {task.assignedTo && (
            <Avatar className="h-7 w-7 border-2 border-neon-darker ring-1 ring-neon-accent/20 shadow-[0_0_5px_rgba(0,225,255,0.15)]">
              <AvatarFallback className="text-[10px] bg-neon-accent/20 text-neon-accent font-medium">
                {task.assignedTo === 1 ? 'AD' : 'US'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </motion.div>
  );
}
