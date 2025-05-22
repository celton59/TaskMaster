import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TaskColumn } from "@/components/tasks/task-column";
import { TaskFilter } from "@/components/tasks/task-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Filter, ArrowDownUp } from "lucide-react";
import { Task, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent, 
  DragOverEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { motion, AnimatePresence } from "framer-motion";

interface TaskBoardProps {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
}

export function TaskBoard({ tasks, categories, isLoading }: TaskBoardProps) {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Set up DnD sensors for different interaction methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance for activation
      },
    }),
    useSensor(KeyboardSensor, {})
  );
  
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
  
  // Find task by ID helper
  const findTaskById = (id: number): Task | undefined => {
    return tasks.find(task => task.id === id);
  };
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = parseInt(active.id.toString());
    const task = findTaskById(taskId);
    
    if (task) {
      setActiveTask(task);
    }
  };
  
  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = parseInt(active.id.toString());
    const overData = over.data.current as any;

    const activeTask = filteredTasks.find(t => t.id === activeId);
    if (!activeTask) return;

    let newStatus = activeTask.status;
    let overTaskId: number | null = null;
    if (overData?.type === "column") {
      newStatus = over.id.toString();
    } else if (overData?.type === "task") {
      newStatus = overData.task.status;
      overTaskId = overData.task.id;
    }

    setFilteredTasks(prev => {
      const grouped: Record<string, Task[]> = {};
      prev.forEach(task => {
        const arr = grouped[task.status] || (grouped[task.status] = []);
        arr.push({ ...task });
      });

      const fromArray = grouped[activeTask.status];
      const fromIndex = fromArray.findIndex(t => t.id === activeId);
      const [moved] = fromArray.splice(fromIndex, 1);
      moved.status = newStatus;

      const toArray = grouped[newStatus] || (grouped[newStatus] = []);
      let newIndex = toArray.length;
      if (overTaskId !== null) {
        const overIndex = toArray.findIndex(t => t.id === overTaskId);
        if (overIndex !== -1) newIndex = overIndex;
      }
      toArray.splice(newIndex, 0, moved);

      return Object.values(grouped).flat();
    });
  };
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;

    setActiveTask(null);

    setFilteredTasks(prev => {
      const grouped: Record<string, Task[]> = {};
      prev.forEach(task => {
        const arr = grouped[task.status] || (grouped[task.status] = []);
        arr.push({ ...task });
      });

      Object.values(grouped).forEach(arr => {
        arr.forEach((task, idx) => {
          task.order = idx;
        });
      });

      const newTasks = Object.values(grouped).flat();

      newTasks.forEach(t => {
        const original = prev.find(o => o.id === t.id);
        if (!original || original.status !== t.status || original.order !== t.order) {
          updateTaskMutation.mutate({ taskId: t.id, updates: { status: t.status, order: t.order } });
        }
      });

      return newTasks;
    });
  };
  
  // Handle task drop (legacy method, used as backup)
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
      return filteredTasks
        .filter(task => task.status === "pending" || task.status === "pendiente")
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } else if (status === "in-progress") {
      // Match both "in-progress" and "en_progreso"
      return filteredTasks
        .filter(task => task.status === "in-progress" || task.status === "en_progreso")
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } else if (status === "review") {
      // Match both "review" and "revision"
      return filteredTasks
        .filter(task => task.status === "review" || task.status === "revision")
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } else if (status === "completed") {
      // Match both "completed" and "completada"
      return filteredTasks
        .filter(task => task.status === "completed" || task.status === "completada")
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return filteredTasks
      .filter(task => task.status === status)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };
  
  // Componente para renderizar el overlay de arrastre
  const TaskDragOverlay = ({ task }: { task: Task }) => {
    if (!task) return null;
    
    // Preparamos datos para pasar a componente estilizado similar a TaskCard
    return (
      <motion.div
        className={cn(
          "task-card p-4 rounded-lg border-l-4 cursor-grabbing w-[280px]",
          isDarkMode
            ? "shadow-md border border-neon-accent/30 border-l-blue-500 bg-neon-darker/70 shadow-[0_4px_16px_rgba(0,225,255,0.3)]"
            : "shadow-lg border border-gray-200 border-l-blue-500 bg-white"
        )}
        initial={{ 
          scale: 1.05, 
          boxShadow: isDarkMode 
            ? "0 10px 30px rgba(0, 225, 255, 0.25)" 
            : "0 10px 20px rgba(0, 0, 0, 0.1)" 
        }}
        animate={{ 
          scale: 1.05, 
          boxShadow: isDarkMode 
            ? "0 10px 30px rgba(0, 225, 255, 0.25)" 
            : "0 10px 20px rgba(0, 0, 0, 0.1)" 
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div 
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
              isDarkMode
                ? task.priority === "high" 
                  ? "bg-rose-900/30 text-rose-400 border border-rose-500/30" 
                  : task.priority === "medium" 
                    ? "bg-amber-900/30 text-amber-300 border border-amber-500/30" 
                    : "bg-emerald-900/30 text-emerald-400 border border-emerald-500/30"
                : task.priority === "high" 
                  ? "bg-rose-50 text-rose-600 border border-rose-200" 
                  : task.priority === "medium" 
                    ? "bg-amber-50 text-amber-600 border border-amber-200" 
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
            )}
          >
            {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
          </div>
        </div>
        <h4 className={cn(
          "font-semibold text-sm line-clamp-1 leading-relaxed",
          isDarkMode ? "text-neon-text" : "text-gray-800"
        )}>
          {task.title}
        </h4>
        {task.description && (
          <p className={cn(
            "text-xs mt-1 line-clamp-2 leading-relaxed",
            isDarkMode ? "text-neon-text/70" : "text-gray-600"
          )}>
            {task.description}
          </p>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <Card className={cn(
        "overflow-hidden rounded-xl mt-8",
        isDarkMode 
          ? "border border-neon-accent/30 bg-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.15)]"
          : "border border-gray-200 bg-white shadow-md"
      )}>
        <CardHeader className={cn(
          "border-b pb-4",
          isDarkMode 
            ? "border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark"
            : "border-gray-200 bg-gradient-to-r from-gray-50 to-white"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className={cn(
                "text-lg font-semibold",
                isDarkMode 
                  ? "text-neon-accent neon-text font-mono"
                  : "text-blue-600 font-sans"
              )}>Tablero de tareas</CardTitle>
              <CardDescription className={isDarkMode ? "text-neon-text/70" : "text-gray-600"}>
                Arrastra y suelta para cambiar el estado de las tareas
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-8",
                  isDarkMode
                    ? "border-neon-accent/30 bg-neon-medium/30 text-neon-text/80 hover:text-neon-accent hover:bg-neon-accent/20"
                    : "border-blue-200 bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                )}
              >
                <Filter className="h-3.5 w-3.5 mr-2" />
                Filtros
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-8",
                  isDarkMode
                    ? "border-neon-accent/30 bg-neon-medium/30 text-neon-text/80 hover:text-neon-accent hover:bg-neon-accent/20"
                    : "border-blue-200 bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                )}
              >
                <ArrowDownUp className="h-3.5 w-3.5 mr-2" />
                Ordenar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={cn("p-4", isDarkMode ? "bg-neon-dark" : "bg-white")}>
          <div className="mb-4">
            <TaskFilter 
              categories={categories} 
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
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
            
            {/* Overlay para la tarea que se está arrastrando */}
            <DragOverlay modifiers={[restrictToWindowEdges]}>
              <AnimatePresence>
                {activeTask && (
                  <TaskDragOverlay task={activeTask} />
                )}
              </AnimatePresence>
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
    </>
  );
}