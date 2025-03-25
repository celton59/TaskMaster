import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TaskChart } from "@/components/dashboard/task-chart";
import { RecentTasksList } from "@/components/dashboard/recent-tasks-list";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  CheckCheck, 
  AlertTriangle,
  Plus
} from "lucide-react";
import type { Task, Category } from "@shared/schema";

export default function Dashboard() {
  const [, navigate] = useLocation();
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
  
  // Fetch task stats
  const { 
    data: stats = { 
      total: 0, 
      pending: 0, 
      inProgress: 0, 
      review: 0, 
      completed: 0 
    }, 
    isLoading: isLoadingStats 
  } = useQuery<{
    total: number;
    pending: number;
    inProgress: number;
    review: number;
    completed: number;
  }>({
    queryKey: ["/api/tasks/stats"]
  });
  
  // Chart data - using a static dataset for simplicity
  const chartData = [
    { name: "Lun", completed: 3, created: 5 },
    { name: "Mar", completed: 5, created: 4 },
    { name: "Mié", completed: 2, created: 6 },
    { name: "Jue", completed: 7, created: 3 },
    { name: "Vie", completed: 4, created: 7 },
    { name: "Sáb", completed: 6, created: 5 },
    { name: "Dom", completed: 8, created: 4 },
  ];
  
  // Get recent tasks (most recent 4)
  const recentTasks = [...tasks]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 4);
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-heading font-bold text-neutral-800">Dashboard</h2>
          <p className="mt-1 text-sm text-neutral-500">Bienvenido de nuevo. Aquí está el resumen de tus tareas.</p>
        </div>
        <div className="mt-4 md:mt-0 flex">
          <Button onClick={() => setIsTaskFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva tarea
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de tareas"
          value={stats.total}
          icon={FileText}
          linkText="Ver todas"
          linkHref="/tasks"
          iconColor="text-primary-600"
          iconBgColor="bg-primary-50"
        />
        
        <MetricCard
          title="Pendientes"
          value={stats.pending}
          icon={Clock}
          linkText="Ver pendientes"
          linkHref="/tasks"
          iconColor="text-secondary-600"
          iconBgColor="bg-secondary-100"
        />
        
        <MetricCard
          title="Completadas"
          value={stats.completed}
          icon={CheckCheck}
          linkText="Ver completadas"
          linkHref="/tasks"
          iconColor="text-success-500"
          iconBgColor="bg-success-50"
        />
        
        <MetricCard
          title="En revisión"
          value={stats.review}
          icon={AlertTriangle}
          linkText="Ver en revisión"
          linkHref="/tasks"
          iconColor="text-warning-500"
          iconBgColor="bg-warning-50"
        />
      </div>

      {/* Chart and Recent Tasks */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TaskChart data={chartData} />
        
        <RecentTasksList 
          tasks={recentTasks} 
          onViewAll={() => navigate("/tasks")} 
        />
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
