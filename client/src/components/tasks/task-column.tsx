import { useState, useRef } from "react";
import { TaskCard } from "@/components/tasks/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, GripVertical } from "lucide-react";
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
        return "border-amber-200 bg-amber-50/50";
      case "in-progress":
        return "border-blue-200 bg-blue-50/50";
      case "review":
        return "border-purple-200 bg-purple-50/50";
      case "completed":
        return "border-emerald-200 bg-emerald-50/50";
      default:
        return "border-neutral-200 bg-neutral-50/60";
    }
  };
  
  return (
    <div 
      ref={columnRef}
      className={cn(
        "p-2 rounded-xl w-80 border",
        getColumnStyle(),
        isDropTarget ? "ring-2 ring-primary-300 ring-inset" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-status={status}
    >
      <div className="flex items-center justify-between p-2 mb-2">
        <div className="flex items-center">
          <div className={`h-2.5 w-2.5 rounded-full ${badgeColor} mr-2.5`}></div>
          <h3 className="font-medium text-neutral-700">
            {title}
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-white border border-neutral-200 rounded-full text-neutral-600">
              {tasks.length}
            </span>
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full"
            title="Añadir tarea"
          >
            <Plus size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full text-neutral-400"
            title="Mover columna"
          >
            <GripVertical size={14} />
          </Button>
        </div>
      </div>

      <div className="space-y-2 task-column px-1 min-h-[200px]">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-5 w-full mt-2" />
              <Skeleton className="h-3 w-full mt-1" />
              <Skeleton className="h-3 w-3/4 mt-0.5" />
              <div className="mt-3 flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-400">
            <div className="w-full border-2 border-dashed border-neutral-200 rounded-lg p-4">
              <p className="text-sm">Arrastra tareas aquí</p>
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
