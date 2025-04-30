import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  Search, 
  Bell, 
  HelpCircle,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Loader2
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
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const toggleMobileMenu = () => {
    const event = new CustomEvent('toggle-mobile-menu');
    window.dispatchEvent(event);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente",
        });
        navigate('/auth');
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    });
  };
  
  return (
    <header className="border-b border-neon-accent/20 shadow-md z-20 sticky top-0" style={{ backgroundColor: 'var(--neon-darker)' }}>
      <div className="px-5 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-neon-text hover:text-neon-accent focus:outline-none transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="md:hidden ml-2 flex items-center">
            <Link to="/" className="cursor-pointer">
              <span className="font-bold text-lg text-neon-accent neon-text">Aitorin</span>
            </Link>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-neon-accent/70 h-4 w-4" />
            </div>
            <Input
              placeholder="Buscar tareas, proyectos..."
              className="pl-10 pr-3 py-2 h-9 bg-neon-dark/50 border-neon-accent/30 rounded-lg text-sm text-neon-text 
              focus-visible:ring-neon-accent focus-visible:border-neon-accent/50 focus-visible:ring-opacity-40
              placeholder:text-neon-text/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-8 w-8 rounded-full bg-neon-medium/50 border border-neon-accent/30 text-neon-text hover:text-neon-accent hover:bg-neon-medium/80 focus:outline-none transition-all duration-300 flex items-center justify-center neon-box">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-neon-accent border-2 border-neon-dark rounded-full shadow-[0_0_4px_rgba(0,225,255,0.7)]"></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0 overflow-hidden rounded-xl border border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)] bg-neon-dark" align="end">
              <div className="px-4 py-3 bg-neon-darker/70 border-b border-neon-accent/30 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-neon-text neon-text">Notificaciones</h3>
                <Badge className="bg-neon-medium border-neon-accent/30 text-neon-accent hover:bg-neon-medium">3 nuevas</Badge>
              </div>
              <div className="max-h-[320px] overflow-y-auto divide-y divide-neon-accent/20">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-neon-medium/20 cursor-pointer transition-all duration-300">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-9 w-9 rounded-full bg-neon-medium/50 flex items-center justify-center text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
                          <Bell className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-neon-text">Tarea actualizada</p>
                          <p className="text-xs text-neon-text/60">2h</p>
                        </div>
                        <p className="text-xs text-neon-text/80 leading-relaxed">
                          Se ha actualizado el estado de la tarea "Diseño de UI" a completado.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-neon-accent/20 bg-neon-darker/70">
                <button className="w-full text-center text-xs font-medium text-neon-accent hover:text-neon-accent/80 py-1 neon-text">
                  Ver todas las notificaciones
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button className="h-8 w-8 rounded-full bg-neon-medium/50 border border-neon-accent/30 text-neon-text hover:text-neon-accent hover:bg-neon-medium/80 focus:outline-none transition-all duration-300 flex items-center justify-center neon-box">
            <HelpCircle className="h-4 w-4" />
          </button>
          
          <button 
            onClick={toggleTheme}
            className="h-8 w-8 rounded-full bg-neon-medium/50 border border-neon-accent/30 text-neon-text hover:text-neon-accent hover:bg-neon-medium/80 focus:outline-none transition-all duration-300 flex items-center justify-center neon-box"
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <Separator orientation="vertical" className="h-6 mx-1 bg-neon-accent/20" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 focus:outline-none">
                <Avatar className="h-8 w-8 border border-neon-accent shadow-[0_0_8px_rgba(0,225,255,0.3)]">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className="bg-neon-medium text-neon-accent text-xs">
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neon-text">{user?.name || user?.username || 'Usuario'}</p>
                  <p className="text-xs text-neon-text/70">{user?.email || ''}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl border border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)] bg-neon-dark" align="end">
              <div className="p-3 border-b border-neon-accent/20 bg-neon-darker/70">
                <p className="text-sm font-medium text-neon-text">{user?.name || user?.username || 'Usuario'}</p>
                <p className="text-xs text-neon-text/70">{user?.email || ''}</p>
              </div>
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className="focus:bg-neon-medium/30 focus:text-neon-accent text-neon-text hover:text-neon-accent hover:bg-neon-medium/20 transition-colors"
                  onClick={() => navigate("/profile")}
                >
                  <User className="mr-2 h-4 w-4 text-neon-text/70" />
                  <span>Mi perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="focus:bg-neon-medium/30 focus:text-neon-accent text-neon-text hover:text-neon-accent hover:bg-neon-medium/20 transition-colors"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4 text-neon-text/70" />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-neon-accent/20" />
              <DropdownMenuItem 
                className="focus:bg-neon-medium/30 focus:text-neon-accent text-neon-text hover:text-neon-accent hover:bg-neon-medium/20 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4 text-neon-text/70" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
