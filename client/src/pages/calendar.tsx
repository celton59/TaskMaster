import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { getQueryFn } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, endOfDay, isWithinInterval, parseISO, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'wouter';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, ListTodo, Plus } from 'lucide-react';
import { TaskForm } from '@/components/tasks/task-form';

// Definición de los tipos
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  categoryId: number | null;
  deadline: Date | string | null;
  userId?: number | null;
}

interface Category {
  id: number;
  name: string;
  color: string;
  userId?: number | null;
}

// Componente principal de Calendario
export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');

  // Consultas para tareas y categorías
  const { data: tasks = [] as Task[] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const { data: categories = [] as Category[] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Función para obtener tareas en una fecha específica
  const getTasksForDate = (date: Date) => {
    const startOfSelectedDay = startOfDay(date);
    const endOfSelectedDay = endOfDay(date);
    
    return tasks.filter((task: Task) => {
      // Si la tarea no tiene deadline, no aparece en el calendario
      if (!task.deadline) return false;
      
      try {
        const taskDate = task.deadline instanceof Date ? task.deadline : parseISO(task.deadline as unknown as string);
        return isWithinInterval(taskDate, {
          start: startOfSelectedDay,
          end: endOfSelectedDay
        });
      } catch (error) {
        console.error('Error al procesar fecha de la tarea:', error);
        return false;
      }
    });
  };

  // Tareas para la fecha seleccionada
  const tasksForSelectedDate = getTasksForDate(date);

  // Función para determinar fechas que tienen tareas en el mes actual (para mostrar puntos en el calendario)
  const getDaysWithTasks = (tasks: Task[]) => {
    const daysWithTasks = new Set<string>();
    
    tasks.forEach((task: Task) => {
      if (task.deadline) {
        try {
          const taskDate = task.deadline instanceof Date ? task.deadline : parseISO(task.deadline as unknown as string);
          daysWithTasks.add(format(taskDate, 'yyyy-MM-dd'));
        } catch (error) {
          console.error('Error al procesar fecha de la tarea para los puntos del calendario:', error);
        }
      }
    });
    
    return daysWithTasks;
  };

  // Obtener el conjunto de días con tareas
  const daysWithTasks = getDaysWithTasks(tasks);

  // Función para navegar entre fechas
  const navigateDate = (direction: 'previous' | 'next') => {
    if (view === 'day') {
      setDate(direction === 'next' ? addDays(date, 1) : subDays(date, 1));
    } else if (view === 'week') {
      setDate(direction === 'next' ? addDays(date, 7) : subDays(date, 7));
    } else {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
      setDate(newDate);
    }
  };

  // Función para abrir el formulario de tarea
  const openTaskForm = (taskId?: number) => {
    setSelectedTaskId(taskId);
    setIsTaskFormOpen(true);
  };

  // Renderizado del contenido según la vista seleccionada
  const renderContent = () => {
    if (view === 'month') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          <Card className="md:col-span-5 overflow-hidden border border-neon-accent/30 bg-neon-darker rounded-xl shadow-[0_0_20px_rgba(0,225,255,0.15)]">
            <div className="border-b border-neon-accent/20 p-3 bg-neon-medium/20">
              <h3 className="font-semibold text-neon-accent neon-text">Calendario mensual</h3>
            </div>
            <CardContent className="p-4">
              <CalendarComponent
                locale={es}
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                modifiers={{
                  withTasks: (date) => daysWithTasks.has(format(date, 'yyyy-MM-dd')),
                }}
                modifiersStyles={{
                  withTasks: {
                    fontWeight: "bold"
                  }
                }}
                modifiersClassNames={{
                  withTasks: "with-task-indicator"
                }}
                className="border-0"
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2 rounded-xl shadow-[0_0_20px_rgba(0,225,255,0.15)] border border-neon-accent/30 bg-neon-darker overflow-hidden">
            <CardHeader className="border-b border-neon-accent/20 pb-3 bg-neon-medium/30">
              <CardTitle className="text-xl flex items-center gap-2 text-neon-accent neon-text">
                <CalendarIcon className="h-5 w-5 text-neon-accent" />
                {format(date, 'd MMMM yyyy', { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-10 px-4 bg-neon-darker/80">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-medium/50 mb-4 border border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.15)]">
                    <CalendarIcon className="h-8 w-8 text-neon-accent" />
                  </div>
                  <h3 className="text-lg font-medium text-neon-text mb-1">Sin tareas hoy</h3>
                  <p className="text-sm text-neon-text/70 mb-4 max-w-xs mx-auto">
                    No tienes tareas programadas para este día. Añade una nueva para organizar tu jornada.
                  </p>
                  <Button 
                    onClick={() => openTaskForm()}
                    className="bg-neon-accent/20 hover:bg-neon-accent/30 border border-neon-accent/50 text-neon-accent neon-text shadow-[0_0_10px_rgba(0,225,255,0.25)] flex mx-auto items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva tarea
                  </Button>
                </div>
              ) : (
                <div className="bg-neon-darker/80 p-3">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <h4 className="text-sm font-medium text-neon-text/80">
                      {tasksForSelectedDate.length} {tasksForSelectedDate.length === 1 ? 'tarea' : 'tareas'}
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openTaskForm()}
                      className="h-7 px-2 text-xs text-neon-accent hover:text-neon-accent/80 hover:bg-neon-medium/20"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Añadir
                    </Button>
                  </div>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3 px-1">
                      {tasksForSelectedDate.map((task: Task) => {
                        // Determinar colores según prioridad
                        let priorityColor = "";
                        let priorityLabel = "";
                        if (task.priority === 'alta') {
                          priorityColor = "bg-rose-500";
                          priorityLabel = "Alta";
                        } else if (task.priority === 'media') {
                          priorityColor = "bg-amber-500";
                          priorityLabel = "Media";
                        } else {
                          priorityColor = "bg-emerald-500";
                          priorityLabel = "Baja";
                        }
                        
                        // Determinar colores según estado (soportando inglés y español)
                        let statusColor = "";
                        if (task.status === 'pendiente' || task.status === 'pending') {
                          statusColor = "bg-neutral-100 text-neutral-600";
                        } else if (task.status === 'en_progreso' || task.status === 'in-progress') {
                          statusColor = "bg-blue-100 text-blue-700";
                        } else if (task.status === 'revision' || task.status === 'review') {
                          statusColor = "bg-purple-100 text-purple-700";
                        } else if (task.status === 'completada' || task.status === 'completed') {
                          statusColor = "bg-green-100 text-green-700";
                        }
                        
                        return (
                          <div 
                            key={task.id} 
                            className="p-3 bg-neon-darker border border-neon-accent/30 rounded-lg hover:bg-neon-medium/10 cursor-pointer transition-all shadow-[0_0_8px_rgba(0,225,255,0.1)] hover:shadow-[0_0_12px_rgba(0,225,255,0.2)] task-card"
                            style={{ borderLeftWidth: '2px', borderLeftStyle: 'solid', borderLeftColor: task.categoryId ? 
                                categories.find((c: Category) => c.id === task.categoryId)?.color || 'rgba(0,225,255,0.5)' 
                                : 'rgba(0,225,255,0.5)' }}
                            onClick={() => openTaskForm(task.id)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-start gap-2">
                                <div className={`h-3 w-3 rounded-full mt-1 flex-shrink-0 ${priorityColor} shadow-[0_0_8px] shadow-neon-accent/30`}></div>
                                <h3 className="font-medium text-neon-text line-clamp-1">{task.title}</h3>
                              </div>
                              {task.categoryId && (
                                <Badge className="bg-neon-darker/80 border text-[10px] px-2 ml-1 whitespace-nowrap shadow-[0_0_8px_rgba(0,255,255,0.15)]" style={{ 
                                  color: categories.find((c: Category) => c.id === task.categoryId)?.color,
                                  borderColor: categories.find((c: Category) => c.id === task.categoryId)?.color,
                                  textShadow: `0 0 8px ${categories.find((c: Category) => c.id === task.categoryId)?.color}80` 
                                }}>
                                  {categories.find((c: Category) => c.id === task.categoryId)?.name || 'Sin categoría'}
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-neon-text/60 mb-2 line-clamp-1 pl-5">{task.description}</p>
                            )}
                            <div className="flex items-center justify-between pl-5 mt-1">
                              <div className="flex items-center text-xs text-neon-text/70">
                                <Clock className="h-3 w-3 mr-1 text-neon-accent/70" />
                                {task.deadline && format(task.deadline instanceof Date ? task.deadline : parseISO(task.deadline as unknown as string), 'HH:mm', { locale: es })}
                              </div>
                              <Badge className="bg-neon-medium/30 text-neon-accent text-xs border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.15)]">
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    } else if (view === 'week') {
      return (
        <Card className="rounded-xl shadow-[0_0_20px_rgba(0,225,255,0.15)] border border-neon-accent/30 bg-neon-darker overflow-hidden">
          <div className="bg-neon-medium/20 border-b border-neon-accent/20 p-4">
            <h3 className="text-lg font-semibold text-neon-accent neon-text">Vista Semanal</h3>
            <p className="text-neon-text/70 text-sm">Planificación a futuro</p>
          </div>
          <CardContent className="p-6 bg-neon-darker/80">
            <div className="flex items-center justify-center h-[300px] flex-col">
              <div className="bg-neon-medium/20 p-6 rounded-xl mb-6 flex items-center justify-center w-24 h-24 border border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.15)]">
                <ListTodo className="h-10 w-10 text-neon-accent" />
              </div>
              <h3 className="text-xl font-medium text-center mb-2 text-neon-text">¡Próximamente!</h3>
              <p className="text-neon-text/70 text-center max-w-md mb-6">
                La vista semanal estará disponible próximamente. Mientras tanto, 
                utiliza la vista mensual para visualizar tus tareas en el calendario.
              </p>
              <Link to="/tasks">
                <Button className="flex items-center gap-2 bg-neon-accent/20 hover:bg-neon-accent/30 border border-neon-accent/50 text-neon-accent neon-text shadow-[0_0_10px_rgba(0,225,255,0.25)]">
                  <ListTodo className="h-4 w-4" />
                  Ver todas las tareas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <Card className="rounded-xl shadow-[0_0_20px_rgba(0,225,255,0.15)] border border-neon-accent/30 bg-neon-darker overflow-hidden">
          <div className="bg-neon-medium/20 border-b border-neon-accent/20 p-4">
            <h3 className="text-xl font-semibold text-neon-accent neon-text">{format(date, 'EEEE, d MMMM yyyy', { locale: es })}</h3>
            <p className="text-neon-text/70 text-sm">Detalle de tareas del día</p>
          </div>
          <CardContent className="p-0">
            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-16 px-6 bg-neon-darker/80">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-medium/20 mb-4 border border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.15)]">
                  <CalendarIcon className="h-10 w-10 text-neon-accent" />
                </div>
                <h3 className="text-xl font-medium text-neon-text mb-2">Sin tareas programadas</h3>
                <p className="text-neon-text/70 mb-6 max-w-md mx-auto">
                  No tienes tareas programadas para este día. Aprovecha para planificar tu jornada añadiendo nuevas tareas.
                </p>
                <Button onClick={() => openTaskForm()} className="bg-neon-accent/20 hover:bg-neon-accent/30 border border-neon-accent/50 text-neon-accent neon-text shadow-[0_0_10px_rgba(0,225,255,0.25)]">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir tarea
                </Button>
              </div>
            ) : (
              <div className="p-5 bg-neon-darker/80">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-neon-medium/20 h-8 w-8 rounded-md flex items-center justify-center text-neon-accent border border-neon-accent/30 shadow-[0_0_10px_rgba(0,225,255,0.15)]">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <h4 className="font-medium text-neon-text">
                      {tasksForSelectedDate.length} {tasksForSelectedDate.length === 1 ? 'tarea' : 'tareas'} para hoy
                    </h4>
                  </div>
                  <Button 
                    onClick={() => openTaskForm()}
                    variant="outline"
                    size="sm"
                    className="h-8 border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Añadir
                  </Button>
                </div>
                <div className="space-y-4">
                  {tasksForSelectedDate.map((task: Task) => {
                    // Calcular colores para categoría, prioridad y estado
                    let priorityColor = "";
                    let priorityLabel = "";
                    if (task.priority === 'alta') {
                      priorityColor = "bg-rose-500";
                      priorityLabel = "Alta";
                    } else if (task.priority === 'media') {
                      priorityColor = "bg-amber-500";
                      priorityLabel = "Media";
                    } else {
                      priorityColor = "bg-emerald-500";
                      priorityLabel = "Baja";
                    }
                    
                    let statusColor = "";
                    if (task.status === 'pendiente' || task.status === 'pending') {
                      statusColor = "bg-neutral-100 text-neutral-600";
                    } else if (task.status === 'en_progreso' || task.status === 'in-progress') {
                      statusColor = "bg-blue-100 text-blue-700";
                    } else if (task.status === 'revision' || task.status === 'review') {
                      statusColor = "bg-purple-100 text-purple-700";
                    } else if (task.status === 'completada' || task.status === 'completed') {
                      statusColor = "bg-green-100 text-green-700";
                    }
                    
                    return (
                      <div
                        key={task.id}
                        className="p-4 bg-neon-darker border-l-2 border border-neon-accent/30 rounded-lg hover:bg-neon-medium/10 cursor-pointer transition-all shadow-[0_0_10px_rgba(0,225,255,0.1)] hover:shadow-[0_0_15px_rgba(0,225,255,0.25)] task-card"
                        style={{ borderLeftStyle: 'solid', borderLeftColor: task.categoryId ? 
                            categories.find((c: Category) => c.id === task.categoryId)?.color || 'rgba(0,225,255,0.5)' 
                            : 'rgba(0,225,255,0.5)' }}
                        onClick={() => openTaskForm(task.id)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-2">
                            <div className={`h-3 w-3 rounded-full mt-1.5 flex-shrink-0 ${priorityColor} shadow-[0_0_8px] shadow-neon-accent/30`}></div>
                            <h3 className="font-medium text-lg text-neon-text line-clamp-1">{task.title}</h3>
                          </div>
                          {task.categoryId && (
                            <Badge className="bg-neon-darker/80 border text-xs px-2 ml-1 whitespace-nowrap shadow-[0_0_8px_rgba(0,255,255,0.15)]" style={{ 
                              color: categories.find((c: Category) => c.id === task.categoryId)?.color,
                              borderColor: categories.find((c: Category) => c.id === task.categoryId)?.color,
                              textShadow: `0 0 8px ${categories.find((c: Category) => c.id === task.categoryId)?.color}80` 
                            }}>
                              {categories.find((c: Category) => c.id === task.categoryId)?.name}
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-neon-text/60 mb-3 ml-5 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between ml-5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center text-xs text-neon-text/70">
                              <Clock className="h-4 w-4 mr-1 text-neon-accent/70" />
                              {task.deadline && format(task.deadline instanceof Date ? task.deadline : parseISO(task.deadline as unknown as string), 'HH:mm', { locale: es })}
                            </div>
                            <div className="flex items-center text-xs text-neon-text/70">
                              <div className={`h-2 w-2 rounded-full ${priorityColor} shadow-[0_0_5px] shadow-neon-accent/30 mr-1`}></div>
                              Prioridad {priorityLabel}
                            </div>
                          </div>
                          <Badge className="bg-neon-medium/30 text-neon-accent text-xs border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.15)]">
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }
  };

  // Renderizado de la interfaz
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-neon-text neon-text">Calendario de Tareas</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
        {/* Panel de navegación */}
        <div className="bg-neon-darker p-5 rounded-xl shadow-[0_0_20px_rgba(0,225,255,0.15)] border border-neon-accent/30 md:w-2/3">
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center mb-4">
            <h2 className="text-2xl font-bold text-neon-text flex items-center neon-text">
              <CalendarIcon className="h-6 w-6 mr-2 text-neon-accent" />
              {format(date, view === 'day' ? 'EEEE, d MMMM yyyy' : view === 'week' ? "'Semana del' d 'de' MMMM" : 'MMMM yyyy', { locale: es })}
            </h2>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDate(new Date())}
                className="text-xs font-medium h-9 px-4 border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20 shadow-[0_0_8px_rgba(0,225,255,0.15)]"
              >
                Hoy
              </Button>
              <div className="flex border border-neon-accent/30 rounded-md overflow-hidden shadow-[0_0_8px_rgba(0,225,255,0.15)]">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigateDate('previous')}
                  className="h-9 w-9 rounded-none border-r border-neon-accent/30 hover:bg-neon-medium/20 text-neon-accent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigateDate('next')}
                  className="h-9 w-9 rounded-none hover:bg-neon-medium/20 text-neon-accent"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-neon-medium/10 p-1.5 border border-neon-accent/20">
            <div className="grid grid-cols-3 gap-1">
              <Button 
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                className={`h-10 rounded-md font-medium ${view === 'month' ? 'bg-neon-accent/20 hover:bg-neon-accent/30 border border-neon-accent/50 text-neon-accent neon-text shadow-[0_0_10px_rgba(0,225,255,0.25)]' : 'hover:bg-neon-medium/20 text-neon-text/70'}`}
              >
                Mes
              </Button>
              <Button 
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className={`h-10 rounded-md font-medium ${view === 'week' ? 'bg-neon-accent/20 hover:bg-neon-accent/30 border border-neon-accent/50 text-neon-accent neon-text shadow-[0_0_10px_rgba(0,225,255,0.25)]' : 'hover:bg-neon-medium/20 text-neon-text/70'}`}
              >
                Semana
              </Button>
              <Button 
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
                className={`h-10 rounded-md font-medium ${view === 'day' ? 'bg-neon-accent/20 hover:bg-neon-accent/30 border border-neon-accent/50 text-neon-accent neon-text shadow-[0_0_10px_rgba(0,225,255,0.25)]' : 'hover:bg-neon-medium/20 text-neon-text/70'}`}
              >
                Día
              </Button>
            </div>
          </div>
        </div>
        
        {/* Panel de acción */}
        <div className="bg-gradient-to-br from-neon-darker to-neon-darker p-5 rounded-xl shadow-[0_0_20px_rgba(0,225,255,0.15)] border border-neon-accent/30 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,225,255,0.1)_0%,transparent_60%)]"></div>
          <div className="relative z-10">
            <h3 className="text-neon-accent font-semibold text-lg mb-1 neon-text">Gestiona tus tareas</h3>
            <p className="text-neon-text/70 text-sm">Organiza tu día y mantente productivo</p>
          </div>
          <Button
            onClick={() => openTaskForm()}
            size="lg"
            className="relative z-10 mt-4 gap-2 bg-neon-accent/20 hover:bg-neon-accent/30 border border-neon-accent/50 text-neon-accent neon-text shadow-[0_0_10px_rgba(0,225,255,0.25)] text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nueva tarea
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        {renderContent()}
      </div>

      {/* Formulario de tarea */}
      <TaskForm
        isOpen={isTaskFormOpen}
        taskId={selectedTaskId}
        onClose={() => {
          setIsTaskFormOpen(false);
          setSelectedTaskId(undefined);
        }}
      />
    </div>
  );
}