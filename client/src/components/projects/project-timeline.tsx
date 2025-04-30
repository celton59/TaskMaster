import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Task } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react";

type TimelineProps = {
  tasks: Task[];
};

export function ProjectTimeline({ tasks = [] }: TimelineProps) {
  // Ordenar las tareas por fecha de inicio
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      return aDate - bDate;
    });
  }, [tasks]);

  // Formatear fecha
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "Sin fecha";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return format(date, "d MMM yyyy", { locale: es });
  };

  // Configuración de animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2,
        duration: 0.5
      }
    }
  };

  const lineVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "100%", 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeInOut" 
      }
    }
  };

  const taskVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 0 20px rgba(0, 225, 255, 0.3)",
      borderColor: "rgba(0, 225, 255, 0.6)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 17 
      }
    }
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { 
        delay: 0.2 + (custom * 0.1),
        duration: 0.4,
        type: "spring",
        stiffness: 200
      }
    })
  };

  // Si no hay tareas, mostrar mensaje
  if (!sortedTasks.length) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-6 text-neon-text/70"
      >
        No hay tareas para mostrar en la línea de tiempo.
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative mt-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Línea vertical de la timeline */}
      <motion.div 
        className="absolute left-5 top-0 bottom-0 w-0.5 bg-neon-accent/30"
        variants={lineVariants}
      />

      {/* Tareas en timeline */}
      <div className="space-y-8 relative">
        {sortedTasks.map((task, index) => {
          // Determinar el color según el estado
          const statusColor = 
            task.status === 'completed' ? 'bg-emerald-500 border-emerald-500/30' :
            task.status === 'in_progress' || task.status === 'in-progress' ? 'bg-amber-500 border-amber-500/30' :
            task.status === 'review' ? 'bg-blue-500 border-blue-500/30' :
            'bg-rose-500 border-rose-500/30';
          
          // Ícono según el estado
          const StatusIcon = 
            task.status === 'completed' ? CheckCircle :
            task.status === 'in_progress' || task.status === 'in-progress' ? Clock :
            task.status === 'review' ? Clock :
            AlertCircle;
          
          return (
            <motion.div key={task.id} className="relative pl-12" variants={taskVariants}>
              {/* Círculo de la línea temporal */}
              <motion.div 
                className={cn(
                  "absolute left-3.5 top-1.5 w-3 h-3 rounded-full -translate-x-1/2",
                  statusColor
                )}
                variants={circleVariants}
                custom={index}
                whileHover={{ 
                  scale: 1.5, 
                  boxShadow: `0 0 10px ${task.status === 'completed' ? 'rgba(16, 185, 129, 0.7)' : 
                                        task.status === 'in_progress' || task.status === 'in-progress' ? 'rgba(245, 158, 11, 0.7)' : 
                                        task.status === 'review' ? 'rgba(59, 130, 246, 0.7)' : 
                                        'rgba(239, 68, 68, 0.7)'}`
                }}
              />
              
              {/* Contenido de la tarea */}
              <motion.div 
                className={cn(
                  "p-4 rounded-lg border",
                  "bg-neon-medium/20 border-neon-accent/20",
                  "shadow-[0_0_15px_rgba(0,225,255,0.1)]",
                  "cursor-pointer"
                )}
                whileHover="hover"
                variants={taskVariants}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-neon-text">{task.title}</h3>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <StatusIcon className={cn(
                      "h-5 w-5",
                      task.status === 'completed' ? "text-emerald-400" :
                      task.status === 'in_progress' || task.status === 'in-progress' ? "text-amber-400" :
                      task.status === 'review' ? "text-blue-400" :
                      "text-rose-400"
                    )} />
                  </motion.div>
                </div>
                
                {task.description && (
                  <p className="text-sm text-neon-text/70 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  {/* Fecha de inicio */}
                  <div className="flex items-center text-neon-text/80">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1 text-neon-accent/70" />
                    <span>Inicio: {formatDate(task.startDate)}</span>
                  </div>
                  
                  {/* Fecha límite */}
                  {task.deadline && (
                    <div className="flex items-center text-neon-text/80">
                      <Clock className="h-3.5 w-3.5 mr-1 text-neon-accent/70" />
                      <span>Límite: {formatDate(task.deadline)}</span>
                    </div>
                  )}
                  
                  {/* Prioridad */}
                  <div className="ml-auto">
                    <motion.span 
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        task.priority === 'alta' ? "bg-rose-500/20 text-rose-300" :
                        task.priority === 'media' ? "bg-amber-500/20 text-amber-300" :
                        "bg-blue-500/20 text-blue-300"
                      )}
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: task.priority === 'alta' ? 'rgba(244, 63, 94, 0.3)' :
                                        task.priority === 'media' ? 'rgba(245, 158, 11, 0.3)' :
                                        'rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {task.priority || "Normal"}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}