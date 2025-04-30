import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Project, ProjectStatus } from "@shared/schema";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { FolderKanban, Plus, CheckCircle2, FileText } from "lucide-react";

// Interfaz para el resumen de proyecto
interface ProjectSummary extends Project {
  taskCount: number;
  progress: number;
}

export default function ProjectsList() {
  const [selectedTab, setSelectedTab] = useState("active");
  const [, setLocation] = useLocation();
  
  // Consulta para obtener el resumen de proyectos con número de tareas y progreso
  const { 
    data: projects = [], 
    isLoading: isLoadingProjects,
    isError: isErrorProjects 
  } = useQuery<ProjectSummary[]>({
    queryKey: ['/api/projects/summary'],
  });
  
  // Filtrar proyectos según la pestaña seleccionada
  const filteredProjects = projects.filter(project => {
    if (selectedTab === "active") return project.status === ProjectStatus.ACTIVE;
    if (selectedTab === "completed") return project.status === ProjectStatus.COMPLETED;
    if (selectedTab === "archived") return project.status === ProjectStatus.ARCHIVED;
    return true;
  });
  
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
          onClick={() => setLocation("/projects/new")}
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
                onClick={() => setLocation("/projects/new")}
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
                  progress={project.progress}
                  taskCount={project.taskCount}
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
                  progress={project.progress}
                  taskCount={project.taskCount}
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
                  progress={project.progress}
                  taskCount={project.taskCount}
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