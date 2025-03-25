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
      className={`task-card bg-white p-3 rounded-lg shadow-sm border border-neutral-200 cursor-grab group ${isDragging ? 'opacity-50 scale-95' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ 
        y: -2, 
        boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)", 
        borderColor: "rgba(59, 130, 246, 0.3)" 
      }}
      data-task-id={task.id}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex space-x-1.5">
          <div className="flex items-center mt-0.5">
            {getStatusIcon(task.status)}
          </div>
          <Badge 
            variant="outline" 
            className="border-transparent hover:border-transparent bg-neutral-100/80 text-neutral-800 hover:bg-neutral-100 font-normal text-xs"
          >
            {category.name}
          </Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs font-medium">Acciones de tarea</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={editTask} className="text-xs">
              Editar tarea
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="text-xs">
              Cambiar estado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="text-xs">
              Asignar usuario
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={deleteTask} className="text-xs text-red-600">
              Eliminar tarea
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <h4 className="font-medium text-sm text-neutral-900 line-clamp-1">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{task.description}</p>
      )}
      
      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center text-xs text-neutral-500">
          {task.deadline ? (
            <>
              <Calendar className="mr-1" size={12} />
              {formatDate(task.deadline)}
            </>
          ) : (
            <>
              <Clock className="mr-1" size={12} />
              <span className="text-xs">Sin plazo</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {getPriorityBadge(task.priority)}
          
          {task.assignedTo && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-primary-100 text-primary-700">
                {task.assignedTo === 1 ? 'AD' : 'US'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </motion.div>
  );
}
