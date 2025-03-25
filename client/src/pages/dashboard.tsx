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
      <div className="bg-white rounded-lg p-5 mb-6 shadow-sm border border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center">
              <span className="bg-primary-50 text-primary-600 p-1.5 rounded-md mr-3">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              Panel de Control
            </h1>
            <p className="mt-2 text-sm text-neutral-500 pl-[46px]">
              Bienvenido de nuevo, <span className="text-primary-700 font-medium">Admin Demo</span> - 
              <span className="text-neutral-400"> {new Date().toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'})}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Button 
              variant="outline"
              size="sm" 
              className="h-9 border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-md transition-all"
            >
              <Mail className="mr-2 h-4 w-4 text-neutral-500" />
              Reportes
            </Button>
            <Button 
              onClick={() => setIsTaskFormOpen(true)}
              size="sm" 
              className="h-9 shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva tarea
            </Button>
          </div>
        </div>
      </div>

      {/* Task Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-neutral-100 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-neutral-100 bg-neutral-50/50">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neutral-800">Distribución de tareas</CardTitle>
              <CardDescription>Resumen por estado</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                <BarChart4 className="h-5 w-5" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/tasks")}
                className="h-8 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 text-neutral-700 rounded-md"
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
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-100 rounded-full">Pendientes</span>
                      <span className="text-xs font-semibold ml-2">{stats.pending}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-rose-600">
                        {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-rose-200">
                    <div style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-rose-500"></div>
                  </div>
                  
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-amber-600 bg-amber-100 rounded-full">En progreso</span>
                      <span className="text-xs font-semibold ml-2">{stats.inProgress}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-amber-600">
                        {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-amber-200">
                    <div style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
                  </div>
                  
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">En revisión</span>
                      <span className="text-xs font-semibold ml-2">{stats.review}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {stats.total > 0 ? Math.round((stats.review / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-blue-200">
                    <div style={{ width: `${stats.total > 0 ? (stats.review / stats.total) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                  </div>
                  
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-emerald-600 bg-emerald-100 rounded-full">Completadas</span>
                      <span className="text-xs font-semibold ml-2">{stats.completed}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-emerald-600">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-emerald-200">
                    <div style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-100 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-neutral-100 bg-neutral-50/50">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neutral-800">Rendimiento semanal</CardTitle>
              <CardDescription>Tareas completadas vs. creadas</CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
              <CheckCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-neutral-700">Eficiencia</div>
                  <div className="text-2xl font-bold text-neutral-900">83%</div>
                </div>
                <div className="flex items-center text-emerald-600 font-medium text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+12% vs. semana anterior</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-3 text-xs text-neutral-500 font-medium">
                  <div>Lun</div>
                  <div>Mié</div>
                  <div>Vie</div>
                </div>
                <div className="grid grid-cols-7 gap-1 h-16">
                  {chartData.map((day, i) => (
                    <div key={i} className="bg-primary-50 rounded-md relative overflow-hidden">
                      <div 
                        className="absolute bottom-0 w-full bg-primary-500"
                        style={{ 
                          height: `${(day.completed / Math.max(...chartData.map(d => Math.max(d.created, d.completed)))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-sm mr-2"></div>
                    <span>Completadas ({chartData.reduce((sum, day) => sum + day.completed, 0)})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 border border-dashed border-primary-500 rounded-sm mr-2"></div>
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
        <Card className="md:col-span-4 border-neutral-100 shadow-md overflow-hidden">
          <CardHeader className="pb-3 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-medium text-neutral-800">Resumen de actividad</CardTitle>
                <CardDescription>Actividad de tareas en la última semana</CardDescription>
              </div>
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                <BarChart4 className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <Tabs defaultValue="semana" className="w-full mb-2">
              <div className="flex justify-end mb-3">
                <TabsList className="grid w-[200px] grid-cols-3 h-8">
                  <TabsTrigger value="dia">Día</TabsTrigger>
                  <TabsTrigger value="semana">Semana</TabsTrigger>
                  <TabsTrigger value="mes">Mes</TabsTrigger>
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
        
        <Card className="md:col-span-2 border-neutral-100 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neutral-100 bg-neutral-50/50">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neutral-800">Tareas recientes</CardTitle>
              <CardDescription>Últimas adiciones</CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
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
        <Card className="border-neutral-100 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neutral-100 bg-neutral-50/50">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neutral-800">Proyecto destacado</CardTitle>
              <CardDescription>Mayor actividad</CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
              <BarChart4 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="text-lg font-bold text-neutral-900">Rediseño de UI</div>
            <div className="flex items-center text-sm text-neutral-600 mt-1.5 space-x-4">
              <div className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                <span className="font-medium">4 miembros</span>
              </div>
              <div className="flex items-center">
                <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                <span className="font-medium">12 tareas</span>
              </div>
            </div>
            <div className="mt-5 mb-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-neutral-700">Progreso</span>
                <span className="font-semibold text-primary-700">75%</span>
              </div>
              <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div className="bg-primary-500 h-full w-3/4 rounded-full"></div>
              </div>
            </div>
            <div className="mt-4 text-xs text-right">
              <span className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center hover:underline cursor-pointer" onClick={() => navigate("/projects")}>
                Ver todos los proyectos
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-100 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neutral-100 bg-neutral-50/50">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neutral-800">Próximos vencimientos</CardTitle>
              <CardDescription>Tareas pendientes</CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
              <CalendarDays className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-100">
              {[
                { title: "Entrega de prototipo", days: 1, category: "Diseño" },
                { title: "Revisión con cliente", days: 2, category: "Reunión" },
                { title: "Implementar feedback", days: 3, category: "Desarrollo" }
              ].map((task, i) => (
                <div key={i} className="flex items-start p-4 hover:bg-neutral-50 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center bg-amber-100 text-amber-600 text-xs font-bold">
                      {task.days}d
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-neutral-900 truncate">{task.title}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-neutral-500">{task.category}</span>
                      <span className="mx-1.5 text-neutral-300">•</span>
                      <span className="text-xs font-medium text-amber-600">
                        {task.days === 1 ? 'Mañana' : `En ${task.days} días`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-100 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neutral-100 bg-neutral-50/50">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neutral-800">Rendimiento del equipo</CardTitle>
              <CardDescription>Top 3 miembros</CardDescription>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[
                { name: "María L.", role: "Diseñadora", score: 92, color: "bg-primary-500" },
                { name: "Juan P.", role: "Desarrollador", score: 86, color: "bg-emerald-500" },
                { name: "Carlos M.", role: "Gerente", score: 78, color: "bg-amber-500" },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center text-sm font-medium mr-3">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">{member.name}</div>
                      <div className="text-xs text-neutral-500">{member.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold mr-1.5">
                      {i + 1}
                    </div>
                    <div className="text-sm font-bold text-neutral-800">{member.score}<span className="text-neutral-400 font-normal">%</span></div>
                  </div>
                </div>
              ))}
              <div className="pt-2 mt-1 border-t border-neutral-100 text-center">
                <span className="text-primary-600 hover:text-primary-700 text-xs font-medium inline-flex items-center hover:underline cursor-pointer" onClick={() => navigate("/team")}>
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
