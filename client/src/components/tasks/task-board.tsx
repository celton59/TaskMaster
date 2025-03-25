import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { TaskColumn } from "@/components/tasks/task-column";
import { TaskFilter } from "@/components/tasks/task-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Filter, LayoutGrid, ArrowDownUp } from "lucide-react";
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
      await apiRequest(`/api/tasks/${data.taskId}`, "PATCH", data.updates);
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
    <Card className="border-neutral-100 shadow-sm mt-8">
      <CardHeader className="border-b border-neutral-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Tablero de tareas</CardTitle>
            <CardDescription>Arrastra y suelta para cambiar el estado de las tareas</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3.5 w-3.5 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <ArrowDownUp className="h-3.5 w-3.5 mr-2" />
              Ordenar
            </Button>
            <Button size="sm" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-2" />
              Nueva tarea
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-4">
          <TaskFilter 
            categories={categories} 
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
        
        <div className="flex overflow-x-auto pb-2 -mx-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-max px-2">
            <TaskColumn 
              title="Pendiente" 
              status="pending"
              badgeColor="bg-amber-500"
              tasks={getTasksByStatus("pending")}
              onTaskDrop={handleTaskDrop}
              isLoading={isLoading}
            />
            
            <TaskColumn 
              title="En progreso" 
              status="in-progress"
              badgeColor="bg-blue-500"
              tasks={getTasksByStatus("in-progress")}
              onTaskDrop={handleTaskDrop}
              isLoading={isLoading}
            />
            
            <TaskColumn 
              title="Revisión" 
              status="review"
              badgeColor="bg-purple-500"
              tasks={getTasksByStatus("review")}
              onTaskDrop={handleTaskDrop}
              isLoading={isLoading}
            />
            
            <TaskColumn 
              title="Completado" 
              status="completed"
              badgeColor="bg-emerald-500"
              tasks={getTasksByStatus("completed")}
              onTaskDrop={handleTaskDrop}
              isLoading={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
