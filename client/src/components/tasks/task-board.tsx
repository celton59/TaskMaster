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
  DragOverEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { motion, AnimatePresence } from "framer-motion";

interface TaskBoardProps {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
}

export function TaskBoard({ tasks: initialTasks, categories, isLoading: parentLoading }: TaskBoardProps) {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Directo fetch de tareas para asegurar datos actualizados
  const { 
    data: tasks = initialTasks, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['/api/tasks'],
    initialData: initialTasks,
    refetchOnWindowFocus: true,
  });
  
  // Función para refrescar tareas después de un cambio significativo
  const refreshTasks = useCallback(() => {
    refetch();
  }, [refetch]);
  
  // Set up DnD sensors for different interaction methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance for activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
    
    // Extract IDs from drag items
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Si el ID activo y el ID destino son iguales, no hacemos nada
    if (activeId === overId) return;
    
    const activeTaskId = parseInt(activeId);
    const task = findTaskById(activeTaskId);
    
    if (!task) return;
    
    // Depuración
    console.log("DragOver - Active:", active.id, active.data.current);
    console.log("DragOver - Over:", over.id, over.data.current);
    
    // Detectar si estamos sobre una columna o sobre otra tarea
    // La forma correcta es comprobar si el tipo del elemento "over" es 'column'
    const isColumn = over.data.current?.type === 'column';
    
    if (isColumn) {
      // Estamos sobre una columna, así que cambiamos el estado de la tarea
      const newStatus = overId;
      
      // Actualizamos el estado de la tarea temporalmente para dar feedback visual
      setFilteredTasks(prevTasks => prevTasks.map(t => 
        t.id === activeTaskId 
          ? { ...t, status: newStatus } 
          : t
      ));
    } else {
      // Estamos sobre otra tarea
      const overTaskId = parseInt(overId);
      const overTask = findTaskById(overTaskId);
      
      if (!overTask) return;
      
      const isSameColumn = task.status === overTask.status;
      const targetStatus = overTask.status;
      
      if (isSameColumn) {
        // Reordenamos dentro de la misma columna
        const columnTasks = filteredTasks.filter(t => t.status === task.status);
        const activeIndex = columnTasks.findIndex(t => t.id === activeTaskId);
        const overIndex = columnTasks.findIndex(t => t.id === overTaskId);
        
        if (activeIndex === -1 || overIndex === -1) return;
        
        console.log("Reordenando en DragOver:", 
          { status: task.status, activeId: activeTaskId, overId: overTaskId, 
            activeIndex, overIndex, columnTasks });
        
        // Reordenar las tareas en el estado temporal
        setFilteredTasks(prevTasks => {
          // Primero separamos las tareas de esta columna de las demás
          const columnTaskIds = columnTasks.map(t => t.id);
          const otherTasks = prevTasks.filter(t => !columnTaskIds.includes(t.id));
          
          // Reordenamos las tareas de la columna
          const reorderedColumnTasks = arrayMove(columnTasks, activeIndex, overIndex);
          
          // Actualizamos el orden (position) de cada tarea de la columna
          const updatedColumnTasks = reorderedColumnTasks.map((t, index) => ({
            ...t, 
            order: index
          }));
          
          // Unimos todas las tareas nuevamente
          return [...otherTasks, ...updatedColumnTasks];
        });
      } else {
        // Estamos moviéndonos entre columnas diferentes
        console.log("DragOver entre columnas:", 
          { sourceStatus: task.status, targetStatus, activeId: activeTaskId, overId: overTaskId });
        
        // Obtenemos las tareas de la columna destino
        const targetColumnTasks = filteredTasks.filter(t => t.status === targetStatus);
        
        // Encontramos la posición de la tarea sobre la que estamos
        const targetIndex = targetColumnTasks.findIndex(t => t.id === overTaskId);
        
        if (targetIndex === -1) return;
        
        // Creamos una copia actualizada de la tarea activa con el nuevo estado
        const updatedActiveTask = {
          ...task,
          status: targetStatus,
          // Aseguramos que la tarea activa tenga todas las propiedades correctas
          id: activeTaskId,  
          title: task.title,
          description: task.description,
          priority: task.priority,
          categoryId: task.categoryId,
          deadline: task.deadline,
          createdAt: task.createdAt,
          assignedTo: task.assignedTo,
          projectId: task.projectId,
          project_id: task.project_id,
          start_date: task.start_date,
          completed_at: task.completed_at
        };
        
        // Actualizar el estado local para dar feedback visual
        setFilteredTasks(prevTasks => {
          // 1. Remover la tarea activa de la lista previa
          const tasksWithoutActive = prevTasks.filter(t => t.id !== activeTaskId);
          
          // 2. Obtener las tareas de la columna destino sin la activa
          const targetTasks = tasksWithoutActive.filter(t => t.status === targetStatus);
          
          // 3. Insertar la tarea activa en la posición correcta
          const updatedTargetTasks = [...targetTasks];
          updatedTargetTasks.splice(targetIndex, 0, updatedActiveTask);
          
          // 4. Actualizar órdenes de las tareas de destino
          const finalTargetTasks = updatedTargetTasks.map((t, index) => ({
            ...t,
            status: targetStatus, // Aseguramos que todas tengan el estado correcto
            order: index
          }));
          
          // 5. Obtener el resto de tareas que no son de la columna destino
          const otherTasks = tasksWithoutActive.filter(t => t.status !== targetStatus);
          
          // 6. Unir todas las tareas
          return [...otherTasks, ...finalTargetTasks];
        });
      }
    }
  };
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset active task
    setActiveTask(null);
    
    if (!over) return;
    
    // Extract IDs from drag items
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Si el ID activo y el ID destino son iguales, no hacemos nada
    if (activeId === overId) return;
    
    const activeTaskId = parseInt(activeId);
    const task = findTaskById(activeTaskId);
    
    if (!task) return;
    
    // Depuración
    console.log("DragEnd - Active:", active.id, active.data.current);
    console.log("DragEnd - Over:", over.id, over.data.current);
    
    // Detectar si estamos sobre una columna o sobre otra tarea
    // La forma correcta es comprobar si el tipo del elemento "over" es 'column'
    const isColumn = over.data.current?.type === 'column';
    
    if (isColumn) {
      // Estamos sobre una columna, así que cambiamos el estado de la tarea
      const newStatus = overId;
      
      // Solo actualizamos si el estado ha cambiado
      if (task.status !== newStatus) {
        // Obtenemos todas las tareas de la columna de destino para ordenar
        const destinationColumnTasks = filteredTasks.filter(t => t.status === newStatus);
        
        // Calculamos el índice para la tarea (al final por defecto)
        const newOrder = destinationColumnTasks.length;
        
        console.log(`Moviendo tarea a nueva columna ${newStatus} con orden ${newOrder}`);
        
        // Actualizamos en el servidor el estado y el orden
        updateTaskMutation.mutate({
          taskId: activeTaskId,
          updates: { status: newStatus, order: newOrder }
        });
        
        // También actualizamos localmente para dar feedback inmediato
        setFilteredTasks(prevTasks => prevTasks.map(t => 
          t.id === activeTaskId 
            ? { ...t, status: newStatus, order: newOrder } 
            : t
        ));
      }
    } else {
      // Estamos sobre otra tarea
      const overTaskId = parseInt(overId);
      const overTask = findTaskById(overTaskId);
      
      if (!overTask) return;
      
      const isSameColumn = task.status === overTask.status;
      const sourceStatus = task.status;
      const targetStatus = overTask.status;
      
      if (isSameColumn) {
        // Reordenamos dentro de la misma columna
        const columnTasks = filteredTasks.filter(t => t.status === task.status);
        const activeIndex = columnTasks.findIndex(t => t.id === activeTaskId);
        const overIndex = columnTasks.findIndex(t => t.id === overTaskId);
        
        if (activeIndex === -1 || overIndex === -1) return;
        
        console.log("Reordenando en misma columna:", 
          { status: task.status, activeId: activeTaskId, overId: overTaskId, 
            activeIndex, overIndex, columnTasks });
        
        // Reordenar las tareas
        const reorderedTasks = arrayMove(columnTasks, activeIndex, overIndex);
        
        // Actualizar las órdenes en el servidor
        reorderedTasks.forEach((t, index) => {
          console.log(`Actualizando tarea ${t.id} a orden ${index}`);
          updateTaskMutation.mutate({
            taskId: t.id,
            updates: { order: index }
          });
        });
        
        // Actualizar el estado local con nuevos órdenes
        setFilteredTasks(prevTasks => {
          // Primero separamos las tareas de esta columna de las demás
          const columnTaskIds = columnTasks.map(t => t.id);
          const otherTasks = prevTasks.filter(t => !columnTaskIds.includes(t.id));
          
          // Actualizamos el orden de las tareas reordenadas
          const updatedColumnTasks = reorderedTasks.map((t, index) => ({
            ...t, 
            order: index
          }));
          
          // Unimos todas las tareas nuevamente
          return [...otherTasks, ...updatedColumnTasks];
        });
      } else {
        // Estamos cambiando de columna Y posicionando en una posición específica
        console.log("Moviendo tarea entre columnas con posición específica:", 
          { sourceStatus, targetStatus, activeId: activeTaskId, overId: overTaskId });
        
        // Obtenemos las tareas de la columna destino
        const targetColumnTasks = filteredTasks.filter(t => t.status === targetStatus);
        
        // Encontramos la posición de la tarea sobre la que estamos
        const targetIndex = targetColumnTasks.findIndex(t => t.id === overTaskId);
        
        if (targetIndex === -1) return;
        
        // Creamos una copia actualizada de la tarea activa con el nuevo estado
        const updatedActiveTask = {
          ...task,
          status: targetStatus,
          // Aseguramos que la tarea activa tenga todas las propiedades correctas
          id: activeTaskId,  
          title: task.title,
          description: task.description,
          priority: task.priority,
          categoryId: task.categoryId,
          deadline: task.deadline,
          createdAt: task.createdAt,
          assignedTo: task.assignedTo,
          projectId: task.projectId,
          project_id: task.project_id,
          start_date: task.start_date,
          completed_at: task.completed_at
        };
        
        // Reorganizamos las tareas de la columna de destino para incluir nuestra tarea
        const updatedColumnTasks = [...targetColumnTasks];
        updatedColumnTasks.splice(targetIndex, 0, updatedActiveTask);
        
        // Actualizamos primero la tarea activa para cambiar su estado
        console.log(`Actualizando tarea activa ${activeTaskId} a status ${targetStatus} y orden ${targetIndex}`);
        updateTaskMutation.mutate({
          taskId: activeTaskId,
          updates: { 
            status: targetStatus, 
            order: targetIndex 
          }
        }, {
          // Aseguramos que esta mutación se complete antes de continuar
          onSuccess: () => {
            console.log("Actualización de estado completada, ahora actualizando órdenes");
            
            // Luego actualizamos las órdenes de todas las tareas en la columna destino
            updatedColumnTasks.forEach((t, index) => {
              if (t.id !== activeTaskId) {  // No volvemos a actualizar la tarea activa
                console.log(`Actualizando tarea destino ${t.id} a orden ${index}`);
                updateTaskMutation.mutate({
                  taskId: t.id,
                  updates: { order: index }
                });
              }
            });
          }
        });
        
        // Actualizar el estado local 
        setFilteredTasks(prevTasks => {
          // Tareas que no son de la columna destino ni la tarea arrastrada
          const otherTasks = prevTasks.filter(t => 
            t.status !== targetStatus && t.id !== activeTaskId
          );
          
          // Tareas actualizadas de la columna destino incluyendo la arrastrada
          const finalColumnTasks = updatedColumnTasks.map((t, index) => ({
            ...t,
            status: targetStatus,
            order: index
          }));
          
          // Unimos todas las tareas
          return [...otherTasks, ...finalColumnTasks];
        });
        
        // Forzamos un refresco de las tareas después de una breve pausa
        setTimeout(() => {
          // Recargar los datos
          window.location.reload();
        }, 300);
      }
    }
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
    let statusTasks;
    
    if (status === "pending") {
      // Match both "pending" and "pendiente"
      statusTasks = filteredTasks.filter(task => 
        task.status === "pending" || task.status === "pendiente"
      );
    } else if (status === "in-progress") {
      // Match both "in-progress" and "en_progreso"
      statusTasks = filteredTasks.filter(task => 
        task.status === "in-progress" || task.status === "en_progreso"
      );
    } else if (status === "review") {
      // Match both "review" and "revision"
      statusTasks = filteredTasks.filter(task => 
        task.status === "review" || task.status === "revision"
      );
    } else if (status === "completed") {
      // Match both "completed" and "completada"
      statusTasks = filteredTasks.filter(task => 
        task.status === "completed" || task.status === "completada"
      );
    } else {
      statusTasks = filteredTasks.filter(task => task.status === status);
    }
    
    // Ordenar las tareas primero por order y luego por id como respaldo
    return statusTasks.sort((a, b) => {
      // Asignar un valor por defecto (0) a orden si es null o undefined
      const orderA = typeof a.order === 'number' ? a.order : 0;
      const orderB = typeof b.order === 'number' ? b.order : 0;
      
      // Primero intentar ordenar por order
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Si tienen el mismo order (o ambos son 0), ordenar por id
      return a.id - b.id;
    });
  };
  
  // Componente para renderizar el overlay de arrastre
  const TaskDragOverlay = ({ task }: { task: Task }) => {
    if (!task) return null;
    
    // Preparamos datos para pasar a componente estilizado similar a TaskCard
    return (
      <motion.div
        className="task-card p-4 rounded-lg shadow-md border border-neon-accent/30 border-l-4 border-l-blue-500 bg-neon-darker/70 shadow-[0_4px_16px_rgba(0,225,255,0.3)] cursor-grabbing w-[280px]"
        initial={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0, 225, 255, 0.25)" }}
        animate={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0, 225, 255, 0.25)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div 
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              task.priority === "high" 
                ? "bg-rose-900/30 text-rose-400 border border-rose-500/30" 
                : task.priority === "medium" 
                  ? "bg-amber-900/30 text-amber-300 border border-amber-500/30" 
                  : "bg-emerald-900/30 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
          </div>
        </div>
        <h4 className="font-semibold text-sm text-neon-text line-clamp-1 leading-relaxed">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-neon-text/70 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
        )}
      </motion.div>
    );
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