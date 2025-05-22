import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

import { Plus, KanbanSquare, List, SlidersHorizontal } from "lucide-react";
import type { Task, Category } from "@shared/schema";

export default function Tasks() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const { isDarkMode } = useTheme();
  
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
    <div className={cn(
      "py-6 px-4 sm:px-6 lg:px-8 min-h-screen",
      isDarkMode ? "bg-neon-darker" : "bg-gray-50"
    )}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className={cn(
            "text-2xl font-heading font-bold",
            isDarkMode 
              ? "text-white" 
              : "text-blue-600"
          )}>
            Gestión de Tareas
          </h2>
          <p className={cn(
            "mt-1 text-sm",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Organiza y administra todas tus tareas desde un solo lugar.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 items-center">
          <div className={cn(
            "flex border rounded-md",
            isDarkMode 
              ? "border-neon-accent/30 bg-neon-medium/30 shadow-[0_0_8px_rgba(0,225,255,0.15)]"
              : "border-gray-200 bg-white shadow-sm"
          )}>
            <Button 
              variant="ghost"
              onClick={() => setViewMode("board")}
              className={cn(
                "rounded-r-none h-9",
                viewMode === "board" 
                  ? isDarkMode
                    ? "bg-neon-accent/30 text-neon-accent border-r border-neon-accent/30" 
                    : "bg-blue-50 text-blue-600 border-r border-gray-200"
                  : isDarkMode
                    ? "text-neon-text/80 hover:text-neon-accent hover:bg-neon-accent/20"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              )}
              disabled={isLoadingTasks || isLoadingCategories}
            >
              <KanbanSquare className="h-4 w-4 mr-1.5" />
              Tablero
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-l-none h-9",
                viewMode === "list" 
                  ? isDarkMode
                    ? "bg-neon-accent/30 text-neon-accent" 
                    : "bg-blue-50 text-blue-600"
                  : isDarkMode
                    ? "text-neon-text/80 hover:text-neon-accent hover:bg-neon-accent/20"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              )}
              disabled={isLoadingTasks || isLoadingCategories}
            >
              <List className="h-4 w-4 mr-1.5" />
              Lista
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsTaskFormOpen(true)}
            className={cn(
              "font-medium",
              isDarkMode
                ? "shadow-[0_0_15px_rgba(0,225,255,0.2)] bg-neon-accent/90 hover:bg-neon-accent text-neon-darker"
                : "shadow-md bg-blue-600 hover:bg-blue-700 text-white"
            )}
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
