import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SimpleTaskColumn } from "@/components/tasks/new/simple-task-column";
import { TaskFilter } from "@/components/tasks/task-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  
  // Handle task drop into column
  const handleTaskDrop = (taskId: number, status: string) => {
    console.log(`Task ${taskId} dropped into ${status}`);
    
    // Find the task
    const task = findTaskById(taskId);
    if (!task || task.status === status) return;
    
    // Update the task status
    updateTaskMutation.mutate({
      taskId,
      updates: { status }
    });
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
              onFilterChange={setActiveFilter}
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
          <SimpleTaskColumn 
            title="Pendientes"
            status={TaskStatus.PENDING}
            badgeColor="bg-amber-400"
            tasks={pendingTasks}
            onTaskDrop={handleTaskDrop}
            isLoading={parentLoading}
            categories={categories}
          />
          
          <SimpleTaskColumn 
            title="En progreso"
            status={TaskStatus.IN_PROGRESS}
            badgeColor="bg-blue-400"
            tasks={inProgressTasks}
            onTaskDrop={handleTaskDrop}
            isLoading={parentLoading}
            categories={categories}
          />
          
          <SimpleTaskColumn 
            title="Revisión"
            status={TaskStatus.REVIEW}
            badgeColor="bg-purple-400"
            tasks={reviewTasks}
            onTaskDrop={handleTaskDrop}
            isLoading={parentLoading}
            categories={categories}
          />
          
          <SimpleTaskColumn 
            title="Completadas"
            status={TaskStatus.COMPLETED}
            badgeColor="bg-green-400"
            tasks={completedTasks}
            onTaskDrop={handleTaskDrop}
            isLoading={parentLoading}
            categories={categories}
          />
        </div>
        
        {/* Drag overlay to show task while dragging */}
        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeTask ? (
            <div className="w-60 opacity-80 shadow-xl rotate-3">
              {activeTask && (
                <div className="bg-neon-medium/20 p-3 rounded-lg border border-neon-accent/30 shadow-md">
                  <h3 className="text-sm font-medium text-neon-text">{activeTask.title}</h3>
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}