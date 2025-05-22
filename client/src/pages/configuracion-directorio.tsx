import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  User,
  Building,
  Calendar,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  UserCircle,
  RefreshCw,
  Save
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";

// Tipos de empleados y departamentos
type Department = 'CEO' | 'Operaciones' | 'Iznoval' | 'Aisoft' | 'Producción' | 'Contenido' | 'Programación';
type Role = 'Director' | 'Supervisor' | 'Especialista' | 'Técnico' | 'Asistente';
type Status = 'Activo' | 'Vacaciones' | 'Permiso' | 'Remoto';

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
  status: Status;
}

// Esquema de validación con zod
const employeeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(9, { message: "Teléfono inválido" }),
  department: z.string({ required_error: "Selecciona un departamento" }),
  role: z.string({ required_error: "Selecciona un rol" }),
  joined: z.string(),
  location: z.string().min(2, { message: "La ubicación debe tener al menos 2 caracteres" }),
  skills: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean) as string[]),
  projects: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) as string[] : []),
  status: z.string({ required_error: "Selecciona un estado" }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export default function ConfiguracionDirectorioPage() {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "",
      joined: new Date().toISOString().split('T')[0],
      location: "",
      skills: "",
      projects: "",
      status: "Activo",
    },
  });

  // Cargar datos de empleados
  useEffect(() => {
    // Cambiar el título de la página
    document.title = "Configuración del Directorio | Aitorin";
    
    // En un entorno real, aquí cargaríamos los datos de una API
    const mockEmployees: Employee[] = [
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
      // ...más empleados igual que en directorio.tsx
    ];
    
    setEmployees(mockEmployees);
    setFilteredEmployees(mockEmployees);
  }, []);

  // Filtrar empleados cuando cambia el término de búsqueda
  useEffect(() => {
    const filtered = employees.filter(employee => {
      return searchTerm === "" || 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  // Función para abrir el diálogo de edición
  const openEditDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    
    // Establecer los valores del formulario
    form.reset({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      role: employee.role,
      joined: employee.joined,
      location: employee.location,
      skills: employee.skills.join(', '),
      projects: employee.projects?.join(', ') || '',
      status: employee.status,
    });
    
    setIsDialogOpen(true);
  };

  // Función para abrir el diálogo de nuevo empleado
  const openNewEmployeeDialog = () => {
    setCurrentEmployee(null);
    
    // Resetear el formulario
    form.reset({
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "",
      joined: new Date().toISOString().split('T')[0],
      location: "",
      skills: "",
      projects: "",
      status: "Activo",
    });
    
    setIsDialogOpen(true);
  };

  // Función para manejar el envío del formulario
  const onSubmit = (data: EmployeeFormValues) => {
    if (currentEmployee) {
      // Editar empleado existente
      const updatedEmployees = employees.map(emp => 
        emp.id === currentEmployee.id 
          ? { ...data, id: currentEmployee.id } as Employee 
          : emp
      );
      setEmployees(updatedEmployees);
      
      toast({
        title: "Empleado actualizado",
        description: `Los datos de ${data.name} han sido actualizados correctamente.`,
      });
    } else {
      // Crear nuevo empleado
      const newId = Math.max(0, ...employees.map(e => e.id)) + 1;
      const newEmployee = { ...data, id: newId } as Employee;
      
      setEmployees([...employees, newEmployee]);
      
      toast({
        title: "Empleado creado",
        description: `${data.name} ha sido añadido correctamente al directorio.`,
      });
    }
    
    setIsDialogOpen(false);
  };

  // Función para eliminar un empleado
  const deleteEmployee = () => {
    if (!employeeToDelete) return;
    
    const updatedEmployees = employees.filter(emp => emp.id !== employeeToDelete.id);
    setEmployees(updatedEmployees);
    
    toast({
      title: "Empleado eliminado",
      description: `${employeeToDelete.name} ha sido eliminado del directorio.`,
      variant: "destructive",
    });
    
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  // Función para obtener el color del departamento
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

  // Función para obtener las iniciales de un nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
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
            Configuración del Directorio
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
          <Button 
            className={cn(
              isDarkMode 
                ? "bg-neon-accent hover:bg-neon-accent/80 text-neon-dark" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
            onClick={openNewEmployeeDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        </div>
      </div>

      <Card className={cn(
        isDarkMode 
          ? "bg-neon-dark border-neon-medium/50" 
          : "bg-white border-gray-200"
      )}>
        <CardHeader className="pb-3">
          <CardTitle>Gestionar Empleados</CardTitle>
          <CardDescription>
            Añade, edita o elimina empleados del directorio.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead className="w-[200px]">Empleado</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className={cn(
                          "h-12 w-12",
                          isDarkMode ? "text-neon-medium/40" : "text-gray-300"
                        )} />
                        <p className={cn(
                          "text-lg font-medium",
                          isDarkMode ? "text-neon-text/50" : "text-gray-500"
                        )}>No se encontraron empleados</p>
                        <p className={cn(
                          "text-sm",
                          isDarkMode ? "text-neon-text/40" : "text-gray-400"
                        )}>
                          {searchTerm ? "Prueba con otra búsqueda" : "Añade un nuevo empleado para comenzar"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => {
                    const departmentColor = getDepartmentColor(employee.department);
                    
                    return (
                      <TableRow 
                        key={employee.id}
                        className={cn(
                          isDarkMode 
                            ? "border-neon-medium/20 hover:bg-neon-medium/10" 
                            : "border-gray-100 hover:bg-gray-50"
                        )}
                      >
                        <TableCell className="font-mono text-xs">
                          {employee.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className={cn(
                              "h-8 w-8 border",
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
                            <div>
                              <p className={cn(
                                "font-medium line-clamp-1",
                                isDarkMode ? "text-neon-text" : "text-gray-900"
                              )}>
                                {employee.name}
                              </p>
                              <p className={cn(
                                "text-xs line-clamp-1",
                                isDarkMode ? "text-neon-text/70" : "text-gray-500"
                              )}>
                                {employee.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Mail className={cn(
                                "h-3 w-3 mr-1.5",
                                isDarkMode ? "text-neon-accent/70" : "text-gray-400"
                              )} />
                              <span className={cn(
                                "text-xs line-clamp-1",
                                isDarkMode ? "text-neon-text/90" : "text-gray-700"
                              )}>
                                {employee.email}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Phone className={cn(
                                "h-3 w-3 mr-1.5",
                                isDarkMode ? "text-neon-accent/70" : "text-gray-400"
                              )} />
                              <span className={cn(
                                "text-xs",
                                isDarkMode ? "text-neon-text/90" : "text-gray-700"
                              )}>
                                {employee.phone}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "font-normal text-xs py-0.5",
                            isDarkMode ? departmentColor.darkBg : departmentColor.bg,
                            isDarkMode ? departmentColor.darkText : departmentColor.text
                          )}>
                            {employee.department}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          "text-sm",
                          isDarkMode ? "text-neon-text/90" : "text-gray-700"
                        )}>
                          {employee.role}
                        </TableCell>
                        <TableCell className={cn(
                          "text-sm",
                          isDarkMode 
                            ? employee.status === "Activo" ? "text-green-400" : "text-yellow-400"
                            : employee.status === "Activo" ? "text-green-600" : "text-yellow-600"
                        )}>
                          {employee.status}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className={cn(
                                "h-8 w-8",
                                isDarkMode 
                                  ? "hover:bg-neon-medium/20 text-neon-accent" 
                                  : "hover:bg-gray-100 text-blue-600"
                              )}
                              onClick={() => openEditDialog(employee)}
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className={cn(
                                "h-8 w-8",
                                isDarkMode 
                                  ? "hover:bg-red-900/30 text-red-400" 
                                  : "hover:bg-red-50 text-red-600"
                              )}
                              onClick={() => {
                                setEmployeeToDelete(employee);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
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

      {/* Diálogo para crear/editar empleados */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          "max-w-2xl",
          isDarkMode 
            ? "bg-neon-dark border-neon-medium text-neon-text" 
            : "bg-white border-gray-200"
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              isDarkMode ? "text-neon-accent" : "text-blue-700"
            )}>
              {currentEmployee ? `Editar empleado: ${currentEmployee.name}` : "Añadir nuevo empleado"}
            </DialogTitle>
            <DialogDescription>
              {currentEmployee 
                ? "Modifica los datos del empleado y guarda los cambios." 
                : "Completa el formulario para añadir un nuevo empleado al directorio."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                        Nombre
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre completo" 
                          {...field}
                          className={cn(
                            isDarkMode 
                              ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                              : "bg-white"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@ejemplo.com" 
                          type="email"
                          {...field}
                          className={cn(
                            isDarkMode 
                              ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                              : "bg-white"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Teléfono */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                        Teléfono
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+34 600 000 000" 
                          {...field}
                          className={cn(
                            isDarkMode 
                              ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                              : "bg-white"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ubicación */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                        Ubicación
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ciudad" 
                          {...field}
                          className={cn(
                            isDarkMode 
                              ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                              : "bg-white"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Departamento */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                        Departamento
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={cn(
                            isDarkMode 
                              ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                              : "bg-white"
                          )}>
                            <SelectValue placeholder="Selecciona departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={cn(
                          isDarkMode 
                            ? "bg-neon-dark border-neon-medium/50 text-neon-text" 
                            : "bg-white"
                        )}>
                          <SelectItem value="CEO">CEO</SelectItem>
                          <SelectItem value="Operaciones">Operaciones</SelectItem>
                          <SelectItem value="Iznoval">Iznoval</SelectItem>
                          <SelectItem value="Aisoft">Aisoft</SelectItem>
                          <SelectItem value="Producción">Producción</SelectItem>
                          <SelectItem value="Contenido">Contenido</SelectItem>
                          <SelectItem value="Programación">Programación</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rol */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                        Rol
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={cn(
                            isDarkMode 
                              ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                              : "bg-white"
                          )}>
                            <SelectValue placeholder="Selecciona rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={cn(
                          isDarkMode 
                            ? "bg-neon-dark border-neon-medium/50 text-neon-text" 
                            : "bg-white"
                        )}>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                          <SelectItem value="Especialista">Especialista</SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                          <SelectItem value="Asistente">Asistente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de incorporación */}
                <FormField
                  control={form.control}
                  name="joined"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                        Fecha de incorporación
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          className={cn(
                            isDarkMode 
                              ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                              : "bg-white"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estado */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                        Estado
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={cn(
                            isDarkMode 
                              ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                              : "bg-white"
                          )}>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={cn(
                          isDarkMode 
                            ? "bg-neon-dark border-neon-medium/50 text-neon-text" 
                            : "bg-white"
                        )}>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                          <SelectItem value="Permiso">Permiso</SelectItem>
                          <SelectItem value="Remoto">Remoto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Habilidades */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                      Habilidades
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Separadas por comas: Gestión, Diseño, Programación, etc." 
                        {...field}
                        className={cn(
                          isDarkMode 
                            ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                            : "bg-white"
                        )}
                      />
                    </FormControl>
                    <FormDescription className={isDarkMode ? "text-neon-text/50" : ""}>
                      Introduce las habilidades separadas por comas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Proyectos */}
              <FormField
                control={form.control}
                name="projects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={isDarkMode ? "text-neon-text" : ""}>
                      Proyectos
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Separados por comas: Proyecto A, Proyecto B, etc." 
                        {...field}
                        className={cn(
                          isDarkMode 
                            ? "bg-neon-darker border-neon-medium/50 text-neon-text" 
                            : "bg-white"
                        )}
                      />
                    </FormControl>
                    <FormDescription className={isDarkMode ? "text-neon-text/50" : ""}>
                      Introduce los proyectos separados por comas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className={cn(
                    isDarkMode 
                      ? "bg-neon-darker border-neon-medium/50 text-neon-text hover:bg-neon-dark" 
                      : ""
                  )}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className={cn(
                    isDarkMode 
                      ? "bg-neon-accent hover:bg-neon-accent/80 text-neon-dark" 
                      : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {currentEmployee ? "Guardar cambios" : "Crear empleado"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={cn(
          "max-w-md",
          isDarkMode 
            ? "bg-neon-dark border-neon-medium text-neon-text" 
            : "bg-white border-gray-200"
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              isDarkMode ? "text-red-400" : "text-red-600"
            )}>
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              {employeeToDelete 
                ? `¿Estás seguro de que deseas eliminar a ${employeeToDelete.name} del directorio? Esta acción no se puede deshacer.` 
                : "¿Estás seguro de que deseas eliminar este empleado?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className={cn(
                isDarkMode 
                  ? "bg-neon-darker border-neon-medium/50 text-neon-text hover:bg-neon-dark" 
                  : ""
              )}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={deleteEmployee}
              className={cn(
                isDarkMode 
                  ? "bg-red-900/70 hover:bg-red-900 text-red-300 border-red-900/50" 
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}