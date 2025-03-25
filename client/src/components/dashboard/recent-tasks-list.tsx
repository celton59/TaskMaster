import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { FileText, Mail, Calendar, Bug } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Task } from "@shared/schema";

interface RecentTasksListProps {
  tasks: Task[];
  onViewAll: () => void;
}

export function RecentTasksList({ tasks, onViewAll }: RecentTasksListProps) {
  // Status badge color variants
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En progreso</Badge>;
      case "review":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Revisión</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completado</Badge>;
      default:
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Atrasado</Badge>;
    }
  };
  
  // Icon for task type
  const getTaskIcon = (index: number) => {
    const icons = [
      <FileText className="h-4 w-4" key="file" />,
      <Mail className="h-4 w-4" key="mail" />,
      <Calendar className="h-4 w-4" key="calendar" />,
      <Bug className="h-4 w-4" key="bug" />
    ];
    return icons[index % icons.length];
  };
  
  // Background color for icon
  const getIconBackground = (index: number) => {
    const backgrounds = [
      "bg-primary-50 text-primary-700",
      "bg-success-50 text-success-700",
      "bg-secondary-50 text-secondary-700",
      "bg-error-50 text-error-700"
    ];
    return backgrounds[index % backgrounds.length];
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const taskDate = new Date(date);
    
    if (now.toDateString() === taskDate.toDateString()) {
      return "Hace " + formatDistanceToNow(taskDate, { locale: es, addSuffix: false });
    }
    
    // If within one week
    if (now.getTime() - taskDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return "Hace " + formatDistanceToNow(taskDate, { locale: es, addSuffix: false });
    }
    
    return format(taskDate, "d MMM", { locale: es });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Tareas recientes</CardTitle>
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
          >
            Ver todas
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-neutral-200">
            {tasks.map((task, index) => (
              <li key={task.id} className="py-3">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full",
                      getIconBackground(index)
                    )}>
                      {getTaskIcon(index)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{task.title}</p>
                    <p className="truncate text-sm text-neutral-500">
                      {task.createdAt && formatDate(task.createdAt)}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
