import { useState } from 'react';
import { Task, Category } from '@shared/schema';
import { formatDistance, parseISO, isBefore, isAfter, addDays, differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { 
  Check, 
  Clock, 
  AlertTriangle, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  FilterX, 
  ChevronDown, 
  CheckCircle,
  Calendar,
  FlameKindling,
  Star,
  Clock4,
  CircleCheck,
  CircleEllipsis,
  Circle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  onEdit?: (taskId: number) => void;
}

type SortField = 'title' | 'priority' | 'status' | 'deadline' | 'category';
type SortOrder = 'asc' | 'desc';
type Filter = {
  status: string | null;
  priority: string | null;
  category: number | null;
};

export function TaskList({ tasks, categories, isLoading, onEdit }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filters, setFilters] = useState<Filter>({
    status: null,
    priority: null,
    category: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const rowsPerPage = 10;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Función para obtener el nombre de la categoría por su ID
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  // Función para obtener el color de la categoría por su ID
  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return 'bg-neutral-100 text-neutral-800';
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) return 'bg-neutral-100 text-neutral-800';
    
    switch (category.color) {
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'green': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'red': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'purple': return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'orange': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  // Función para mapear estados internos a etiquetas en español
  const getStatusLabel = (status: string | null) => {
    if (!status) return 'Sin estado';
    
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En progreso';
      case 'review': return 'Revisión';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  // Función para mapear prioridades internas a etiquetas en español
  const getPriorityLabel = (priority: string | null) => {
    if (!priority) return 'Sin prioridad';
    
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  // Estilos para cada estado
  const getStatusStyle = (status: string | null) => {
    if (!status) return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    
    switch (status) {
      case 'pending': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'in_progress': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'review': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  // Estilos para cada prioridad
  const getPriorityStyle = (priority: string | null) => {
    if (!priority) return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };
  
  // Check if date is today
  const isToday = (date: Date | string | null) => {
    if (!date) return false;
    const today = new Date();
    const taskDate = new Date(date);
    return (
      today.getDate() === taskDate.getDate() &&
      today.getMonth() === taskDate.getMonth() &&
      today.getFullYear() === taskDate.getFullYear()
    );
  };
  
  // Get deadline status
  const getDeadlineStatus = (deadline: Date | string | null) => {
    if (!deadline) return "none";
    
    const today = new Date();
    const taskDeadline = new Date(deadline);
    const threeDaysFromNow = addDays(today, 3);
    
    if (isBefore(taskDeadline, today)) {
      return "overdue"; // Fecha vencida
    } else if (isBefore(taskDeadline, threeDaysFromNow)) {
      return "soon"; // Próximo a vencer (3 días)
    } else {
      return "ok"; // Fecha normal
    }
  };
  
  // Get days until deadline or days overdue
  const getDaysUntilDeadline = (deadline: Date | string | null) => {
    if (!deadline) return 0;
    
    const today = new Date();
    const taskDeadline = new Date(deadline);
    
    return differenceInDays(taskDeadline, today);
  };
  
  // Get deadline text and style
  const getDeadlineInfo = (deadline: Date | string | null) => {
    if (!deadline) return { text: "Sin fecha", className: "text-neutral-500" };
    
    const status = getDeadlineStatus(deadline);
    const days = getDaysUntilDeadline(deadline);
    
    if (status === "overdue") {
      return { 
        text: `${Math.abs(days)} día${Math.abs(days) > 1 ? 's' : ''} de retraso`, 
        className: "text-rose-600 font-medium"
      };
    } else if (status === "soon") {
      if (isToday(deadline)) {
        return { text: "¡Hoy!", className: "text-amber-600 font-medium" };
      } else {
        return { 
          text: `En ${days} día${days > 1 ? 's' : ''}`, 
          className: "text-amber-600 font-medium" 
        };
      }
    } else {
      return { 
        text: formatDate(deadline), 
        className: "text-neutral-500 font-medium" 
      };
    }
  };
  
  // Get deadline icon
  const getDeadlineIcon = (deadline: Date | string | null) => {
    if (!deadline) return <Clock size={14} className="text-neutral-400" />;
    
    const status = getDeadlineStatus(deadline);
    
    if (status === "overdue") {
      return <AlertTriangle size={14} className="text-rose-500" />;
    } else if (status === "soon") {
      return <AlertTriangle size={14} className="text-amber-500" />;
    } else {
      return <Calendar size={14} className="text-blue-500" />;
    }
  };
  
  // Get status icon and style
  const getStatusInfo = (status: string | null) => {
    if (!status) return {
      icon: <Circle className="h-4 w-4 text-neutral-500" />,
      label: "Sin estado",
      className: "bg-neutral-50 text-neutral-700 border-neutral-200"
    };
    
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
          label: "Completada",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
      case "pending":
        return {
          icon: <Circle className="h-4 w-4 text-amber-500" />,
          label: "Pendiente",
          className: "bg-amber-50 text-amber-700 border-amber-200"
        };
      case "review":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-purple-500" />,
          label: "Revisión",
          className: "bg-purple-50 text-purple-700 border-purple-200"
        };
      case "in_progress":
      case "in-progress":
        return {
          icon: <Clock className="h-4 w-4 text-blue-500" />,
          label: "En progreso",
          className: "bg-blue-50 text-blue-700 border-blue-200"
        };
      default:
        return {
          icon: <Circle className="h-4 w-4 text-neutral-500" />,
          label: status,
          className: "bg-neutral-50 text-neutral-700 border-neutral-200"
        };
    }
  };
  
  // Get priority icon and style
  const getPriorityInfo = (priority: string | null) => {
    if (!priority) return {
      icon: <Circle className="h-4 w-4 text-neutral-500" />,
      label: "Normal",
      className: "bg-neutral-50 text-neutral-700 border-neutral-200"
    };
    
    switch (priority) {
      case "high":
        return {
          icon: <FlameKindling className="h-4 w-4 text-rose-500" />,
          label: "Alta",
          className: "bg-rose-50 text-rose-700 border-rose-200"
        };
      case "medium":
        return {
          icon: <Star className="h-4 w-4 text-amber-500" />,
          label: "Media",
          className: "bg-amber-50 text-amber-700 border-amber-200"
        };
      case "low":
        return {
          icon: <Clock4 className="h-4 w-4 text-emerald-500" />,
          label: "Baja",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
      default:
        return {
          icon: <Circle className="h-4 w-4 text-neutral-500" />,
          label: priority,
          className: "bg-neutral-50 text-neutral-700 border-neutral-200"
        };
    }
  };
  
  // Calculate progress based on status
  const getProgress = (status: string | null) => {
    if (!status) return 0;
    
    switch (status) {
      case "completed": return 100;
      case "review": return 75;
      case "in_progress":
      case "in-progress": return 50;
      case "pending": return 0;
      default: return 0;
    }
  };

  // Formateador de fechas relativas
  const formatDate = (dateStr: string | null | Date) => {
    if (!dateStr) return 'Sin fecha';
    
    try {
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
      return formatDistance(date, new Date(), { 
        addSuffix: true,
        locale: es 
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Alternador de ordenamiento
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Aplicar filtros a las tareas
  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.category !== null && task.categoryId !== filters.category) return false;
    return true;
  });

  // Ordenar tareas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority':
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[a.priority as string] || 0) - (priorityOrder[b.priority as string] || 0);
        break;
      case 'status':
        const statusOrder: Record<string, number> = { pending: 1, in_progress: 2, review: 3, completed: 4 };
        comparison = (statusOrder[a.status as string] || 0) - (statusOrder[b.status as string] || 0);
        break;
      case 'deadline':
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        comparison = dateA - dateB;
        break;
      case 'category':
        const catA = getCategoryName(a.categoryId);
        const catB = getCategoryName(b.categoryId);
        comparison = catA.localeCompare(catB);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginación
  const totalPages = Math.ceil(sortedTasks.length / rowsPerPage);
  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Alternar selección de todas las tareas en la página actual
  const toggleSelectAll = () => {
    if (selectedTasks.length === paginatedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(paginatedTasks.map(task => task.id));
    }
  };

  // Alternar selección de una tarea
  const toggleSelectTask = (taskId: number) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  // Resetear todos los filtros
  const resetFilters = () => {
    setFilters({
      status: null,
      priority: null,
      category: null
    });
  };

  // Marcar tareas seleccionadas como completadas
  const markAsCompleted = async () => {
    if (selectedTasks.length === 0) return;
    
    try {
      const promises = selectedTasks.map(taskId => 
        apiRequest(
          `/api/tasks/${taskId}`,
          'PATCH',
          { status: 'completed' }
        )
      );
      
      await Promise.all(promises);
      
      // Actualizar caché
      await queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
      
      toast({
        title: "Tareas actualizadas",
        description: `${selectedTasks.length} tareas marcadas como completadas`,
      });
      
      setSelectedTasks([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las tareas",
        variant: "destructive",
      });
    }
  };

  // Eliminar tareas seleccionadas
  const deleteSelected = async () => {
    if (selectedTasks.length === 0) return;
    
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedTasks.length} tareas?`)) {
      return;
    }
    
    try {
      const promises = selectedTasks.map(taskId => 
        apiRequest(
          `/api/tasks/${taskId}`,
          'DELETE'
        )
      );
      
      await Promise.all(promises);
      
      // Actualizar caché
      await queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
      
      toast({
        title: "Tareas eliminadas",
        description: `${selectedTasks.length} tareas eliminadas correctamente`,
      });
      
      setSelectedTasks([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar las tareas",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-neutral-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Lista de tareas</CardTitle>
          <CardDescription>Cargando tareas...</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 bg-neutral-100 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-100 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <CardTitle>Lista de tareas</CardTitle>
            <CardDescription>
              {filteredTasks.length} 
              {filteredTasks.length === 1 ? ' tarea encontrada' : ' tareas encontradas'}
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              {/* Estado */}
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? null : value })}
              >
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="review">Revisión</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Prioridad */}
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? null : value })}
              >
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Categoría */}
              <Select
                value={filters.category?.toString() || 'all'}
                onValueChange={(value) => setFilters({ 
                  ...filters, 
                  category: value === 'all' ? null : parseInt(value, 10)
                })}
              >
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Botón resetear filtros */}
              {(filters.status || filters.priority || filters.category !== null) && (
                <Button 
                  variant="outline" 
                  className="h-9 px-2" 
                  onClick={resetFilters}
                >
                  <FilterX className="h-4 w-4 mr-1" />
                  <span className="text-xs">Limpiar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Acciones para tareas seleccionadas */}
        {selectedTasks.length > 0 && (
          <div className="mt-2 flex items-center gap-2 bg-primary-50 p-2 rounded-md">
            <span className="text-sm text-primary-700 font-medium">{selectedTasks.length} tareas seleccionadas</span>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAsCompleted}
                className="h-8 text-xs gap-1 border-primary-200 text-primary-700 hover:text-primary-800 hover:bg-primary-100"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Completar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelected}
                className="h-8 text-xs gap-1 border-rose-200 text-rose-700 hover:text-rose-800 hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-neutral-50">
                <TableHead className="w-[40px] px-3">
                  <Checkbox 
                    checked={selectedTasks.length === paginatedTasks.length && paginatedTasks.length > 0} 
                    onCheckedChange={toggleSelectAll} 
                  />
                </TableHead>
                
                <TableHead className="cursor-pointer" onClick={() => toggleSort('title')}>
                  <div className="flex items-center space-x-1">
                    <span>Tarea</span>
                    {sortField === 'title' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Estado</span>
                    {sortField === 'status' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="cursor-pointer" onClick={() => toggleSort('priority')}>
                  <div className="flex items-center space-x-1">
                    <span>Prioridad</span>
                    {sortField === 'priority' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="cursor-pointer" onClick={() => toggleSort('category')}>
                  <div className="flex items-center space-x-1">
                    <span>Categoría</span>
                    {sortField === 'category' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="cursor-pointer" onClick={() => toggleSort('deadline')}>
                  <div className="flex items-center space-x-1">
                    <span>Fecha límite</span>
                    {sortField === 'deadline' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {paginatedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-neutral-500">
                    No se encontraron tareas con los filtros aplicados
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTasks.map((task) => (
                  <TableRow 
                    key={task.id} 
                    className={cn(
                      "hover:bg-neutral-50 transition-colors",
                      task.status === "completed" ? "bg-emerald-50/30" : "",
                      getDeadlineStatus(task.deadline) === "overdue" && task.status !== "completed" ? "bg-rose-50/30" : "",
                      getDeadlineStatus(task.deadline) === "soon" && task.status !== "completed" ? "bg-amber-50/30" : ""
                    )}
                  >
                    <TableCell className="px-3">
                      <Checkbox 
                        checked={selectedTasks.includes(task.id)} 
                        onCheckedChange={() => toggleSelectTask(task.id)} 
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <div className={cn(
                            "w-1 h-5 rounded-full mr-2", 
                            task.status === "completed" ? "bg-emerald-500" :
                            task.status === "review" ? "bg-purple-500" :
                            task.status === "in_progress" ? "bg-blue-500" :
                            task.priority === "high" ? "bg-rose-500" :
                            task.priority === "medium" ? "bg-amber-500" :
                            task.priority === "low" ? "bg-emerald-500" : "bg-neutral-300"
                          )} />
                          <span className="font-medium">{task.title}</span>
                        </div>
                        {task.description && (
                          <span className="text-xs text-neutral-500 line-clamp-1 ml-3">{task.description}</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getStatusInfo(task.status).icon}
                        <Badge className={cn("text-xs font-medium flex items-center gap-1", getStatusInfo(task.status).className)}>
                          {getStatusInfo(task.status).label}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getPriorityInfo(task.priority).icon}
                        <Badge className={cn("text-xs font-medium flex items-center gap-1", getPriorityInfo(task.priority).className)}>
                          {getPriorityInfo(task.priority).label}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`text-xs font-medium ${getCategoryColor(task.categoryId)}`}>
                        {getCategoryName(task.categoryId)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {task.deadline ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
                                <span className="text-sm">{formatDate(task.deadline)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {new Date(task.deadline).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-neutral-400 text-sm">Sin fecha</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => onEdit && onEdit(task.id)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer text-destructive"
                            onClick={async () => {
                              if (confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`)) {
                                try {
                                  await apiRequest(
                                    `/api/tasks/${task.id}`,
                                    'DELETE'
                                  );
                                  
                                  // Actualizar caché
                                  await queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
                                  await queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
                                  
                                  toast({
                                    title: "Tarea eliminada",
                                    description: "La tarea se ha eliminado correctamente",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "No se pudo eliminar la tarea",
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="py-4 px-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}