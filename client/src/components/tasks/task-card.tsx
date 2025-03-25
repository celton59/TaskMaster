import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Calendar, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AvatarGroup } from "@/components/ui/avatar-group";
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
  
  // Get category color class
  const getCategoryColorClass = (color: string) => {
    switch (color) {
      case "blue": return "bg-primary-100 text-primary-800";
      case "purple": return "bg-secondary-100 text-secondary-800";
      case "orange": return "bg-accent-100 text-accent-800";
      case "green": return "bg-success-100 text-success-800";
      case "red": return "bg-error-100 text-error-800";
      default: return "bg-gray-100 text-gray-800";
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
      className={`task-card bg-white p-4 rounded-lg shadow-sm border border-neutral-200 cursor-grab ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      data-task-id={task.id}
    >
      <div className="flex justify-between items-start">
        <Badge className={getCategoryColorClass(category.color)}>
          {category.name}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-neutral-400 hover:text-neutral-700">
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={editTask}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={deleteTask} className="text-red-600">Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <h4 className="font-medium text-neutral-900 mt-2">{task.title}</h4>
      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{task.description}</p>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center text-xs text-neutral-500">
          <Calendar className="mr-1" size={12} />
          {task.deadline ? formatDate(task.deadline) : "Sin fecha"}
        </div>
        
        <AvatarGroup
          avatars={[
            { fallback: "U1", alt: "User 1" },
            ...(task.priority === "high" ? [{ fallback: "U2", alt: "User 2" }] : []),
            ...(task.status === "review" ? [{ fallback: "U3", alt: "User 3" }] : [])
          ]}
        />
      </div>
    </motion.div>
  );
}
