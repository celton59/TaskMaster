import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TaskChart } from "@/components/dashboard/task-chart";
import { RecentTasksList } from "@/components/dashboard/recent-tasks-list";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Clock, 
  CheckCheck, 
  AlertTriangle,
  Plus,
  BarChart4,
  CalendarDays,
  Users,
  Mail
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
    <div className="py-8 px-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Bienvenido de nuevo, Admin Demo</p>
        </div>
        <div className="mt-4 md:mt-0 flex">
          <Button 
            onClick={() => setIsTaskFormOpen(true)}
            size="sm" 
            className="shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva tarea
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de tareas"
          value={stats.total}
          icon={FileText}
          linkText="Ver todas"
          linkHref="/tasks"
          iconColor="text-primary-600"
          iconBgColor="bg-primary-50"
          trend={{ value: "12%", isPositive: true }}
        />
        
        <MetricCard
          title="Pendientes"
          value={stats.pending}
          icon={Clock}
          linkText="Ver pendientes"
          linkHref="/tasks/pending"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          trend={{ value: "4%", isPositive: false }}
        />
        
        <MetricCard
          title="Completadas"
          value={stats.completed}
          icon={CheckCheck}
          linkText="Ver completadas"
          linkHref="/tasks/completed"
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          trend={{ value: "18%", isPositive: true }}
        />
        
        <MetricCard
          title="En revisión"
          value={stats.review}
          icon={AlertTriangle}
          linkText="Ver en revisión"
          linkHref="/tasks/review"
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          trend={{ value: "2%", isPositive: true }}
        />
      </div>

      {/* Overview Tabs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
        <Card className="md:col-span-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">Resumen de actividad</CardTitle>
                <CardDescription>Actividad de tareas en la última semana</CardDescription>
              </div>
              <Tabs defaultValue="semana" className="w-[200px]">
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="dia">Día</TabsTrigger>
                  <TabsTrigger value="semana">Semana</TabsTrigger>
                  <TabsTrigger value="mes">Mes</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <TaskChart data={chartData} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Tareas recientes</CardTitle>
            <CardDescription>Últimas tareas agregadas al sistema</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <RecentTasksList 
              tasks={recentTasks} 
              onViewAll={() => navigate("/tasks")} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium">Proyecto más activo</CardTitle>
              <CardDescription>Basado en tareas completadas</CardDescription>
            </div>
            <BarChart4 className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Rediseño de UI</div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <div className="flex items-center mr-2">
                <Users className="w-3 h-3 mr-1" />
                <span>4 miembros</span>
              </div>
              <div className="flex items-center">
                <CheckCheck className="w-3 h-3 mr-1" />
                <span>12 tareas</span>
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div className="bg-primary-500 h-full w-3/4 rounded-full"></div>
            </div>
            <div className="mt-2 text-sm text-right text-neutral-500">75% completado</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium">Próximos vencimientos</CardTitle>
              <CardDescription>Tareas que vencen pronto</CardDescription>
            </div>
            <CalendarDays className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start px-2 py-1.5 rounded-md hover:bg-neutral-50">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-amber-500 mr-2"></div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Entrega de prototipo</div>
                    <div className="text-xs text-neutral-500">Vence en {i} días</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium">Rendimiento del equipo</CardTitle>
              <CardDescription>Basado en tareas completadas</CardDescription>
            </div>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "María L.", role: "Diseñadora", score: 92 },
                { name: "Juan P.", role: "Desarrollador", score: 86 },
                { name: "Carlos M.", role: "Gerente", score: 78 },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center text-xs font-medium mr-3">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-neutral-500">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{member.score}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Board */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Tablero de tareas</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/tasks")}>
            Ver completo
          </Button>
        </div>
        <TaskBoard 
          tasks={tasks} 
          categories={categories}
          isLoading={isLoadingTasks || isLoadingCategories} 
        />
      </div>
      
      {/* Task Form Modal */}
      <TaskForm 
        isOpen={isTaskFormOpen} 
        onClose={() => setIsTaskFormOpen(false)} 
      />
    </div>
  );
}
