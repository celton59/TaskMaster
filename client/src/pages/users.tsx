import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Plus, Search, UserCog, UserPlus, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user";
  lastActive: string;
  status: "active" | "inactive";
  avatar?: string;
}

// Ejemplo de datos de usuario para la interfaz
const mockUsers: User[] = [
  {
    id: 1,
    username: "admin123",
    name: "Administrador",
    email: "admin@sistema.com",
    role: "admin",
    lastActive: "2025-03-25T15:30:00",
    status: "active"
  },
  {
    id: 2,
    username: "mariaperez",
    name: "María Pérez",
    email: "maria@empresa.com",
    role: "manager",
    lastActive: "2025-03-29T10:15:00",
    status: "active"
  },
  {
    id: 3,
    username: "juanlopez",
    name: "Juan López",
    email: "juan@empresa.com",
    role: "user",
    lastActive: "2025-03-28T16:45:00",
    status: "active"
  },
  {
    id: 4,
    username: "anagarcia",
    name: "Ana García",
    email: "ana@empresa.com",
    role: "user",
    lastActive: "2025-03-15T09:20:00",
    status: "inactive"
  },
  {
    id: 5,
    username: "carlosmartinez",
    name: "Carlos Martínez",
    email: "carlos@empresa.com",
    role: "manager",
    lastActive: "2025-03-26T14:10:00",
    status: "active"
  }
];

// Función para formatear fechas
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Componente para Avatar con respaldo de iniciales si no hay imagen
function UserAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleColors: Record<string, string> = {
    admin: "bg-neon-purple/20 border-neon-purple text-neon-purple",
    manager: "bg-neon-accent/20 border-neon-accent text-neon-accent",
    user: "bg-neon-green/20 border-neon-green text-neon-green",
  };

  // Determinar el color basado en el rol o usar un color por defecto
  const getColorClass = (userName: string) => {
    // Simulando asignación de rol basada en el nombre para este ejemplo
    if (userName.toLowerCase().includes("admin")) return roleColors.admin;
    if (userName.toLowerCase().includes("maría") || userName.toLowerCase().includes("carlos")) return roleColors.manager;
    return roleColors.user;
  };

  const colorClass = getColorClass(name);

  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${colorClass} shadow-[0_0_10px_rgba(0,225,255,0.15)]`}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="font-medium text-sm">{initials}</span>
      )}
    </div>
  );
}

// Badge de estado para usuarios
function StatusBadge({ status }: { status: "active" | "inactive" }) {
  const statusClasses = {
    active: "bg-neon-green/10 text-neon-green border-neon-green/30 shadow-[0_0_8px_rgba(74,222,128,0.15)]",
    inactive: "bg-neon-red/10 text-neon-red border-neon-red/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]",
  };

  const statusText = {
    active: "Activo",
    inactive: "Inactivo",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs border ${statusClasses[status]}`}>
      {statusText[status]}
    </span>
  );
}

// Badge de rol para usuarios
function RoleBadge({ role }: { role: "admin" | "manager" | "user" }) {
  const roleClasses = {
    admin: "bg-neon-purple/10 text-neon-purple border-neon-purple/30 shadow-[0_0_8px_rgba(149,76,233,0.15)]",
    manager: "bg-neon-accent/10 text-neon-accent border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.15)]",
    user: "bg-neon-green/10 text-neon-green border-neon-green/30 shadow-[0_0_8px_rgba(74,222,128,0.15)]",
  };

  const roleText = {
    admin: "Administrador",
    manager: "Gerente",
    user: "Usuario",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs border ${roleClasses[role]}`}>
      {roleText[role]}
    </span>
  );
}

// Componente principal de la página de usuarios
export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "lastActive">("lastActive");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const { toast } = useToast();

  // Simulación de carga de usuarios
  const { data: users = mockUsers, isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      // Simulamos una llamada a la API - en producción, aquí iría la llamada real
      return new Promise<User[]>((resolve) => {
        setTimeout(() => resolve(mockUsers), 500);
      });
    }
  });

  // Filtrar y ordenar usuarios
  const filteredUsers = users.filter(user => {
    // Filtrar por estado
    if (filter !== "all" && user.status !== filter) return false;
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Ordenar usuarios
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === "asc"
        ? new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime()
        : new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    }
  });

  // Función para cambiar ordenamiento
  const toggleSort = (field: "name" | "lastActive") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Función para simular la creación de un usuario
  const handleAddUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Aquí iría la lógica para enviar a la API
    console.log({
      username: formData.get('username'),
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
    });
    
    toast({
      title: "Usuario creado",
      description: "El usuario se ha creado correctamente",
      variant: "default"
    });
    
    // Refrescar la lista de usuarios
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    
    setShowAddUserDialog(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-neon-text neon-text">Gestión de Usuarios</h1>
          <Button 
            onClick={() => setShowAddUserDialog(true)}
            className="bg-gradient-to-r from-neon-accent/80 to-neon-accent/40 hover:from-neon-accent/90 hover:to-neon-accent/50 text-white shadow-[0_0_15px_rgba(0,225,255,0.3)]"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-neon-medium/10 border border-neon-accent/30 shadow-[0_0_10px_rgba(0,225,255,0.15)]">
              <TabsTrigger value="all" className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent">
                Todos
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green">
                Activos
              </TabsTrigger>
              <TabsTrigger value="inactive" className="data-[state=active]:bg-neon-red/20 data-[state=active]:text-neon-red">
                Inactivos
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neon-text/50" />
              <Input
                placeholder="Buscar usuarios..."
                className="pl-9 w-64 bg-neon-medium/10 border-neon-accent/30 text-neon-text focus-visible:ring-neon-accent/50 placeholder:text-neon-text/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <UsersList 
              users={sortedUsers} 
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
            />
          </TabsContent>
          <TabsContent value="active" className="mt-0">
            <UsersList 
              users={sortedUsers.filter(user => user.status === 'active')} 
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
            />
          </TabsContent>
          <TabsContent value="inactive" className="mt-0">
            <UsersList 
              users={sortedUsers.filter(user => user.status === 'inactive')} 
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para crear usuario */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-md bg-neon-darker border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-neon-text neon-text">Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription className="text-neon-text/70">
              Ingresa los datos para crear un nuevo usuario en el sistema.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username" className="text-neon-text">Nombre de usuario</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    placeholder="usuario123" 
                    className="bg-neon-medium/20 border-neon-accent/30 text-neon-text focus-visible:ring-neon-accent/50 placeholder:text-neon-text/50"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name" className="text-neon-text">Nombre completo</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Nombre Apellido" 
                    className="bg-neon-medium/20 border-neon-accent/30 text-neon-text focus-visible:ring-neon-accent/50 placeholder:text-neon-text/50"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email" className="text-neon-text">Correo electrónico</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="usuario@ejemplo.com" 
                  className="bg-neon-medium/20 border-neon-accent/30 text-neon-text focus-visible:ring-neon-accent/50 placeholder:text-neon-text/50"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="role" className="text-neon-text">Rol</Label>
                <Select name="role" defaultValue="user">
                  <SelectTrigger className="bg-neon-medium/20 border-neon-accent/30 text-neon-text focus-visible:ring-neon-accent/50">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent className="bg-neon-darker border-neon-accent/30">
                    <SelectItem value="admin" className="text-neon-purple focus:bg-neon-purple/10">Administrador</SelectItem>
                    <SelectItem value="manager" className="text-neon-accent focus:bg-neon-accent/10">Gerente</SelectItem>
                    <SelectItem value="user" className="text-neon-green focus:bg-neon-green/10">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password" className="text-neon-text">Contraseña</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-neon-medium/20 border-neon-accent/30 text-neon-text focus-visible:ring-neon-accent/50 placeholder:text-neon-text/50"
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddUserDialog(false)}
                className="border-neon-red/30 text-neon-red hover:bg-neon-red/10 shadow-[0_0_8px_rgba(255,45,109,0.15)]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-neon-accent/80 to-neon-accent/40 hover:from-neon-accent/90 hover:to-neon-accent/50 text-white shadow-[0_0_15px_rgba(0,225,255,0.3)]"
              >
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de lista de usuarios
function UsersList({ 
  users, 
  isLoading,
  sortBy,
  sortOrder,
  toggleSort 
}: { 
  users: User[], 
  isLoading: boolean,
  sortBy: "name" | "lastActive",
  sortOrder: "asc" | "desc",
  toggleSort: (field: "name" | "lastActive") => void 
}) {
  const { toast } = useToast();
  
  const handleUserAction = (action: string, userId: number, userName: string) => {
    // Aquí iría la lógica para las acciones
    toast({
      title: `Acción: ${action}`,
      description: `Se ha ${action === 'edit' ? 'editado' : action === 'activate' ? 'activado' : 'desactivado'} al usuario ${userName}`,
      variant: "default"
    });
  };
  
  if (isLoading) {
    return (
      <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)]">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="text-neon-accent animate-pulse flex flex-col items-center">
              <Users className="h-12 w-12 mb-2" />
              <p className="text-sm text-neon-text/70">Cargando usuarios...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (users.length === 0) {
    return (
      <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)]">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="text-neon-accent flex flex-col items-center">
              <Users className="h-12 w-12 mb-2" />
              <p className="text-lg text-neon-text">No se encontraron usuarios</p>
              <p className="text-sm text-neon-text/70 mt-1">Intenta cambiar los filtros o crear uno nuevo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)]">
      <CardHeader className="bg-gradient-to-r from-neon-darker to-neon-medium/30 border-b border-neon-accent/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-neon-text">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-neon-accent" />
              Lista de Usuarios
            </div>
          </CardTitle>
          <CardDescription className="text-neon-text/70">
            Mostrando {users.length} usuario{users.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neon-medium/10 border-b border-neon-accent/20">
                <th className="px-4 py-3 text-left text-sm font-medium text-neon-text/70">Usuario</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neon-text/70">
                  <button 
                    onClick={() => toggleSort("name")}
                    className="flex items-center text-neon-text/70 hover:text-neon-accent"
                  >
                    Nombre
                    {sortBy === "name" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 text-neon-accent ${sortOrder === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neon-text/70">Rol</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neon-text/70">
                  <button 
                    onClick={() => toggleSort("lastActive")}
                    className="flex items-center text-neon-text/70 hover:text-neon-accent"
                  >
                    Última actividad
                    {sortBy === "lastActive" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 text-neon-accent ${sortOrder === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neon-text/70">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-neon-text/70">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b border-neon-accent/10 hover:bg-neon-medium/5 transition-colors"
                >
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <UserAvatar name={user.name} avatar={user.avatar} />
                      <div>
                        <p className="text-neon-text font-medium">{user.username}</p>
                        <p className="text-neon-text/70 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neon-text">{user.name}</td>
                  <td className="px-4 py-4 text-sm">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-4 text-sm text-neon-text/70">
                    {formatDate(user.lastActive)}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserAction('edit', user.id, user.name)}
                        className="h-8 border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20 shadow-[0_0_8px_rgba(0,225,255,0.15)]"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                      {user.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction('deactivate', user.id, user.name)}
                          className="h-8 border-neon-red/30 text-neon-red hover:bg-neon-red/10 shadow-[0_0_8px_rgba(255,45,109,0.15)]"
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction('activate', user.id, user.name)}
                          className="h-8 border-neon-green/30 text-neon-green hover:bg-neon-green/10 shadow-[0_0_8px_rgba(74,222,128,0.15)]"
                        >
                          Activar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}