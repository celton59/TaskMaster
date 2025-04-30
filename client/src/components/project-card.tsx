import { Project, ProjectStatus } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, Users } from "lucide-react";

interface ProjectCardProps { 
  project: Project, 
  progress?: number,
  taskCount?: number,
  onClick: () => void 
}

// Definir un componente para visualizar un proyecto
export function ProjectCard({ 
  project,
  progress = 0,
  taskCount = 0,
  onClick 
}: ProjectCardProps) {
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
  
  // Formatear fecha de manera segura
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "No definida";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return format(date, "d MMM yyyy", { locale: es });
  };
  
  const colorStyles = getColorStyles(project.color);
  
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
            <span className="text-xs text-neon-text/70">{taskCount} {taskCount === 1 ? 'tarea' : 'tareas'}</span>
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
}