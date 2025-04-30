import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Project, ProjectStatus, Task, insertProjectSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  FolderKanban,
  Plus,
  Calendar as CalendarIcon, 
  ListTodo,
  BarChart4,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Users,
  FileText,
  PenLine
} from "lucide-react";

// Definir un componente para visualizar un proyecto
const ProjectCard = ({ project, onClick }: { project: Project, onClick: () => void }) => {
  // Colores predeterminados cuando la propiedad color no está disponible
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
  
  // Calcular progreso basado en el estado
  const calculateProgress = (status: string): number => {
    if (status === ProjectStatus.COMPLETED) return 100;
    if (status === ProjectStatus.ACTIVE) return 50;
    return 0;
  };
  
  // Formatear fecha de manera segura
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "No definida";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return format(date, "d MMM yyyy", { locale: es });
  };
  
  const colorStyles = getColorStyles(project.color);
  const progress = calculateProgress(project.status);
  
  return (
    <Card 
      key={project.id}
      className={`overflow-hidden transition-all duration-300 cursor-pointer hover:translate-y-[-5px] ${colorStyles.bg} ${colorStyles.border} ${colorStyles.shadow} border`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className={`${colorStyles.text} text-lg line-clamp-1`}>
          {project.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-neon-text/70">
          {project.description || "Sin descripción"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-neon-text/70">Inicio</span>
            <span className="text-sm text-neon-text flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1 text-neon-accent/70" />
              {formatDate(project.startDate)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-neon-text/70">Límite</span>
            <span className="text-sm text-neon-text flex items-center">
              <Clock className="h-3 w-3 mr-1 text-neon-accent/70" />
              {formatDate(project.dueDate)}
            </span>
          </div>
        </div>
        
        <div className="mb-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-neon-text/70">Progreso</span>
            <span className="text-xs font-medium text-neon-text">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5 bg-neon-dark" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-neon-accent/70 mr-1" />
            <span className="text-xs text-neon-text/70">1</span>
          </div>
        </div>
        <Badge
          className={`${colorStyles.bg} ${colorStyles.border} ${colorStyles.text} text-xs`}
        >
          {project.status === ProjectStatus.ACTIVE ? "Activo" : 
            project.status === ProjectStatus.COMPLETED ? "Completado" : "Archivado"}
        </Badge>
      </CardFooter>
    </Card>
  );
};

// Importar el dialog de proyectos
import { ProjectDialog } from "@/components/projects/project-dialog";

// Componente principal de Proyectos
export default function Projects() {
  const [selectedTab, setSelectedTab] = useState("active");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [, setLocation] = useLocation();
  const params = useParams();
  
  // Función para abrir el dialog de nuevo proyecto
  const handleNewProject = () => {
    setSelectedProject(undefined);
    setIsDialogOpen(true);
  };
  
  // Función para abrir el dialog de edición de proyecto
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };
  
  // Si hay un ID en la ruta, estamos viendo un proyecto específico
  const projectId = params?.id ? parseInt(params.id, 10) : undefined;
  
  // Consulta para obtener todos los proyectos
  const { 
    data: projects = [], 
    isLoading: isLoadingProjects,
    isError: isErrorProjects 
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Si estamos viendo un proyecto específico, cargamos sus detalles y tareas
  const { 
    data: projectDetails, 
    isLoading: isLoadingDetails,
    isError: isErrorDetails
  } = useQuery<{project: Project; tasks: Task[]}>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });
  
  // Redireccionar si no hay detalles cuando se espera
  useEffect(() => {
    if (projectId && !isLoadingDetails && !projectDetails) {
      setLocation("/projects");
    }
  }, [projectId, isLoadingDetails, projectDetails, setLocation]);
  
  // Filtrar proyectos según la pestaña seleccionada
  const filteredProjects = projects.filter(project => {
    if (selectedTab === "active") return project.status === ProjectStatus.ACTIVE;
    if (selectedTab === "completed") return project.status === ProjectStatus.COMPLETED;
    if (selectedTab === "archived") return project.status === ProjectStatus.ARCHIVED;
    return true;
  });
  
  // Formatear fecha de manera segura
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "No definida";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return format(date, "d MMM yyyy", { locale: es });
  };

  // Si hay error en la carga
  if (isErrorProjects || (projectId && isErrorDetails)) {
    return (
      <div className="text-center py-10 bg-neon-medium/20 rounded-md border border-red-500/30">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neon-text mb-1">
          Error al cargar los proyectos
        </h3>
        <p className="text-neon-text/70 mb-4">
          Ha ocurrido un error al obtener los datos de proyectos
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-neon-accent hover:bg-neon-accent/80 text-neon-dark"
        >
          Reintentar
        </Button>
      </div>
    );
  }
  
  // Vista de detalles del proyecto
  if (projectId && projectDetails && projectDetails.tasks) {
    const { project, tasks } = projectDetails;
    const completedTasks = tasks?.filter(task => task.status === "completed") || [];
    const completionPercentage = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100) 
      : 0;
    
    // Definir un mapa de colores para la vista de detalles
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
    
    const colorStyles = getColorStyles(project.color);
    
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
            <Badge className={`${colorStyles.bg} ${colorStyles.border} ${colorStyles.text}`}>
              {project.status === ProjectStatus.ACTIVE ? "Activo" :
                project.status === ProjectStatus.COMPLETED ? "Completado" : "Archivado"}
            </Badge>
          </div>
          <Button 
            onClick={() => handleEditProject(project)}
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
                    className="flex items-center justify-between p-3 bg-neon-dark rounded-md border border-neon-accent/10 hover:border-neon-accent/30 transition-all duration-300 cursor-pointer"
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
  
  // Vista de lista de proyectos
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neon-text flex items-center">
            <FolderKanban className="h-6 w-6 mr-2 text-neon-accent" />
            Proyectos
          </h1>
          <p className="text-neon-text/70 mt-1">
            Gestiona tus proyectos y organiza tus tareas de manera eficiente
          </p>
        </div>
        <Button 
          className="bg-neon-accent hover:bg-neon-accent/80 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo proyecto
        </Button>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-neon-medium/20 border border-neon-accent/20">
          <TabsTrigger value="active" className="data-[state=active]:bg-neon-accent data-[state=active]:text-neon-dark">
            Activos
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-neon-accent data-[state=active]:text-neon-dark">
            Completados
          </TabsTrigger>
          <TabsTrigger value="archived" className="data-[state=active]:bg-neon-accent data-[state=active]:text-neon-dark">
            Archivados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-5">
          {isLoadingProjects ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neon-accent border-r-transparent"></div>
              <p className="mt-2 text-neon-text">Cargando proyectos...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-neon-medium/20 rounded-md border border-neon-accent/20">
              <FolderKanban className="h-12 w-12 text-neon-accent/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neon-text mb-1">No hay proyectos activos</h3>
              <p className="text-neon-text/70 mb-4">Crea un nuevo proyecto para empezar a organizar tus tareas</p>
              <Button 
                className="bg-neon-accent hover:bg-neon-accent/80 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Nuevo proyecto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id}
                  project={project}
                  onClick={() => setLocation(`/projects/${project.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-5">
          {isLoadingProjects ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neon-accent border-r-transparent"></div>
              <p className="mt-2 text-neon-text">Cargando proyectos...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-neon-medium/20 rounded-md border border-neon-accent/20">
              <CheckCircle2 className="h-12 w-12 text-emerald-500/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neon-text mb-1">No hay proyectos completados</h3>
              <p className="text-neon-text/70">Completa proyectos activos para verlos aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id}
                  project={project}
                  onClick={() => setLocation(`/projects/${project.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="mt-5">
          {isLoadingProjects ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neon-accent border-r-transparent"></div>
              <p className="mt-2 text-neon-text">Cargando proyectos...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-neon-medium/20 rounded-md border border-neon-accent/20">
              <FileText className="h-12 w-12 text-neon-accent/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neon-text mb-1">No hay proyectos archivados</h3>
              <p className="text-neon-text/70">Los proyectos archivados se mostrarán aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id}
                  project={project}
                  onClick={() => setLocation(`/projects/${project.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}