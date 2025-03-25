import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { getQueryFn, queryClient } from '@/lib/queryClient';
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

// Interfaz para las props del componente DayContent del calendario
interface DayContentProps {
  date: Date;
  day: number;
  displayMonth: number;
  displayYear: number;
  children?: React.ReactNode;
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

  // Función para obtener color de categoría
  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return 'gray';
    
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category ? category.color : 'gray';
  };

  // Función para abrir el formulario de tarea
  const openTaskForm = (taskId?: number) => {
    setSelectedTaskId(taskId);
    setIsTaskFormOpen(true);
  };

  // Renderizado de la interfaz
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Calendario de Tareas</h1>
        <Button 
          onClick={() => openTaskForm()} 
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Nueva Tarea
        </Button>
      </div>

      <Tabs defaultValue="month" className="mb-8" onValueChange={(value) => setView(value as 'day' | 'week' | 'month')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="month">Mes</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="day">Día</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateDate('previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium min-w-[200px] text-center">
              {format(date, view === 'day' ? 'EEEE, d MMMM yyyy' : view === 'week' ? "'Semana del' d 'de' MMMM" : 'MMMM yyyy', { locale: es })}
            </h2>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setDate(new Date())}
              size="sm"
            >
              Hoy
            </Button>
          </div>
        </div>

        <TabsContent value="month">
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
                      // Estilo personalizado para días con tareas
                      color: 'inherit',
                      position: 'relative',
                    }
                  }}
                  components={{
                    DayContent: (props) => {
                      const date = props.date;
                      const isWithTasks = daysWithTasks.has(format(date, 'yyyy-MM-dd'));
                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {props.children}
                          {isWithTasks && (
                            <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      );
                    },
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
                    No hay tareas para este día
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {tasksForSelectedDate.map((task: Task) => (
                        <div 
                          key={task.id} 
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => openTaskForm(task.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <Badge className={`bg-${getCategoryColor(task.categoryId)}-100 text-${getCategoryColor(task.categoryId)}-800 border-${getCategoryColor(task.categoryId)}-200`}>
                              {task.categoryId ? categories.find((c: Category) => c.id === task.categoryId)?.name : 'Sin categoría'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.deadline && format(task.deadline instanceof Date ? task.deadline : parseISO(task.deadline as unknown as string), 'HH:mm', { locale: es })}
                            <Badge variant="outline" className="ml-2 capitalize">
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="week">
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
        </TabsContent>

        <TabsContent value="day">
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
                  {tasksForSelectedDate.map((task: Task) => (
                    <div
                      key={task.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => openTaskForm(task.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-lg text-gray-900">{task.title}</h3>
                        <Badge className={`bg-${getCategoryColor(task.categoryId)}-100 text-${getCategoryColor(task.categoryId)}-800 border-${getCategoryColor(task.categoryId)}-200`}>
                          {task.categoryId ? categories.find((c: Category) => c.id === task.categoryId)?.name : 'Sin categoría'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          {task.deadline && format(task.deadline instanceof Date ? task.deadline : parseISO(task.deadline as unknown as string), 'HH:mm', { locale: es })}
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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