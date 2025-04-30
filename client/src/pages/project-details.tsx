import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Project, Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  PenLine
} from "lucide-react";

export default function ProjectDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();
  
  // Obtener el ID del proyecto de los parámetros
  const projectId = params?.id ? parseInt(params.id, 10) : undefined;
  
  // Consulta para obtener detalles del proyecto y sus tareas
  const { data: projectDetails, isLoading } = useQuery<{
    project: Project;
    tasks: Task[];
  }>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });
  
  // Redireccionar si no hay ID o no se encuentra el proyecto
  useEffect(() => {
    if (projectId && !isLoading && !projectDetails) {
      setLocation("/projects");
    }
  }, [projectId, isLoading, projectDetails, setLocation]);
  
  // Formatear fecha
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "No definida";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return format(date, "d MMM yyyy", { locale: es });
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
  
  // Si no hay detalles del proyecto, redirigir
  if (!projectDetails) return null;
  
  const { project, tasks } = projectDetails;
  const completedTasks = tasks.filter(task => task.status === "completed");
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;
  
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
            {project.name}
          </h1>
          <Badge className="bg-blue-500/10 border-blue-500/30 text-blue-400">
            {project.status}
          </Badge>
        </div>
        <Button 
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
                {project.description || "Sin descripción"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-5 mt-4">
              <div>
                <h3 className="text-sm font-medium text-neon-accent mb-1">Fecha de inicio</h3>
                <div className="flex items-center text-sm text-neon-text">
                  <CalendarIcon className="h-4 w-4 mr-2 text-neon-accent/70" />
                  {formatDate(project.startDate)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neon-accent mb-1">Fecha límite</h3>
                <div className="flex items-center text-sm text-neon-text">
                  <Clock className="h-4 w-4 mr-2 text-neon-accent/70" />
                  {formatDate(project.dueDate)}
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
                <span className="text-lg font-bold text-neon-text">{tasks.length}</span>
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
                  {tasks.filter(t => t.status === "in_progress").length}
                </span>
                <span className="text-xs text-neon-text/70">En progreso</span>
              </div>
              <div className="bg-neon-dark p-3 rounded-lg flex flex-col items-center justify-center">
                <AlertCircle className="h-5 w-5 text-rose-400 mb-2" />
                <span className="text-lg font-bold text-neon-text">
                  {tasks.filter(t => t.status === "pending").length}
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
            <CardDescription>Total: {tasks.length} tareas</CardDescription>
          </div>
          <Button 
            size="sm"
            className="bg-neon-accent hover:bg-neon-accent/80 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva tarea
          </Button>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-neon-text/70">
              No hay tareas asociadas a este proyecto.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-neon-dark rounded-md border border-neon-accent/10 hover:border-neon-accent/30 transition-all duration-300"
                  onClick={() => setLocation(`/tasks/${task.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      task.status === 'completed' ? 'bg-emerald-500' :
                      task.status === 'in_progress' ? 'bg-amber-500' :
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}