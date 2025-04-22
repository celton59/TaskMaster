import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TaskColumn } from "@/components/tasks/task-column";
import { TaskFilter } from "@/components/tasks/task-filter";
import { TaskForm } from "@/components/tasks/task-form";
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
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  
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
  
  // Get tasks by status - supporting both English and Spanish status values
  const getTasksByStatus = (status: string) => {
    if (status === "pending") {
      // Match both "pending" and "pendiente"
      return filteredTasks.filter(task => 
        task.status === "pending" || task.status === "pendiente"
      );
    } else if (status === "in-progress") {
      // Match both "in-progress" and "en_progreso"
      return filteredTasks.filter(task => 
        task.status === "in-progress" || task.status === "en_progreso"
      );
    } else if (status === "review") {
      // Match both "review" and "revision"
      return filteredTasks.filter(task => 
        task.status === "review" || task.status === "revision"
      );
    } else if (status === "completed") {
      // Match both "completed" and "completada"
      return filteredTasks.filter(task => 
        task.status === "completed" || task.status === "completada"
      );
    }
    return filteredTasks.filter(task => task.status === status);
  };
  
  return (
    <>
      <Card className="border border-neon-accent/30 bg-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.15)] overflow-hidden rounded-xl mt-8">
        <CardHeader className="border-b border-neon-accent/30 pb-4 bg-gradient-to-r from-neon-darker to-neon-dark">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold text-neon-accent neon-text font-mono">Tablero de tareas</CardTitle>
              <CardDescription className="text-neon-text/70">Arrastra y suelta para cambiar el estado de las tareas</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 border-neon-accent/30 bg-neon-medium/30 text-neon-text/80 hover:text-neon-accent hover:bg-neon-accent/20">
                <Filter className="h-3.5 w-3.5 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" className="h-8 border-neon-accent/30 bg-neon-medium/30 text-neon-text/80 hover:text-neon-accent hover:bg-neon-accent/20">
                <ArrowDownUp className="h-3.5 w-3.5 mr-2" />
                Ordenar
              </Button>
              <Button 
                onClick={() => setIsTaskFormOpen(true)} 
                size="sm" 
                className="h-8 bg-neon-accent/90 hover:bg-neon-accent text-neon-darker font-medium shadow-[0_0_8px_rgba(0,225,255,0.2)]"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Nueva tarea
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 bg-neon-dark">
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
      
      <TaskForm 
        isOpen={isTaskFormOpen} 
        onClose={() => setIsTaskFormOpen(false)}
        categories={categories}
      />
    </>
  );
}