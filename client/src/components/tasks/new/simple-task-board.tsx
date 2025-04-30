import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TaskColumn } from "@/components/tasks/task-column";
import { TaskFilter } from "@/components/tasks/task-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Filter, ArrowDownUp } from "lucide-react";
import { Task, Category, TaskStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent, 
  DragEndEvent
} from "@dnd-kit/core";
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { motion, AnimatePresence } from "framer-motion";

interface TaskBoardProps {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
}

export function SimpleTaskBoard({ tasks: initialTasks, categories, isLoading: parentLoading }: TaskBoardProps) {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Initialize state with passed tasks
  useEffect(() => {
    setFilteredTasks(initialTasks);
  }, [initialTasks]);
  
  // Filter tasks based on category selection
  useEffect(() => {
    if (activeFilter === null) {
      setFilteredTasks(initialTasks);
    } else {
      setFilteredTasks(initialTasks.filter(task => task.categoryId === activeFilter));
    }
  }, [initialTasks, activeFilter]);
  
  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require a drag of 5px before activating
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  // Task mutation for updating tasks
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
      
      // Force a page reload to ensure all data is fresh
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la tarea: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Find a task by its ID
  const findTaskById = (id: number): Task | undefined => {
    return initialTasks.find(task => task.id === id);
  };
  
  // Handle the start of a drag operation
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = parseInt(active.id.toString());
    const task = findTaskById(taskId);
    
    if (task) {
      setActiveTask(task);
    }
  };
  
  // Handle the end of a drag operation
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset active task
    setActiveTask(null);
    
    if (!over) return;
    
    // Get the IDs from the drag event
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Find the task being dragged
    const activeTaskId = parseInt(activeId);
    const task = findTaskById(activeTaskId);
    
    if (!task) return;
    
    // Check if dropping on a column
    const isColumn = over.data.current?.type === 'column';
    
    if (isColumn) {
      const newStatus = overId;
      
      // Only update if the status has changed
      if (task.status !== newStatus) {
        console.log(`Moving task to new column: ${newStatus}`);
        
        // Update task on the server
        updateTaskMutation.mutate({
          taskId: activeTaskId,
          updates: { status: newStatus }
        });
      }
    }
  };
  
  // Get tasks for each status column
  const pendingTasks = filteredTasks.filter(task => task.status === TaskStatus.PENDING)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
    
  const inProgressTasks = filteredTasks.filter(task => task.status === TaskStatus.IN_PROGRESS)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
    
  const reviewTasks = filteredTasks.filter(task => task.status === TaskStatus.REVIEW)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
    
  const completedTasks = filteredTasks.filter(task => task.status === TaskStatus.COMPLETED)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return (
    <div className="w-full h-full bg-neon-darker">
      {/* Filter controls */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Card className="w-full sm:w-auto bg-neon-darker border-neon-faint/30 shadow-[0_0_8px_rgba(0,225,255,0.15)]">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-mono font-medium text-neon-text/80 flex items-center">
              <Filter className="w-4 h-4 mr-2 text-neon-accent/80" />
              Filtrar por categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <TaskFilter 
              categories={categories} 
              activeFilter={activeFilter}
              onChange={setActiveFilter}
            />
          </CardContent>
        </Card>
        
        <Button
          variant="outline" 
          className="bg-neon-medium/30 border-neon-faint/30 text-neon-text hover:bg-neon-medium/50 hover:text-neon-accent"
          onClick={() => window.location.reload()}
        >
          <ArrowDownUp className="w-4 h-4 mr-2" />
          Refrescar tablero
        </Button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TaskColumn 
            id={TaskStatus.PENDING}
            title="Pendientes"
            tasks={pendingTasks}
            color="bg-gradient-to-r from-orange-400/20 to-amber-500/20"
            borderColor="border-orange-500/40"
            iconColor="text-orange-400"
            isLoading={parentLoading}
          />
          
          <TaskColumn 
            id={TaskStatus.IN_PROGRESS}
            title="En progreso"
            tasks={inProgressTasks}
            color="bg-gradient-to-r from-blue-400/20 to-indigo-500/20"
            borderColor="border-blue-500/40"
            iconColor="text-blue-400"
            isLoading={parentLoading}
          />
          
          <TaskColumn 
            id={TaskStatus.REVIEW}
            title="Revisión"
            tasks={reviewTasks}
            color="bg-gradient-to-r from-purple-400/20 to-pink-500/20"
            borderColor="border-purple-500/40"
            iconColor="text-purple-400"
            isLoading={parentLoading}
          />
          
          <TaskColumn 
            id={TaskStatus.COMPLETED}
            title="Completadas"
            tasks={completedTasks}
            color="bg-gradient-to-r from-green-400/20 to-emerald-500/20"
            borderColor="border-green-500/40"
            iconColor="text-green-400"
            isLoading={parentLoading}
          />
        </div>
        
        {/* Drag overlay to show task while dragging */}
        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeTask ? (
            <div className="w-60 opacity-80 shadow-xl rotate-3">
              <TaskColumn.Card task={activeTask} categories={categories} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}