import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { insertTaskSchema, TaskStatus, TaskPriority, type Category, type Project } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  isOpen: boolean;
  taskId?: number;
  onClose: () => void;
}

// Extend the task schema for form validation
const formSchema = insertTaskSchema.extend({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  deadline: z.date().optional().nullable(),
});

export function TaskForm({ isOpen, taskId, onClose }: TaskFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Get categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });
  
  // Get projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });
  
  // Get task data if editing
  const { data: taskData, isLoading: isLoadingTask } = useQuery({
    queryKey: ["/api/tasks", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to fetch task");
      return res.json();
    },
    enabled: !!taskId,
  });
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      categoryId: undefined,
      projectId: undefined,
      deadline: null,
      assignedTo: undefined,
    }
  });
  
  // Set form values when editing task data is loaded
  // Usamos useEffect en lugar de useState para que se ejecute cuando cambie taskData
  useEffect(() => {
    if (taskData) {
      console.log("Configurando formulario con datos de tarea:", taskData);
      form.reset({
        ...taskData,
        deadline: taskData.deadline ? new Date(taskData.deadline) : null,
      });
      
      if (taskData.deadline) {
        setSelectedDate(new Date(taskData.deadline));
      }
    }
  }, [taskData, form]);
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      console.log("Intentando crear tarea con datos:", data);
      return await apiRequest("/api/tasks", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
      toast({
        title: "Tarea creada",
        description: "La tarea se creó correctamente.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error("Error al crear tarea:", error);
      toast({
        title: "Error",
        description: `No se pudo crear la tarea: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!taskId) return;
      return await apiRequest(`/api/tasks/${taskId}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks", taskId] });
      }
      toast({
        title: "Tarea actualizada",
        description: "La tarea se actualizó correctamente.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la tarea: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (taskId) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-[1px] border-[#00E1FF]/30 bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">{taskId ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {taskId 
              ? "Actualiza los detalles de la tarea existente." 
              : "Crea una nueva tarea para tu lista de tareas."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Título de la tarea" 
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-offset-0 focus-visible:ring-[#00E1FF]/50"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción de la tarea" 
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-offset-0 focus-visible:ring-[#00E1FF]/50 min-h-[100px]"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Estado</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || TaskStatus.PENDING}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-border text-foreground focus-visible:ring-offset-0 focus-visible:ring-[#00E1FF]/50">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TaskStatus.PENDING}>Pendiente</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>En progreso</SelectItem>
                        <SelectItem value={TaskStatus.REVIEW}>Revisión</SelectItem>
                        <SelectItem value={TaskStatus.COMPLETED}>Completado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Prioridad</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || TaskPriority.MEDIUM}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-border text-foreground focus-visible:ring-offset-0 focus-visible:ring-[#00E1FF]/50">
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TaskPriority.LOW}>Baja</SelectItem>
                        <SelectItem value={TaskPriority.MEDIUM}>Media</SelectItem>
                        <SelectItem value={TaskPriority.HIGH}>Alta</SelectItem>
                        <SelectItem value={TaskPriority.URGENT}>Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Categoría</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-border text-foreground focus-visible:ring-offset-0 focus-visible:ring-[#00E1FF]/50">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Proyecto</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value, 10))} 
                      defaultValue={field.value?.toString() || "null"}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-border text-foreground focus-visible:ring-offset-0 focus-visible:ring-[#00E1FF]/50">
                          <SelectValue placeholder="Seleccionar proyecto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Sin proyecto</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-foreground font-medium">Fecha límite</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-background border-border text-foreground focus-visible:ring-offset-0 focus-visible:ring-[#00E1FF]/50",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => {
                          field.onChange(date);
                          setSelectedDate(date);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isLoadingTask}
                className="bg-primary hover:bg-primary/80 text-white font-medium"
              >
                {taskId ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
