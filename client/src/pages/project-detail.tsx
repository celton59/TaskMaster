import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Project, ProjectStatus, Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectTimeline } from "@/components/projects/project-timeline";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Plus,
  PenLine,
  BarChart4,
  ClipboardList
} from "lucide-react";

export default function ProjectDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [activeTab, setActiveTab] = useState("lista");
  
  // Obtener el ID del proyecto de los parámetros
  const projectId = params?.id ? parseInt(params.id, 10) : undefined;
  
  // Consulta para obtener detalles del proyecto y sus tareas
  const { 
    data: projectWithTasks, 
    isLoading,
    isError
  } = useQuery<{
    project: Project;
    tasks: Task[];
  }>({
    // Usar la ruta correcta para obtener el proyecto con sus tareas
    queryKey: [`/api/projects/${projectId}/with-tasks`],
    enabled: !!projectId,
  });
  
  // Redireccionar si no hay ID o no se encuentra el proyecto
  useEffect(() => {
    if (projectId && !isLoading && (!projectWithTasks || isError)) {
      setLocation("/projects");
    }
  }, [projectId, isLoading, projectWithTasks, isError, setLocation]);
  
  // Formatear fecha
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "No definida";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return format(date, "d MMM yyyy", { locale: es });
  };
  
  // Obtener el color de fondo para un proyecto
  const getColorStyles = (colorName?: string) => {
    const color = colorName || 'blue';
    const colorMap: Record<string, any> = {
      blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
        shadow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]"
      },
      purple: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        text: "text-purple-400",
        shadow: "shadow-[0_0_15px_rgba(139,92,246,0.2)]"
      },
      green: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        shadow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      },
      orange: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        shadow: "shadow-[0_0_15px_rgba(249,115,22,0.2)]"
      },
      cyan: {
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/30",
        text: "text-cyan-400",
        shadow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]"
      },
      pink: {
        bg: "bg-pink-500/10",
        border: "border-pink-500/30",
        text: "text-pink-400",
        shadow: "shadow-[0_0_15px_rgba(236,72,153,0.2)]"
      },
      red: {
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        text: "text-rose-400",
        shadow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]"
      },
      yellow: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        text: "text-yellow-400",
        shadow: "shadow-[0_0_15px_rgba(234,179,8,0.2)]"
      }
    };
    
    return colorMap[color] || colorMap.blue;
  };
  
  // Mostrar spinner mientras carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neon-accent border-r-transparent"></div>
        <p className="ml-2 text-neon-text">Cargando detalles del proyecto...</p>
      </div>
    );
  }
  
  // Si hay errores o datos indefinidos, mostrar mensaje
  if (isError || !projectWithTasks || !projectWithTasks.project) {
    return (
      <div className="text-center py-10 bg-neon-medium/20 rounded-md border border-red-500/30">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neon-text mb-1">
          Error al cargar el proyecto
        </h3>
        <p className="text-neon-text/70 mb-4">
          No se pudo encontrar el proyecto solicitado
        </p>
        <Button
          onClick={() => setLocation("/projects")}
          className="bg-neon-accent hover:bg-neon-accent/80 text-neon-dark"
        >
          Volver a proyectos
        </Button>
      </div>
    );
  }
  
  // Extraer datos del proyecto y tareas con valores por defecto seguros
  const { project, tasks = [] } = projectWithTasks;
  const tasksArray = Array.isArray(tasks) ? tasks : [];
  
  // Calcular estadísticas
  const completedTasks = tasksArray.filter(task => task.status === "completed");
  const completionPercentage = tasksArray.length > 0 
    ? Math.round((completedTasks.length / tasksArray.length) * 100) 
    : 0;
  
  // Estilos específicos de este proyecto - con verificación para evitar errores
  // El color es indefinido posiblemente porque la API devuelve datos incompletos
  const colorStyles = getColorStyles(project?.color);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-neon-medium/20 border-neon-accent/30 text-neon-accent hover:bg-neon-medium/40"
            onClick={() => setLocation("/projects")}
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-neon-text">
            {project?.name || "Proyecto"}
          </h1>
          <Badge className={`${colorStyles.bg} ${colorStyles.border} ${colorStyles.text}`}>
            {project?.status === ProjectStatus.ACTIVE ? "Activo" :
              project?.status === ProjectStatus.COMPLETED ? "Completado" : "Archivado"}
          </Badge>
        </div>
        <Button 
          onClick={() => setLocation(`/projects/${project?.id || 0}/edit`)}
          className="bg-neon-accent hover:bg-neon-accent/80 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
          size="sm"
        >
          <PenLine className="h-4 w-4 mr-1.5" />
          Editar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="col-span-1 lg:col-span-2 bg-neon-medium/20 border-neon-accent/30">
          <CardHeader>
            <CardTitle className="text-neon-text">Detalles del proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-neon-accent mb-1">Descripción</h3>
              <p className="text-sm text-neon-text">
                {project?.description || "Sin descripción"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-5 mt-4">
              <div>
                <h3 className="text-sm font-medium text-neon-accent mb-1">Fecha de inicio</h3>
                <div className="flex items-center text-sm text-neon-text">
                  <CalendarIcon className="h-4 w-4 mr-2 text-neon-accent/70" />
                  {formatDate(project?.startDate)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neon-accent mb-1">Fecha límite</h3>
                <div className="flex items-center text-sm text-neon-text">
                  <Clock className="h-4 w-4 mr-2 text-neon-accent/70" />
                  {formatDate(project?.dueDate)}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-neon-accent mb-2">Progreso del proyecto</h3>
              <div className="flex items-center space-x-4">
                <Progress value={completionPercentage} className="h-2 bg-neon-dark" />
                <span className="text-sm font-medium text-neon-text">{completionPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-neon-medium/20 border-neon-accent/30">
          <CardHeader>
            <CardTitle className="text-neon-text">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neon-dark p-3 rounded-lg flex flex-col items-center justify-center">
                <ListTodo className="h-5 w-5 text-neon-accent mb-2" />
                <span className="text-lg font-bold text-neon-text">{tasksArray.length}</span>
                <span className="text-xs text-neon-text/70">Tareas totales</span>
              </div>
              <div className="bg-neon-dark p-3 rounded-lg flex flex-col items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-2" />
                <span className="text-lg font-bold text-neon-text">{completedTasks.length}</span>
                <span className="text-xs text-neon-text/70">Completadas</span>
              </div>
              <div className="bg-neon-dark p-3 rounded-lg flex flex-col items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400 mb-2" />
                <span className="text-lg font-bold text-neon-text">
                  {tasksArray.filter(t => t.status === "in_progress" || t.status === "in-progress").length}
                </span>
                <span className="text-xs text-neon-text/70">En progreso</span>
              </div>
              <div className="bg-neon-dark p-3 rounded-lg flex flex-col items-center justify-center">
                <AlertCircle className="h-5 w-5 text-rose-400 mb-2" />
                <span className="text-lg font-bold text-neon-text">
                  {tasksArray.filter(t => t.status === "pending").length}
                </span>
                <span className="text-xs text-neon-text/70">Pendientes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-neon-medium/20 border-neon-accent/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-neon-text">Tareas del proyecto</CardTitle>
            <CardDescription>Total: {tasksArray.length} tareas</CardDescription>
          </div>
          <Button 
            size="sm"
            className="bg-neon-accent hover:bg-neon-accent/80 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
            onClick={() => setLocation(`/tasks/new?projectId=${project?.id || 0}`)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva tarea
          </Button>
        </CardHeader>
        <CardContent>
          {tasksArray.length === 0 ? (
            <div className="text-center py-8 text-neon-text/70">
              No hay tareas asociadas a este proyecto.
            </div>
          ) : (
            <Tabs defaultValue="lista" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-neon-dark">
                <TabsTrigger 
                  value="lista" 
                  className="data-[state=active]:bg-neon-accent/20 data-[state=active]:border-b-2 data-[state=active]:border-neon-accent data-[state=active]:shadow-none data-[state=active]:text-neon-accent"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Lista de Tareas
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="data-[state=active]:bg-neon-accent/20 data-[state=active]:border-b-2 data-[state=active]:border-neon-accent data-[state=active]:shadow-none data-[state=active]:text-neon-accent"
                >
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Línea de Tiempo
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="lista" className="mt-0">
                <div className="space-y-2">
                  {tasksArray.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-neon-dark rounded-md border border-neon-accent/10 hover:border-neon-accent/30 transition-all duration-300 cursor-pointer"
                      onClick={() => setLocation(`/tasks/${task.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${
                          task.status === 'completed' ? 'bg-emerald-500' :
                          task.status === 'in_progress' || task.status === 'in-progress' ? 'bg-amber-500' :
                          task.status === 'review' ? 'bg-blue-500' :
                          'bg-rose-500'
                        }`}></div>
                        <span className="text-neon-text font-medium">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-neon-medium border-0 text-neon-text text-xs">
                          {task.priority || "Normal"}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-neon-accent/70" />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-0">
                <ProjectTimeline tasks={tasksArray} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}