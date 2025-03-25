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
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200 font-normal text-xs">Alta</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 font-normal text-xs">Media</Badge>;
      case "low":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-normal text-xs">Baja</Badge>;
      default:
        return <Badge className="bg-neutral-100 text-neutral-700 hover:bg-neutral-100 border-neutral-200 font-normal text-xs">Normal</Badge>;
    }
  };
  
  // Get status icon
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
      className={`task-card bg-white p-4 rounded-lg shadow-md border border-neutral-100 cursor-grab group ${isDragging ? 'opacity-50 scale-95' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ 
        y: -2, 
        boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.08)",
        borderColor: "rgba(124, 58, 237, 0.2)" 
      }}
      data-task-id={task.id}
    >
      <div className="flex items-center mb-2 justify-between">
        <div>
          {getPriorityBadge(task.priority)}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border border-neutral-100 shadow-lg p-1">
            <DropdownMenuLabel className="text-xs font-medium text-neutral-800 px-2 py-1.5">Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-neutral-100" />
            <DropdownMenuItem onClick={editTask} className="text-xs rounded-md focus:bg-neutral-50 focus:text-neutral-900 px-2 py-1.5 cursor-pointer">
              Editar tarea
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="text-xs rounded-md focus:bg-neutral-50 focus:text-neutral-900 px-2 py-1.5 cursor-pointer">
              Cambiar estado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="text-xs rounded-md focus:bg-neutral-50 focus:text-neutral-900 px-2 py-1.5 cursor-pointer">
              Asignar usuario
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-neutral-100" />
            <DropdownMenuItem onClick={deleteTask} className="text-xs text-red-600 rounded-md focus:bg-red-50 focus:text-red-600 px-2 py-1.5 cursor-pointer">
              Eliminar tarea
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <h4 className="font-semibold text-sm text-neutral-900 line-clamp-1 leading-relaxed">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      
      <div className="flex items-center space-x-2 mt-2">
        <Badge 
          variant="outline" 
          className="rounded-md border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-200 text-neutral-800 font-normal text-xs py-0 h-5"
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
        <div className="flex items-center text-xs text-neutral-500">
          <div className="flex items-center">
            {getStatusIcon(task.status)}
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center text-xs text-neutral-500">
          {task.deadline ? (
            <>
              <Calendar className="mr-1.5" size={12} />
              <span className="font-medium">{formatDate(task.deadline)}</span>
            </>
          ) : (
            <>
              <Clock className="mr-1.5" size={12} />
              <span className="text-xs">Sin plazo</span>
            </>
          )}
        </div>
        
        <div>
          {task.assignedTo && (
            <Avatar className="h-7 w-7 border-2 border-white ring-1 ring-neutral-200">
              <AvatarFallback className="text-[10px] bg-primary-50 text-primary-700 font-medium">
                {task.assignedTo === 1 ? 'AD' : 'US'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </motion.div>
  );
}
