import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/use-theme";
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  BarChart, 
  Settings,
  Users,
  FileText,
  MessageSquare,
  Mail,
  HelpCircle,
  Globe,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  Home,
  LogOut,
  PlusCircle,
  Clock,
  CheckCircle2,
  Bot,
  MessageCircle,
  Activity,
  FolderKanban,
  Book
} from "lucide-react";
import type { Category } from "@shared/schema";

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tasks: true,
    reports: false
  });
  const { isDarkMode } = useTheme();
  
  // Get categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });
  
  useEffect(() => {
    // Close the mobile menu when location changes
    setIsMobileMenuOpen(false);
  }, [location]);
  
  useEffect(() => {
    // Listen for mobile menu toggle events from header
    const handleMobileMenuToggle = () => {
      setIsMobileMenuOpen(prevState => !prevState);
    };
    
    window.addEventListener('toggle-mobile-menu', handleMobileMenuToggle);
    
    return () => {
      window.removeEventListener('toggle-mobile-menu', handleMobileMenuToggle);
    };
  }, []);
  
  // Get proper category color
  const getCategoryColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-primary-500";
      case "purple": return "bg-secondary-500";
      case "orange": return "bg-amber-500";
      case "green": return "bg-emerald-500";
      case "red": return "bg-rose-500";
      default: return "bg-slate-500";
    }
  };
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col w-64 h-full shrink-0 shadow-lg overflow-hidden border-r",
        isDarkMode 
          ? "bg-neon-dark border-neon-accent/20" 
          : "bg-white border-gray-200"
      )}>
        <div className="py-4 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center cursor-pointer">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              isDarkMode 
                ? "bg-neon-accent/90 text-neon-dark" 
                : "bg-blue-600 text-white"
            )}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h1 className={cn(
              "font-bold text-base ml-2",
              isDarkMode ? "text-neon-text" : "text-gray-800"
            )}>
              Aitorin
            </h1>
          </Link>
          <Button 
            size="icon" 
            variant="ghost" 
            className={cn(
              "h-7 w-7 rounded-full",
              isDarkMode 
                ? "text-neon-text hover:text-neon-accent hover:bg-neon-medium" 
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
            )}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="px-3 py-2">
          <Button 
            className={cn(
              "w-full h-8 transition-all duration-300",
              isDarkMode 
                ? "bg-transparent text-neon-accent border border-neon-accent hover:bg-neon-medium" 
                : "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50"
            )}
            size="sm"
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">Nueva tarea</span>
          </Button>
        </div>
        
        <nav className="flex-1 px-2 py-0.5 flex flex-col overflow-hidden">
          <div className="space-y-1.5 px-1 flex-shrink-0 mt-2">            
            <NavLink 
              href="/" 
              icon={<LayoutDashboard className="h-5 w-5" />} 
              label="Dashboard" 
            />
              
            {/* Tareas section with dropdown - Always visible links */}
            <NavLink 
              href="/tasks" 
              icon={<ListTodo className="h-5 w-5" />} 
              label="Gestión de tareas" 
            />
            
            <NavLink 
              href="/projects" 
              icon={<FolderKanban className="h-5 w-5" />} 
              label="Proyectos" 
            />
            
            <NavLink 
              href="/habits" 
              icon={<Activity className="h-5 w-5" />} 
              label="Hábitos" 
            />
            
            <NavLink 
              href="/documentation" 
              icon={<Book className="h-5 w-5" />} 
              label="Documentación" 
            />
            
            <NavLink 
              href="/calendar" 
              icon={<Calendar className="h-5 w-5" />} 
              label="Calendario" 
            />
            
            <NavLink 
              href="/reports" 
              icon={<BarChart className="h-5 w-5" />} 
              label="Informes" 
            />
            
            <NavLink 
              href="/assistant" 
              icon={<Bot className="h-5 w-5" />} 
              label="Asistente AI" 
            />
            
            <NavLink 
              href="/users" 
              icon={<Users className="h-5 w-5" />} 
              label="Usuarios" 
            />
            
            <NavLink 
              href="/whatsapp-settings" 
              icon={<MessageCircle className="h-5 w-5" />} 
              label="WhatsApp" 
            />
          </div>
          
          <Separator className={cn(
            "my-3 flex-shrink-0",
            isDarkMode ? "bg-neon-accent/20" : "bg-gray-200"
          )} />
          
          <div className="px-2 pt-0 flex-shrink-0">
            <div className={cn(
              "px-2 py-1 uppercase tracking-wider text-xs font-medium",
              isDarkMode ? "text-neon-accent" : "text-blue-600"
            )}>
              Categorías
            </div>
            
            {/* Mostrar solo las primeras 3 categorías para evitar scroll */}
            {categories.slice(0, 3).map((category) => (
              <div 
                key={category.id} 
                className={cn(
                  "flex justify-between items-center px-2 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-all duration-300",
                  isDarkMode 
                    ? "text-neon-text hover:bg-neon-medium/30" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center">
                  <span className={cn(
                    `h-2.5 w-2.5 rounded-full ${getCategoryColor(category.color)} mr-2`,
                    isDarkMode && "shadow-[0_0_4px_rgba(0,225,255,0.7)]"
                  )}></span>
                  {category.name}
                </div>
                <Badge 
                  className={cn(
                    "text-xs font-normal h-5 border-0",
                    isDarkMode 
                      ? "bg-neon-medium text-neon-text hover:bg-neon-medium/80" 
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  )}
                >
                  {Math.floor(Math.random() * 10) + 2}
                </Badge>
              </div>
            ))}
            
            {categories.length > 3 && (
              <div className={cn(
                "px-2 py-1 text-xs font-medium cursor-pointer hover:underline",
                isDarkMode ? "text-neon-accent" : "text-blue-600"
              )}>
                Ver más ({categories.length - 3})
              </div>
            )}
          </div>
        </nav>
        
        <div className={cn(
          "p-3 border-t mt-3",
          isDarkMode ? "border-neon-accent/20" : "border-gray-200" 
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
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
                )}>AD</AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-neon-text" : "text-gray-800"
                )}>Admin Demo</p>
                <p className={cn(
                  "text-xs",
                  isDarkMode ? "text-neon-text/70" : "text-gray-500"
                )}>admin@example.com</p>
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-7 w-7 rounded-full",
                isDarkMode 
                  ? "text-neon-text hover:text-neon-accent hover:bg-neon-medium" 
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              )}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 flex z-40" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-neon-darker/90 backdrop-blur-sm" 
            aria-hidden="true"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-neon-dark border-r border-neon-accent/30 shadow-[0_0_25px_rgba(0,225,255,0.2)]">
            {/* Mobile menu content - mirror of desktop sidebar */}
            <div className="py-5 px-6 border-b border-neon-accent/20 flex items-center">
              <Link to="/" className="flex items-center cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="h-10 w-10 rounded-lg bg-neon-accent/90 flex items-center justify-center text-neon-dark neon-box">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h1 className="font-bold text-xl ml-3 text-neon-text neon-text">Aitorin</h1>
              </Link>
            </div>
            
            <nav className="flex-1 py-5 px-5 overflow-y-auto">
              <div className="mb-6">
                <p className="px-3 text-xs font-semibold text-neon-accent uppercase tracking-wider mb-3">
                  Menú principal
                </p>
                
                <div className="space-y-1.5">
                  <NavLink 
                    href="/" 
                    icon={<LayoutDashboard className="h-5 w-5" />} 
                    label="Dashboard" 
                  />
                  <NavLink 
                    href="/tasks" 
                    icon={<ListTodo className="h-5 w-5" />} 
                    label="Tareas" 
                  />
                  <NavLink 
                    href="/projects" 
                    icon={<FolderKanban className="h-5 w-5" />} 
                    label="Proyectos" 
                  />
                  <NavLink 
                    href="/habits" 
                    icon={<Activity className="h-5 w-5" />} 
                    label="Hábitos" 
                  />
                  <NavLink 
                    href="/documentation" 
                    icon={<Book className="h-5 w-5" />} 
                    label="Documentación" 
                  />
                  <NavLink 
                    href="/calendar" 
                    icon={<Calendar className="h-5 w-5" />} 
                    label="Calendario" 
                  />
                  <NavLink 
                    href="/reports" 
                    icon={<BarChart className="h-5 w-5" />} 
                    label="Informes" 
                  />
                  <NavLink 
                    href="/assistant" 
                    icon={<Bot className="h-5 w-5" />} 
                    label="Asistente AI" 
                  />
                  <NavLink 
                    href="/users" 
                    icon={<Users className="h-5 w-5" />} 
                    label="Usuarios" 
                  />
                  <NavLink 
                    href="/whatsapp-settings" 
                    icon={<MessageCircle className="h-5 w-5" />} 
                    label="WhatsApp" 
                  />
                </div>
              </div>
              
              <Separator className="my-5 bg-neon-accent/20" />
              
              <div className="mb-6">
                <p className="px-3 text-xs font-semibold text-neon-accent uppercase tracking-wider mb-3">
                  Categorías
                </p>
                <div className="space-y-1.5">
                  {categories.map((category) => (
                    <div key={category.id} className="flex justify-between items-center px-3 py-2 text-sm font-medium rounded-md text-neon-text hover:bg-neon-medium/30 cursor-pointer transition-all duration-300">
                      <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full ${getCategoryColor(category.color)} mr-3 shadow-[0_0_4px_rgba(0,225,255,0.7)]`}></span>
                        {category.name}
                      </div>
                      <Badge className="bg-neon-medium border-0 text-xs font-normal text-neon-text">
                        {Math.floor(Math.random() * 10) + 2}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </nav>
            
            <div className="p-4 border-t border-neon-accent/20 bg-neon-darker/50">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 border border-neon-accent shadow-[0_0_8px_rgba(0,225,255,0.3)]">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className="bg-neon-medium text-neon-accent">AD</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neon-text">Admin Demo</p>
                  <p className="text-xs text-neon-text/70">Administrador</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isSubmenu?: boolean;
}

function NavLink({ href, icon, label, isSubmenu = false }: NavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;
  const { isDarkMode } = useTheme();
  
  // For main menu items
  if (!isSubmenu) {
    return (
      <Link 
        to={href}
        className={cn(
          "flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-300 relative overflow-hidden",
          isDarkMode
            ? isActive 
              ? "text-neon-accent bg-neon-medium/40" 
              : "text-neon-text hover:bg-neon-medium/30 hover:text-neon-accent"
            : isActive 
              ? "text-blue-600 bg-blue-50" 
              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
        )}
      >
        <div className={cn(
          "flex-shrink-0 mr-2.5 transition-colors",
          isDarkMode
            ? isActive ? 'text-neon-accent' : 'text-neon-text'
            : isActive ? 'text-blue-600' : 'text-gray-500'
        )}>
          {icon}
        </div>
        <span className={cn(
          "truncate",
          isDarkMode
            ? isActive && "text-neon-accent"
            : isActive && "text-blue-600 font-medium"
        )}>{label}</span>
        {isActive && (
          <>
            <div className={cn(
              "absolute inset-y-0 left-0 w-1 rounded-r-full",
              isDarkMode 
                ? "bg-neon-accent" 
                : "bg-blue-600"
            )} />
            {isDarkMode && (
              <div className="absolute inset-0 border border-neon-accent/20 rounded-md pointer-events-none" />
            )}
          </>
        )}
      </Link>
    );
  }
  
  // For submenu items
  return (
    <Link 
      to={href}
      className={cn(
        "flex items-center px-2 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-all duration-300",
        isDarkMode
          ? isActive 
            ? "text-neon-accent bg-neon-medium/40" 
            : "text-neon-text/80 hover:bg-neon-medium/30 hover:text-neon-accent"
          : isActive 
            ? "text-blue-600 bg-blue-50/70" 
            : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
      )}
    >
      <div className={cn(
        "flex-shrink-0 mr-2 transition-colors",
        isDarkMode
          ? isActive ? 'text-neon-accent' : 'text-neon-text/70'
          : isActive ? 'text-blue-600' : 'text-gray-500'
      )}>
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </Link>
  );
}
