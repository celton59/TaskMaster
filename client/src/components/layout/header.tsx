import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  Search, 
  Bell, 
  HelpCircle,
  User,
  Settings,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const toggleMobileMenu = () => {
    const event = new CustomEvent('toggle-mobile-menu');
    window.dispatchEvent(event);
  };
  
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm z-20 sticky top-0">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-neutral-500 hover:text-neutral-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="md:hidden ml-2 font-heading font-bold text-xl text-primary-800">TaskMaster</div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-neutral-400 h-4 w-4" />
            </div>
            <Input
              placeholder="Buscar tareas..."
              className="pl-10 pr-3 py-2 bg-neutral-50 border-neutral-200 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-1.5 rounded-full bg-neutral-100 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none transition-colors">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary-500">3</Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-2 py-2 hover:bg-neutral-50 cursor-pointer">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                          <Bell className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-neutral-900">Tarea actualizada</p>
                        <p className="text-xs text-neutral-500">Se ha actualizado el estado de la tarea "Diseño de UI"</p>
                        <p className="text-xs text-neutral-400 mt-1">Hace 2 horas</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700">
                  Ver todas las notificaciones
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button className="p-1.5 rounded-full bg-neutral-100 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
          
          <Separator orientation="vertical" className="h-8 mx-1" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 focus:outline-none">
                <Avatar className="h-8 w-8 ring-2 ring-neutral-200">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className="bg-primary-100 text-primary-700">AD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-800">Admin Demo</p>
                  <p className="text-xs text-neutral-500">Administrador</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
