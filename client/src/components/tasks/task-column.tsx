import { useState, useRef } from "react";
import { TaskCard } from "@/components/tasks/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import type { Task, Category, Project } from "@shared/schema";

interface TaskColumnProps {
  title: string;
  status: string;
  badgeColor: string;
  tasks: Task[];
  onTaskDrop: (taskId: number, status: string) => void;
  isLoading: boolean;
}

export function TaskColumn({ 
  title, 
  status, 
  badgeColor, 
  tasks, 
  onTaskDrop,
  isLoading 
}: TaskColumnProps) {
  // Usar el hook de tema para detectar el modo claro/oscuro
  const { isDarkMode } = useTheme();
  
  // Configurar la columna como un área droppable para @dnd-kit
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });
  
  // Get categories for task cards
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });
  
  // Get projects for task cards
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });
  
  // Get column styles based on status
  const getColumnStyle = () => {
    if (isDarkMode) {
      switch (status) {
        case "pending":
          return "border-amber-500/40 bg-neon-medium/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]";
        case "in-progress":
          return "border-blue-500/40 bg-neon-medium/20 shadow-[0_0_8px_rgba(59,130,246,0.2)]";
        case "review":
          return "border-purple-500/40 bg-neon-medium/20 shadow-[0_0_8px_rgba(168,85,247,0.2)]";
        case "completed":
          return "border-emerald-500/40 bg-neon-medium/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
        default:
          return "border-neon-accent/30 bg-neon-medium/20 shadow-[0_0_8px_rgba(0,225,255,0.15)]";
      }
    } else {
      // Estilos para modo claro
      switch (status) {
        case "pending":
          return "border-amber-200 bg-white shadow-sm";
        case "in-progress":
          return "border-blue-200 bg-white shadow-sm";
        case "review":
          return "border-purple-200 bg-white shadow-sm";
        case "completed":
          return "border-emerald-200 bg-white shadow-sm";
        default:
          return "border-gray-200 bg-white shadow-sm";
      }
    }
  };
  
  // Get title badge styles by status
  const getTitleBadge = () => {
    if (isDarkMode) {
      switch (status) {
        case "pending":
          return "bg-amber-500/20 text-amber-300 border border-amber-500/40";
        case "in-progress":
          return "bg-blue-500/20 text-blue-300 border border-blue-500/40";
        case "review":
          return "bg-purple-500/20 text-purple-300 border border-purple-500/40";
        case "completed":
          return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
        default:
          return "bg-neon-medium/30 text-neon-text border border-neon-accent/30";
      }
    } else {
      // Estilos para modo claro
      switch (status) {
        case "pending":
          return "bg-amber-50 text-amber-600 border border-amber-200";
        case "in-progress":
          return "bg-blue-50 text-blue-600 border border-blue-200";
        case "review":
          return "bg-purple-50 text-purple-600 border border-purple-200";
        case "completed":
          return "bg-emerald-50 text-emerald-600 border border-emerald-200";
        default:
          return "bg-gray-50 text-gray-600 border border-gray-200";
      }
    }
  };
  
  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "p-3 rounded-xl border w-[280px]",
        getColumnStyle(),
        isOver ? "ring-2 ring-neon-accent ring-opacity-70" : ""
      )}
      data-status={status}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={cn("rounded-md py-1 px-2", getTitleBadge())}>
            <div className={`h-2 w-2 rounded-full ${badgeColor} mr-1.5`}></div>
            <span className="font-medium">{title}</span>
          </Badge>
          <Badge variant="outline" className={cn(
            "py-0.5 font-normal",
            isDarkMode 
              ? "bg-neon-medium/20 text-neon-text/90 border-neon-accent/30"
              : "bg-gray-50 text-gray-600 border-gray-200"
          )}>
            {tasks.length}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-7 w-7 rounded-full",
              isDarkMode
                ? "hover:bg-neon-accent/20 text-neon-text/70 hover:text-neon-accent"
                : "hover:bg-blue-100 text-gray-500 hover:text-blue-600"
            )}
            title="Añadir tarea"
          >
            <Plus size={15} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-7 w-7 rounded-full",
              isDarkMode
                ? "hover:bg-neon-accent/20 text-neon-text/70 hover:text-neon-accent"
                : "hover:bg-blue-100 text-gray-500 hover:text-blue-600"
            )}
            title="Más opciones"
          >
            <MoreHorizontal size={15} />
          </Button>
        </div>
      </div>

      <div className="space-y-2 task-column px-1 min-h-[200px]">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <div key={index} className={cn(
              "p-4 rounded-lg shadow-md",
              isDarkMode
                ? "bg-neon-medium/10 border border-neon-accent/10"
                : "bg-gray-50 border border-gray-200"
            )}>
              <div className="flex justify-between items-start">
                <Skeleton className={cn(
                  "h-5 w-20 rounded-full",
                  isDarkMode ? "bg-neon-accent/10" : "bg-gray-200"
                )} />
                <Skeleton className={cn(
                  "h-4 w-4 rounded-full",
                  isDarkMode ? "bg-neon-accent/10" : "bg-gray-200"
                )} />
              </div>
              <Skeleton className={cn(
                "h-5 w-full mt-2",
                isDarkMode ? "bg-neon-accent/10" : "bg-gray-200"
              )} />
              <Skeleton className={cn(
                "h-3 w-full mt-1",
                isDarkMode ? "bg-neon-accent/10" : "bg-gray-200"
              )} />
              <Skeleton className={cn(
                "h-3 w-3/4 mt-0.5",
                isDarkMode ? "bg-neon-accent/10" : "bg-gray-200"
              )} />
              <div className="mt-3 flex items-center justify-between">
                <Skeleton className={cn(
                  "h-3 w-16",
                  isDarkMode ? "bg-neon-accent/10" : "bg-gray-200"
                )} />
                <Skeleton className={cn(
                  "h-6 w-6 rounded-full",
                  isDarkMode ? "bg-neon-accent/10" : "bg-gray-200"
                )} />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          // Empty state
          <div className={cn(
            "flex flex-col items-center justify-center py-8 text-center",
            isDarkMode ? "text-neon-text/40" : "text-gray-400"
          )}>
            <div className={cn(
              "w-full border-2 border-dashed rounded-lg p-4",
              isDarkMode ? "border-neon-accent/20" : "border-gray-200"
            )}>
              <p className="text-sm">Arrastra tareas aquí</p>
            </div>
          </div>
        ) : (
          // Task cards
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  categories={categories}
                  projects={projects}
                  onDragStart={() => {}}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
