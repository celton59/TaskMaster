import { useState } from "react";
import { SimpleTaskCard } from "./simple-task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, Category } from "@shared/schema";

interface SimpleTaskColumnProps {
  title: string;
  status: string;
  badgeColor: string;
  tasks: Task[];
  onTaskDrop: (taskId: number, status: string) => void;
  isLoading: boolean;
  categories: Category[];
}

export function SimpleTaskColumn({ 
  title, 
  status, 
  badgeColor, 
  tasks, 
  onTaskDrop,
  isLoading,
  categories
}: SimpleTaskColumnProps) {
  // Configurar la columna como un área droppable para @dnd-kit
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });
  
  // Get column styles based on status
  const getColumnStyle = () => {
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
  };
  
  // Get title badge styles by status
  const getTitleBadge = () => {
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
          <Badge variant="outline" className="bg-neon-medium/20 text-neon-text/90 py-0.5 font-normal border-neon-accent/30">
            {tasks.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 task-column px-1 min-h-[200px]">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-neon-medium/10 p-4 rounded-lg shadow-md border border-neon-accent/10">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-20 rounded-full bg-neon-accent/10" />
                <Skeleton className="h-4 w-4 rounded-full bg-neon-accent/10" />
              </div>
              <Skeleton className="h-5 w-full mt-2 bg-neon-accent/10" />
              <Skeleton className="h-3 w-full mt-1 bg-neon-accent/10" />
              <Skeleton className="h-3 w-3/4 mt-0.5 bg-neon-accent/10" />
              <div className="mt-3 flex items-center justify-between">
                <Skeleton className="h-3 w-16 bg-neon-accent/10" />
                <Skeleton className="h-6 w-6 rounded-full bg-neon-accent/10" />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-8 text-center text-neon-text/40">
            <div className="w-full border-2 border-dashed border-neon-accent/20 rounded-lg p-4">
              <p className="text-sm">Arrastra tareas aquí</p>
            </div>
          </div>
        ) : (
          // Task cards con contexto de ordenación
          <SortableContext 
            items={tasks.map(task => task.id.toString())} 
            strategy={verticalListSortingStrategy}
          >
            {tasks.map(task => (
              <SimpleTaskCard 
                key={task.id} 
                task={task} 
                categories={categories}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}