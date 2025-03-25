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
    <header className="bg-white border-b border-neutral-100 shadow-sm z-20 sticky top-0">
      <div className="px-5 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-neutral-500 hover:text-neutral-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="md:hidden ml-2 flex items-center">
            <span className="font-bold text-lg text-neutral-900">Aitorin</span>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-neutral-400 h-4 w-4" />
            </div>
            <Input
              placeholder="Buscar tareas, proyectos..."
              className="pl-10 pr-3 py-2 h-9 bg-neutral-50 border-neutral-200 rounded-lg text-sm focus-visible:ring-primary-500 focus-visible:border-primary-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-8 w-8 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 focus:outline-none transition-colors flex items-center justify-center">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-primary-500 border-2 border-white rounded-full"></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0 overflow-hidden rounded-xl border border-neutral-100 shadow-lg" align="end">
              <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-neutral-900">Notificaciones</h3>
                <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">3 nuevas</Badge>
              </div>
              <div className="max-h-[320px] overflow-y-auto divide-y divide-neutral-100">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-neutral-50 cursor-pointer">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100">
                          <Bell className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-neutral-900">Tarea actualizada</p>
                          <p className="text-xs text-neutral-500">2h</p>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          Se ha actualizado el estado de la tarea "Diseño de UI" a completado.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-neutral-100 bg-neutral-50">
                <button className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-700 py-1">
                  Ver todas las notificaciones
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button className="h-8 w-8 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 focus:outline-none transition-colors flex items-center justify-center">
            <HelpCircle className="h-4 w-4" />
          </button>
          
          <Separator orientation="vertical" className="h-6 mx-1 bg-neutral-200" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 focus:outline-none">
                <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-neutral-200">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">AD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-800">Admin Demo</p>
                  <p className="text-xs text-neutral-500">admin@example.com</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl border border-neutral-100 shadow-lg" align="end">
              <div className="p-3 border-b border-neutral-100">
                <p className="text-sm font-medium text-neutral-900">Admin Demo</p>
                <p className="text-xs text-neutral-500">admin@example.com</p>
              </div>
              <DropdownMenuGroup>
                <DropdownMenuItem className="focus:bg-neutral-50 focus:text-neutral-900">
                  <User className="mr-2 h-4 w-4 text-neutral-500" />
                  <span>Mi perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-neutral-50 focus:text-neutral-900">
                  <Settings className="mr-2 h-4 w-4 text-neutral-500" />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:bg-neutral-50 focus:text-neutral-900">
                <LogOut className="mr-2 h-4 w-4 text-neutral-500" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
