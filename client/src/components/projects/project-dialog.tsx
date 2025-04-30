import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { insertProjectSchema, Project, ProjectStatus } from "@shared/schema";

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

// Extendemos el esquema para agregar validaciones adicionales
const projectFormSchema = insertProjectSchema.extend({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  description: z.string().optional().nullable(),
  color: z.string(),
  status: z.string(),
  startDate: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function ProjectDialog({ isOpen, onClose, project }: ProjectDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      color: project?.color || "blue", 
      status: project?.status || ProjectStatus.ACTIVE,
      startDate: project?.startDate ? new Date(project.startDate) : null,
      dueDate: project?.dueDate ? new Date(project.dueDate) : null,
    },
  });
  
  // Mutación para crear un nuevo proyecto
  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Proyecto creado",
        description: "El proyecto ha sido creado exitosamente",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Error al crear el proyecto: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para actualizar un proyecto existente
  const updateMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const res = await apiRequest("PATCH", `/api/projects/${project?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      if (project?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
      }
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto ha sido actualizado exitosamente",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Error al actualizar el proyecto: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Manejador de envío del formulario
  const onSubmit = (data: ProjectFormValues) => {
    setSubmitting(true);
    if (project) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-neon-dark border-neon-accent/30">
        <DialogHeader>
          <DialogTitle className="text-neon-text">
            {project ? "Editar proyecto" : "Crear nuevo proyecto"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neon-text">Nombre del proyecto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del proyecto"
                      {...field}
                      className="bg-neon-medium/20 border-neon-accent/30 text-neon-text"
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
                  <FormLabel className="text-neon-text">Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del proyecto"
                      {...field}
                      value={field.value || ''}
                      className="bg-neon-medium/20 border-neon-accent/30 text-neon-text min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-neon-text">Fecha de inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-neon-medium/20 border-neon-accent/30 text-neon-text",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-neon-dark border-neon-accent/30" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="text-neon-text"
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
                    <FormLabel className="text-neon-text">Fecha límite</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-neon-medium/20 border-neon-accent/30 text-neon-text",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-neon-dark border-neon-accent/30" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="text-neon-text"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neon-text">Color del proyecto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-neon-medium/20 border-neon-accent/30 text-neon-text">
                        <SelectValue placeholder="Seleccionar color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-neon-dark border-neon-accent/30">
                      <SelectItem value="blue" className="text-blue-400">Azul</SelectItem>
                      <SelectItem value="purple" className="text-purple-400">Púrpura</SelectItem>
                      <SelectItem value="green" className="text-emerald-400">Verde</SelectItem>
                      <SelectItem value="orange" className="text-amber-400">Naranja</SelectItem>
                      <SelectItem value="cyan" className="text-cyan-400">Cian</SelectItem>
                      <SelectItem value="pink" className="text-pink-400">Rosa</SelectItem>
                      <SelectItem value="red" className="text-rose-400">Rojo</SelectItem>
                      <SelectItem value="yellow" className="text-yellow-400">Amarillo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {project && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-neon-text">Estado del proyecto</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={ProjectStatus.ACTIVE} id="active" className="border-neon-accent/50 text-neon-accent" />
                          <Label htmlFor="active" className="text-neon-text">Activo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={ProjectStatus.COMPLETED} id="completed" className="border-emerald-400/50 text-emerald-400" />
                          <Label htmlFor="completed" className="text-neon-text">Completado</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={ProjectStatus.ARCHIVED} id="archived" className="border-slate-400/50 text-slate-400" />
                          <Label htmlFor="archived" className="text-neon-text">Archivado</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="bg-transparent border-neon-accent/50 text-neon-text hover:bg-neon-accent/10"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
                className="bg-neon-accent hover:bg-neon-accent/80 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
              >
                {submitting ? "Enviando..." : project ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}