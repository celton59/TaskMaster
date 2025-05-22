import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TaskChart } from "@/components/dashboard/task-chart";
import { RecentTasksList } from "@/components/dashboard/recent-tasks-list";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { neonEffectClasses } from "@/lib/neon-effects";

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
  
  // Obtener el tema actual
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
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
      <div className={isDarkMode 
          ? "neon-card rounded-lg p-5 mb-6 shadow-xl bg-neon-dark border border-neon-purple/30" 
          : "rounded-lg p-5 mb-6 shadow-md bg-white border border-gray-200"
        }>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold tracking-tight flex items-center">
                <span className={isDarkMode
                  ? "bg-neon-purple/10 text-neon-purple p-1.5 rounded-md mr-3 border border-neon-purple/30 shadow-[0_0_8px_rgba(187,0,255,0.2)]"
                  : "bg-purple-50 text-purple-700 p-1.5 rounded-md mr-3 border border-purple-200"
                }>
                  <LayoutDashboard className="h-5 w-5" />
                </span>
                <span className={isDarkMode ? "terminal-text" : "text-gray-800"}>Panel de Control</span>
              </h1>

            </div>
            <p className="mt-2 text-sm text-neon-text/90 pl-[46px]">
              Bienvenido de nuevo, <span className="text-neon-purple font-medium">Admin Demo</span> - 
              <span className="text-neon-text/70"> {new Date().toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'})}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Button 
              variant="outline"
              size="sm" 
              className="h-9 bg-neon-dark/80 border border-neon-green/50 text-neon-green/80 
              hover:bg-neon-green/10 hover:text-neon-green hover:border-neon-green/70 rounded-md 
              transition-all duration-300 shadow-[0_0_8px_rgba(0,255,157,0.2)] 
              hover:shadow-[0_0_12px_rgba(0,255,157,0.4)]"
            >
              <Mail className="mr-2 h-4 w-4 text-neon-green" />
              Reportes
            </Button>
            <Button 
              onClick={() => setIsTaskFormOpen(true)}
              size="sm" 
              className="h-9 bg-gradient-to-r from-neon-pink to-neon-pink/80 hover:from-neon-pink/90 hover:to-neon-pink 
              text-neon-darker rounded-md transition-all font-medium shadow-[0_0_10px_rgba(255,0,230,0.4)] 
              hover:shadow-[0_0_15px_rgba(255,0,230,0.6)] border border-neon-pink/50"
            >
              <Plus className="mr-2 h-4 w-4 animate-pulse-slow" />
              Nueva tarea
            </Button>
          </div>
        </div>
      </div>

      {/* Task Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className={isDarkMode 
          ? "neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]"
          : "overflow-hidden border border-gray-200 bg-white shadow-sm"
        }>
          <CardHeader className={isDarkMode 
            ? "flex flex-row items-center justify-between pb-3 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark"
            : "flex flex-row items-center justify-between pb-3 border-b border-gray-200 bg-white"
          }>
            <div className="space-y-0.5">
              <CardTitle className={isDarkMode
                ? "text-base font-medium text-neon-accent neon-text font-mono"
                : "text-base font-medium text-blue-700"
              }>Distribución de tareas</CardTitle>
              <CardDescription className={isDarkMode 
                ? "text-neon-text/70" 
                : "text-gray-500"
              }>Resumen por estado</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className={isDarkMode
                ? "h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]"
                : "h-9 w-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-700 border border-blue-200"
              }>
                <BarChart4 className="h-5 w-5" />
              </div>
              <Button 
                variant={isDarkMode ? "outline" : "secondary"}
                size="sm" 
                onClick={() => navigate("/tasks")}
                className={isDarkMode
                  ? "h-8 bg-neon-dark/80 border border-neon-accent/50 text-neon-accent/80 hover:bg-neon-accent/10 hover:text-neon-accent hover:border-neon-accent/70 rounded-md transition-all duration-300 shadow-[0_0_8px_rgba(0,225,255,0.2)] hover:shadow-[0_0_12px_rgba(0,225,255,0.4)]"
                  : "h-8 bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
                }
              >
                Ver tareas
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md">
                <div className="relative pt-1">
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className={isDarkMode 
                        ? "inline-block px-2 py-1 text-xs font-semibold text-neon-text border border-neon-red/30 bg-neon-red/10 rounded-full shadow-[0_0_5px_rgba(255,45,109,0.15)]"
                        : "inline-block px-2 py-1 text-xs font-semibold text-gray-700 border border-red-200 bg-white rounded-full"
                      }>Pendientes</span>
                      <span className={isDarkMode 
                        ? "text-xs font-semibold ml-2 text-neon-red"
                        : "text-xs font-semibold ml-2 text-red-600"
                      }>{stats.pending}</span>
                    </div>
                    <div className="text-right">
                      <span className={isDarkMode
                        ? "text-xs font-semibold inline-block text-neon-red"
                        : "text-xs font-semibold inline-block text-red-600"
                      }>
                        {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className={isDarkMode
                    ? "overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-neon-medium/30 border border-neon-red/20"
                    : "overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-gray-100 border border-gray-200"
                  }>
                    <div 
                      style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }} 
                      className={isDarkMode
                        ? "shadow-[0_0_10px_rgba(255,45,109,0.5)] flex flex-col text-center whitespace-nowrap justify-center bg-neon-red/80 animate-pulse"
                        : "flex flex-col text-center whitespace-nowrap justify-center bg-red-500"
                      }>
                    </div>
                  </div>
                  
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className={isDarkMode 
                        ? "inline-block px-2 py-1 text-xs font-semibold text-neon-text border border-neon-yellow/30 bg-neon-yellow/10 rounded-full shadow-[0_0_5px_rgba(255,234,0,0.15)]"
                        : "inline-block px-2 py-1 text-xs font-semibold text-gray-700 border border-amber-200 bg-white rounded-full"
                      }>En progreso</span>
                      <span className={isDarkMode 
                        ? "text-xs font-semibold ml-2 text-neon-yellow"
                        : "text-xs font-semibold ml-2 text-amber-600"
                      }>{stats.inProgress}</span>
                    </div>
                    <div className="text-right">
                      <span className={isDarkMode
                        ? "text-xs font-semibold inline-block text-neon-yellow"
                        : "text-xs font-semibold inline-block text-amber-600"
                      }>
                        {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className={isDarkMode
                    ? "overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-neon-medium/30 border border-neon-yellow/20"
                    : "overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-gray-100 border border-gray-200"
                  }>
                    <div 
                      style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }} 
                      className={isDarkMode
                        ? "shadow-[0_0_10px_rgba(255,234,0,0.5)] flex flex-col text-center whitespace-nowrap justify-center bg-neon-yellow/80 animate-pulse"
                        : "flex flex-col text-center whitespace-nowrap justify-center bg-amber-500"
                      }>
                    </div>
                  </div>
                  
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className={isDarkMode 
                        ? "inline-block px-2 py-1 text-xs font-semibold text-neon-text border border-neon-purple/30 bg-neon-purple/10 rounded-full shadow-[0_0_5px_rgba(187,0,255,0.15)]"
                        : "inline-block px-2 py-1 text-xs font-semibold text-gray-700 border border-purple-200 bg-white rounded-full"
                      }>En revisión</span>
                      <span className={isDarkMode 
                        ? "text-xs font-semibold ml-2 text-neon-purple"
                        : "text-xs font-semibold ml-2 text-purple-600"
                      }>{stats.review}</span>
                    </div>
                    <div className="text-right">
                      <span className={isDarkMode
                        ? "text-xs font-semibold inline-block text-neon-purple"
                        : "text-xs font-semibold inline-block text-purple-600"
                      }>
                        {stats.total > 0 ? Math.round((stats.review / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className={isDarkMode
                    ? "overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-neon-medium/30 border border-neon-purple/20"
                    : "overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-gray-100 border border-gray-200"
                  }>
                    <div 
                      style={{ width: `${stats.total > 0 ? (stats.review / stats.total) * 100 : 0}%` }} 
                      className={isDarkMode
                        ? "shadow-[0_0_10px_rgba(187,0,255,0.5)] flex flex-col text-center whitespace-nowrap justify-center bg-neon-purple/80 animate-pulse"
                        : "flex flex-col text-center whitespace-nowrap justify-center bg-purple-500"
                      }>
                    </div>
                  </div>
                  
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className={isDarkMode 
                        ? "inline-block px-2 py-1 text-xs font-semibold text-neon-text border border-neon-green/30 bg-neon-green/10 rounded-full shadow-[0_0_5px_rgba(0,255,157,0.15)]"
                        : "inline-block px-2 py-1 text-xs font-semibold text-gray-700 border border-emerald-200 bg-white rounded-full"
                      }>Completadas</span>
                      <span className={isDarkMode 
                        ? "text-xs font-semibold ml-2 text-neon-green"
                        : "text-xs font-semibold ml-2 text-emerald-600"
                      }>{stats.completed}</span>
                    </div>
                    <div className="text-right">
                      <span className={isDarkMode
                        ? "text-xs font-semibold inline-block text-neon-green"
                        : "text-xs font-semibold inline-block text-emerald-600"
                      }>
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className={isDarkMode
                    ? "overflow-hidden h-2 text-xs flex rounded-full bg-neon-medium/30 border border-neon-green/20"
                    : "overflow-hidden h-2 text-xs flex rounded-full bg-gray-100 border border-gray-200"
                  }>
                    <div 
                      style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} 
                      className={isDarkMode
                        ? "shadow-[0_0_10px_rgba(0,255,157,0.5)] flex flex-col text-center whitespace-nowrap justify-center bg-neon-green/80 animate-pulse"
                        : "flex flex-col text-center whitespace-nowrap justify-center bg-emerald-500"
                      }>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode 
          ? "neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]"
          : "overflow-hidden border border-gray-200 bg-white shadow-sm"
        }>
          <CardHeader className={isDarkMode 
            ? "flex flex-row items-center justify-between pb-3 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark"
            : "flex flex-row items-center justify-between pb-3 border-b border-gray-200 bg-white"
          }>
            <div className="space-y-0.5">
              <CardTitle className={isDarkMode
                ? "text-base font-medium text-neon-accent neon-text font-mono"
                : "text-base font-medium text-blue-700"
              }>Rendimiento semanal</CardTitle>
              <CardDescription className={isDarkMode 
                ? "text-neon-text/70" 
                : "text-gray-500"
              }>Tareas completadas vs. creadas</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className={isDarkMode
                ? "h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]"
                : "h-9 w-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-700 border border-blue-200"
              }>
                <CheckCheck className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className={isDarkMode 
                    ? "text-sm font-medium text-neon-text/90" 
                    : "text-sm font-medium text-gray-700"
                  }>Eficiencia</div>
                  <div className={isDarkMode 
                    ? "text-2xl font-bold text-neon-accent font-mono neon-text" 
                    : "text-2xl font-bold text-blue-700"
                  }>83%</div>
                </div>
                <div className="flex items-center text-emerald-400 font-medium text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+12% vs. semana anterior</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className={isDarkMode 
                  ? "grid grid-cols-3 text-xs text-neon-text/70 font-medium"
                  : "grid grid-cols-3 text-xs text-gray-500 font-medium"
                }>
                  <div>Lun</div>
                  <div>Mié</div>
                  <div>Vie</div>
                </div>
                <div className="grid grid-cols-7 gap-1 h-16">
                  {chartData.map((day, i) => (
                    <div key={i} className={isDarkMode
                      ? "bg-neon-medium/30 rounded-md relative overflow-hidden border border-neon-accent/20"
                      : "bg-gray-100 rounded-md relative overflow-hidden border border-gray-200"
                    }>
                      <div 
                        className={isDarkMode
                          ? "absolute bottom-0 w-full bg-gradient-to-t from-neon-pink/90 to-neon-pink/70 shadow-[0_0_10px_rgba(0,225,255,0.6)] transition-all duration-500 ease-in-out hover:shadow-[0_0_15px_rgba(0,255,230,0.8)]"
                          : "absolute bottom-0 w-full bg-pink-500 transition-all duration-300"
                        }
                        style={{ 
                          height: `${(day.completed / Math.max(...chartData.map(d => Math.max(d.created, d.completed)))) * 100}%`,
                          animation: isDarkMode ? `pulse-scale 1.5s ease-in-out ${i * 0.15}s infinite alternate` : 'none',
                        }}
                      >
                        {isDarkMode && (
                          <>
                            <div className="absolute bottom-0 w-full h-1/4 bg-white/20 opacity-70"></div>
                            <div className="absolute top-0 w-full h-[1px] bg-white/40 opacity-80"></div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={isDarkMode
                  ? "flex items-center justify-between text-xs text-neon-text/80"
                  : "flex items-center justify-between text-xs text-gray-600"
                }>
                  <div className="flex items-center">
                    <div className={isDarkMode
                      ? "w-3 h-3 bg-neon-pink/80 rounded-sm mr-2 shadow-[0_0_4px_rgba(0,225,255,0.4)]"
                      : "w-3 h-3 bg-pink-500 rounded-sm mr-2"
                    }></div>
                    <span>Completadas ({chartData.reduce((sum, day) => sum + day.completed, 0)})</span>
                  </div>
                  <div className="flex items-center">
                    <div className={isDarkMode
                      ? "w-3 h-3 border border-dashed border-neon-accent/60 rounded-sm mr-2"
                      : "w-3 h-3 border border-dashed border-blue-400 rounded-sm mr-2"
                    }></div>
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
        <Card className={isDarkMode 
          ? "md:col-span-4 neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)]"
          : "md:col-span-4 overflow-hidden border border-gray-200 bg-white shadow-sm"
        }>
          <CardHeader className={isDarkMode 
            ? "pb-3 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker to-neon-dark"
            : "pb-3 border-b border-gray-200 bg-white"
          }>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className={isDarkMode
                  ? "text-base font-medium text-neon-accent neon-text font-mono"
                  : "text-base font-medium text-blue-700"
                }>Resumen de actividad</CardTitle>
                <CardDescription className={isDarkMode 
                  ? "text-neon-text/70"
                  : "text-gray-500"
                }>Actividad de tareas en la última semana</CardDescription>
              </div>
              <div className={isDarkMode
                ? "h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]"
                : "h-9 w-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-700 border border-blue-200"
              }>
                <BarChart4 className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <Tabs defaultValue="semana" className="w-full mb-2">
              <div className="flex justify-end mb-3">
                <TabsList className={isDarkMode
                  ? "grid w-[200px] grid-cols-3 h-8 bg-neon-medium/30 border border-neon-accent/30"
                  : "grid w-[200px] grid-cols-3 h-8 bg-gray-100 border border-gray-200"
                }>
                  <TabsTrigger className={isDarkMode
                    ? "data-[state=active]:bg-neon-accent/30 data-[state=active]:text-neon-accent text-neon-text/80"
                    : "data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-600"
                  } value="dia">Día</TabsTrigger>
                  <TabsTrigger className={isDarkMode
                    ? "data-[state=active]:bg-neon-accent/30 data-[state=active]:text-neon-accent text-neon-text/80"
                    : "data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-600"
                  } value="semana">Semana</TabsTrigger>
                  <TabsTrigger className={isDarkMode
                    ? "data-[state=active]:bg-neon-accent/30 data-[state=active]:text-neon-accent text-neon-text/80"
                    : "data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-600"
                  } value="mes">Mes</TabsTrigger>
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
        
        <Card className={isDarkMode 
          ? "md:col-span-2 neon-card overflow-hidden border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)] animate-card-glow"
          : "md:col-span-2 overflow-hidden border border-gray-200 bg-white shadow-sm"
        }>
          <CardHeader className={isDarkMode 
            ? "flex flex-row items-center justify-between pb-2 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker via-neon-medium/20 to-neon-dark bg-[length:200%_100%] animate-flow-gradient"
            : "flex flex-row items-center justify-between pb-2 border-b border-gray-200 bg-white"
          }>
            <div className="space-y-0.5">
              <CardTitle className={isDarkMode
                ? "text-base font-medium text-neon-accent [text-shadow:0_0_10px_rgba(0,225,255,0.5)] font-mono"
                : "text-base font-medium text-blue-700"
              }>Tareas recientes</CardTitle>
              <CardDescription className={isDarkMode 
                ? "text-neon-text/70"
                : "text-gray-500"
              }>Últimas adiciones</CardDescription>
            </div>
            <div className={isDarkMode
              ? "h-9 w-9 rounded-full flex items-center justify-center bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]"
              : "h-9 w-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-700 border border-blue-200"
            }>
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <RecentTasksList 
              tasks={recentTasks} 
              onViewAll={() => navigate("/tasks")} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className={isDarkMode 
          ? "neon-card overflow-hidden border border-neon-green/30 bg-neon-dark shadow-[0_0_10px_rgba(0,255,157,0.1)]"
          : "overflow-hidden border border-gray-200 bg-white shadow-sm"
        }>
          <CardHeader className={isDarkMode 
            ? "flex flex-row items-center justify-between pb-2 border-b border-neon-green/30 bg-gradient-to-r from-neon-darker to-neon-dark"
            : "flex flex-row items-center justify-between pb-2 border-b border-gray-200 bg-white"
          }>
            <div className="space-y-0.5">
              <CardTitle className={isDarkMode
                ? "text-base font-medium text-neon-green neon-text-green font-mono"
                : "text-base font-medium text-emerald-700"
              }>Proyecto destacado</CardTitle>
              <CardDescription className={isDarkMode 
                ? "text-neon-text/70"
                : "text-gray-500"
              }>Mayor actividad</CardDescription>
            </div>
            <div className={isDarkMode
              ? "h-9 w-9 rounded-full flex items-center justify-center bg-neon-green/20 text-neon-green border border-neon-green/30 shadow-[0_0_8px_rgba(0,255,157,0.2)]"
              : "h-9 w-9 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-700 border border-emerald-200"
            }>
              <BarChart4 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className={isDarkMode 
              ? "text-lg font-bold text-neon-text font-mono"
              : "text-lg font-bold text-gray-800"
            }>Rediseño de UI</div>
            <div className={isDarkMode 
              ? "flex items-center text-sm text-neon-text/80 mt-1.5 space-x-4"
              : "flex items-center text-sm text-gray-600 mt-1.5 space-x-4"
            }>
              <div className="flex items-center">
                <Users className={isDarkMode 
                  ? "w-3.5 h-3.5 mr-1.5 text-neon-green/60"
                  : "w-3.5 h-3.5 mr-1.5 text-emerald-500"
                } />
                <span className="font-medium">4 miembros</span>
              </div>
              <div className="flex items-center">
                <CheckCheck className={isDarkMode
                  ? "w-3.5 h-3.5 mr-1.5 text-neon-green/60"
                  : "w-3.5 h-3.5 mr-1.5 text-emerald-500"
                } />
                <span className="font-medium">12 tareas</span>
              </div>
            </div>
            <div className="mt-5 mb-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className={isDarkMode
                  ? "font-medium text-neon-text/90"
                  : "font-medium text-gray-700"
                }>Progreso</span>
                <span className={isDarkMode 
                  ? "font-semibold text-neon-green"
                  : "font-semibold text-emerald-600"
                }>75%</span>
              </div>
              <div className={isDarkMode
                ? "h-2.5 w-full bg-neon-medium/30 rounded-full overflow-hidden border border-neon-green/20"
                : "h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200"
              }>
                <div className={isDarkMode
                  ? "bg-neon-green/80 h-full w-3/4 rounded-full shadow-[0_0_8px_rgba(0,255,157,0.4)]"
                  : "bg-emerald-500 h-full w-3/4 rounded-full"
                }></div>
              </div>
            </div>
            <div className="mt-4 text-xs text-right">
              <span className={isDarkMode
                ? "text-neon-green hover:text-neon-green/80 font-medium inline-flex items-center hover:underline cursor-pointer transition-colors"
                : "text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center hover:underline cursor-pointer transition-colors"
              } onClick={() => navigate("/projects")}>
                Ver todos los proyectos
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode 
          ? "neon-card overflow-hidden border border-neon-yellow/30 bg-neon-dark shadow-[0_0_10px_rgba(255,234,0,0.1)]"
          : "overflow-hidden border border-gray-200 bg-white shadow-sm"
        }>
          <CardHeader className={isDarkMode 
            ? "flex flex-row items-center justify-between pb-2 border-b border-neon-yellow/30 bg-gradient-to-r from-neon-darker to-neon-dark"
            : "flex flex-row items-center justify-between pb-2 border-b border-gray-200 bg-white"
          }>
            <div className="space-y-0.5">
              <CardTitle className={isDarkMode
                ? "text-base font-medium text-neon-yellow neon-text-yellow font-mono"
                : "text-base font-medium text-amber-700"
              }>Próximos vencimientos</CardTitle>
              <CardDescription className={isDarkMode 
                ? "text-neon-text/70"
                : "text-gray-500"
              }>Tareas pendientes</CardDescription>
            </div>
            <div className={isDarkMode
              ? "h-9 w-9 rounded-full flex items-center justify-center bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30 shadow-[0_0_8px_rgba(255,234,0,0.2)]"
              : "h-9 w-9 rounded-full flex items-center justify-center bg-amber-50 text-amber-700 border border-amber-200"
            }>
              <CalendarDays className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className={isDarkMode 
              ? "divide-y divide-neon-yellow/10"
              : "divide-y divide-gray-100"
            }>
              {[
                { title: "Entrega de prototipo", days: 1, category: "Diseño" },
                { title: "Revisión con cliente", days: 2, category: "Reunión" },
                { title: "Implementar feedback", days: 3, category: "Desarrollo" }
              ].map((task, i) => (
                <div key={i} className={isDarkMode 
                  ? "flex items-start p-4 hover:bg-neon-medium/10 transition-colors cursor-pointer"
                  : "flex items-start p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                }>
                  <div className="flex-shrink-0 mr-3">
                    <div className={isDarkMode
                      ? "h-9 w-9 rounded-full flex items-center justify-center bg-neon-yellow/20 text-neon-yellow text-xs font-bold border border-neon-yellow/30 shadow-[0_0_5px_rgba(255,234,0,0.3)]"
                      : "h-9 w-9 rounded-full flex items-center justify-center bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200"
                    }>
                      {task.days}d
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={isDarkMode
                      ? "text-sm font-semibold text-neon-text truncate"
                      : "text-sm font-semibold text-gray-800 truncate"
                    }>{task.title}</div>
                    <div className="flex items-center mt-1">
                      <span className={isDarkMode 
                        ? "text-xs text-neon-text/60"
                        : "text-xs text-gray-500"
                      }>{task.category}</span>
                      <span className={isDarkMode 
                        ? "mx-1.5 text-neon-yellow/30"
                        : "mx-1.5 text-gray-300"
                      }>•</span>
                      <span className={isDarkMode 
                        ? "text-xs font-medium text-neon-yellow"
                        : "text-xs font-medium text-amber-600"
                      }>
                        {task.days === 1 ? 'Mañana' : `En ${task.days} días`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode 
          ? "neon-card overflow-hidden border border-neon-purple/30 bg-neon-dark shadow-[0_0_10px_rgba(187,0,255,0.1)]"
          : "overflow-hidden border border-gray-200 bg-white shadow-sm"
        }>
          <CardHeader className={isDarkMode 
            ? "flex flex-row items-center justify-between pb-2 border-b border-neon-purple/30 bg-gradient-to-r from-neon-darker to-neon-dark"
            : "flex flex-row items-center justify-between pb-2 border-b border-gray-200 bg-white"
          }>
            <div className="space-y-0.5">
              <CardTitle className={isDarkMode
                ? "text-base font-medium text-neon-purple neon-text-purple font-mono"
                : "text-base font-medium text-purple-700"
              }>Rendimiento del equipo</CardTitle>
              <CardDescription className={isDarkMode 
                ? "text-neon-text/70"
                : "text-gray-500"
              }>Top 3 miembros</CardDescription>
            </div>
            <div className={isDarkMode
              ? "h-9 w-9 rounded-full flex items-center justify-center bg-neon-purple/20 text-neon-purple border border-neon-purple/30 shadow-[0_0_8px_rgba(187,0,255,0.2)]"
              : "h-9 w-9 rounded-full flex items-center justify-center bg-purple-50 text-purple-700 border border-purple-200"
            }>
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
                    <div className={isDarkMode
                      ? "h-10 w-10 rounded-full bg-neon-medium/40 border border-neon-purple/30 text-neon-text flex items-center justify-center text-sm font-medium mr-3 shadow-[0_0_8px_rgba(187,0,255,0.2)]"
                      : "h-10 w-10 rounded-full bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center text-sm font-medium mr-3"
                    }>
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className={isDarkMode
                        ? "text-sm font-semibold text-neon-text"
                        : "text-sm font-semibold text-gray-800"
                      }>{member.name}</div>
                      <div className={isDarkMode
                        ? "text-xs text-neon-text/60"
                        : "text-xs text-gray-500"
                      }>{member.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={
                      isDarkMode
                        ? `h-6 w-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-neon-purple/30 border-neon-purple text-neon-purple' : 'bg-neon-medium/30 border-neon-purple/30 text-neon-text/80'} text-xs font-bold mr-1.5 border shadow-[0_0_5px_rgba(187,0,255,0.2)]`
                        : `h-6 w-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-gray-100 border-gray-200 text-gray-700'} text-xs font-bold mr-1.5 border`
                    }>
                      {i + 1}
                    </div>
                    <div className={isDarkMode
                      ? "text-sm font-bold text-neon-purple"
                      : "text-sm font-bold text-purple-700"
                    }>{member.score}<span className={isDarkMode 
                      ? "text-neon-text/40 font-normal"
                      : "text-gray-400 font-normal"
                    }>%</span></div>
                  </div>
                </div>
              ))}
              <div className={isDarkMode
                ? "pt-2 mt-1 border-t border-neon-purple/20 text-center"
                : "pt-2 mt-1 border-t border-gray-200 text-center"
              }>
                <span className={isDarkMode
                  ? "text-neon-purple hover:text-neon-purple/80 text-xs font-medium inline-flex items-center hover:underline cursor-pointer transition-colors"
                  : "text-purple-700 hover:text-purple-800 text-xs font-medium inline-flex items-center hover:underline cursor-pointer transition-colors"
                } onClick={() => navigate("/team")}>
                  Ver todo el equipo
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      
      {/* Robot Animation Card */}
      <div className="grid grid-cols-1 gap-6 mt-8">
        <Card className={isDarkMode 
          ? "border border-neon-accent/30 bg-neon-dark shadow-[0_0_10px_rgba(0,225,255,0.1)] overflow-hidden animate-card-glow rounded-xl"
          : "border border-gray-200 bg-white shadow-sm overflow-hidden rounded-xl"
        }>
          <CardHeader className={isDarkMode 
            ? "flex flex-row items-center justify-between pb-3 border-b border-neon-accent/30 bg-gradient-to-r from-neon-darker via-neon-medium/20 to-neon-dark bg-[length:200%_100%] animate-flow-gradient"
            : "flex flex-row items-center justify-between pb-3 border-b border-gray-200 bg-white"
          }>
            <div className="space-y-0.5">
              <CardTitle className={isDarkMode
                ? "text-base font-medium text-neon-accent [text-shadow:0_0_10px_rgba(0,225,255,0.5)] font-mono"
                : "text-base font-medium text-blue-700"
              }>Asistente Robótico</CardTitle>
              <CardDescription className={isDarkMode 
                ? "text-neon-text/70"
                : "text-gray-500"
              }>Tu compañero de productividad</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/3 flex justify-center">
              <div className={isDarkMode
                ? "w-32 h-32 rounded-full bg-neon-accent/20 flex items-center justify-center border border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.3)]"
                : "w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200"
              }>
                <Users className={isDarkMode
                  ? "w-16 h-16 text-neon-accent"
                  : "w-16 h-16 text-blue-600"
                } />
              </div>
            </div>
            <div className="md:w-2/3 space-y-4">
              <h3 className={isDarkMode
                ? "text-xl font-medium text-neon-accent"
                : "text-xl font-medium text-blue-700"
              }>Conoce a NeoBot</h3>
              <p className={isDarkMode
                ? "text-neon-text/80"
                : "text-gray-600"
              }>
                Tu asistente robótico está aquí para ayudarte a gestionar tus tareas y mantenerte productivo. 
                Puede gestionar tus mensajes de WhatsApp, organizar tu agenda y mucho más.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="flex items-start space-x-3">
                  <div className={isDarkMode
                    ? "h-8 w-8 rounded-md flex items-center justify-center bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                    : "h-8 w-8 rounded-md flex items-center justify-center bg-purple-50 text-purple-700 border border-purple-200"
                  }>
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className={isDarkMode
                      ? "text-sm font-medium text-neon-text"
                      : "text-sm font-medium text-gray-800"
                    }>Mensajería</h4>
                    <p className={isDarkMode
                      ? "text-xs text-neon-text/70"
                      : "text-xs text-gray-500"
                    }>Gestiona tus conversaciones de WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className={isDarkMode
                    ? "h-8 w-8 rounded-md flex items-center justify-center bg-neon-green/20 text-neon-green border border-neon-green/30"
                    : "h-8 w-8 rounded-md flex items-center justify-center bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }>
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className={isDarkMode
                      ? "text-sm font-medium text-neon-text"
                      : "text-sm font-medium text-gray-800"
                    }>Planificación</h4>
                    <p className={isDarkMode
                      ? "text-xs text-neon-text/70"
                      : "text-xs text-gray-500"
                    }>Organiza tu agenda y fechas límite</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className={isDarkMode
                    ? "h-8 w-8 rounded-md flex items-center justify-center bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30"
                    : "h-8 w-8 rounded-md flex items-center justify-center bg-amber-50 text-amber-700 border border-amber-200"
                  }>
                    <CheckCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className={isDarkMode
                      ? "text-sm font-medium text-neon-text"
                      : "text-sm font-medium text-gray-800"
                    }>Tareas</h4>
                    <p className={isDarkMode
                      ? "text-xs text-neon-text/70"
                      : "text-xs text-gray-500"
                    }>Crea y gestiona tus tareas fácilmente</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className={isDarkMode
                    ? "h-8 w-8 rounded-md flex items-center justify-center bg-neon-pink/20 text-neon-pink border border-neon-pink/30"
                    : "h-8 w-8 rounded-md flex items-center justify-center bg-pink-50 text-pink-700 border border-pink-200"
                  }>
                    <BarChart4 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className={isDarkMode
                      ? "text-sm font-medium text-neon-text"
                      : "text-sm font-medium text-gray-800"
                    }>Estadísticas</h4>
                    <p className={isDarkMode
                      ? "text-xs text-neon-text/70"
                      : "text-xs text-gray-500"
                    }>Analiza tu productividad</p>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Button 
                  onClick={() => navigate("/ai-assistant")}
                  className={isDarkMode
                    ? "bg-gradient-to-r from-neon-accent to-neon-accent/80 hover:from-neon-accent/90 hover:to-neon-accent text-neon-darker font-medium shadow-[0_0_15px_rgba(0,225,255,0.4)] hover:shadow-[0_0_20px_rgba(0,225,255,0.6)] transition-all duration-300 border border-neon-accent/50 animate-pulse-slow"
                    : "bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-300"
                  }
                >
                  <span className="mr-2">💬</span>
                  Hablar con el asistente
                </Button>
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
