import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  Search, 
  Bell, 
  HelpCircle 
} from "lucide-react";

export function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const toggleMobileMenu = () => {
    const event = new CustomEvent('toggle-mobile-menu');
    window.dispatchEvent(event);
  };
  
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm z-10">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-neutral-500 hover:text-neutral-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="md:hidden ml-2 font-heading font-bold text-lg text-neutral-800">TaskMaster</div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-neutral-400 h-4 w-4" />
            </div>
            <Input
              placeholder="Buscar tareas..."
              className="pl-10 pr-3 py-2 bg-neutral-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="p-1 rounded-full text-neutral-500 hover:text-neutral-700 focus:outline-none">
            <Bell className="h-5 w-5" />
          </button>
          
          <button className="p-1 rounded-full text-neutral-500 hover:text-neutral-700 focus:outline-none">
            <HelpCircle className="h-5 w-5" />
          </button>
          
          <div className="ml-3 relative md:hidden">
            <button className="flex items-center max-w-xs rounded-full focus:outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
