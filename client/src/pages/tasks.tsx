import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, KanbanSquare, List, SlidersHorizontal } from "lucide-react";
import type { Task, Category } from "@shared/schema";

export default function Tasks() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  
  // Fetch tasks
  const { 
    data: tasks = [], 
    isLoading: isLoadingTasks 
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks"]
  });
  
  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });

  // Manejar la edición de tareas
  const handleEditTask = (taskId: number) => {
    setEditingTaskId(taskId);
    setIsTaskFormOpen(true);
  };
  
  // Cerrar el formulario de tareas
  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTaskId(undefined);
  };
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-neutral-800">Gestión de Tareas</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Organiza y administra todas tus tareas desde un solo lugar.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 items-center">
          <TabsList className="h-9">
            <TabsTrigger 
              value="board" 
              onClick={() => setViewMode("board")}
              className={viewMode === "board" ? "bg-primary-500 text-white" : ""}
              disabled={isLoadingTasks || isLoadingCategories}
            >
              <KanbanSquare className="h-4 w-4 mr-1.5" />
              Tablero
            </TabsTrigger>
            <TabsTrigger 
              value="list" 
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-primary-500 text-white" : ""}
              disabled={isLoadingTasks || isLoadingCategories}
            >
              <List className="h-4 w-4 mr-1.5" />
              Lista
            </TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={() => setIsTaskFormOpen(true)}
            className="shadow-sm bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva tarea
          </Button>
        </div>
      </div>
      
      {/* Vista de Tareas (Tablero o Lista) */}
      {viewMode === "board" ? (
        <TaskBoard 
          tasks={tasks} 
          categories={categories}
          isLoading={isLoadingTasks || isLoadingCategories} 
        />
      ) : (
        <TaskList 
          tasks={tasks} 
          categories={categories}
          isLoading={isLoadingTasks || isLoadingCategories}
          onEdit={handleEditTask}
        />
      )}
      
      {/* Formulario de Tareas (Modal) */}
      <TaskForm 
        isOpen={isTaskFormOpen} 
        taskId={editingTaskId}
        onClose={handleCloseTaskForm}
      />
    </div>
  );
}
