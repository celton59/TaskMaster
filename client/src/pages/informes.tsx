import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Search,
  Download,
  FileText,
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Datos de ejemplo para los KPIs
const kpisProduccion = [
  { 
    id: 1, 
    kpi: "Backlog de tareas", 
    definicion: "Nº de vídeos pendientes de iniciar (cola del equipo de producción).", 
    revisor: "Supervisor", 
    frecuencia: "Diario" 
  },
  { 
    id: 2, 
    kpi: "Throughput de producción", 
    definicion: "Nº de vídeos finalizados por el equipo de producción.", 
    revisor: "Supervisor/COO", 
    frecuencia: "Semanal" 
  },
  { 
    id: 3, 
    kpi: "Tiempo medio de producción", 
    definicion: "Tiempo desde asignación de tarea hasta entrega del primer corte.", 
    revisor: "Supervisor", 
    frecuencia: "Semanal" 
  },
  { 
    id: 4, 
    kpi: "Utilización de capacidad", 
    definicion: "% de horas trabajadas vs. horas disponibles del equipo de producción.", 
    revisor: "Supervisor", 
    frecuencia: "Semanal" 
  },
  { 
    id: 5, 
    kpi: "Tasa de rechazo en revisión", 
    definicion: "% de vídeos que la persona de revisión devuelve por incumplimiento de normas o calidad.", 
    revisor: "Revisor", 
    frecuencia: "Diario/Semanal" 
  },
  { 
    id: 6, 
    kpi: "Tiempo medio de revisión", 
    definicion: "Tiempo desde entrega de vídeo hasta aprobación final del revisor.", 
    revisor: "Revisor", 
    frecuencia: "Semanal" 
  },
  { 
    id: 7, 
    kpi: "Cumplimiento de normativa de marca", 
    definicion: "% de revisiones que pasan sin observaciones sobre estilo, miniatura y descripción.", 
    revisor: "Revisor", 
    frecuencia: "Mensual" 
  },
  { 
    id: 8, 
    kpi: "Precisión de enlaces de afiliados", 
    definicion: "% de vídeos publicados con links correctos y activos.", 
    revisor: "Revisor / Uploader", 
    frecuencia: "Diario" 
  },
  { 
    id: 9, 
    kpi: "Adherencia al calendario", 
    definicion: "% de vídeos publicados en la fecha/hora.", 
    revisor: "Uploader / Supervisor", 
    frecuencia: "Semanal" 
  },
  { 
    id: 10, 
    kpi: "Lead time total", 
    definicion: "Tiempo desde asignación al Supervisor hasta publicación en YouTube.", 
    revisor: "COO / Supervisor", 
    frecuencia: "Mensual" 
  },
  { 
    id: 11, 
    kpi: "Desviaciones significativas", 
    definicion: "Cualquier KPI clave >10-15 % fuera de objetivo o bloqueo en el proceso que supere X horas/días.", 
    revisor: "COO / Supervisor", 
    frecuencia: "Semanal / Inmediato" 
  },
  { 
    id: 12, 
    kpi: "Oportunidades estratégicas", 
    definicion: "Contenido o features que superan benchmarks internos (engagement alto) y feedback de mercado.", 
    revisor: "COO / Supervisor", 
    frecuencia: "Mensual" 
  },
  { 
    id: 13, 
    kpi: "Visitas totales del canal", 
    definicion: "Nº total de visualizaciones en YouTube (views).", 
    revisor: "Supervisor", 
    frecuencia: "Semanal" 
  },
  { 
    id: 14, 
    kpi: "Watch Time (horas vistas)", 
    definicion: "Total de horas que los espectadores han visto el contenido.", 
    revisor: "Supervisor", 
    frecuencia: "Semanal" 
  },
  { 
    id: 15, 
    kpi: "CTR de miniaturas", 
    definicion: "% de usuarios que hacen clic en la miniatura respecto a las impresiones.", 
    revisor: "Supervisor", 
    frecuencia: "Semanal" 
  },
  { 
    id: 16, 
    kpi: "Suscriptores netos", 
    definicion: "Nuevos suscriptores menos bajas en el período.", 
    revisor: "Supervisor", 
    frecuencia: "Semanal" 
  },
  { 
    id: 17, 
    kpi: "Engagement (likes, comentarios, compartidos)", 
    definicion: "Número de interacciones dividido por el total de vistas.", 
    revisor: "Supervisor", 
    frecuencia: "Semanal" 
  },
  { 
    id: 18, 
    kpi: "RPM de canal", 
    definicion: "Ingresos estimados por cada 1000 impresiones de vídeo.", 
    revisor: "COO / Supervisor", 
    frecuencia: "Mensual" 
  }
];

export default function InformesPage() {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [frecuenciaFilter, setFrecuenciaFilter] = useState("");
  const [revisorFilter, setRevisorFilter] = useState("");
  
  // Filtrado de KPIs
  const filteredKPIs = kpisProduccion.filter(kpi => {
    const matchesSearch = kpi.kpi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         kpi.definicion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrecuencia = frecuenciaFilter ? kpi.frecuencia.includes(frecuenciaFilter) : true;
    const matchesRevisor = revisorFilter ? kpi.revisor.includes(revisorFilter) : true;
    
    return matchesSearch && matchesFrecuencia && matchesRevisor;
  });
  
  // Obtener valores únicos para los filtros
  const frecuenciasSet = new Set(kpisProduccion.map(kpi => kpi.frecuencia));
  const frecuencias = Array.from(frecuenciasSet);
  
  const revisoresArray = kpisProduccion.flatMap(kpi => kpi.revisor.split('/').map(r => r.trim()));
  const revisoresSet = new Set(revisoresArray);
  const revisores = Array.from(revisoresSet);
  
  return (
    <div className={cn(
      "flex-1 overflow-auto",
      isDarkMode ? "bg-neon-darker text-neon-text" : "bg-gray-50 text-gray-900"
    )}>
      <div className={cn(
        "container mx-auto px-4 py-6",
        isDarkMode ? "bg-neon-darker text-neon-text" : "bg-gray-50 text-gray-900"
      )}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "flex items-center gap-1",
                isDarkMode 
                  ? "border-neon-medium/50 text-neon-text hover:bg-neon-medium/20" 
                  : "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
              )}
              asChild
            >
              <Link to="/documentation">
                <ArrowLeft className={cn(
                  "h-4 w-4",
                  isDarkMode ? "text-neon-text" : "text-blue-600"
                )} />
                Volver a Documentación
              </Link>
            </Button>
            
            <h1 className={cn(
              "text-3xl font-bold",
              isDarkMode ? "text-neon-accent" : "text-blue-700"
            )}>
              <div className="flex items-center gap-2">
                <BarChart size={28} className={isDarkMode ? "text-neon-accent" : "text-blue-600"} />
                Informes KPI
              </div>
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className={cn(
                "absolute left-2.5 top-2.5 h-4 w-4",
                isDarkMode ? "text-neon-text/50" : "text-gray-400"
              )} />
              <Input
                type="search"
                placeholder="Buscar KPI..."
                className={cn(
                  "pl-9 w-full",
                  isDarkMode 
                    ? "bg-neon-dark border-neon-medium text-neon-text placeholder:text-neon-text/50" 
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              className={cn(
                isDarkMode 
                  ? "bg-neon-accent hover:bg-neon-accent/80 text-neon-dark" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="produccion" className="w-full mb-6">
          <TabsList className={cn(
            "w-full sm:w-auto grid grid-cols-2 sm:flex sm:flex-row",
            isDarkMode 
              ? "bg-neon-dark/50" 
              : "bg-gray-100"
          )}>
            <TabsTrigger 
              value="produccion"
              className={cn(
                isDarkMode 
                  ? "data-[state=active]:bg-neon-medium/30 data-[state=active]:text-neon-accent" 
                  : "data-[state=active]:bg-white data-[state=active]:text-blue-700"
              )}
            >
              Producción
            </TabsTrigger>
            <TabsTrigger 
              value="marketing"
              className={cn(
                isDarkMode 
                  ? "data-[state=active]:bg-neon-medium/30 data-[state=active]:text-neon-accent" 
                  : "data-[state=active]:bg-white data-[state=active]:text-blue-700"
              )}
            >
              Marketing
            </TabsTrigger>
            <TabsTrigger 
              value="financiero"
              className={cn(
                isDarkMode 
                  ? "data-[state=active]:bg-neon-medium/30 data-[state=active]:text-neon-accent" 
                  : "data-[state=active]:bg-white data-[state=active]:text-blue-700"
              )}
            >
              Financiero
            </TabsTrigger>
            <TabsTrigger 
              value="operativo"
              className={cn(
                isDarkMode 
                  ? "data-[state=active]:bg-neon-medium/30 data-[state=active]:text-neon-accent" 
                  : "data-[state=active]:bg-white data-[state=active]:text-blue-700"
              )}
            >
              Operativo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produccion" className="mt-4">
            <Card className={cn(
              isDarkMode 
                ? "bg-neon-dark border-neon-medium/50" 
                : "bg-white border-gray-200"
            )}>
              <CardHeader className={cn(
                "pb-3",
                isDarkMode 
                  ? "text-neon-text" 
                  : "text-gray-900"
              )}>
                <CardTitle className={cn(
                  isDarkMode 
                    ? "text-neon-accent" 
                    : "text-blue-700"
                )}>
                  KPIs de Producción
                </CardTitle>
                <CardDescription className={cn(
                  isDarkMode 
                    ? "text-neon-text/70" 
                    : "text-gray-500"
                )}>
                  Métricas de rendimiento para el equipo de producción de contenido.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/3">
                    <label className={cn(
                      "text-sm font-medium block mb-1.5",
                      isDarkMode ? "text-neon-text/80" : "text-gray-600"
                    )}>
                      Filtrar por Frecuencia
                    </label>
                    <Select value={frecuenciaFilter} onValueChange={setFrecuenciaFilter}>
                      <SelectTrigger className={cn(
                        isDarkMode 
                          ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                          : "bg-white border-gray-200"
                      )}>
                        <SelectValue placeholder="Todas las frecuencias" />
                      </SelectTrigger>
                      <SelectContent className={cn(
                        isDarkMode 
                          ? "bg-neon-dark border-neon-medium/50 text-neon-text" 
                          : "bg-white"
                      )}>
                        <SelectItem value="">Todas las frecuencias</SelectItem>
                        {frecuencias.map((frecuencia, index) => (
                          <SelectItem key={index} value={frecuencia}>{frecuencia}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full md:w-1/3">
                    <label className={cn(
                      "text-sm font-medium block mb-1.5",
                      isDarkMode ? "text-neon-text/80" : "text-gray-600"
                    )}>
                      Filtrar por Revisor
                    </label>
                    <Select value={revisorFilter} onValueChange={setRevisorFilter}>
                      <SelectTrigger className={cn(
                        isDarkMode 
                          ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                          : "bg-white border-gray-200"
                      )}>
                        <SelectValue placeholder="Todos los revisores" />
                      </SelectTrigger>
                      <SelectContent className={cn(
                        isDarkMode 
                          ? "bg-neon-dark border-neon-medium/50 text-neon-text" 
                          : "bg-white"
                      )}>
                        <SelectItem value="">Todos los revisores</SelectItem>
                        {revisores.map((revisor, index) => (
                          <SelectItem key={index} value={revisor}>{revisor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full md:w-1/3 flex items-end">
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full",
                        isDarkMode 
                          ? "border-neon-medium/50 hover:bg-neon-medium/20" 
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                      onClick={() => {
                        setSearchTerm("");
                        setFrecuenciaFilter("");
                        setRevisorFilter("");
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-auto">
                  <Table>
                    <TableHeader className={cn(
                      isDarkMode 
                        ? "bg-neon-darker" 
                        : "bg-gray-50"
                    )}>
                      <TableRow className={cn(
                        isDarkMode 
                          ? "border-neon-medium/30 hover:bg-neon-darker" 
                          : "border-gray-200 hover:bg-gray-50"
                      )}>
                        <TableHead className={cn(
                          "w-[200px]",
                          isDarkMode ? "text-neon-accent" : "text-blue-700 font-medium"
                        )}>KPI</TableHead>
                        <TableHead className={cn(
                          isDarkMode ? "text-neon-accent" : "text-blue-700 font-medium"
                        )}>Definición</TableHead>
                        <TableHead className={cn(
                          "w-[150px]",
                          isDarkMode ? "text-neon-accent" : "text-blue-700 font-medium"
                        )}>¿Quién lo revisa?</TableHead>
                        <TableHead className={cn(
                          "w-[120px]",
                          isDarkMode ? "text-neon-accent" : "text-blue-700 font-medium"
                        )}>Frecuencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKPIs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <BarChart className={cn(
                                "h-12 w-12",
                                isDarkMode ? "text-neon-medium/40" : "text-gray-300"
                              )} />
                              <p className={cn(
                                "text-lg font-medium",
                                isDarkMode ? "text-neon-text/50" : "text-gray-500"
                              )}>No se encontraron KPIs</p>
                              <p className={cn(
                                "text-sm",
                                isDarkMode ? "text-neon-text/40" : "text-gray-400"
                              )}>
                                Intenta ajustar los filtros de búsqueda
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredKPIs.map((kpi) => {
                          // Destacar KPIs con desviaciones significativas
                          const isHighlighted = kpi.kpi === "Desviaciones significativas";
                          
                          return (
                            <TableRow 
                              key={kpi.id}
                              className={cn(
                                isDarkMode 
                                  ? isHighlighted 
                                    ? "border-neon-medium/20 bg-red-900/20 hover:bg-red-900/30" 
                                    : "border-neon-medium/20 hover:bg-neon-medium/10"
                                  : isHighlighted 
                                    ? "border-gray-100 bg-red-50 hover:bg-red-100/70" 
                                    : "border-gray-100 hover:bg-gray-50"
                              )}
                            >
                              <TableCell className={cn(
                                "font-medium",
                                isDarkMode 
                                  ? isHighlighted ? "text-red-300" : "text-neon-text" 
                                  : isHighlighted ? "text-red-600" : "text-gray-900"
                              )}>
                                {kpi.kpi}
                              </TableCell>
                              <TableCell className={cn(
                                isDarkMode ? "text-neon-text/90" : "text-gray-700"
                              )}>
                                {isHighlighted ? (
                                  <span className={cn(
                                    isDarkMode ? "text-red-300" : "text-red-600"
                                  )}>
                                    {kpi.definicion}
                                  </span>
                                ) : (
                                  kpi.definicion
                                )}
                              </TableCell>
                              <TableCell className={cn(
                                isDarkMode ? "text-neon-text/90" : "text-gray-700"
                              )}>
                                {kpi.revisor.split('/').map((revisor, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline"
                                    className={cn(
                                      "mr-1 mb-1",
                                      isDarkMode 
                                        ? "bg-neon-medium/20 text-neon-text border-neon-medium/30" 
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                    )}
                                  >
                                    {revisor.trim()}
                                  </Badge>
                                ))}
                              </TableCell>
                              <TableCell className={cn(
                                isDarkMode ? "text-neon-text/90" : "text-gray-700"
                              )}>
                                {kpi.frecuencia.split('/').map((frecuencia, idx) => (
                                  <Badge 
                                    key={idx}
                                    className={cn(
                                      "mr-1",
                                      isDarkMode
                                        ? "bg-neon-darker text-neon-text"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                                      frecuencia.includes("Inmediato") && (
                                        isDarkMode 
                                          ? "bg-red-900/30 text-red-300" 
                                          : "bg-red-100 text-red-700"
                                      )
                                    )}
                                  >
                                    {frecuencia.trim()}
                                  </Badge>
                                ))}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="marketing" className="mt-4">
            <Card className={cn(
              isDarkMode 
                ? "bg-neon-dark border-neon-medium/50" 
                : "bg-white border-gray-200"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  isDarkMode ? "text-neon-accent" : "text-blue-700"
                )}>KPIs de Marketing</CardTitle>
                <CardDescription>
                  Esta sección está en desarrollo.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <LineChart className={cn(
                    "h-16 w-16 mx-auto mb-4",
                    isDarkMode ? "text-neon-medium/50" : "text-gray-300"
                  )} />
                  <h3 className={cn(
                    "text-lg font-medium mb-2",
                    isDarkMode ? "text-neon-text" : "text-gray-700"
                  )}>
                    Contenido próximamente
                  </h3>
                  <p className={cn(
                    "max-w-md text-sm",
                    isDarkMode ? "text-neon-text/70" : "text-gray-500"
                  )}>
                    Los KPIs de marketing estarán disponibles en una próxima actualización.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financiero" className="mt-4">
            <Card className={cn(
              isDarkMode 
                ? "bg-neon-dark border-neon-medium/50" 
                : "bg-white border-gray-200"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  isDarkMode ? "text-neon-accent" : "text-blue-700"
                )}>KPIs Financieros</CardTitle>
                <CardDescription>
                  Esta sección está en desarrollo.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <PieChart className={cn(
                    "h-16 w-16 mx-auto mb-4",
                    isDarkMode ? "text-neon-medium/50" : "text-gray-300"
                  )} />
                  <h3 className={cn(
                    "text-lg font-medium mb-2",
                    isDarkMode ? "text-neon-text" : "text-gray-700"
                  )}>
                    Contenido próximamente
                  </h3>
                  <p className={cn(
                    "max-w-md text-sm",
                    isDarkMode ? "text-neon-text/70" : "text-gray-500"
                  )}>
                    Los KPIs financieros estarán disponibles en una próxima actualización.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="operativo" className="mt-4">
            <Card className={cn(
              isDarkMode 
                ? "bg-neon-dark border-neon-medium/50" 
                : "bg-white border-gray-200"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  isDarkMode ? "text-neon-accent" : "text-blue-700"
                )}>KPIs Operativos</CardTitle>
                <CardDescription>
                  Esta sección está en desarrollo.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Calendar className={cn(
                    "h-16 w-16 mx-auto mb-4",
                    isDarkMode ? "text-neon-medium/50" : "text-gray-300"
                  )} />
                  <h3 className={cn(
                    "text-lg font-medium mb-2",
                    isDarkMode ? "text-neon-text" : "text-gray-700"
                  )}>
                    Contenido próximamente
                  </h3>
                  <p className={cn(
                    "max-w-md text-sm",
                    isDarkMode ? "text-neon-text/70" : "text-gray-500"
                  )}>
                    Los KPIs operativos estarán disponibles en una próxima actualización.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}