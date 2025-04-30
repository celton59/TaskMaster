import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SimpleTaskBoard } from "@/components/tasks/new/simple-task-board";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";

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
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-neon-darker min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-neon-accent neon-text font-mono">Gestión de Tareas</h2>
          <p className="mt-1 text-sm text-neon-text/70">
            Organiza y administra todas tus tareas desde un solo lugar.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 items-center">
          <div className="flex border rounded-md border-neon-accent/30 bg-neon-medium/30 shadow-[0_0_8px_rgba(0,225,255,0.15)]">
            <Button 
              variant="ghost"
              onClick={() => setViewMode("board")}
              className={`rounded-r-none h-9 ${viewMode === "board" ? "bg-neon-accent/30 text-neon-accent border-r border-neon-accent/30" : "text-neon-text/80 hover:text-neon-accent hover:bg-neon-accent/20"}`}
              disabled={isLoadingTasks || isLoadingCategories}
            >
              <KanbanSquare className="h-4 w-4 mr-1.5" />
              Tablero
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setViewMode("list")}
              className={`rounded-l-none h-9 ${viewMode === "list" ? "bg-neon-accent/30 text-neon-accent" : "text-neon-text/80 hover:text-neon-accent hover:bg-neon-accent/20"}`}
              disabled={isLoadingTasks || isLoadingCategories}
            >
              <List className="h-4 w-4 mr-1.5" />
              Lista
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsTaskFormOpen(true)}
            className="shadow-[0_0_15px_rgba(0,225,255,0.2)] bg-neon-accent/90 hover:bg-neon-accent text-neon-darker font-medium"
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
