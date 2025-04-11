import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Habit } from "@shared/schema";
import { HabitList } from "@/components/habits/HabitList";
import { HabitForm } from "@/components/habits/HabitForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function HabitsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentHabit, setCurrentHabit] = useState<Habit | undefined>(undefined);

  // Mutaciones para operaciones CRUD
  const createHabitMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest("/api/habits", {
        method: "POST",
        data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Hábito creado",
        description: "El hábito se ha creado correctamente",
      });
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habits/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el hábito",
        variant: "destructive",
      });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/habits/${id}`, {
        method: "PATCH",
        data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Hábito actualizado",
        description: "El hábito se ha actualizado correctamente",
      });
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habits/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el hábito",
        variant: "destructive",
      });
    },
  });

  const completeHabitMutation = useMutation({
    mutationFn: (habit: Habit) => {
      const today = new Date();
      return apiRequest("/api/habit-logs", {
        method: "POST",
        data: {
          habitId: habit.id,
          completedDate: format(today, "yyyy-MM-dd"),
          notes: null,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Hábito completado",
        description: "Se ha registrado la realización del hábito para hoy",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/habits/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habit-logs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar la realización del hábito",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleCreateHabit = (data: any) => {
    // Formatear la fecha como string YYYY-MM-DD para el API
    const formattedData = {
      ...data,
      startDate: format(data.startDate, "yyyy-MM-dd"),
    };
    createHabitMutation.mutate(formattedData);
  };

  const handleEditHabit = (data: any) => {
    if (!currentHabit) return;
    
    // Formatear la fecha como string YYYY-MM-DD para el API
    const formattedData = {
      ...data,
      startDate: format(data.startDate, "yyyy-MM-dd"),
    };
    
    updateHabitMutation.mutate({ id: currentHabit.id, data: formattedData });
  };

  const handleOpenEditDialog = (habit: Habit) => {
    setCurrentHabit(habit);
    setEditDialogOpen(true);
  };

  const handleCompleteHabit = (habit: Habit) => {
    completeHabitMutation.mutate(habit);
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-5xl">
      <HabitList 
        onCreateHabit={() => setCreateDialogOpen(true)}
        onEditHabit={handleOpenEditDialog}
        onCompleteHabit={handleCompleteHabit}
        onViewStats={(habit) => {
          // Futura implementación: mostrar estadísticas detalladas del hábito
          toast({
            title: "Próximamente",
            description: `Estadísticas detalladas para "${habit.title}" estarán disponibles pronto`,
          });
        }}
      />

      {/* Diálogo para crear hábito */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear nuevo hábito</DialogTitle>
            <DialogDescription>
              Rellena el formulario para crear un nuevo hábito que quieras seguir
            </DialogDescription>
          </DialogHeader>
          <HabitForm
            onSubmit={handleCreateHabit}
            onCancel={() => setCreateDialogOpen(false)}
            isSubmitting={createHabitMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar hábito */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar hábito</DialogTitle>
            <DialogDescription>
              Modifica la información de este hábito
            </DialogDescription>
          </DialogHeader>
          {currentHabit && (
            <HabitForm
              habit={currentHabit}
              onSubmit={handleEditHabit}
              onCancel={() => setEditDialogOpen(false)}
              isSubmitting={updateHabitMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}