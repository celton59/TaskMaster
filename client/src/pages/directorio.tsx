import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  Star,
  MapPin,
  CalendarDays,
  UserCircle,
  AtSign,
  Briefcase,
  BadgeCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Tipos de empleados y departamentos
type Department = 'CEO' | 'Operaciones' | 'Iznoval' | 'Aisoft' | 'Producción' | 'Contenido' | 'Programación';
type Role = 'Director' | 'Supervisor' | 'Especialista' | 'Técnico' | 'Asistente';

interface Employee {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  department: Department;
  role: Role;
  joined: string;
  location: string;
  skills: string[];
  projects?: string[];
  status: 'Activo' | 'Vacaciones' | 'Permiso' | 'Remoto';
}

export default function DirectorioPage() {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [view, setView] = useState<"cards" | "table">("cards");

  // Datos de empleados
  const employees: Employee[] = [
    {
      id: 1,
      name: "Aitor",
      email: "aitor@aitorinpetant.com",
      phone: "+34 600 123 456",
      department: "CEO",
      role: "Director",
      joined: "2020-01-01",
      location: "Madrid",
      status: "Activo",
      skills: ["Estrategia", "Gestión", "Visión de negocio"],
      projects: ["Expansión Internacional", "Plan Estratégico 2025"]
    },
    {
      id: 2,
      name: "Max",
      avatar: "perros/max.jpg", // Las rutas de imágenes son ficticias
      email: "max@aitorinpetant.com",
      phone: "+34 600 123 457",
      department: "Operaciones",
      role: "Director",
      joined: "2020-02-15",
      location: "Madrid",
      status: "Activo",
      skills: ["Operaciones", "Gestión de equipos", "Agile"],
      projects: ["Optimización de Procesos", "Transformación Digital"]
    },
    {
      id: 3,
      name: "Rocky",
      avatar: "perros/rocky.jpg",
      email: "rocky@aitorinpetant.com",
      phone: "+34 600 123 458",
      department: "Iznoval",
      role: "Supervisor",
      joined: "2020-03-10",
      location: "Barcelona",
      status: "Activo",
      skills: ["Gestión de proyectos", "Comunicación", "Liderazgo"],
      projects: ["Proyecto YouTube", "Gestión de contenidos"]
    },
    {
      id: 4,
      name: "Luna",
      avatar: "perros/luna.jpg",
      email: "luna@aitorinpetant.com",
      phone: "+34 600 123 459",
      department: "Aisoft",
      role: "Supervisor",
      joined: "2020-04-05",
      location: "Valencia",
      status: "Vacaciones",
      skills: ["Desarrollo de software", "DevOps", "Testing"],
      projects: ["Plataforma de Contenidos", "Automatización"]
    },
    {
      id: 5,
      name: "Coco",
      avatar: "perros/coco.jpg",
      email: "coco@aitorinpetant.com",
      phone: "+34 600 123 460",
      department: "Producción",
      role: "Especialista",
      joined: "2021-01-15",
      location: "Madrid",
      status: "Activo",
      skills: ["Edición de vídeo", "Diseño gráfico", "Guión"],
      projects: ["Serie Viral", "Campañas estacionales"]
    },
    {
      id: 6,
      name: "Nina",
      avatar: "perros/nina.jpg",
      email: "nina@aitorinpetant.com",
      phone: "+34 600 123 461",
      department: "Producción",
      role: "Técnico",
      joined: "2021-02-20",
      location: "Barcelona",
      status: "Remoto",
      skills: ["Cámara", "Iluminación", "Sonido"],
      projects: ["Documentales", "Entrevistas"]
    },
    {
      id: 7,
      name: "Thor",
      avatar: "perros/thor.jpg",
      email: "thor@aitorinpetant.com",
      phone: "+34 600 123 462",
      department: "Contenido",
      role: "Especialista",
      joined: "2021-03-25",
      location: "Sevilla",
      status: "Activo",
      skills: ["Revisión de contenidos", "Control de calidad", "Documentación"],
      projects: ["Estándares de calidad", "Revisión Editorial"]
    },
    {
      id: 8,
      name: "Lola",
      avatar: "perros/lola.jpg",
      email: "lola@aitorinpetant.com",
      phone: "+34 600 123 463",
      department: "Contenido",
      role: "Asistente",
      joined: "2021-04-30",
      location: "Madrid",
      status: "Activo",
      skills: ["Gestión documental", "Corrección", "Estilo"],
      projects: ["Manual de estilo", "Biblioteca de recursos"]
    },
    {
      id: 9,
      name: "Rex",
      avatar: "perros/rex.jpg",
      email: "rex@aitorinpetant.com",
      phone: "+34 600 123 464",
      department: "Programación",
      role: "Especialista",
      joined: "2022-01-10",
      location: "Barcelona",
      status: "Permiso",
      skills: ["Programación web", "Automatización", "QA"],
      projects: ["Programador de contenidos", "Sistema de monitorización"]
    },
    {
      id: 10,
      name: "Nala",
      avatar: "perros/nala.jpg",
      email: "nala@aitorinpetant.com",
      phone: "+34 600 123 465",
      department: "Programación",
      role: "Técnico",
      joined: "2022-02-15",
      location: "Madrid",
      status: "Activo",
      skills: ["Publicación digital", "Análisis", "Testing"],
      projects: ["Portal de métricas", "Optimización de publicación"]
    }
  ];

  useEffect(() => {
    // Cambiar el título de la página
    document.title = "Directorio | Aitorin";
    
    // Filtrar empleados
    filterEmployees();
  }, [searchTerm, filterDepartment]);

  const filterEmployees = () => {
    const filtered = employees.filter(employee => {
      // Filtro por búsqueda
      const matchesSearch = searchTerm === "" || 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por departamento
      const matchesDepartment = filterDepartment === "all" || 
        employee.department.toLowerCase() === filterDepartment.toLowerCase();
      
      return matchesSearch && matchesDepartment;
    });
    
    setFilteredEmployees(filtered);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getDepartmentColor = (department: Department) => {
    const departmentColors: Record<Department, { bg: string, text: string, darkBg: string, darkText: string }> = {
      'CEO': { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800',
        darkBg: 'bg-amber-900/30',
        darkText: 'text-amber-400'
      },
      'Operaciones': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        darkBg: 'bg-blue-900/30',
        darkText: 'text-blue-400'
      },
      'Iznoval': { 
        bg: 'bg-green-100', 
        text: 'text-green-800',
        darkBg: 'bg-green-900/30',
        darkText: 'text-green-400'
      },
      'Aisoft': { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800',
        darkBg: 'bg-gray-800/40',
        darkText: 'text-gray-400'
      },
      'Producción': { 
        bg: 'bg-pink-100', 
        text: 'text-pink-800',
        darkBg: 'bg-pink-900/30',
        darkText: 'text-pink-400'
      },
      'Contenido': { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800',
        darkBg: 'bg-emerald-900/30',
        darkText: 'text-emerald-400'
      },
      'Programación': { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800',
        darkBg: 'bg-purple-900/30',
        darkText: 'text-purple-400'
      }
    };
    
    return departmentColors[department];
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, { bg: string, text: string, darkBg: string, darkText: string, icon: JSX.Element }> = {
      'Activo': { 
        bg: 'bg-green-100', 
        text: 'text-green-800',
        darkBg: 'bg-green-900/30',
        darkText: 'text-green-400',
        icon: <BadgeCheck className="w-3 h-3 mr-1" />
      },
      'Vacaciones': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        darkBg: 'bg-blue-900/30',
        darkText: 'text-blue-400',
        icon: <CalendarDays className="w-3 h-3 mr-1" />
      },
      'Permiso': { 
        bg: 'bg-orange-100', 
        text: 'text-orange-800',
        darkBg: 'bg-orange-900/30',
        darkText: 'text-orange-400',
        icon: <CalendarDays className="w-3 h-3 mr-1" />
      },
      'Remoto': { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800',
        darkBg: 'bg-purple-900/30',
        darkText: 'text-purple-400',
        icon: <MapPin className="w-3 h-3 mr-1" />
      }
    };
    
    return statusColors[status] || statusColors['Activo'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={cn(
      "container mx-auto px-4 py-6",
      isDarkMode ? "bg-neon-darker text-neon-text" : "bg-gray-50 text-gray-900"
    )}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className={cn(
          "text-3xl font-bold",
          isDarkMode ? "text-neon-accent" : "text-blue-700"
        )}>
          <div className="flex items-center gap-2">
            <Users size={28} className={isDarkMode ? "text-neon-accent" : "text-blue-600"} />
            Directorio de Empleados
          </div>
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className={cn(
              "absolute left-2.5 top-2.5 h-4 w-4",
              isDarkMode ? "text-neon-text/50" : "text-gray-400"
            )} />
            <Input
              type="search"
              placeholder="Buscar empleado..."
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
          <div className="flex gap-2">
            <select
              className={cn(
                "h-10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
                isDarkMode 
                  ? "bg-neon-dark border border-neon-medium text-neon-text focus:ring-neon-accent focus:ring-offset-neon-dark" 
                  : "bg-white border border-gray-200 text-gray-900 focus:ring-blue-500 focus:ring-offset-white"
              )}
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">Todos los departamentos</option>
              <option value="ceo">CEO</option>
              <option value="operaciones">Operaciones</option>
              <option value="iznoval">Iznoval</option>
              <option value="aisoft">Aisoft</option>
              <option value="producción">Producción</option>
              <option value="contenido">Contenido</option>
              <option value="programación">Programación</option>
            </select>
            
            <Tabs 
              defaultValue="cards" 
              className="w-auto"
              value={view}
              onValueChange={(value) => setView(value as "cards" | "table")}
            >
              <TabsList className={cn(
                isDarkMode 
                  ? "bg-neon-dark border border-neon-medium" 
                  : "bg-white border border-gray-200"
              )}>
                <TabsTrigger value="cards" className={cn(
                  isDarkMode
                    ? "data-[state=active]:bg-neon-medium data-[state=active]:text-neon-accent"
                    : "data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                )}>
                  <div className="flex items-center gap-1">
                    <div className="grid grid-cols-2 gap-0.5 h-3.5 w-3.5">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-sm",
                        isDarkMode ? "bg-neon-text" : "bg-gray-600"
                      )}></div>
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-sm",
                        isDarkMode ? "bg-neon-text" : "bg-gray-600"
                      )}></div>
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-sm",
                        isDarkMode ? "bg-neon-text" : "bg-gray-600"
                      )}></div>
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-sm",
                        isDarkMode ? "bg-neon-text" : "bg-gray-600"
                      )}></div>
                    </div>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="table" className={cn(
                  isDarkMode
                    ? "data-[state=active]:bg-neon-medium data-[state=active]:text-neon-accent"
                    : "data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                )}>
                  <div className="flex flex-col gap-0.5 h-4 w-4 justify-center">
                    <div className={cn(
                      "h-0.5 w-full rounded-sm",
                      isDarkMode ? "bg-neon-text" : "bg-gray-600"
                    )}></div>
                    <div className={cn(
                      "h-0.5 w-full rounded-sm",
                      isDarkMode ? "bg-neon-text" : "bg-gray-600"
                    )}></div>
                    <div className={cn(
                      "h-0.5 w-full rounded-sm",
                      isDarkMode ? "bg-neon-text" : "bg-gray-600"
                    )}></div>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <p className={cn(
          "text-sm",
          isDarkMode ? "text-neon-text/70" : "text-gray-500"
        )}>
          Mostrando {filteredEmployees.length} de {employees.length} empleados
        </p>
      </div>

      {view === "cards" ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredEmployees.map((employee, index) => {
            const departmentColor = getDepartmentColor(employee.department);
            const statusColor = getStatusColor(employee.status);
            
            return (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={cn(
                  "overflow-hidden",
                  isDarkMode 
                    ? "bg-neon-dark border-neon-medium/50 hover:shadow-[0_0_15px_rgba(0,225,255,0.1)]" 
                    : "bg-white border-gray-200 hover:shadow-md"
                )}>
                  <div className={cn(
                    "h-2",
                    isDarkMode ? departmentColor.darkBg : departmentColor.bg
                  )}></div>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center mb-4">
                      <Avatar className={cn(
                        "h-20 w-20 mb-3 border-2",
                        isDarkMode 
                          ? "border-neon-medium" 
                          : "border-gray-200"
                      )}>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback className={cn(
                          isDarkMode 
                            ? "bg-neon-medium text-neon-text" 
                            : "bg-blue-100 text-blue-700"
                        )}>
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className={cn(
                        "text-lg font-semibold",
                        isDarkMode ? "text-neon-text" : "text-gray-900"
                      )}>{employee.name}</h3>
                      <div className="flex items-center mt-1 mb-2">
                        <Badge className={cn(
                          "font-normal text-xs py-0.5",
                          isDarkMode ? departmentColor.darkBg : departmentColor.bg,
                          isDarkMode ? departmentColor.darkText : departmentColor.text
                        )}>
                          {employee.department}
                        </Badge>
                      </div>
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-neon-text/70" : "text-gray-500"
                      )}>{employee.role}</p>
                      
                      <div className="flex items-center mt-2">
                        <Badge className={cn(
                          "font-normal text-xs flex items-center py-0.5 h-5",
                          isDarkMode ? statusColor.darkBg : statusColor.bg,
                          isDarkMode ? statusColor.darkText : statusColor.text
                        )}>
                          {statusColor.icon}
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "border-t pt-4 space-y-2",
                      isDarkMode ? "border-neon-medium/30" : "border-gray-100"
                    )}>
                      <div className="flex items-center">
                        <Mail className={cn(
                          "h-4 w-4 mr-2",
                          isDarkMode ? "text-neon-accent/70" : "text-blue-500"
                        )} />
                        <span className={cn(
                          "text-sm",
                          isDarkMode ? "text-neon-text/90" : "text-gray-700"
                        )}>{employee.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className={cn(
                          "h-4 w-4 mr-2",
                          isDarkMode ? "text-neon-accent/70" : "text-blue-500"
                        )} />
                        <span className={cn(
                          "text-sm",
                          isDarkMode ? "text-neon-text/90" : "text-gray-700"
                        )}>{employee.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className={cn(
                          "h-4 w-4 mr-2",
                          isDarkMode ? "text-neon-accent/70" : "text-blue-500"
                        )} />
                        <span className={cn(
                          "text-sm",
                          isDarkMode ? "text-neon-text/90" : "text-gray-700"
                        )}>{employee.location}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarDays className={cn(
                          "h-4 w-4 mr-2 flex-shrink-0",
                          isDarkMode ? "text-neon-accent/70" : "text-blue-500"
                        )} />
                        <span className={cn(
                          "text-sm",
                          isDarkMode ? "text-neon-text/90" : "text-gray-700"
                        )}>Desde {formatDate(employee.joined)}</span>
                      </div>
                    </div>
                    
                    {employee.skills && employee.skills.length > 0 && (
                      <div className={cn(
                        "border-t mt-4 pt-4",
                        isDarkMode ? "border-neon-medium/30" : "border-gray-100"
                      )}>
                        <h4 className={cn(
                          "text-xs font-medium mb-2",
                          isDarkMode ? "text-neon-accent" : "text-blue-600"
                        )}>HABILIDADES</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {employee.skills.map((skill, idx) => (
                            <Badge key={idx} variant="outline" className={cn(
                              "font-normal text-xs",
                              isDarkMode 
                                ? "border-neon-medium/50 text-neon-text/80" 
                                : "border-gray-200 text-gray-700"
                            )}>
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={cn(
            isDarkMode 
              ? "bg-neon-dark border-neon-medium/50" 
              : "bg-white border-gray-200"
          )}>
            <CardContent className="p-0 overflow-auto">
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
                    <TableHead className="w-[80px]"></TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Incorporación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => {
                    const departmentColor = getDepartmentColor(employee.department);
                    const statusColor = getStatusColor(employee.status);
                    
                    return (
                      <TableRow 
                        key={employee.id}
                        className={cn(
                          isDarkMode 
                            ? "border-neon-medium/20 hover:bg-neon-medium/10" 
                            : "border-gray-100 hover:bg-gray-50"
                        )}
                      >
                        <TableCell>
                          <Avatar className={cn(
                            "h-10 w-10 border",
                            isDarkMode 
                              ? "border-neon-medium/50" 
                              : "border-gray-200"
                          )}>
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback className={cn(
                              isDarkMode 
                                ? "bg-neon-medium text-neon-text" 
                                : "bg-blue-100 text-blue-700"
                            )}>
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className={cn(
                          "font-medium",
                          isDarkMode ? "text-neon-text" : "text-gray-900"
                        )}>
                          {employee.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="text-xs">{employee.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="text-xs">{employee.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "font-normal text-xs",
                            isDarkMode ? departmentColor.darkBg : departmentColor.bg,
                            isDarkMode ? departmentColor.darkText : departmentColor.text
                          )}>
                            {employee.department}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          isDarkMode ? "text-neon-text/90" : "text-gray-700"
                        )}>
                          {employee.role}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "font-normal text-xs flex items-center py-0.5 h-5",
                            isDarkMode ? statusColor.darkBg : statusColor.bg,
                            isDarkMode ? statusColor.darkText : statusColor.text
                          )}>
                            {statusColor.icon}
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          isDarkMode ? "text-neon-text/90" : "text-gray-700"
                        )}>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {employee.location}
                          </div>
                        </TableCell>
                        <TableCell className={cn(
                          isDarkMode ? "text-neon-text/90" : "text-gray-700"
                        )}>
                          {formatDate(employee.joined)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}