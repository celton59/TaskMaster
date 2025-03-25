import { useState, useRef } from "react";
import { TaskCard } from "@/components/tasks/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
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
  
  return (
    <div 
      ref={columnRef}
      className={cn(
        "bg-neutral-100/60 p-4 rounded-lg w-80",
        isDropTarget && "drop-target"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-status={status}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-neutral-700 flex items-center">
          <span className={`h-2 w-2 rounded-full ${badgeColor} mr-2`}></span>
          {title}
          <span className="ml-2 text-xs px-1.5 py-0.5 bg-neutral-200 rounded-full">
            {tasks.length}
          </span>
        </h3>
        <button className="text-neutral-500 hover:text-neutral-700">
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3 task-column">
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
