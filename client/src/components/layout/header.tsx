import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
  const { theme, toggleTheme, isDarkMode } = useTheme();
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
    <header className={cn(
        "border-b shadow-md z-20 sticky top-0",
        isDarkMode 
          ? "border-neon-accent/20 bg-neon-darker" 
          : "border-gray-200 bg-white"
      )}>
      <div className="px-5 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className={cn(
              "md:hidden focus:outline-none transition-colors",
              isDarkMode 
                ? "text-neon-text hover:text-neon-accent" 
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="md:hidden ml-2 flex items-center">
            <Link to="/" className="cursor-pointer">
              <span className={cn(
                "font-bold text-lg",
                isDarkMode ? "text-neon-accent" : "text-blue-600"
              )}>Aitorin</span>
            </Link>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={cn(
                "h-4 w-4",
                isDarkMode ? "text-neon-accent/70" : "text-gray-400"
              )} />
            </div>
            <Input
              placeholder="Buscar tareas, proyectos..."
              className={cn(
                "pl-10 pr-3 py-2 h-9 text-sm rounded-lg",
                isDarkMode 
                  ? "bg-neon-dark/50 border-neon-accent/30 text-neon-text focus-visible:ring-neon-accent focus-visible:border-neon-accent/50 focus-visible:ring-opacity-40 placeholder:text-neon-text/40" 
                  : "bg-gray-50 border-gray-200 text-gray-800 focus-visible:ring-blue-500 focus-visible:border-blue-400 focus-visible:ring-opacity-40 placeholder:text-gray-400"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "relative h-8 w-8 rounded-full border focus:outline-none transition-all duration-300 flex items-center justify-center",
                isDarkMode 
                  ? "bg-neon-medium/50 border-neon-accent/30 text-neon-text hover:text-neon-accent hover:bg-neon-medium/80" 
                  : "bg-gray-100 border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-200"
              )}>
                <Bell className="h-4 w-4" />
                <span className={cn(
                  "absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full",
                  isDarkMode 
                    ? "bg-neon-accent border-2 border-neon-dark shadow-[0_0_4px_rgba(0,225,255,0.7)]"
                    : "bg-blue-500 border-2 border-white"
                )}></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn(
              "w-80 p-0 overflow-hidden rounded-xl border",
              isDarkMode
                ? "border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)] bg-neon-dark"
                : "border-gray-200 shadow-lg bg-white"
            )} align="end">
              <div className={cn(
                "px-4 py-3 border-b flex justify-between items-center",
                isDarkMode 
                  ? "bg-neon-darker/70 border-neon-accent/30" 
                  : "bg-gray-50 border-gray-200"
              )}>
                <h3 className={cn(
                  "text-sm font-semibold",
                  isDarkMode ? "text-neon-text" : "text-gray-800"
                )}>Notificaciones</h3>
                <Badge className={cn(
                  isDarkMode
                    ? "bg-neon-medium border-neon-accent/30 text-neon-accent hover:bg-neon-medium"
                    : "bg-blue-100 border-blue-200 text-blue-600 hover:bg-blue-200"
                )}>3 nuevas</Badge>
              </div>
              <div className={cn(
                "max-h-[320px] overflow-y-auto divide-y",
                isDarkMode ? "divide-neon-accent/20" : "divide-gray-200"
              )}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={cn(
                    "px-4 py-3 cursor-pointer transition-all duration-300",
                    isDarkMode 
                      ? "hover:bg-neon-medium/20" 
                      : "hover:bg-gray-50"
                  )}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center border",
                          isDarkMode 
                            ? "bg-neon-medium/50 text-neon-accent border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]" 
                            : "bg-blue-100 text-blue-600 border-blue-200"
                        )}>
                          <Bell className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className={cn(
                            "text-sm font-medium",
                            isDarkMode ? "text-neon-text" : "text-gray-800"
                          )}>Tarea actualizada</p>
                          <p className={cn(
                            "text-xs",
                            isDarkMode ? "text-neon-text/60" : "text-gray-500"
                          )}>2h</p>
                        </div>
                        <p className={cn(
                          "text-xs leading-relaxed",
                          isDarkMode ? "text-neon-text/80" : "text-gray-600"
                        )}>
                          Se ha actualizado el estado de la tarea "Diseño de UI" a completado.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={cn(
                "p-3 border-t",
                isDarkMode 
                  ? "border-neon-accent/20 bg-neon-darker/70" 
                  : "border-gray-200 bg-gray-50"
              )}>
                <button className={cn(
                  "w-full text-center text-xs font-medium py-1",
                  isDarkMode 
                    ? "text-neon-accent hover:text-neon-accent/80" 
                    : "text-blue-600 hover:text-blue-700"
                )}>
                  Ver todas las notificaciones
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button className={cn(
            "h-8 w-8 rounded-full border focus:outline-none transition-all duration-300 flex items-center justify-center",
            isDarkMode 
              ? "bg-neon-medium/50 border-neon-accent/30 text-neon-text hover:text-neon-accent hover:bg-neon-medium/80" 
              : "bg-gray-100 border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-200"
          )}>
            <HelpCircle className="h-4 w-4" />
          </button>
          
          <button 
            onClick={toggleTheme}
            className={cn(
              "h-8 w-8 rounded-full border focus:outline-none transition-all duration-300 flex items-center justify-center",
              isDarkMode 
                ? "bg-neon-medium/50 border-neon-accent/30 text-neon-text hover:text-neon-accent hover:bg-neon-medium/80" 
                : "bg-gray-100 border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-200"
            )}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <Separator orientation="vertical" className={cn(
            "h-6 mx-1",
            isDarkMode ? "bg-neon-accent/20" : "bg-gray-200"
          )} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 focus:outline-none">
                <Avatar className={cn(
                  "h-8 w-8 border",
                  isDarkMode 
                    ? "border-neon-accent shadow-[0_0_8px_rgba(0,225,255,0.3)]" 
                    : "border-gray-200"
                )}>
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className={cn(
                    "text-xs",
                    isDarkMode 
                      ? "bg-neon-medium text-neon-accent" 
                      : "bg-blue-100 text-blue-600"
                  )}>
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-neon-text" : "text-gray-800"
                  )}>{user?.name || user?.username || 'Usuario'}</p>
                  <p className={cn(
                    "text-xs",
                    isDarkMode ? "text-neon-text/70" : "text-gray-500"
                  )}>{user?.email || ''}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn(
              "w-56 rounded-xl border",
              isDarkMode 
                ? "border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)] bg-neon-dark" 
                : "border-gray-200 shadow-lg bg-white"
            )} align="end">
              <div className={cn(
                "p-3 border-b",
                isDarkMode 
                  ? "border-neon-accent/20 bg-neon-darker/70" 
                  : "border-gray-200 bg-gray-50"
              )}>
                <p className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-neon-text" : "text-gray-800"
                )}>{user?.name || user?.username || 'Usuario'}</p>
                <p className={cn(
                  "text-xs",
                  isDarkMode ? "text-neon-text/70" : "text-gray-500"
                )}>{user?.email || ''}</p>
              </div>
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className={cn(
                    "transition-colors",
                    isDarkMode 
                      ? "focus:bg-neon-medium/30 focus:text-neon-accent text-neon-text hover:text-neon-accent hover:bg-neon-medium/20" 
                      : "focus:bg-blue-50 focus:text-blue-700 text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                  )}
                  onClick={() => navigate("/profile")}
                >
                  <User className={cn(
                    "mr-2 h-4 w-4",
                    isDarkMode ? "text-neon-text/70" : "text-gray-500"
                  )} />
                  <span>Mi perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(
                    "transition-colors",
                    isDarkMode 
                      ? "focus:bg-neon-medium/30 focus:text-neon-accent text-neon-text hover:text-neon-accent hover:bg-neon-medium/20" 
                      : "focus:bg-blue-50 focus:text-blue-700 text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                  )}
                  onClick={() => navigate("/settings")}
                >
                  <Settings className={cn(
                    "mr-2 h-4 w-4",
                    isDarkMode ? "text-neon-text/70" : "text-gray-500"
                  )} />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className={cn(
                isDarkMode ? "bg-neon-accent/20" : "bg-gray-200"
              )} />
              <DropdownMenuItem 
                className={cn(
                  "transition-colors",
                  isDarkMode 
                    ? "focus:bg-neon-medium/30 focus:text-neon-accent text-neon-text hover:text-neon-accent hover:bg-neon-medium/20" 
                    : "focus:bg-blue-50 focus:text-blue-700 text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                )}
                onClick={handleLogout}
              >
                <LogOut className={cn(
                  "mr-2 h-4 w-4",
                  isDarkMode ? "text-neon-text/70" : "text-gray-500"
                )} />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
