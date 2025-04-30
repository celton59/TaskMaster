import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskForm } from "@/components/tasks/task-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  Edit,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import type { Task, Category } from "@shared/schema";

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Parse task ID
  const taskId = parseInt(id, 10);
  
  // Redirect if invalid ID
  useEffect(() => {
    if (isNaN(taskId)) {
      navigate("/tasks");
    }
  }, [taskId, navigate]);
  
  // Fetch task data
  const { 
    data: taskData, 
    isLoading: isLoadingTask,
    error
  } = useQuery<Task | Task[]>({
    queryKey: ["/api/tasks", taskId],
    queryFn: async () => {
      if (isNaN(taskId)) return null;
      console.log("Obteniendo datos para la tarea ID:", taskId);
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Error al obtener la tarea");
      const data = await res.json();
      console.log("Datos de tarea recibidos:", data);
      return data;
    },
    enabled: !isNaN(taskId)
  });
  
  // Si es un array, tomamos el primer elemento
  const task = taskData && Array.isArray(taskData) ? taskData[0] : taskData;
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });
  
  // Handle back button
  const handleBack = () => {
    navigate("/tasks");
  };
  
  // Get category
  const getCategory = () => {
    if (!task?.categoryId) return null;
    return categories.find(c => c.id === task.categoryId);
  };
  
  // Format date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "No establecida";
    return format(new Date(date), "PPP", { locale: es });
  };
  
  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">En progreso</Badge>;
      case "review":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Revisión</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Baja</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Media</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Alta</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Urgente</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };
  
  // Loading state
  if (isLoadingTask) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
                <div>
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
                <div>
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
                <div>
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !task) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Error al cargar la tarea
              </CardTitle>
              <CardDescription>
                No se pudo encontrar la tarea con ID {id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Por favor, vuelve a la lista de tareas e intenta nuevamente.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleBack}>Volver a tareas</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  const category = getCategory();
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <CardDescription>
                  {task.createdAt && (
                    <span>Creada el {format(new Date(task.createdAt), "PPP", { locale: es })}</span>
                  )}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-neutral-700 whitespace-pre-line">
                {task.description || "Sin descripción"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-neutral-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">Estado</p>
                  <div className="mt-1">{getStatusBadge(task.status)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-neutral-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">Prioridad</p>
                  <div className="mt-1">{getPriorityBadge(task.priority)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-neutral-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">Categoría</p>
                  <p className="mt-1 font-medium">
                    {category ? category.name : "Sin categoría"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-neutral-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">Fecha límite</p>
                  <p className="mt-1 font-medium">
                    {formatDate(task.deadline)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between">
            <p className="text-sm text-neutral-500">
              ID de tarea: {task.id}
            </p>
            {task.status === "completed" ? (
              <Badge className="bg-green-100 text-green-800 flex items-center">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completada
              </Badge>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                Actualizar estado
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Edit Task Modal */}
      <TaskForm
        isOpen={isEditModalOpen}
        taskId={taskId}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
