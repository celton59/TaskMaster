import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Project, ProjectStatus, Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { FolderKanban, Plus } from "lucide-react";

export default function Projects() {
  const [selectedTab, setSelectedTab] = useState("active");
  const [, setLocation] = useLocation();
  
  // Consulta para obtener todos los proyectos
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Filtrar proyectos según la pestaña seleccionada
  const filteredProjects = projects.filter(project => {
    if (selectedTab === "active") return project.status === ProjectStatus.ACTIVE;
    if (selectedTab === "completed") return project.status === ProjectStatus.COMPLETED;
    if (selectedTab === "archived") return project.status === ProjectStatus.ARCHIVED;
    return true;
  });
  
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
                <Card 
                  key={project.id}
                  className="overflow-hidden transition-all duration-300 cursor-pointer hover:translate-y-[-5px] bg-neon-medium/20 border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.2)]"
                  onClick={() => setLocation(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-neon-accent text-lg line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-neon-text/70">
                      {project.description || "Sin descripción"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-5">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-neon-medium/20 rounded-md border border-neon-accent/20">
              <h3 className="text-lg font-medium text-neon-text mb-1">No hay proyectos completados</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map(project => (
                <Card 
                  key={project.id}
                  className="overflow-hidden transition-all duration-300 cursor-pointer hover:translate-y-[-5px] bg-neon-medium/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  onClick={() => setLocation(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-emerald-400 text-lg line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-neon-text/70">
                      {project.description || "Sin descripción"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="mt-5">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-neon-medium/20 rounded-md border border-neon-accent/20">
              <h3 className="text-lg font-medium text-neon-text mb-1">No hay proyectos archivados</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map(project => (
                <Card 
                  key={project.id}
                  className="overflow-hidden transition-all duration-300 cursor-pointer hover:translate-y-[-5px] bg-neon-medium/20 border-slate-500/30 shadow-[0_0_15px_rgba(100,116,139,0.2)] opacity-80"
                  onClick={() => setLocation(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-slate-400 text-lg line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-neon-text/70">
                      {project.description || "Sin descripción"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}