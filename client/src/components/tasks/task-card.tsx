import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MoreHorizontal, Clock, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  const formatDate = (date: Date | null) => {
    if (!date) return "Sin fecha";
    return format(new Date(date), "d MMM", { locale: es });
  };
  
  // Get category details and color class
  const getCategory = () => {
    const category = categories.find(c => c.id === task.categoryId);
    if (!category) return { name: "Sin categoría", color: "gray" };
    return category;
  };
  
  // Get category color class
  const getCategoryColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "purple":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "green":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "red":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "orange":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200 font-normal text-[10px] px-1.5 py-0">Alta</Badge>;
      case "medium":
        return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 font-normal text-[10px] px-1.5 py-0">Media</Badge>;
      case "low":
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-normal text-[10px] px-1.5 py-0">Baja</Badge>;
      default:
        return <Badge className="bg-neutral-50 text-neutral-600 hover:bg-neutral-50 border border-neutral-200 font-normal text-[10px] px-1.5 py-0">Normal</Badge>;
    }
  };
  
  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "review":
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Delete task
  const deleteTask = async () => {
    try {
      await apiRequest("DELETE", `/api/tasks/${task.id}`, undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente."
      });
    } catch (error) {
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
  
  return (
    <motion.div
      ref={dragRef}
      className={`task-card bg-white p-3.5 rounded-lg shadow-sm border border-neutral-100 cursor-grab group ${isDragging ? 'opacity-50 scale-95' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ 
        y: -2, 
        boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.05)", 
        borderColor: "rgba(124, 58, 237, 0.2)" 
      }}
      data-task-id={task.id}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge 
            className={`font-normal text-xs ${getCategoryColorClass(category.color)}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full mr-1 ${category.color === 'blue' ? 'bg-blue-500' : category.color === 'purple' ? 'bg-purple-500' : category.color === 'green' ? 'bg-emerald-500' : category.color === 'red' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
            {category.name}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={`border border-neutral-200 bg-white font-normal text-xs text-neutral-600 flex items-center`}
          >
            {getStatusIcon(task.status)}
            <span className="ml-1">
              {task.status === 'pending' ? 'Pendiente' : 
               task.status === 'in-progress' ? 'En progreso' : 
               task.status === 'review' ? 'Revisión' : 'Completado'}
            </span>
          </Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-50 rounded-full h-6 w-6 flex items-center justify-center">
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl border-neutral-100 shadow-lg">
            <DropdownMenuLabel className="text-xs font-medium text-neutral-800">Acciones de tarea</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-100" />
            <DropdownMenuItem onClick={editTask} className="text-xs focus:bg-neutral-50 focus:text-neutral-900">
              Editar tarea
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="text-xs focus:bg-neutral-50 focus:text-neutral-900">
              Cambiar estado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="text-xs focus:bg-neutral-50 focus:text-neutral-900">
              Asignar usuario
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-100" />
            <DropdownMenuItem onClick={deleteTask} className="text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50">
              Eliminar tarea
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <h4 className="font-semibold text-sm text-neutral-900 line-clamp-1 mb-1">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs text-neutral-600 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      
      <div className="mt-2 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center text-xs text-neutral-500">
          {task.deadline ? (
            <div className="flex items-center bg-neutral-50 rounded-full px-2 py-0.5 border border-neutral-200">
              <Calendar className="mr-1 text-neutral-400" size={10} />
              {formatDate(task.deadline)}
            </div>
          ) : (
            <div className="flex items-center bg-neutral-50 rounded-full px-2 py-0.5 border border-neutral-200">
              <Clock className="mr-1 text-neutral-400" size={10} />
              <span className="text-xs">Sin plazo</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {getPriorityBadge(task.priority)}
          
          {task.assignedTo && (
            <Avatar className="h-5 w-5 border border-white ring-1 ring-neutral-200">
              <AvatarFallback className="text-[9px] bg-primary-50 text-primary-700 font-medium">
                {task.assignedTo === 1 ? 'AD' : 'US'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </motion.div>
  );
}
