import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfWeek, startOfMonth, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Habit, HabitLog } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarIcon, 
  ActivityIcon, 
  BarChart3Icon, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

interface HabitStatsProps {
  habit: Habit;
  onClose: () => void;
}

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function HabitStats({ habit, onClose }: HabitStatsProps) {
  const [activeTab, setActiveTab] = useState("resumen");
  
  // Obtener los logs de este hábito
  const { data: habitLogs = [] } = useQuery<HabitLog[]>({
    queryKey: ['/api/habit-logs', habit.id],
    staleTime: 1000 * 60 // 1 minuto
  });
  
  // Filtrar logs solo para este hábito
  const filteredLogs = habitLogs.filter(log => log.habitId === habit.id);
  
  // Organizar datos por semana, mes y año
  const today = new Date();
  const lastWeekStart = startOfWeek(addDays(today, -7), { weekStartsOn: 1 });
  const thisMonthStart = startOfMonth(today);
  
  // Datos de la última semana
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(lastWeekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const completed = filteredLogs.some(log => format(new Date(log.completedDate), 'yyyy-MM-dd') === dateStr);
    
    return {
      day: weekDays[i],
      date: dateStr,
      completed: completed ? 1 : 0
    };
  });
  
  // Datos del último mes (30 días)
  const monthData = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, -29 + i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const completed = filteredLogs.some(log => format(new Date(log.completedDate), 'yyyy-MM-dd') === dateStr);
    
    return {
      day: format(date, 'dd'),
      date: dateStr,
      completed: completed ? 1 : 0
    };
  });
  
  // Calcular estadísticas
  const totalDaysSinceStart = Math.max(
    1, 
    differenceInDays(today, new Date(habit.startDate))
  );
  
  const totalCompletions = filteredLogs.length;
  const completionRate = (totalCompletions / totalDaysSinceStart) * 100;
  
  // Calcular racha actual
  const streakDays = (() => {
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Retroceder día a día y verificar si existe un log
    while (true) {
      const dateToCheck = format(currentDate, 'yyyy-MM-dd');
      const hasLogForDate = filteredLogs.some(log => 
        format(new Date(log.completedDate), 'yyyy-MM-dd') === dateToCheck
      );
      
      if (hasLogForDate) {
        streak++;
        currentDate = addDays(currentDate, -1);
      } else {
        break;
      }
    }
    
    return streak;
  })();
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-medium">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: habit.color }}
            ></span>
            {habit.title} - Estadísticas
          </CardTitle>
        </div>
        <div className="text-sm text-muted-foreground flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>Comenzó el {format(new Date(habit.startDate), 'PP', { locale: es })}</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="resumen" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumen" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium mb-1">Racha actual</p>
                  <div className="font-bold text-2xl">{streakDays}</div>
                  <p className="text-xs text-muted-foreground">
                    {streakDays === 1 ? 'día' : 'días'} consecutivos
                  </p>
                  <div className="mt-2 w-full">
                    <Progress value={Math.min(streakDays * 10, 100)} className="h-2" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium mb-1">Completados</p>
                  <div className="font-bold text-2xl">{totalCompletions}</div>
                  <p className="text-xs text-muted-foreground">
                    de {totalDaysSinceStart} días posibles
                  </p>
                  <div className="mt-2 w-full">
                    <Progress 
                      value={Math.min(
                        (totalCompletions / Math.max(1, totalDaysSinceStart)) * 100, 
                        100
                      )} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium mb-1">Tasa de éxito</p>
                  <div className="font-bold text-2xl">{completionRate.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">
                    general desde el inicio
                  </p>
                  <div className="mt-2 w-full">
                    <Progress value={completionRate} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Últimos 7 días</h3>
              <div className="grid grid-cols-7 gap-1">
                {weekData.map((day, index) => (
                  <div 
                    key={day.date} 
                    className="flex flex-col items-center"
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {day.day}
                    </div>
                    <div 
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${day.completed 
                          ? 'bg-green-500/20 text-green-600' 
                          : 'bg-red-500/10 text-red-500'}
                      `}
                    >
                      {day.completed 
                        ? <CheckCircle2 className="h-5 w-5" /> 
                        : <XCircle className="h-5 w-5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Progreso último mes</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value, index) => {
                        return index % 5 === 0 ? value : '';
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        return value === 0 ? '' : value === 1 ? 'Sí' : '';
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        value === 1 ? 'Completado' : 'No completado', 
                        'Estado'
                      ]}
                      labelFormatter={(label, items) => {
                        const dataItem = monthData.find(item => item.day === label);
                        return dataItem 
                          ? format(new Date(dataItem.date), 'PP', { locale: es })
                          : label;
                      }}
                    />
                    <Bar dataKey="completed" barSize={18}>
                      {monthData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.completed ? '#10b981' : '#f43f5e'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="semana">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis 
                    domain={[0, 1]} 
                    tickCount={2} 
                    tickFormatter={(value) => {
                      return value === 0 ? 'No' : value === 1 ? 'Sí' : '';
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      value === 1 ? 'Completado' : 'No completado', 
                      'Estado'
                    ]}
                    labelFormatter={(label, items) => {
                      const dataItem = weekData.find(item => item.day === label);
                      return dataItem 
                        ? format(new Date(dataItem.date), 'PP', { locale: es })
                        : label;
                    }}
                  />
                  <Bar 
                    dataKey="completed" 
                    fill={habit.color || '#10b981'} 
                    barSize={40}
                  >
                    {weekData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.completed ? '#10b981' : '#f43f5e'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mt-6">
              {weekData.map((item) => (
                <div 
                  key={item.date} 
                  className={`
                    border-2 rounded-md p-3 text-center
                    ${item.completed 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-red-300 bg-red-50'}
                  `}
                >
                  <div className="font-medium">{item.day}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(item.date), 'dd/MM')}
                  </div>
                  <div className="mt-2">
                    {item.completed 
                      ? <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" /> 
                      : <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="mes">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tickCount={6} 
                  />
                  <YAxis 
                    domain={[0, 1]} 
                    tickCount={2} 
                    tickFormatter={(value) => {
                      return value === 0 ? 'No' : value === 1 ? 'Sí' : '';
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      value === 1 ? 'Completado' : 'No completado', 
                      'Estado'
                    ]}
                    labelFormatter={(label, items) => {
                      const dataItem = monthData.find(item => item.day === label);
                      return dataItem 
                        ? format(new Date(dataItem.date), 'PP', { locale: es })
                        : label;
                    }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="completed"
                    stroke={habit.color || '#10b981'}
                    strokeWidth={2}
                    dot={{ r: 4, fill: habit.color || '#10b981' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="p-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium">Días completados</h3>
                  <div className="font-bold text-3xl mt-2">
                    {monthData.filter(d => d.completed).length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    de los últimos 30 días
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium">Tasa de éxito</h3>
                  <div className="font-bold text-3xl mt-2">
                    {((monthData.filter(d => d.completed).length / 30) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    en el último mes
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium">Mejor racha</h3>
                  <div className="font-bold text-3xl mt-2">
                    {(() => {
                      let maxStreak = 0;
                      let currentStreak = 0;
                      
                      for (const data of monthData) {
                        if (data.completed) {
                          currentStreak++;
                          maxStreak = Math.max(maxStreak, currentStreak);
                        } else {
                          currentStreak = 0;
                        }
                      }
                      
                      return maxStreak;
                    })()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    días consecutivos
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}