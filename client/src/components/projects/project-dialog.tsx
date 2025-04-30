import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertProjectSchema, InsertProject, Project, ProjectStatus } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

// Extender el esquema de inserción de proyecto para incluir validaciones de formulario
const formSchema = insertProjectSchema.extend({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  color: z.string(),
  startDate: z.date().refine(date => date <= new Date(), {
    message: "La fecha de inicio no puede ser posterior a hoy"
  }),
  dueDate: z.date().refine(date => date > new Date(), {
    message: "La fecha límite debe ser posterior a hoy"
  }),
  status: z.enum([ProjectStatus.ACTIVE, ProjectStatus.COMPLETED, ProjectStatus.ARCHIVED]),
});

// Definir los colores disponibles para los proyectos
const colorOptions = [
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "orange", label: "Naranja" },
  { value: "purple", label: "Morado" },
  { value: "pink", label: "Rosa" },
  { value: "cyan", label: "Cian" },
  { value: "red", label: "Rojo" },
  { value: "yellow", label: "Amarillo" },
];

// Definir los estados disponibles para los proyectos
const statusOptions = [
  { value: ProjectStatus.ACTIVE, label: "Activo" },
  { value: ProjectStatus.COMPLETED, label: "Completado" },
  { value: ProjectStatus.ARCHIVED, label: "Archivado" },
];

type ProjectDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
};

export function ProjectDialog({ isOpen, onClose, project }: ProjectDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!project;
  
  // Configurar el formulario con los valores por defecto
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      color: project?.color || "blue",
      startDate: project?.startDate ? new Date(project.startDate) : new Date(),
      dueDate: project?.dueDate ? new Date(project.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: project?.status || ProjectStatus.ACTIVE,
      ownerId: project?.ownerId || 1, // Valor predeterminado, ajustar según la implementación
    },
  });
  
  // Mutación para crear un nuevo proyecto
  const createMutation = useMutation({
    mutationFn: async (newProject: InsertProject) => {
      const res = await apiRequest("POST", "/api/projects", newProject);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Proyecto creado",
        description: "El proyecto ha sido creado con éxito",
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear el proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para actualizar un proyecto existente
  const updateMutation = useMutation({
    mutationFn: async (projectData: Partial<InsertProject>) => {
      const res = await apiRequest("PATCH", `/api/projects/${project?.id}`, projectData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      if (project?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
      }
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto ha sido actualizado con éxito",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar el proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Manejar el envío del formulario
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditing && project) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Verificar si alguna de las mutaciones está en proceso
  const isLoading = createMutation.isPending || updateMutation.isPending;
  
  // Previsualización de color seleccionado
  const getColorPreview = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-emerald-500",
      orange: "bg-amber-500", 
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      cyan: "bg-cyan-500",
      red: "bg-rose-500",
      yellow: "bg-yellow-500",
    };
    
    return colorMap[color] || "bg-blue-500";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-neon-medium/40 border-neon-accent/40 text-neon-text backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-neon-accent">
            {isEditing ? "Editar proyecto" : "Crear nuevo proyecto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Actualiza los detalles del proyecto" 
              : "Completa la información para crear un nuevo proyecto"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nombre del proyecto" 
                      {...field}
                      className="bg-neon-dark/60 border-neon-accent/30 focus:border-neon-accent text-neon-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del proyecto" 
                      className="bg-neon-dark/60 border-neon-accent/30 focus:border-neon-accent text-neon-text resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${getColorPreview(field.value)}`}></div>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-neon-dark/60 border-neon-accent/30 text-neon-text">
                            <SelectValue placeholder="Seleccionar color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-neon-medium border-neon-accent/30">
                          {colorOptions.map(color => (
                            <SelectItem 
                              key={color.value} 
                              value={color.value}
                              className="text-neon-text focus:bg-neon-accent/20 focus:text-neon-text"
                            >
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${getColorPreview(color.value)} mr-2`}></div>
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {isEditing && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-neon-dark/60 border-neon-accent/30 text-neon-text">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-neon-medium border-neon-accent/30">
                          {statusOptions.map(status => (
                            <SelectItem 
                              key={status.value} 
                              value={status.value}
                              className="text-neon-text focus:bg-neon-accent/20 focus:text-neon-text"
                            >
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal bg-neon-dark/60 border-neon-accent/30 text-neon-text",
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
                      <PopoverContent className="w-auto p-0 bg-neon-medium border-neon-accent/30" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="bg-neon-medium text-neon-text"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha límite</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal bg-neon-dark/60 border-neon-accent/30 text-neon-text",
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
                      <PopoverContent className="w-auto p-0 bg-neon-medium border-neon-accent/30" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="bg-neon-medium text-neon-text"
                          fromDate={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-neon-dark/60 border-neon-accent/30 text-neon-text hover:bg-neon-dark"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-neon-accent hover:bg-neon-accent/80 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}