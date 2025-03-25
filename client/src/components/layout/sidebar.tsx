import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  PieChart, 
  Settings 
} from "lucide-react";
import type { Category } from "@shared/schema";

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });
  
  useEffect(() => {
    // Close the mobile menu when location changes
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Get proper category color
  const getCategoryColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-primary-500";
      case "purple": return "bg-secondary-500";
      case "orange": return "bg-accent-500";
      case "green": return "bg-success-500";
      case "red": return "bg-error-500";
      default: return "bg-gray-500";
    }
  };
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 h-full shrink-0">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="font-heading font-bold text-xl ml-2 text-neutral-800">TaskMaster</h1>
          </div>
        </div>
        
        <nav className="flex-1 pt-4 px-2 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            <NavLink href="/" icon={<LayoutDashboard className="mr-3 h-5 w-5" />} label="Dashboard" />
            <NavLink href="/tasks" icon={<ListTodo className="mr-3 h-5 w-5" />} label="Tareas" />
            <NavLink href="/calendar" icon={<Calendar className="mr-3 h-5 w-5" />} label="Calendario" />
            <NavLink href="/reports" icon={<PieChart className="mr-3 h-5 w-5" />} label="Informes" />
            <NavLink href="/settings" icon={<Settings className="mr-3 h-5 w-5" />} label="Configuración" />
          </div>
          
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Categorías
            </h3>
            <div className="mt-2 space-y-1">
              {categories.map((category) => (
                <div key={category.id} className="flex justify-between items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100">
                  <div className="flex items-center">
                    <span className={`h-2 w-2 rounded-full ${getCategoryColor(category.color)} mr-3`}></span>
                    {category.name}
                  </div>
                  <Badge variant="outline" className="bg-neutral-100 text-neutral-600 text-xs">
                    {Math.floor(Math.random() * 10) + 2}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-800">Administrator</p>
              <p className="text-xs text-neutral-500">admin@example.com</p>
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
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center text-white">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h1 className="font-heading font-bold text-xl ml-2 text-neutral-800">TaskMaster</h1>
              </div>
            </div>
            
            <nav className="flex-1 pt-4 px-2 overflow-y-auto scrollbar-hide">
              <div className="space-y-1">
                <NavLink href="/" icon={<LayoutDashboard className="mr-3 h-5 w-5" />} label="Dashboard" />
                <NavLink href="/tasks" icon={<ListTodo className="mr-3 h-5 w-5" />} label="Tareas" />
                <NavLink href="/calendar" icon={<Calendar className="mr-3 h-5 w-5" />} label="Calendario" />
                <NavLink href="/reports" icon={<PieChart className="mr-3 h-5 w-5" />} label="Informes" />
                <NavLink href="/settings" icon={<Settings className="mr-3 h-5 w-5" />} label="Configuración" />
              </div>
              
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Categorías
                </h3>
                <div className="mt-2 space-y-1">
                  {categories.map((category) => (
                    <div key={category.id} className="flex justify-between items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100">
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full ${getCategoryColor(category.color)} mr-3`}></span>
                        {category.name}
                      </div>
                      <Badge variant="outline" className="bg-neutral-100 text-neutral-600 text-xs">
                        {Math.floor(Math.random() * 10) + 2}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </nav>
            
            <div className="p-4 border-t border-neutral-200">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-800">Administrator</p>
                  <p className="text-xs text-neutral-500">admin@example.com</p>
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
}

function NavLink({ href, icon, label }: NavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link href={href}>
      <a 
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
          isActive 
            ? "bg-primary-50 text-primary-700" 
            : "text-neutral-700 hover:bg-neutral-100"
        )}
      >
        {icon}
        {label}
      </a>
    </Link>
  );
}
