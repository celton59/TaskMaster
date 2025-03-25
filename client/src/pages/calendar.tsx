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
          <Card className="md:col-span-5">
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

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                {format(date, 'd MMMM yyyy', { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium mb-1">No hay tareas para este día</p>
                  <p className="text-xs text-gray-400 mb-3">Añade una nueva tarea para esta fecha</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openTaskForm()}
                    className="flex mx-auto items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Añadir tarea
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {tasksForSelectedDate.map((task: Task) => {
                      // Determinar colores según prioridad
                      let priorityColor = "";
                      if (task.priority === 'alta') {
                        priorityColor = "bg-rose-500";
                      } else if (task.priority === 'media') {
                        priorityColor = "bg-amber-500";
                      } else {
                        priorityColor = "bg-emerald-500";
                      }
                      
                      // Determinar colores según estado
                      let statusColor = "";
                      if (task.status === 'pendiente') {
                        statusColor = "bg-neutral-100 text-neutral-600";
                      } else if (task.status === 'en_progreso') {
                        statusColor = "bg-blue-100 text-blue-800";
                      } else if (task.status === 'revision') {
                        statusColor = "bg-purple-100 text-purple-800";
                      } else if (task.status === 'completada') {
                        statusColor = "bg-green-100 text-green-800";
                      }
                      
                      return (
                        <div 
                          key={task.id} 
                          className="p-3 border border-l-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors shadow-sm hover:shadow"
                          style={{ borderLeftColor: task.categoryId ? 
                              categories.find((c: Category) => c.id === task.categoryId)?.color || '#e5e7eb' 
                              : '#e5e7eb' }}
                          onClick={() => openTaskForm(task.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-start gap-2">
                              <div className={`h-3 w-3 rounded-full mt-1 flex-shrink-0 ${priorityColor}`}></div>
                              <h3 className="font-medium text-gray-900 line-clamp-1">{task.title}</h3>
                            </div>
                            {task.categoryId && (
                              <Badge className="bg-white border text-xs px-2 ml-1 whitespace-nowrap" style={{ 
                                color: categories.find((c: Category) => c.id === task.categoryId)?.color,
                                borderColor: categories.find((c: Category) => c.id === task.categoryId)?.color 
                              }}>
                                {categories.find((c: Category) => c.id === task.categoryId)?.name || 'Sin categoría'}
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1 pl-5">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between pl-5 mt-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.deadline && format(task.deadline instanceof Date ? task.deadline : parseISO(task.deadline as unknown as string), 'HH:mm', { locale: es })}
                            </div>
                            <Badge className={`${statusColor} text-xs`}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      );
    } else if (view === 'week') {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Vista Semanal - En desarrollo</h3>
              <p className="text-gray-600">
                Esta vista estará disponible próximamente. Por ahora, utiliza la vista mensual
                para ver tus tareas en el calendario.
              </p>
              <Link to="/tasks">
                <Button variant="outline" className="flex items-center gap-2">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              {format(date, 'EEEE, d MMMM yyyy', { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">No hay tareas programadas</h3>
                <p className="text-sm text-gray-500 mb-4">
                  No tienes tareas programadas para este día
                </p>
                <Button onClick={() => openTaskForm()} variant="outline">
                  Añadir tarea
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasksForSelectedDate.map((task: Task) => {
                  // Calcular colores para categoría, prioridad y estado
                  let priorityColor = "";
                  if (task.priority === 'alta') {
                    priorityColor = "bg-rose-500";
                  } else if (task.priority === 'media') {
                    priorityColor = "bg-amber-500";
                  } else {
                    priorityColor = "bg-emerald-500";
                  }
                  
                  let statusColor = "";
                  if (task.status === 'pendiente') {
                    statusColor = "bg-neutral-100 text-neutral-600";
                  } else if (task.status === 'en_progreso') {
                    statusColor = "bg-blue-100 text-blue-800";
                  } else if (task.status === 'revision') {
                    statusColor = "bg-purple-100 text-purple-800";
                  } else if (task.status === 'completada') {
                    statusColor = "bg-green-100 text-green-800";
                  }
                  
                  return (
                    <div
                      key={task.id}
                      className="p-4 border-l-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors shadow-sm hover:shadow"
                      style={{ borderLeftColor: task.categoryId ? 
                          categories.find((c: Category) => c.id === task.categoryId)?.color || '#e5e7eb' 
                          : '#e5e7eb' }}
                      onClick={() => openTaskForm(task.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-2">
                          <div className={`h-3 w-3 rounded-full mt-1.5 flex-shrink-0 ${priorityColor}`}></div>
                          <h3 className="font-medium text-lg text-gray-900 line-clamp-1">{task.title}</h3>
                        </div>
                        {task.categoryId && (
                          <Badge className="bg-white border text-xs px-2 ml-1 whitespace-nowrap" style={{ 
                            color: categories.find((c: Category) => c.id === task.categoryId)?.color,
                            borderColor: categories.find((c: Category) => c.id === task.categoryId)?.color 
                          }}>
                            {categories.find((c: Category) => c.id === task.categoryId)?.name}
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-gray-600 mb-3 ml-5 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between ml-5">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          {task.deadline && format(task.deadline instanceof Date ? task.deadline : parseISO(task.deadline as unknown as string), 'HH:mm', { locale: es })}
                        </div>
                        <Badge className={`${statusColor} text-xs`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
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
        <h1 className="text-3xl font-bold">Calendario de Tareas</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {format(date, view === 'day' ? 'EEEE, d MMMM yyyy' : view === 'week' ? "'Semana del' d 'de' MMMM" : 'MMMM yyyy', { locale: es })}
          </h2>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDate(new Date())}
              className="text-xs h-8 px-3 border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Hoy
            </Button>
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigateDate('previous')}
                className="h-8 w-8 rounded-none border-r hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigateDate('next')}
                className="h-8 w-8 rounded-none hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <div className="grid grid-cols-3 gap-1 p-1 bg-white border rounded-lg">
            <Button 
              variant={view === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className="h-8 rounded-md px-4 text-sm"
            >
              Mes
            </Button>
            <Button 
              variant={view === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className="h-8 rounded-md px-4 text-sm"
            >
              Semana
            </Button>
            <Button 
              variant={view === 'day' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className="h-8 rounded-md px-4 text-sm"
            >
              Día
            </Button>
          </div>
          
          <div className="flex items-center">
            <Button
              onClick={() => openTaskForm()}
              size="sm"
              className="h-8 gap-1 text-xs bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva tarea
            </Button>
          </div>
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