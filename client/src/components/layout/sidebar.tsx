import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
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
  ChevronRight
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
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-neutral-200 h-full shrink-0">
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
              
              {/* Tareas section with dropdown */}
              <div>
                <button 
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md text-neutral-800 hover:bg-neutral-50"
                  onClick={() => toggleSection('tasks')}
                >
                  <div className="flex items-center">
                    <ListTodo className="h-5 w-5 text-neutral-500" />
                    <span className="ml-3">Gestión de tareas</span>
                  </div>
                  {expandedSections.tasks ? (
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  )}
                </button>
                
                {expandedSections.tasks && (
                  <div className="pl-10 mt-1 space-y-1">
                    <NavLink 
                      href="/tasks" 
                      icon={<ListTodo className="h-4 w-4" />} 
                      label="Todas las tareas" 
                      isSubmenu 
                    />
                    <NavLink 
                      href="/tasks/pending" 
                      icon={<FileText className="h-4 w-4" />} 
                      label="Pendientes" 
                      isSubmenu 
                    />
                    <NavLink 
                      href="/tasks/completed" 
                      icon={<FileText className="h-4 w-4" />} 
                      label="Completadas" 
                      isSubmenu 
                    />
                  </div>
                )}
              </div>
              
              <NavLink 
                href="/calendar" 
                icon={<Calendar className="h-5 w-5" />} 
                label="Calendario" 
              />
              
              {/* Reports section with dropdown */}
              <div>
                <button 
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md text-neutral-800 hover:bg-neutral-50"
                  onClick={() => toggleSection('reports')}
                >
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 text-neutral-500" />
                    <span className="ml-3">Informes</span>
                  </div>
                  {expandedSections.reports ? (
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  )}
                </button>
                
                {expandedSections.reports && (
                  <div className="pl-10 mt-1 space-y-1">
                    <NavLink 
                      href="/reports/productivity" 
                      icon={<BarChart className="h-4 w-4" />} 
                      label="Productividad" 
                      isSubmenu 
                    />
                    <NavLink 
                      href="/reports/status" 
                      icon={<BarChart className="h-4 w-4" />} 
                      label="Estado de tareas" 
                      isSubmenu 
                    />
                  </div>
                )}
              </div>
              
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
          
          <Separator className="my-5" />
          
          <div>
            <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Ayuda & Soporte
            </p>
            <div className="space-y-1">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-50">
                <HelpCircle className="h-5 w-5 text-neutral-500 mr-3" />
                Centro de ayuda
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-50">
                <MessageSquare className="h-5 w-5 text-neutral-500 mr-3" />
                Contacto
              </button>
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
      <div 
        className={cn(
          "flex items-center px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer",
          isActive 
            ? "bg-primary-50 text-primary-700" 
            : "text-neutral-800 hover:bg-neutral-50 hover:text-primary-700"
        )}
        onClick={() => window.location.href = href}
      >
        <div className={`${isActive ? 'text-primary-600' : 'text-neutral-500'} mr-3`}>
          {icon}
        </div>
        {label}
      </div>
    );
  }
  
  // For submenu items
  return (
    <div 
      className={cn(
        "flex items-center px-2 py-2 text-xs font-medium rounded-md cursor-pointer",
        isActive 
          ? "text-primary-700 bg-primary-50" 
          : "text-neutral-700 hover:bg-neutral-50 hover:text-primary-700"
      )}
      onClick={() => window.location.href = href}
    >
      <div className={`${isActive ? 'text-primary-600' : 'text-neutral-500'} mr-2`}>
        {icon}
      </div>
      {label}
    </div>
  );
}
