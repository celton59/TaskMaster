import { useState, useRef } from "react";
import { TaskCard } from "@/components/tasks/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, MoreHorizontal, GripVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Task, Category } from "@shared/schema";

interface TaskColumnProps {
  title: string;
  status: string;
  badgeColor: string;
  tasks: Task[];
  onTaskDrop: (taskId: number, status: string) => void;
  isLoading: boolean;
}

export function TaskColumn({ 
  title, 
  status, 
  badgeColor, 
  tasks, 
  onTaskDrop,
  isLoading 
}: TaskColumnProps) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  
  // Get categories for task cards
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(true);
  };
  
  // Handle drag leave
  const handleDragLeave = () => {
    setIsDropTarget(false);
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    
    const taskId = parseInt(e.dataTransfer.getData("taskId"), 10);
    if (taskId) {
      onTaskDrop(taskId, status);
    }
  };
  
  // Get column styles based on status
  const getColumnStyle = () => {
    switch (status) {
      case "pending":
        return "border-amber-100 bg-white";
      case "in-progress":
        return "border-blue-100 bg-white";
      case "review":
        return "border-purple-100 bg-white";
      case "completed":
        return "border-emerald-100 bg-white";
      default:
        return "border-neutral-100 bg-white";
    }
  };
  
  // Get title badge styles by status
  const getTitleBadge = () => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "review":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };
  
  return (
    <div 
      ref={columnRef}
      className={cn(
        "p-3 rounded-xl border bg-white shadow-sm w-[280px]",
        getColumnStyle(),
        isDropTarget ? "ring-2 ring-primary-400 ring-opacity-50" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-status={status}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={cn("rounded-md py-1 px-2", getTitleBadge())}>
            <div className={`h-2 w-2 rounded-full ${badgeColor} mr-1.5`}></div>
            <span className="font-medium">{title}</span>
          </Badge>
          <Badge variant="outline" className="bg-white text-neutral-600 py-0.5 font-normal">
            {tasks.length}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full hover:bg-neutral-100"
            title="Añadir tarea"
          >
            <Plus size={15} className="text-neutral-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full hover:bg-neutral-100"
            title="Más opciones"
          >
            <MoreHorizontal size={15} className="text-neutral-500" />
          </Button>
        </div>
      </div>

      <div className="space-y-2.5 task-column min-h-[300px]">
        {isLoading ? (
          // Loading skeletons
          Array(2).fill(0).map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-100 animate-pulse">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-4 w-4/5 mt-3" />
              <Skeleton className="h-3 w-full mt-1.5" />
              <Skeleton className="h-3 w-3/4 mt-0.5" />
              <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                <Skeleton className="h-3 w-14 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          // Empty state
          <div className="h-[300px] flex flex-col items-center justify-center">
            <div className="w-full border border-dashed border-neutral-200 rounded-lg p-6 text-center bg-neutral-50/50">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-3">
                <Plus size={18} />
              </div>
              <p className="text-sm font-medium text-neutral-600 mb-1">No hay tareas</p>
              <p className="text-xs text-neutral-500 mb-3">Arrastra tareas aquí o crea una nueva</p>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-white">
                <Plus size={12} className="mr-1" />
                Nueva tarea
              </Button>
            </div>
          </div>
        ) : (
          // Task cards
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              categories={categories}
              onDragStart={() => setIsDropTarget(false)}
            />
          ))
        )}
      </div>
    </div>
  );
}
