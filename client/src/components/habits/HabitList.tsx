import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Habit } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusCircle, CheckCircle2, CircleX, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HabitListProps {
  className?: string;
  onCreateHabit?: () => void;
  onEditHabit?: (habit: Habit) => void;
  onViewStats?: (habit: Habit) => void;
  onCompleteHabit?: (habit: Habit) => void;
}

const habitFrequencyMap: Record<string, string> = {
  daily: "Diaria",
  weekday: "Días laborables",
  weekend: "Fines de semana"
};

export function HabitList({ 
  className, 
  onCreateHabit, 
  onEditHabit, 
  onViewStats,
  onCompleteHabit 
}: HabitListProps) {
  const [filter, setFilter] = useState<string | null>(null);

  // Obtener todos los hábitos
  const habitsQuery = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
    staleTime: 1000 * 60, // 1 minuto
  });

  // Obtener las estadísticas de los hábitos
  const statsQuery = useQuery<{
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    streakData: Record<number, number>;
  }>({
    queryKey: ['/api/habits/stats'],
    staleTime: 1000 * 60, // 1 minuto
  });

  const habits = habitsQuery.data || [];
  const stats = statsQuery.data || { 
    totalHabits: 0, 
    activeHabits: 0, 
    completedToday: 0, 
    streakData: {} 
  };

  const filteredHabits = filter 
    ? habits.filter((habit: Habit) => habit.frequency === filter)
    : habits;

  // Ordenar hábitos: primero los activos, luego por nombre
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    // Primero por estado activo/inactivo
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    // Luego por nombre
    return a.title.localeCompare(b.title);
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Mis Hábitos
          </h2>
          <p className="text-sm text-muted-foreground">
            {stats.activeHabits} hábitos activos, {stats.completedToday} completados hoy
          </p>
        </div>
        <Button onClick={onCreateHabit} variant="default">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuevo hábito
        </Button>
      </div>

      <div className="flex items-center space-x-2 pb-2">
        <Button
          variant={filter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter(null)}
        >
          Todos
        </Button>
        <Button
          variant={filter === "daily" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("daily")}
        >
          Diarios
        </Button>
        <Button
          variant={filter === "weekday" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("weekday")}
        >
          Laborables
        </Button>
        <Button
          variant={filter === "weekend" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("weekend")}
        >
          Fin de semana
        </Button>
      </div>

      {habitsQuery.isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : habitsQuery.isError ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <CircleX className="h-12 w-12 mx-auto mb-2 text-destructive" />
              <p>Error al cargar los hábitos</p>
            </div>
          </CardContent>
        </Card>
      ) : sortedHabits.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No hay hábitos {filter ? `con frecuencia ${habitFrequencyMap[filter]}` : ""}</p>
              <Button onClick={onCreateHabit} variant="link" className="mt-2">
                Crear un hábito nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid gap-4 grid-cols-1">
            {sortedHabits.map((habit) => (
              <Card 
                key={habit.id}
                className={`border-l-4 transition-all hover:shadow-md ${!habit.isActive ? 'opacity-60' : ''}`}
                style={{ borderLeftColor: habit.color }}
              >
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <CardTitle className="flex items-center font-medium">
                        {habit.iconName && (
                          <span className="mr-2 text-xl">{habit.iconName}</span>
                        )}
                        {habit.title}
                      </CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>
                          {habitFrequencyMap[habit.frequency]} • Desde {format(new Date(habit.startDate), 'PP', { locale: es })}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Badge variant={habit.isActive ? "default" : "outline"}>
                        {habit.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {habit.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <span className="font-semibold">{stats.streakData[habit.id] || 0}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            {stats.streakData[habit.id] === 1 ? 'día' : 'días'} consecutivos
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((stats.streakData[habit.id] || 0) * 10, 100)} 
                          className="h-1.5 w-16 mt-1" 
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewStats?.(habit)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEditHabit?.(habit)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant={habit.id in (statsQuery.data?.streakData || {}) ? "secondary" : "default"}  
                        size="sm"
                        onClick={() => onCompleteHabit?.(habit)}
                      >
                        {habit.id in (statsQuery.data?.streakData || {}) ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Completado
                          </>
                        ) : (
                          "Completar"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}