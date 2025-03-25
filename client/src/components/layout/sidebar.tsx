import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  CheckCircle2
} from "lucide-react";
import type { Category } from "@shared/schema";

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tasks: true,
    reports: false
  });
  
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
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-100 h-full shrink-0 shadow-lg overflow-hidden">
        <div className="py-2 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              <Home className="h-4 w-4" />
            </div>
            <h1 className="font-bold text-base ml-2 text-neutral-900">TaskMaster</h1>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="px-3 py-0.5">
          <Button 
            className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm h-8"
            size="sm"
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">Nueva tarea</span>
          </Button>
        </div>
        
        <nav className="flex-1 px-2 py-0.5 flex flex-col overflow-hidden">
          <div className="space-y-0.5 px-1 flex-shrink-0">            
            <NavLink 
              href="/" 
              icon={<Home className="h-5 w-5" />} 
              label="Inicio" 
            />
            
            <NavLink 
              href="/dashboard" 
              icon={<LayoutDashboard className="h-5 w-5" />} 
              label="Dashboard" 
            />
              
            {/* Tareas section with dropdown - Always visible links */}
            <div>
              <Link 
                to="/tasks"
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md",
                  location.includes('/tasks') ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <div className="flex items-center">
                  <ListTodo className={`h-5 w-5 ${location.includes('/tasks') ? 'text-primary-600' : 'text-neutral-500'}`} />
                  <span className="ml-2">Gestión de tareas</span>
                </div>
              </Link>
            </div>
            
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
              href="/users" 
              icon={<Users className="h-5 w-5" />} 
              label="Usuarios" 
            />
          </div>
          
          <Separator className="my-2 bg-neutral-100 flex-shrink-0" />
          
          <div className="px-2 pt-0 flex-shrink-0">
            <div className="text-sm font-medium text-neutral-500 px-2 py-1">
              Categorías
            </div>
            
            {/* Mostrar solo las primeras 3 categorías para evitar scroll */}
            {categories.slice(0, 3).map((category) => (
              <div 
                key={category.id} 
                className="flex justify-between items-center px-2 py-1 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <span className={`h-2.5 w-2.5 rounded-full ${getCategoryColor(category.color)} mr-2`}></span>
                  {category.name}
                </div>
                <Badge 
                  className="bg-neutral-100 border-0 text-xs font-normal h-5 text-neutral-600 hover:bg-neutral-100"
                >
                  {Math.floor(Math.random() * 10) + 2}
                </Badge>
              </div>
            ))}
            
            {categories.length > 3 && (
              <div className="px-2 py-1 text-xs text-primary-600 font-medium cursor-pointer hover:underline">
                Ver más ({categories.length - 3})
              </div>
            )}
          </div>
        </nav>
        
        <div className="p-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 border border-white">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">AD</AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-sm font-medium text-neutral-800">Admin Demo</p>
                <p className="text-xs text-neutral-500">admin@example.com</p>
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
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
            className="fixed inset-0 bg-neutral-600 bg-opacity-75" 
            aria-hidden="true"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            {/* Mobile menu content - mirror of desktop sidebar */}
            <div className="py-5 px-6 border-b border-neutral-200 flex items-center">
              <div className="h-10 w-10 rounded-md bg-primary-700 flex items-center justify-center text-white">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h1 className="font-bold text-xl ml-3 text-neutral-900">TaskMaster</h1>
            </div>
            
            <nav className="flex-1 py-5 px-5 overflow-y-auto">
              <div className="mb-6">
                <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Menú principal
                </p>
                
                <div className="space-y-1">
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
                    href="/users" 
                    icon={<Users className="h-5 w-5" />} 
                    label="Usuarios" 
                  />
                </div>
              </div>
              
              <Separator className="my-5" />
              
              <div className="mb-6">
                <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Categorías
                </p>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <div key={category.id} className="flex justify-between items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full ${getCategoryColor(category.color)} mr-3`}></span>
                        {category.name}
                      </div>
                      <Badge variant="outline" className="bg-neutral-50 text-neutral-600 text-xs font-normal">
                        {Math.floor(Math.random() * 10) + 2}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </nav>
            
            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className="bg-primary-100 text-primary-700">AD</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-800">Admin Demo</p>
                  <p className="text-xs text-neutral-500">Administrador</p>
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
  
  // For main menu items
  if (!isSubmenu) {
    return (
      <Link 
        to={href}
        className={cn(
          "flex items-center px-2 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors",
          isActive 
            ? "bg-primary-50 text-primary-700" 
            : "text-neutral-700 hover:bg-neutral-50 hover:text-primary-700"
        )}
      >
        <div className={cn(
          "flex-shrink-0 mr-2 transition-colors",
          isActive ? 'text-primary-600' : 'text-neutral-400'
        )}>
          {icon}
        </div>
        <span className="truncate">{label}</span>
        {isActive && <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 rounded-r-full" />}
      </Link>
    );
  }
  
  // For submenu items
  return (
    <Link 
      to={href}
      className={cn(
        "flex items-center px-2 py-1 text-sm font-medium rounded-md cursor-pointer transition-colors",
        isActive 
          ? "text-primary-700 bg-primary-50" 
          : "text-neutral-600 hover:bg-neutral-50 hover:text-primary-700"
      )}
    >
      <div className={cn(
        "flex-shrink-0 mr-1.5 transition-colors",
        isActive ? 'text-primary-600' : 'text-neutral-400'
      )}>
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </Link>
  );
}
