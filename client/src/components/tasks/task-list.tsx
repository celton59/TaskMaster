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
    if (!deadline) return <Clock size={14} className="text-neon-text/40" />;
    
    const status = getDeadlineStatus(deadline);
    
    if (status === "overdue") {
      return <AlertTriangle size={14} className="text-rose-300 animate-pulse" />;
    } else if (status === "soon") {
      return <Clock4 size={14} className="text-amber-300" />;
    } else {
      return <Calendar size={14} className="text-neon-accent/80" />;
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
      <Card className="border-neon-accent/20 bg-neon-darker shadow-[0_0_15px_rgba(0,225,255,0.1)]">
        <CardHeader className="pb-4 border-b border-neon-accent/20">
          <CardTitle className="text-neon-accent neon-text">Lista de tareas</CardTitle>
          <CardDescription className="text-neon-text/70">Cargando tareas...</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 bg-neon-medium/10 rounded-md border border-neon-accent/10" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neon-accent/20 bg-neon-darker shadow-[0_0_15px_rgba(0,225,255,0.1)]">
      <CardHeader className="pb-4 border-b border-neon-accent/20">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <CardTitle className="text-neon-accent neon-text">Lista de tareas</CardTitle>
            <CardDescription className="text-neon-text/70">
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
                <SelectTrigger className="w-[140px] h-9 text-sm bg-neon-darker border-neon-accent/40 text-neon-text hover:border-neon-accent/60 focus:border-neon-accent/80 shadow-[0_0_5px_rgba(0,225,255,0.1)]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-neon-darker border-neon-accent/40 text-neon-text">
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
                <SelectTrigger className="w-[140px] h-9 text-sm bg-neon-darker border-neon-accent/40 text-neon-text hover:border-neon-accent/60 focus:border-neon-accent/80 shadow-[0_0_5px_rgba(0,225,255,0.1)]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent className="bg-neon-darker border-neon-accent/40 text-neon-text">
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
                <SelectTrigger className="w-[140px] h-9 text-sm bg-neon-darker border-neon-accent/40 text-neon-text hover:border-neon-accent/60 focus:border-neon-accent/80 shadow-[0_0_5px_rgba(0,225,255,0.1)]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-neon-darker border-neon-accent/40 text-neon-text">
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
                  className="relative h-9 px-2 border-rose-500/40 text-rose-300 bg-rose-950/40 shadow-[0_0_8px_rgba(244,63,94,0.3)] hover:text-rose-200 hover:bg-rose-900/40 hover:border-rose-500/60 transition-all" 
                  onClick={resetFilters}
                >
                  <FilterX className="h-4 w-4 mr-1" />
                  <span className="text-xs">Limpiar</span>
                  <span className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></span>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Acciones para tareas seleccionadas */}
        {selectedTasks.length > 0 && (
          <div className="mt-4 flex items-center gap-2 bg-[#001a25]/80 border border-[#00e1ff]/30 p-3 rounded-md shadow-[0_0_15px_rgba(0,225,255,0.15)]">
            <span className="text-sm text-[#00e1ff] font-medium">{selectedTasks.length} tareas seleccionadas</span>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAsCompleted}
                className="relative h-8 text-xs gap-1 border-[#39ffa1]/60 text-[#39ffa1] bg-[#092a1f]/80 hover:text-[#5dffc0] hover:bg-[#092a1f] hover:border-[#39ffa1]/80 shadow-[0_0_12px_rgba(57,255,161,0.4)] transition-all"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Completar</span>
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelected}
                className="relative h-8 text-xs gap-1 border-[#ff3a5e]/60 text-[#ff3a5e] bg-[#400012]/80 hover:text-[#ff617c] hover:bg-[#400012] hover:border-[#ff3a5e]/80 shadow-[0_0_12px_rgba(255,58,94,0.4)] transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Eliminar</span>
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></span>
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto border-t border-neon-accent/20">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="hover:bg-neon-medium/5 border-b border-neon-accent/20">
                <TableHead className="w-[40px] px-3 text-neon-text bg-neon-darker">
                  <Checkbox 
                    checked={selectedTasks.length === paginatedTasks.length && paginatedTasks.length > 0} 
                    onCheckedChange={toggleSelectAll} 
                  />
                </TableHead>
                
                <TableHead className="cursor-pointer text-neon-text bg-neon-darker font-medium text-xs uppercase tracking-wider hover:text-neon-accent transition-colors" onClick={() => toggleSort('title')}>
                  <div className="flex items-center space-x-1">
                    <span>Tarea</span>
                    {sortField === 'title' && (
                      <ChevronDown className={`h-4 w-4 transition-transform text-neon-accent ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="cursor-pointer text-neon-text bg-neon-darker font-medium text-xs uppercase tracking-wider hover:text-neon-accent transition-colors" onClick={() => toggleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Estado</span>
                    {sortField === 'status' && (
                      <ChevronDown className={`h-4 w-4 transition-transform text-neon-accent ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="cursor-pointer text-neon-text bg-neon-darker font-medium text-xs uppercase tracking-wider hover:text-neon-accent transition-colors" onClick={() => toggleSort('priority')}>
                  <div className="flex items-center space-x-1">
                    <span>Prioridad</span>
                    {sortField === 'priority' && (
                      <ChevronDown className={`h-4 w-4 transition-transform text-neon-accent ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="cursor-pointer text-neon-text bg-neon-darker font-medium text-xs uppercase tracking-wider hover:text-neon-accent transition-colors" onClick={() => toggleSort('category')}>
                  <div className="flex items-center space-x-1">
                    <span>Categoría</span>
                    {sortField === 'category' && (
                      <ChevronDown className={`h-4 w-4 transition-transform text-neon-accent ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="cursor-pointer text-neon-text bg-neon-darker font-medium text-xs uppercase tracking-wider hover:text-neon-accent transition-colors" onClick={() => toggleSort('deadline')}>
                  <div className="flex items-center space-x-1">
                    <span>Fecha límite</span>
                    {sortField === 'deadline' && (
                      <ChevronDown className={`h-4 w-4 transition-transform text-neon-accent ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                
                <TableHead className="w-[60px] text-neon-text bg-neon-darker"></TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {paginatedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-neon-text/60 bg-neon-darker/50">
                    No se encontraron tareas con los filtros aplicados
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTasks.map((task) => (
                  <TableRow 
                    key={task.id} 
                    className={cn(
                      "hover:bg-neon-medium/5 border-b border-neon-accent/10 transition-colors text-neon-text",
                      task.status === "completed" ? "bg-emerald-500/5" : "",
                      getDeadlineStatus(task.deadline) === "overdue" && task.status !== "completed" ? "bg-rose-500/5" : "",
                      getDeadlineStatus(task.deadline) === "soon" && task.status !== "completed" ? "bg-amber-500/5" : ""
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
                            "w-2 h-6 rounded-full mr-2 animate-pulse", 
                            task.status === "completed" ? "bg-[#39ffa1] shadow-[0_0_15px_rgba(57,255,161,0.8)]" :
                            task.status === "review" ? "bg-[#c77dff] shadow-[0_0_15px_rgba(199,125,255,0.8)]" :
                            task.status === "in_progress" ? "bg-[#4d9eff] shadow-[0_0_15px_rgba(77,158,255,0.8)]" :
                            task.priority === "high" ? "bg-[#ff3a5e] shadow-[0_0_15px_rgba(255,58,94,0.8)]" :
                            task.priority === "medium" ? "bg-[#ffcd29] shadow-[0_0_15px_rgba(255,205,41,0.8)]" :
                            task.priority === "low" ? "bg-[#39ffa1] shadow-[0_0_15px_rgba(57,255,161,0.8)]" : "bg-[#a8b4d4] shadow-[0_0_15px_rgba(168,180,212,0.8)]"
                          )} />
                          <span className="font-medium">{task.title}</span>
                        </div>
                        {task.description && (
                          <span className="text-xs text-neon-text/50 line-clamp-1 ml-3">{task.description}</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="inline-flex items-center gap-1">
                        <div className={cn(
                          "relative flex items-center px-3 py-1 rounded-md text-sm font-medium",
                          task.status === "completed" ? "bg-[#092a1f]/90 text-[#00ff9d] shadow-[0_0_20px_rgba(0,255,157,0.6)] border-2 border-[#00ff9d]/70" : 
                          task.status === "review" ? "bg-[#240052]/90 text-[#bb00ff] shadow-[0_0_20px_rgba(187,0,255,0.6)] border-2 border-[#bb00ff]/70" :
                          task.status === "in_progress" ? "bg-[#011e60]/90 text-[#00e1ff] shadow-[0_0_20px_rgba(0,225,255,0.6)] border-2 border-[#00e1ff]/70" :
                          "bg-[#462800]/90 text-[#ffcc00] shadow-[0_0_20px_rgba(255,204,0,0.6)] border-2 border-[#ffcc00]/70"
                        )}>
                          {getStatusInfo(task.status).icon}
                          <span className="ml-1">{getStatusInfo(task.status).label}</span>
                          <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="inline-flex items-center gap-1">
                        <div className={cn(
                          "relative flex items-center px-3 py-1 rounded-md text-sm font-medium",
                          task.priority === "high" ? "bg-[#400012]/90 text-[#ff2d55] shadow-[0_0_20px_rgba(255,45,85,0.6)] border-2 border-[#ff2d55]/70" : 
                          task.priority === "medium" ? "bg-[#462800]/90 text-[#ffcc00] shadow-[0_0_20px_rgba(255,204,0,0.6)] border-2 border-[#ffcc00]/70" :
                          "bg-[#092a1f]/90 text-[#00ff9d] shadow-[0_0_20px_rgba(0,255,157,0.6)] border-2 border-[#00ff9d]/70"
                        )}>
                          {getPriorityInfo(task.priority).icon}
                          <span className="ml-1">{getPriorityInfo(task.priority).label}</span>
                          <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="inline-flex items-center gap-1">
                        <div className={cn(
                          "relative flex items-center px-3 py-1 rounded-md text-sm font-medium",
                          task.categoryId === 1 ? "bg-[#011e60]/90 text-[#00e1ff] shadow-[0_0_20px_rgba(0,225,255,0.6)] border-2 border-[#00e1ff]/70" : 
                          task.categoryId === 2 ? "bg-[#092a1f]/90 text-[#00ff9d] shadow-[0_0_20px_rgba(0,255,157,0.6)] border-2 border-[#00ff9d]/70" :
                          task.categoryId === 3 ? "bg-[#400012]/90 text-[#ff2d55] shadow-[0_0_20px_rgba(255,45,85,0.6)] border-2 border-[#ff2d55]/70" :
                          task.categoryId === 4 ? "bg-[#240052]/90 text-[#bb00ff] shadow-[0_0_20px_rgba(187,0,255,0.6)] border-2 border-[#bb00ff]/70" : 
                          task.categoryId === 5 ? "bg-[#462800]/90 text-[#ffcc00] shadow-[0_0_20px_rgba(255,204,0,0.6)] border-2 border-[#ffcc00]/70" :
                          "bg-[#152034]/90 text-[#a8b4d4] shadow-[0_0_20px_rgba(168,180,212,0.6)] border-2 border-[#a8b4d4]/70"
                        )}>
                          <span>{getCategoryName(task.categoryId)}</span>
                          <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {task.deadline ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                "relative inline-flex items-center px-3 py-1 rounded-md text-sm font-medium",
                                getDeadlineStatus(task.deadline) === "overdue" 
                                  ? "bg-[#400012]/90 text-[#ff2d55] shadow-[0_0_20px_rgba(255,45,85,0.6)] border-2 border-[#ff2d55]/70" 
                                  : getDeadlineStatus(task.deadline) === "soon" 
                                  ? "bg-[#462800]/90 text-[#ffcc00] shadow-[0_0_20px_rgba(255,204,0,0.6)] border-2 border-[#ffcc00]/70" 
                                  : "bg-[#152034]/90 text-[#00e1ff] shadow-[0_0_20px_rgba(0,225,255,0.6)] border-2 border-[#00e1ff]/70"
                              )}>
                                {getDeadlineIcon(task.deadline)}
                                <span className="ml-1.5">{formatDate(task.deadline)}</span>
                                <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-neon-darker border-neon-accent/30 text-neon-text">
                              {new Date(task.deadline).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="relative inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-[#152034]/90 text-[#00e1ff] shadow-[0_0_20px_rgba(0,225,255,0.6)] border-2 border-[#00e1ff]/70">
                          <Clock className="h-4 w-4 mr-1.5" />
                          <span>Sin fecha</span>
                          <span className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></span>
                        </div>
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
          <div className="py-4 px-6 border-t border-neon-accent/20">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    aria-disabled={currentPage === 1}
                    className={cn(
                      "border-neon-accent/30 text-neon-text bg-neon-darker hover:border-neon-accent/60 hover:text-neon-accent/90 transition-all duration-300 shadow-[0_0_4px_rgba(0,225,255,0.05)]",
                      currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    )}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className={cn(
                        "cursor-pointer border-neon-accent/30 hover:border-neon-accent/60 bg-neon-darker transition-all duration-300",
                        currentPage === i + 1 ? "bg-neon-medium/20 text-neon-accent border-neon-accent/50 shadow-[0_0_6px_rgba(0,225,255,0.2)]" : "text-neon-text"
                      )}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    aria-disabled={currentPage === totalPages}
                    className={cn(
                      "border-neon-accent/30 text-neon-text bg-neon-darker hover:border-neon-accent/60 hover:text-neon-accent/90 transition-all duration-300 shadow-[0_0_4px_rgba(0,225,255,0.05)]",
                      currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    )}
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