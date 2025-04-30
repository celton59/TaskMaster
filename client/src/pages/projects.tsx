import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Project, ProjectStatus } from "@shared/schema";
import { FolderKanban, Plus, CalendarRange, Check, Ban, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Projects() {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  // Fetch all projects
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    retry: 1,
  });
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return "bg-green-500/10 text-green-500 border-green-500/30";
      case ProjectStatus.COMPLETED:
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case ProjectStatus.ARCHIVED:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return <Clock className="h-3.5 w-3.5" />;
      case ProjectStatus.COMPLETED:
        return <Check className="h-3.5 w-3.5" />;
      case ProjectStatus.ARCHIVED:
        return <Ban className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };
  
  const handleCreateProject = () => {
    setProjectToEdit(null);
    setIsProjectDialogOpen(true);
  };
  
  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectDialogOpen(true);
  };
  
  const closeProjectDialog = () => {
    setIsProjectDialogOpen(false);
    setProjectToEdit(null);
  };
  
  // Formatear fecha en español
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Sin fecha";
    return format(new Date(date), "d MMM yyyy", { locale: es });
  };
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error al cargar los proyectos. Inténtalo de nuevo más tarde.</p>
      </div>
    );
  }
  
  return (
    <div className="py-8 px-6 space-y-8">
      <div className="neon-card rounded-lg p-5 mb-6 shadow-xl bg-neon-dark border border-neon-purple/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold tracking-tight flex items-center">
                <span className="bg-neon-purple/10 text-neon-purple p-1.5 rounded-md mr-3 border border-neon-purple/30 shadow-[0_0_8px_rgba(187,0,255,0.2)]">
                  <FolderKanban className="h-5 w-5" />
                </span>
                <span className="terminal-text">Proyectos</span>
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-gray-300">
              Gestiona tus proyectos y visualiza su progreso
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={handleCreateProject}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white shadow-[0_0_15px_rgba(187,0,255,0.3)]"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nuevo Proyecto
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neon-dark border border-neon-accent/20 rounded-lg p-5 shadow-lg">
              <Skeleton className="h-8 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-5 w-full mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div 
                  className={`cursor-pointer bg-neon-dark border border-${project.color}-500/30 rounded-lg p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-${project.color}-500/50`}
                  onClick={(e) => {
                    e.preventDefault(); // Prevenir navegación en este evento
                    handleEditProject(project);
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-lg font-semibold text-${project.color}-400 terminal-text`}>
                      {project.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)} border flex items-center`}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">
                        {project.status === ProjectStatus.ACTIVE ? "Activo" : 
                         project.status === ProjectStatus.COMPLETED ? "Completado" : "Archivado"}
                      </span>
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {project.description || "Sin descripción"}
                  </p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Progreso</span>
                      <span className="text-neon-accent">75%</span>
                    </div>
                    <Progress value={75} className="h-1.5" indicatorClassName={`bg-${project.color}-500`} />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400 mt-4">
                    <div className="flex items-center">
                      <CalendarRange className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(project.startDate)} - {formatDate(project.dueDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <span>12 tareas</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-400 mb-4">No hay proyectos creados</p>
              <Button 
                onClick={handleCreateProject}
                className="bg-neon-purple hover:bg-neon-purple/80 text-white shadow-[0_0_15px_rgba(187,0,255,0.3)]"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Crear mi primer proyecto
              </Button>
            </div>
          )}
        </div>
      )}
      
      {isProjectDialogOpen && (
        <ProjectDialog 
          isOpen={isProjectDialogOpen} 
          onClose={closeProjectDialog} 
          project={projectToEdit}
        />
      )}
    </div>
  );
}