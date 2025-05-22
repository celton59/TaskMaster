import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { 
  BarChart3, 
  Download, 
  PieChart as PieChartIcon, 
  Calendar, 
  Filter, 
  RefreshCw, 
  ArrowUpRight
} from "lucide-react";
import { Task, Category } from "@shared/schema";

// Definición de colores según el tema
const darkColors = [
  "#00E1FF", // Neón Azul (neon-accent)
  "#FF00E6", // Neón Rosa (neon-pink)
  "#BB00FF", // Neón Morado (neon-purple)
  "#00FF9D", // Neón Verde (neon-green)
  "#FFEA00", // Neón Amarillo (neon-yellow)
  "#FF6D00", // Neón Naranja (neon-orange)
  "#FF2D6D", // Neón Rojo (neon-red)
  "#1AFFEF", // Neón Turquesa
];

const lightColors = [
  "#0078D4", // Azul estándar
  "#d63384", // Rosa estándar
  "#6f42c1", // Morado estándar
  "#198754", // Verde estándar
  "#ffc107", // Amarillo estándar
  "#fd7e14", // Naranja estándar
  "#dc3545", // Rojo estándar
  "#20c997", // Turquesa estándar
];

// Estados para las tareas - Colores adaptados al tema
const darkStatusColors = {
  "pendiente": "#FFEA00", // Neón Amarillo
  "en_progreso": "#00E1FF", // Neón Azul
  "revision": "#BB00FF", // Neón Morado
  "completada": "#00FF9D" // Neón Verde
};

const lightStatusColors = {
  "pendiente": "#ffc107", // Amarillo estándar
  "en_progreso": "#0078D4", // Azul estándar
  "revision": "#6f42c1", // Morado estándar
  "completada": "#198754" // Verde estándar
};

// Traducciones de estado
const STATUS_LABELS: Record<string, string> = {
  "pendiente": "Pendiente",
  "en_progreso": "En Progreso",
  "revision": "Revisión",
  "completada": "Completada"
};

export default function Reports() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("general");
  const [timeRange, setTimeRange] = useState("semana");
  
  // Obtener el tema actual
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Seleccionar colores según el tema actual
  const COLORS = isDarkMode ? darkColors : lightColors;
  const STATUS_COLORS = isDarkMode ? darkStatusColors : lightStatusColors;
  
  // Obtener las tareas
  const { data: tasks = [] as Task[], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Obtener las estadísticas
  const { data: stats = { total: 0, pending: 0, inProgress: 0, review: 0, completed: 0 }, isLoading: isLoadingStats } = useQuery<{
    total: number;
    pending: number;
    inProgress: number;
    review: number;
    completed: number;
  }>({
    queryKey: ['/api/tasks/stats'],
  });

  // Obtener las categorías
  const { data: categories = [] as Category[], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Datos para el gráfico de estado
  const statusData = [
    { name: 'Pendiente', value: stats.pending },
    { name: 'En Progreso', value: stats.inProgress },
    { name: 'Revisión', value: stats.review },
    { name: 'Completada', value: stats.completed }
  ];

  // Datos para el gráfico de categorías
  const generateCategoryData = () => {
    const categoryMap = new Map<number, number>();

    // Inicializar contador para cada categoría
    categories.forEach((category: Category) => {
      categoryMap.set(category.id, 0);
    });

    // Contar tareas por categoría
    tasks.forEach((task: Task) => {
      if (task.categoryId) {
        const current = categoryMap.get(task.categoryId) || 0;
        categoryMap.set(task.categoryId, current + 1);
      }
    });

    // Convertir a formato para gráfico
    return Array.from(categoryMap).map(([id, count]) => {
      const category = categories.find((c: Category) => c.id === id);
      return {
        name: category ? category.name : 'Sin categoría',
        value: count,
        color: category ? category.color : 'gray'
      };
    });
  };

  const categoryData = generateCategoryData();

  // Datos para el gráfico de tendencia (simulados)
  const trendData = [
    { name: 'Lun', completadas: 2, creadas: 3 },
    { name: 'Mar', completadas: 4, creadas: 2 },
    { name: 'Mie', completadas: 3, creadas: 5 },
    { name: 'Jue', completadas: 6, creadas: 3 },
    { name: 'Vie', completadas: 4, creadas: 4 },
    { name: 'Sab', completadas: 3, creadas: 1 },
    { name: 'Dom', completadas: 1, creadas: 2 }
  ];

  // Calcular la tasa de finalización
  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  // Datos para el gráfico de prioridad
  const priorityData = [
    { name: 'Alta', value: tasks.filter((t: Task) => t.priority === 'alta').length },
    { name: 'Media', value: tasks.filter((t: Task) => t.priority === 'media').length },
    { name: 'Baja', value: tasks.filter((t: Task) => t.priority === 'baja').length }
  ];

  const isLoading = isLoadingTasks || isLoadingStats || isLoadingCategories;

  return (
    <div className="py-8 px-6 space-y-8">
      {/* Header */}
      <div className="bg-neon-darker rounded-xl p-5 mb-6 shadow-[0_0_20px_rgba(0,225,255,0.15)] border border-neon-accent/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,225,255,0.1)_0%,transparent_60%)]"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-neon-text neon-text flex items-center">
              <span className="bg-neon-medium/20 text-neon-accent p-1.5 rounded-md mr-3 border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.25)]">
                <BarChart3 className="h-5 w-5" />
              </span>
              Informes y Estadísticas
            </h1>
            <p className="mt-2 text-sm text-neon-text/70 pl-[46px]">
              Visualiza y analiza el rendimiento de las tareas y proyectos
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Button 
              variant="outline"
              size="sm" 
              className="h-9 border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20 shadow-[0_0_8px_rgba(0,225,255,0.15)] rounded-md transition-all"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button 
              size="sm" 
              className="h-9 bg-neon-accent/20 hover:bg-neon-accent/30 border border-neon-accent/50 text-neon-accent neon-text shadow-[0_0_10px_rgba(0,225,255,0.25)] rounded-md transition-all font-medium"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs de Informes */}
      <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)] overflow-hidden mb-6 rounded-xl">
        <CardHeader className="border-b border-neon-accent/20 bg-neon-medium/5 pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium text-neon-text">Informes</CardTitle>
              <CardDescription className="text-neon-text/70">Selecciona el tipo de informe que deseas visualizar</CardDescription>
            </div>
            <Tabs 
              value={timeRange} 
              onValueChange={setTimeRange}
              className="mt-4 md:mt-0"
            >
              <TabsList className="grid w-[200px] grid-cols-3 h-8 bg-neon-dark border border-neon-accent/30">
                <TabsTrigger 
                  value="semana" 
                  className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_8px_rgba(0,225,255,0.25)] data-[state=active]:border-neon-accent/50 text-neon-text/70"
                >
                  Semana
                </TabsTrigger>
                <TabsTrigger 
                  value="mes" 
                  className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_8px_rgba(0,225,255,0.25)] data-[state=active]:border-neon-accent/50 text-neon-text/70"
                >
                  Mes
                </TabsTrigger>
                <TabsTrigger 
                  value="año" 
                  className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_8px_rgba(0,225,255,0.25)] data-[state=active]:border-neon-accent/50 text-neon-text/70"
                >
                  Año
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex border-b border-neon-accent/20 bg-neon-medium/5">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab("general")}
              className={`px-5 py-3 rounded-none border-b-2 transition-colors ${
                activeTab === "general" 
                  ? "border-neon-accent text-neon-accent neon-text" 
                  : "border-transparent text-neon-text/70 hover:text-neon-text hover:bg-neon-medium/10"
              }`}
            >
              General
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab("categorias")}
              className={`px-5 py-3 rounded-none border-b-2 transition-colors ${
                activeTab === "categorias" 
                  ? "border-neon-accent text-neon-accent neon-text" 
                  : "border-transparent text-neon-text/70 hover:text-neon-text hover:bg-neon-medium/10"
              }`}
            >
              Por Categorías
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab("estados")}
              className={`px-5 py-3 rounded-none border-b-2 transition-colors ${
                activeTab === "estados" 
                  ? "border-neon-accent text-neon-accent neon-text" 
                  : "border-transparent text-neon-text/70 hover:text-neon-text hover:bg-neon-medium/10"
              }`}
            >
              Por Estados
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab("prioridad")}
              className={`px-5 py-3 rounded-none border-b-2 transition-colors ${
                activeTab === "prioridad" 
                  ? "border-neon-accent text-neon-accent neon-text" 
                  : "border-transparent text-neon-text/70 hover:text-neon-text hover:bg-neon-medium/10"
              }`}
            >
              Por Prioridad
            </Button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {/* General */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.15)] rounded-xl">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium text-neon-text">Tendencia de Tareas</CardTitle>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-neon-medium/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.25)]">
                          <BarChart3 className="h-4 w-4" />
                        </div>
                      </div>
                      <CardDescription className="text-neon-text/70">Tareas creadas vs. completadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={trendData}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,225,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                            <YAxis stroke="rgba(255,255,255,0.7)" />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '8px', 
                                boxShadow: '0 0 10px rgba(0,225,255,0.2)', 
                                border: '1px solid rgba(0,225,255,0.3)',
                                backgroundColor: '#111827',
                                color: 'rgba(255,255,255,0.9)'
                              }} 
                            />
                            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                            <Area 
                              type="monotone" 
                              dataKey="creadas" 
                              stackId="1"
                              stroke="#00E1FF" 
                              fill="#00E1FF"
                              fillOpacity={0.2}
                              strokeWidth={2}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="completadas" 
                              stackId="2" 
                              stroke="#00FF9D" 
                              fill="#00FF9D" 
                              fillOpacity={0.2}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.15)] rounded-xl">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium text-neon-text">Distribución de Tareas</CardTitle>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-neon-medium/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.25)]">
                          <PieChartIcon className="h-4 w-4" />
                        </div>
                      </div>
                      <CardDescription className="text-neon-text/70">Tareas por estado</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={90}
                              fill="#00E1FF"
                              stroke="rgba(0,225,255,0.3)"
                              strokeWidth={2}
                              dataKey="value"
                            >
                              {statusData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]}
                                  stroke={COLORS[index % COLORS.length]}
                                  strokeWidth={2}
                                  style={{ filter: `drop-shadow(0 0 3px ${COLORS[index % COLORS.length]})` }}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value} tarea(s)`, '']}
                              contentStyle={{ 
                                borderRadius: '8px', 
                                boxShadow: '0 0 10px rgba(0,225,255,0.2)', 
                                border: '1px solid rgba(0,225,255,0.3)',
                                backgroundColor: '#111827',
                                color: 'rgba(255,255,255,0.9)'
                              }}
                              wrapperStyle={{ outline: 'none' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.15)] rounded-xl">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-neon-accent mb-1 neon-text">{completionRate}%</div>
                          <div className="text-sm text-neon-text/80">Tasa de finalización</div>
                        </div>
                        <div className="w-full h-3 bg-neon-medium/10 rounded-full mt-4 mb-2 border border-neon-accent/20">
                          <div 
                            className="h-full bg-neon-accent/40 rounded-full shadow-[0_0_10px_rgba(0,225,255,0.3)]" 
                            style={{ width: `${completionRate}%` }} 
                          />
                        </div>
                        <div className="text-xs text-neon-text/70 mt-1">
                          {stats.completed} de {stats.total} tareas completadas
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.15)] rounded-xl">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-neon-yellow mb-1 neon-yellow-text">
                            {stats.inProgress}
                          </div>
                          <div className="text-sm text-neon-text/80">Tareas en progreso</div>
                        </div>
                        <div className="flex justify-between w-full mt-4">
                          <div className="text-xs text-neon-text/70">
                            <span className="font-medium text-neon-yellow neon-yellow-text">33%</span> desde la semana pasada
                          </div>
                          <div className="text-xs text-neon-text/70">Objetivo: 10</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.15)] rounded-xl">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-neon-green mb-1 neon-green-text">
                            {categories.length}
                          </div>
                          <div className="text-sm text-neon-text/80">Categorías activas</div>
                        </div>
                        <div className="flex justify-between w-full mt-4 items-center">
                          <div className="text-xs text-neon-text/70">
                            <span className="text-neon-green font-medium">↑ 2</span> nuevas este mes
                          </div>
                          <Button 
                            variant="outline"
                            size="sm" 
                            className="h-7 text-xs border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20"
                          >
                            Gestionar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Por Categorías */}
            {activeTab === "categorias" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-neutral-100 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium text-neutral-800">Tareas por Categoría</CardTitle>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                          <PieChartIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value} tarea(s)`, '']}
                              contentStyle={{ 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                                border: 'none' 
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="border-neutral-100 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base font-medium text-neutral-800">Distribución por Categoría</CardTitle>
                          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                            <BarChart3 className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={categoryData}
                              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                              <XAxis type="number" stroke="#9ca3af" />
                              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                              <Tooltip 
                                contentStyle={{ 
                                  borderRadius: '8px', 
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                                  border: 'none' 
                                }} 
                              />
                              <Legend />
                              <Bar dataKey="value" name="Tareas" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-neutral-100 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex flex-col">
                            <div className="text-4xl font-bold text-primary-600 mb-1">
                              {categoryData.length}
                            </div>
                            <div className="text-sm text-neutral-600 mb-2">
                              Categorías activas
                            </div>
                            <div className="text-xs text-neutral-500">
                              Todas las categorías con tareas asignadas
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-neutral-100 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex flex-col">
                            <div className="text-4xl font-bold text-emerald-600 mb-1">
                              {Math.max(...categoryData.map(item => item.value))}
                            </div>
                            <div className="text-sm text-neutral-600 mb-2">
                              Más utilizada
                            </div>
                            <div className="text-xs text-neutral-500">
                              Tareas en la categoría principal
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                <Card className="border-neutral-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium text-neutral-800">Detalle por Categoría</CardTitle>
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="h-8"
                      >
                        <Filter className="mr-1.5 h-3.5 w-3.5" />
                        Filtrar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200 bg-neutral-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">Categoría</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">Total Tareas</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">Pendientes</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">En Progreso</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">Completadas</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">% Completadas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category: Category) => {
                            const categoryTasks = tasks.filter((t: Task) => t.categoryId === category.id);
                            const completedTasks = categoryTasks.filter((t: Task) => t.status === 'completada').length;
                            const pendingTasks = categoryTasks.filter((t: Task) => t.status === 'pendiente').length;
                            const inProgressTasks = categoryTasks.filter((t: Task) => t.status === 'en_progreso').length;
                            const completionPercentage = categoryTasks.length > 0 
                              ? Math.round((completedTasks / categoryTasks.length) * 100) 
                              : 0;
                            
                            return (
                              <tr key={category.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <span className={`h-3 w-3 rounded-full mr-2 ${getCategoryColor(category.color)}`}></span>
                                    <span className="font-medium text-neutral-800">{category.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-neutral-800">{categoryTasks.length}</td>
                                <td className="px-4 py-3 text-center text-sm text-amber-600 font-medium">{pendingTasks}</td>
                                <td className="px-4 py-3 text-center text-sm text-primary-600 font-medium">{inProgressTasks}</td>
                                <td className="px-4 py-3 text-center text-sm text-emerald-600 font-medium">{completedTasks}</td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center">
                                    <div className="w-16 h-2 bg-neutral-100 rounded-full mr-2">
                                      <div 
                                        className="h-full bg-emerald-500 rounded-full" 
                                        style={{ width: `${completionPercentage}%` }} 
                                      />
                                    </div>
                                    <span className="text-xs text-neutral-600">{completionPercentage}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Por Estados */}
            {activeTab === "estados" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-neutral-100 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium text-neutral-800">Distribución por Estado</CardTitle>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                          <PieChartIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value} tarea(s)`, '']}
                              contentStyle={{ 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                                border: 'none' 
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-neutral-100 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium text-neutral-800">Evolución de Estados</CardTitle>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                          <BarChart3 className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Sem 1', pendiente: 4, enProgreso: 2, revision: 1, completada: 1 },
                              { name: 'Sem 2', pendiente: 3, enProgreso: 3, revision: 2, completada: 2 },
                              { name: 'Sem 3', pendiente: 2, enProgreso: 4, revision: 2, completada: 3 },
                              { name: 'Sem 4', pendiente: 1, enProgreso: 2, revision: 3, completada: 5 },
                            ]}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                                border: 'none' 
                              }} 
                            />
                            <Legend />
                            <Bar dataKey="pendiente" name="Pendiente" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="enProgreso" name="En Progreso" stackId="a" fill="#4f46e5" />
                            <Bar dataKey="revision" name="Revisión" stackId="a" fill="#64748b" />
                            <Bar dataKey="completada" name="Completada" stackId="a" fill="#16a34a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-neutral-100 shadow-sm bg-amber-50">
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-amber-800 mb-1">
                          Pendientes
                        </div>
                        <div className="text-3xl font-bold text-amber-600">
                          {stats.pending}
                        </div>
                        <div className="mt-2 flex items-center text-xs text-amber-700">
                          <span>{Math.round((stats.pending / stats.total) * 100)}% del total</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-neutral-100 shadow-sm bg-primary-50">
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-primary-800 mb-1">
                          En Progreso
                        </div>
                        <div className="text-3xl font-bold text-primary-600">
                          {stats.inProgress}
                        </div>
                        <div className="mt-2 flex items-center text-xs text-primary-700">
                          <span>{Math.round((stats.inProgress / stats.total) * 100)}% del total</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-neutral-100 shadow-sm bg-neutral-100">
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-neutral-800 mb-1">
                          En Revisión
                        </div>
                        <div className="text-3xl font-bold text-neutral-600">
                          {stats.review}
                        </div>
                        <div className="mt-2 flex items-center text-xs text-neutral-700">
                          <span>{Math.round((stats.review / stats.total) * 100)}% del total</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-neutral-100 shadow-sm bg-emerald-50">
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-emerald-800 mb-1">
                          Completadas
                        </div>
                        <div className="text-3xl font-bold text-emerald-600">
                          {stats.completed}
                        </div>
                        <div className="mt-2 flex items-center text-xs text-emerald-700">
                          <span>{Math.round((stats.completed / stats.total) * 100)}% del total</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-neutral-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium text-neutral-800">Tiempo promedio por estado</CardTitle>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Pendiente', dias: 3.5 },
                            { name: 'En Progreso', dias: 5.2 },
                            { name: 'Revisión', dias: 2.1 },
                            { name: 'Completada', dias: 0 },
                          ]}
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" label={{ value: 'Días promedio', angle: -90, position: 'insideLeft' }} />
                          <Tooltip 
                            formatter={(value) => [`${value} días`, 'Tiempo promedio']}
                            contentStyle={{ 
                              borderRadius: '8px', 
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                              border: 'none' 
                            }} 
                          />
                          <Bar 
                            dataKey="dias" 
                            fill="#4f46e5" 
                            radius={[4, 4, 0, 0]} 
                            barSize={60}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Por Prioridad */}
            {activeTab === "prioridad" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-neutral-100 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium text-neutral-800">Distribución por Prioridad</CardTitle>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                          <PieChartIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={priorityData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell key="cell-0" fill="#ef4444" />
                              <Cell key="cell-1" fill="#f59e0b" />
                              <Cell key="cell-2" fill="#4f46e5" />
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value} tarea(s)`, '']}
                              contentStyle={{ 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                                border: 'none' 
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-neutral-100 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium text-neutral-800">Estado por Prioridad</CardTitle>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                          <BarChart3 className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { 
                                name: 'Alta', 
                                pendiente: tasks.filter(t => t.priority === 'alta' && t.status === 'pendiente').length,
                                enProgreso: tasks.filter(t => t.priority === 'alta' && t.status === 'en_progreso').length,
                                revision: tasks.filter(t => t.priority === 'alta' && t.status === 'revision').length,
                                completada: tasks.filter(t => t.priority === 'alta' && t.status === 'completada').length,
                              },
                              { 
                                name: 'Media', 
                                pendiente: tasks.filter(t => t.priority === 'media' && t.status === 'pendiente').length,
                                enProgreso: tasks.filter(t => t.priority === 'media' && t.status === 'en_progreso').length,
                                revision: tasks.filter(t => t.priority === 'media' && t.status === 'revision').length,
                                completada: tasks.filter(t => t.priority === 'media' && t.status === 'completada').length,
                              },
                              { 
                                name: 'Baja', 
                                pendiente: tasks.filter(t => t.priority === 'baja' && t.status === 'pendiente').length,
                                enProgreso: tasks.filter(t => t.priority === 'baja' && t.status === 'en_progreso').length,
                                revision: tasks.filter(t => t.priority === 'baja' && t.status === 'revision').length,
                                completada: tasks.filter(t => t.priority === 'baja' && t.status === 'completada').length,
                              },
                            ]}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                                border: 'none' 
                              }} 
                            />
                            <Legend />
                            <Bar dataKey="pendiente" name="Pendiente" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="enProgreso" name="En Progreso" stackId="a" fill="#4f46e5" />
                            <Bar dataKey="revision" name="Revisión" stackId="a" fill="#64748b" />
                            <Bar dataKey="completada" name="Completada" stackId="a" fill="#16a34a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-neutral-100 shadow-sm bg-rose-50">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center mr-4">
                          <div className="text-2xl font-bold">A</div>
                        </div>
                        <div>
                          <div className="text-base font-medium text-rose-800">Prioridad Alta</div>
                          <div className="text-2xl font-bold text-rose-600">
                            {tasks.filter(t => t.priority === 'alta').length}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-rose-700 mb-1">
                          {tasks.filter(t => t.priority === 'alta' && t.status === 'completada').length} completadas de {tasks.filter(t => t.priority === 'alta').length}
                        </div>
                        <div className="w-full h-2 bg-rose-100 rounded-full">
                          <div 
                            className="h-full bg-rose-600 rounded-full" 
                            style={{ 
                              width: `${tasks.filter(t => t.priority === 'alta').length > 0 
                                ? (tasks.filter(t => t.priority === 'alta' && t.status === 'completada').length / tasks.filter(t => t.priority === 'alta').length) * 100 
                                : 0}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-neutral-100 shadow-sm bg-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center mr-4">
                          <div className="text-2xl font-bold">M</div>
                        </div>
                        <div>
                          <div className="text-base font-medium text-amber-800">Prioridad Media</div>
                          <div className="text-2xl font-bold text-amber-600">
                            {tasks.filter(t => t.priority === 'media').length}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-amber-700 mb-1">
                          {tasks.filter(t => t.priority === 'media' && t.status === 'completada').length} completadas de {tasks.filter(t => t.priority === 'media').length}
                        </div>
                        <div className="w-full h-2 bg-amber-100 rounded-full">
                          <div 
                            className="h-full bg-amber-600 rounded-full" 
                            style={{ 
                              width: `${tasks.filter(t => t.priority === 'media').length > 0 
                                ? (tasks.filter(t => t.priority === 'media' && t.status === 'completada').length / tasks.filter(t => t.priority === 'media').length) * 100 
                                : 0}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-neutral-100 shadow-sm bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                          <div className="text-2xl font-bold">B</div>
                        </div>
                        <div>
                          <div className="text-base font-medium text-blue-800">Prioridad Baja</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {tasks.filter(t => t.priority === 'baja').length}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-blue-700 mb-1">
                          {tasks.filter(t => t.priority === 'baja' && t.status === 'completada').length} completadas de {tasks.filter(t => t.priority === 'baja').length}
                        </div>
                        <div className="w-full h-2 bg-blue-100 rounded-full">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ 
                              width: `${tasks.filter(t => t.priority === 'baja').length > 0 
                                ? (tasks.filter(t => t.priority === 'baja' && t.status === 'completada').length / tasks.filter(t => t.priority === 'baja').length) * 100 
                                : 0}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-neutral-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium text-neutral-800">Tiempo de resolución por prioridad</CardTitle>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { name: 'Dia 1', alta: 0, media: 0, baja: 0 },
                            { name: 'Dia 2', alta: 2, media: 1, baja: 0 },
                            { name: 'Dia 3', alta: 3, media: 2, baja: 1 },
                            { name: 'Dia 4', alta: 4, media: 3, baja: 1 },
                            { name: 'Dia 5', alta: 5, media: 4, baja: 2 },
                            { name: 'Dia 6', alta: 6, media: 5, baja: 3 },
                            { name: 'Dia 7', alta: 7, media: 6, baja: 4 },
                          ]}
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" label={{ value: 'Días para completar', angle: -90, position: 'insideLeft' }} />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                              border: 'none' 
                            }} 
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="alta" 
                            name="Prioridad Alta" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            activeDot={{ r: 6 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="media" 
                            name="Prioridad Media" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            activeDot={{ r: 6 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="baja" 
                            name="Prioridad Baja" 
                            stroke="#4f46e5" 
                            strokeWidth={2}
                            activeDot={{ r: 6 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de rendimiento */}
      <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)] rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-neon-accent/20 bg-neon-medium/5">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-medium text-neon-text neon-text">Resumen de Rendimiento</CardTitle>
              <CardDescription className="text-neon-text/70">Vista general del progreso del equipo</CardDescription>
            </div>
            <Button 
              variant="outline"
              size="sm" 
              className="h-8 border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20 shadow-[0_0_8px_rgba(0,225,255,0.15)]"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="p-6 border-b md:border-b-0 md:border-r border-neon-accent/20 relative">
              <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-neon-accent/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-sm font-medium text-neon-accent mb-3">Efectividad</div>
                <div className="text-4xl font-bold neon-text mb-2">{completionRate}%</div>
                <div className="flex items-center mb-4">
                  <span className="text-xs bg-neon-green/10 text-neon-green px-2 py-0.5 rounded-full font-medium border border-neon-green/30 shadow-[0_0_8px_rgba(0,255,157,0.2)]">
                    +12% vs. mes anterior
                  </span>
                </div>
                <div className="text-sm text-neon-text/70">
                  Basado en la tasa de tareas completadas a tiempo respecto al total
                </div>
              </div>
            </div>
            
            <div className="p-6 border-b md:border-b-0 md:border-r border-neon-accent/20 relative">
              <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-neon-accent/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-sm font-medium text-neon-accent mb-3">Tiempo Promedio</div>
                <div className="text-4xl font-bold neon-text-yellow mb-2">3.2 <span className="text-lg font-medium">días</span></div>
                <div className="flex items-center mb-4">
                  <span className="text-xs bg-neon-yellow/10 text-neon-yellow px-2 py-0.5 rounded-full font-medium border border-neon-yellow/30 shadow-[0_0_8px_rgba(255,234,0,0.2)]">
                    +0.5 días vs. mes anterior
                  </span>
                </div>
                <div className="text-sm text-neon-text/70">
                  Tiempo promedio para completar una tarea desde su creación
                </div>
              </div>
            </div>
            
            <div className="p-6 relative">
              <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-neon-accent/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-sm font-medium text-neon-accent mb-3">Carga de Trabajo</div>
                <div className="text-4xl font-bold neon-text-purple mb-2">{stats.pending + stats.inProgress + stats.review} <span className="text-lg font-medium">activas</span></div>
                <div className="flex items-center mb-4">
                  <span className="text-xs bg-neon-accent/10 text-neon-accent px-2 py-0.5 rounded-full font-medium border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
                    {stats.total} tareas totales
                  </span>
                </div>
                <div className="text-sm text-neon-text/70">
                  Basado en tareas pendientes, en progreso y en revisión
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Función para obtener el color de la categoría
function getCategoryColor(color: string) {
  switch (color) {
    case "blue": return "bg-neon-accent shadow-[0_0_8px_rgba(0,225,255,0.5)]";
    case "purple": return "bg-neon-purple shadow-[0_0_8px_rgba(187,0,255,0.5)]";
    case "orange": return "bg-neon-orange shadow-[0_0_8px_rgba(255,109,0,0.5)]";
    case "green": return "bg-neon-green shadow-[0_0_8px_rgba(0,255,157,0.5)]";
    case "red": return "bg-neon-red shadow-[0_0_8px_rgba(255,45,109,0.5)]";
    case "yellow": return "bg-neon-yellow shadow-[0_0_8px_rgba(255,234,0,0.5)]";
    default: return "bg-neon-accent shadow-[0_0_8px_rgba(0,225,255,0.5)]";
  }
}