import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { TaskColumn } from "@/components/tasks/task-column";
import { TaskFilter } from "@/components/tasks/task-filter";
import { Task, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface TaskBoardProps {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
}

export function TaskBoard({ tasks, categories, isLoading }: TaskBoardProps) {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  
  // Update filtered tasks when tasks or filter changes
  useEffect(() => {
    if (activeFilter === null) {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.categoryId === activeFilter));
    }
  }, [tasks, activeFilter]);
  
  // Task update mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: { taskId: number, updates: Partial<Task> }) => {
      await apiRequest("PATCH", `/api/tasks/${data.taskId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Tarea actualizada",
        description: "La tarea se actualizó correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la tarea: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle drag and drop
  const handleTaskDrop = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({
      taskId,
      updates: { status: newStatus }
    });
  };
  
  // Get tasks by status
  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-neutral-900 mb-4">Tareas por estado</h3>
      
      <TaskFilter 
        categories={categories} 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      
      <div className="flex overflow-x-auto pb-4 scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full min-w-max">
          <TaskColumn 
            title="Pendiente" 
            status="pending"
            badgeColor="bg-warning-500"
            tasks={getTasksByStatus("pending")}
            onTaskDrop={handleTaskDrop}
            isLoading={isLoading}
          />
          
          <TaskColumn 
            title="En progreso" 
            status="in-progress"
            badgeColor="bg-secondary-500"
            tasks={getTasksByStatus("in-progress")}
            onTaskDrop={handleTaskDrop}
            isLoading={isLoading}
          />
          
          <TaskColumn 
            title="Completado" 
            status="completed"
            badgeColor="bg-success-500"
            tasks={getTasksByStatus("completed")}
            onTaskDrop={handleTaskDrop}
            isLoading={isLoading}
          />
          
          <TaskColumn 
            title="Revisión" 
            status="review"
            badgeColor="bg-accent-500"
            tasks={getTasksByStatus("review")}
            onTaskDrop={handleTaskDrop}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
