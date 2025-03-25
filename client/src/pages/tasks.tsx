import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Task, Category } from "@shared/schema";

export default function Tasks() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  
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
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-heading font-bold text-neutral-800">Gestión de Tareas</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Organiza y administra todas tus tareas desde un solo lugar.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex">
          <Button onClick={() => setIsTaskFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva tarea
          </Button>
        </div>
      </div>
      
      {/* Task Board */}
      <TaskBoard 
        tasks={tasks} 
        categories={categories}
        isLoading={isLoadingTasks || isLoadingCategories} 
      />
      
      {/* Task Form Modal */}
      <TaskForm 
        isOpen={isTaskFormOpen} 
        onClose={() => setIsTaskFormOpen(false)} 
      />
    </div>
  );
}
