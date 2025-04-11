import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HabitFrequency, HabitColors, Habit } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface HabitFormProps {
  habit?: Habit;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function HabitForm({ habit, onSubmit, onCancel, isSubmitting = false }: HabitFormProps) {
  // Esquema de validación para el formulario
  const formSchema = z.object({
    title: z.string().min(1, "El título es obligatorio").max(100, "El título es demasiado largo"),
    description: z.string().optional(),
    frequency: z.enum(["daily", "weekday", "weekend"]),
    color: z.string(),
    iconName: z.string().optional(),
    isActive: z.boolean().default(true),
    startDate: z.date(),
  });

  // Valores por defecto
  const defaultValues: z.infer<typeof formSchema> = {
    title: habit?.title || "",
    description: habit?.description || "",
    frequency: (habit?.frequency as "daily" | "weekday" | "weekend") || "daily",
    color: habit?.color || "blue",
    iconName: habit?.iconName || "",
    isActive: habit?.isActive !== undefined ? habit.isActive : true,
    startDate: habit?.startDate ? new Date(habit.startDate) : new Date(),
  };

  // Configuración del formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Función para manejar el envío del formulario
  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Hacer ejercicio" {...field} />
              </FormControl>
              <FormDescription>
                Nombre corto y descriptivo para tu hábito
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Hacer al menos 30 minutos de ejercicio cardiovascular"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Una descripción detallada de lo que implica este hábito
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frecuencia</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="daily" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Diario
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="weekday" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Días laborables (Lun-Vie)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="weekend" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Fines de semana (Sáb-Dom)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(HabitColors).map(([key, color]) => (
                      <SelectItem key={key} value={color}>
                        <div className="flex items-center">
                          <div 
                            className="h-4 w-4 rounded-full mr-2" 
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="capitalize">{key.toLowerCase()}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="iconName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icono (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: 🏃‍♂️ o 🧘‍♀️" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Emoji que represente tu hábito
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Día desde el que quieres empezar a registrar este hábito
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Activo</FormLabel>
                <FormDescription>
                  Desactiva esta opción para pausar temporalmente el hábito
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : habit ? "Actualizar hábito" : "Crear hábito"}
          </Button>
        </div>
      </form>
    </Form>
  );
}