import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TaskChart } from "@/components/dashboard/task-chart";
import { RecentTasksList } from "@/components/dashboard/recent-tasks-list";
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
  Mail,
  ArrowUpRight,
  LayoutDashboard
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
      <div className="neon-card rounded-lg p-5 mb-6 shadow-xl bg-neon-dark border border-neon-purple/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <span className="bg-neon-purple/10 text-neon-purple p-1.5 rounded-md mr-3 border border-neon-purple/30 shadow-[0_0_8px_rgba(187,0,255,0.2)]">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <span className="neon-text-purple font-mono">Panel de Control</span>
            </h1>
            <p className="mt-2 text-sm text-neon-text/90 pl-[46px]">
              Bienvenido de nuevo, <span className="text-neon-purple font-medium">Admin Demo</span> - 
              <span className="text-neon-text/70"> {new Date().toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'})}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Button 
              variant="outline"
              size="sm" 
              className="h-9 border-neon-green/50 text-neon-text hover:bg-neon-green/10 hover:text-neon-green rounded-md transition-all neon-button-green"
            >
              <Mail className="mr-2 h-4 w-4 text-neon-green/80" />
              Reportes
            </Button>
            <Button 
              onClick={() => setIsTaskFormOpen(true)}
              size="sm" 
              className="h-9 shadow-glow bg-neon-pink hover:bg-neon-pink/90 text-neon-darker rounded-md transition-all font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva tarea
            </Button>
          </div>
        </div>
      </div>

      {/* Task Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neon-accent neon-text font-mono">Distribución de tareas</CardTitle>
              <CardDescription className="text-neon-text/70">Resumen por estado</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
                <BarChart4 className="h-5 w-5" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/tasks")}
                className="h-8 border-neon-accent/50 hover:bg-neon-accent/10 text-neon-text hover:text-neon-accent rounded-md neon-button"
              >
                Ver tareas
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md">
                <div className="relative pt-1">
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-neon-text border border-neon-red/30 bg-neon-red/10 rounded-full shadow-[0_0_5px_rgba(255,45,109,0.15)]">Pendientes</span>
                      <span className="text-xs font-semibold ml-2 text-neon-red">{stats.pending}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-neon-red">
                        {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-neon-medium/30 border border-neon-red/20">
                    <div style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }} className="shadow-[0_0_10px_rgba(255,45,109,0.5)] flex flex-col text-center whitespace-nowrap justify-center bg-neon-red/80 animate-pulse"></div>
                  </div>
                  
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-neon-text border border-neon-yellow/30 bg-neon-yellow/10 rounded-full shadow-[0_0_5px_rgba(255,234,0,0.15)]">En progreso</span>
                      <span className="text-xs font-semibold ml-2 text-neon-yellow">{stats.inProgress}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-neon-yellow">
                        {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-neon-medium/30 border border-neon-yellow/20">
                    <div style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }} className="shadow-[0_0_10px_rgba(255,234,0,0.5)] flex flex-col text-center whitespace-nowrap justify-center bg-neon-yellow/80 animate-pulse"></div>
                  </div>
                  
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-neon-text border border-neon-purple/30 bg-neon-purple/10 rounded-full shadow-[0_0_5px_rgba(187,0,255,0.15)]">En revisión</span>
                      <span className="text-xs font-semibold ml-2 text-neon-purple">{stats.review}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-neon-purple">
                        {stats.total > 0 ? Math.round((stats.review / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-neon-medium/30 border border-neon-purple/20">
                    <div style={{ width: `${stats.total > 0 ? (stats.review / stats.total) * 100 : 0}%` }} className="shadow-[0_0_10px_rgba(187,0,255,0.5)] flex flex-col text-center whitespace-nowrap justify-center bg-neon-purple/80 animate-pulse"></div>
                  </div>
                  
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-neon-text border border-neon-green/30 bg-neon-green/10 rounded-full shadow-[0_0_5px_rgba(0,255,157,0.15)]">Completadas</span>
                      <span className="text-xs font-semibold ml-2 text-neon-green">{stats.completed}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-neon-green">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-neon-medium/30 border border-neon-green/20">
                    <div style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} className="shadow-[0_0_10px_rgba(0,255,157,0.5)] flex flex-col text-center whitespace-nowrap justify-center bg-neon-green/80 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neon-accent neon-text font-mono">Rendimiento semanal</CardTitle>
              <CardDescription className="text-neon-text/70">Tareas completadas vs. creadas</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
                <CheckCheck className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-neon-text/90">Eficiencia</div>
                  <div className="text-2xl font-bold text-neon-accent font-mono neon-text">83%</div>
                </div>
                <div className="flex items-center text-emerald-400 font-medium text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+12% vs. semana anterior</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-3 text-xs text-neon-text/70 font-medium">
                  <div>Lun</div>
                  <div>Mié</div>
                  <div>Vie</div>
                </div>
                <div className="grid grid-cols-7 gap-1 h-16">
                  {chartData.map((day, i) => (
                    <div key={i} className="bg-neon-medium/30 rounded-md relative overflow-hidden border border-neon-accent/20">
                      <div 
                        className="absolute bottom-0 w-full bg-neon-pink/80 shadow-[0_0_8px_rgba(0,225,255,0.4)]"
                        style={{ 
                          height: `${(day.completed / Math.max(...chartData.map(d => Math.max(d.created, d.completed)))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-neon-text/80">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-neon-pink/80 rounded-sm mr-2 shadow-[0_0_4px_rgba(0,225,255,0.4)]"></div>
                    <span>Completadas ({chartData.reduce((sum, day) => sum + day.completed, 0)})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 border border-dashed border-neon-accent/60 rounded-sm mr-2"></div>
                    <span>Creadas ({chartData.reduce((sum, day) => sum + day.created, 0)})</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de tareas"
          value={stats.total}
          icon={FileText}
          linkText="Ver todas"
          linkHref="/tasks"
          iconColor="text-neon-green"
          iconBgColor="bg-neon-dark"
          trend={{ value: "12%", isPositive: true }}
        />
        
        <MetricCard
          title="Pendientes"
          value={stats.pending}
          icon={Clock}
          linkText="Ver pendientes"
          linkHref="/tasks/pending"
          iconColor="text-neon-purple"
          iconBgColor="bg-neon-dark"
          trend={{ value: "4%", isPositive: false }}
        />
        
        <MetricCard
          title="Completadas"
          value={stats.completed}
          icon={CheckCheck}
          linkText="Ver completadas"
          linkHref="/tasks/completed"
          iconColor="text-neon-pink"
          iconBgColor="bg-neon-dark"
          trend={{ value: "18%", isPositive: true }}
        />
        
        <MetricCard
          title="En revisión"
          value={stats.review}
          icon={AlertTriangle}
          linkText="Ver en revisión"
          linkHref="/tasks/review"
          iconColor="text-neon-yellow"
          iconBgColor="bg-neon-dark"
          trend={{ value: "2%", isPositive: true }}
        />
      </div>

      {/* Overview Tabs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
        <Card className="md:col-span-4 neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]">
          <CardHeader className="pb-3 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-medium text-neon-accent neon-text font-mono">Resumen de actividad</CardTitle>
                <CardDescription className="text-neon-text/70">Actividad de tareas en la última semana</CardDescription>
              </div>
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
                <BarChart4 className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <Tabs defaultValue="semana" className="w-full mb-2">
              <div className="flex justify-end mb-3">
                <TabsList className="grid w-[200px] grid-cols-3 h-8 bg-neon-medium/30 border border-neon-accent/30">
                  <TabsTrigger value="dia" className="data-[state=active]:bg-neon-accent/30 data-[state=active]:text-neon-accent text-neon-text/80">Día</TabsTrigger>
                  <TabsTrigger value="semana" className="data-[state=active]:bg-neon-accent/30 data-[state=active]:text-neon-accent text-neon-text/80">Semana</TabsTrigger>
                  <TabsTrigger value="mes" className="data-[state=active]:bg-neon-accent/30 data-[state=active]:text-neon-accent text-neon-text/80">Mes</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="dia" className="m-0">
                <TaskChart data={chartData.slice(0, 1)} />
              </TabsContent>
              <TabsContent value="semana" className="m-0">
                <TaskChart data={chartData} />
              </TabsContent>
              <TabsContent value="mes" className="m-0">
                <TaskChart data={chartData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neon-accent neon-text font-mono">Tareas recientes</CardTitle>
              <CardDescription className="text-neon-text/70">Últimas adiciones</CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <RecentTasksList 
              tasks={recentTasks} 
              onViewAll={() => navigate("/tasks")} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neon-accent neon-text font-mono">Proyecto destacado</CardTitle>
              <CardDescription className="text-neon-text/70">Mayor actividad</CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
              <BarChart4 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="text-lg font-bold text-neon-text font-mono">Rediseño de UI</div>
            <div className="flex items-center text-sm text-neon-text/80 mt-1.5 space-x-4">
              <div className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-neon-accent/60" />
                <span className="font-medium">4 miembros</span>
              </div>
              <div className="flex items-center">
                <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-neon-accent/60" />
                <span className="font-medium">12 tareas</span>
              </div>
            </div>
            <div className="mt-5 mb-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-neon-text/90">Progreso</span>
                <span className="font-semibold text-neon-accent">75%</span>
              </div>
              <div className="h-2.5 w-full bg-neon-medium/30 rounded-full overflow-hidden border border-neon-accent/20">
                <div className="bg-neon-accent/80 h-full w-3/4 rounded-full shadow-[0_0_8px_rgba(0,225,255,0.4)]"></div>
              </div>
            </div>
            <div className="mt-4 text-xs text-right">
              <span className="text-neon-accent hover:text-neon-accent/80 font-medium inline-flex items-center hover:underline cursor-pointer transition-colors" onClick={() => navigate("/projects")}>
                Ver todos los proyectos
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neon-accent neon-text font-mono">Próximos vencimientos</CardTitle>
              <CardDescription className="text-neon-text/70">Tareas pendientes</CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
              <CalendarDays className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neon-accent/10">
              {[
                { title: "Entrega de prototipo", days: 1, category: "Diseño" },
                { title: "Revisión con cliente", days: 2, category: "Reunión" },
                { title: "Implementar feedback", days: 3, category: "Desarrollo" }
              ].map((task, i) => (
                <div key={i} className="flex items-start p-4 hover:bg-neon-medium/10 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent text-xs font-bold border border-neon-accent/30 shadow-[0_0_5px_rgba(0,225,255,0.3)]">
                      {task.days}d
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-neon-text truncate">{task.title}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-neon-text/60">{task.category}</span>
                      <span className="mx-1.5 text-neon-accent/30">•</span>
                      <span className="text-xs font-medium text-neon-accent">
                        {task.days === 1 ? 'Mañana' : `En ${task.days} días`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neon-accent neon-text font-mono">Rendimiento del equipo</CardTitle>
              <CardDescription className="text-neon-text/70">Top 3 miembros</CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[
                { name: "María L.", role: "Diseñadora", score: 92, color: "bg-blue-500" },
                { name: "Juan P.", role: "Desarrollador", score: 86, color: "bg-emerald-500" },
                { name: "Carlos M.", role: "Gerente", score: 78, color: "bg-amber-500" },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-neon-medium/40 border border-neon-accent/30 text-neon-text flex items-center justify-center text-sm font-medium mr-3 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neon-text">{member.name}</div>
                      <div className="text-xs text-neon-text/60">{member.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-neon-accent/30 border-neon-accent text-neon-accent' : 'bg-neon-medium/30 border-neon-accent/30 text-neon-text/80'} text-xs font-bold mr-1.5 border shadow-[0_0_5px_rgba(0,225,255,0.2)]`}>
                      {i + 1}
                    </div>
                    <div className="text-sm font-bold text-neon-accent">{member.score}<span className="text-neon-text/40 font-normal">%</span></div>
                  </div>
                </div>
              ))}
              <div className="pt-2 mt-1 border-t border-neon-accent/20 text-center">
                <span className="text-neon-accent hover:text-neon-accent/80 text-xs font-medium inline-flex items-center hover:underline cursor-pointer transition-colors" onClick={() => navigate("/team")}>
                  Ver todo el equipo
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      
      {/* Task Form Modal */}
      <TaskForm 
        isOpen={isTaskFormOpen} 
        onClose={() => setIsTaskFormOpen(false)} 
      />
    </div>
  );
}
