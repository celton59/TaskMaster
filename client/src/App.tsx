import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import TaskDetails from "@/pages/task-details";
import Reports from "@/pages/reports";
import AIAssistant from "@/pages/ai-assistant";
import Calendar from "@/pages/calendar";
import Users from "@/pages/users";
import WhatsAppSettings from "@/pages/whatsapp-settings";
import Habits from "@/pages/habits";
import ProjectsList from "@/pages/projects-list";
import ProjectDetail from "@/pages/project-detail";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Documentation from "@/pages/documentation";
import Organigrama from "@/pages/organigrama";
import Directorio from "@/pages/directorio";
import ConfiguracionDirectorio from "@/pages/configuracion-directorio";
import Informes from "@/pages/informes";
import AuthPage from "@/pages/auth-page";
import DevLoginPage from "@/pages/dev-login";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

function App() {
  // Estado para controlar si está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Estado para controlar si está cargando
  const [isLoading, setIsLoading] = useState(true);
  
  // Comprobar estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user", {
          credentials: "include"
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Mientras está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E1FF]" />
      </div>
    );
  }
  
  // Renderizar la aplicación basada en el estado de autenticación
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {isAuthenticated ? (
            // Si está autenticado, mostrar el layout principal con las rutas
            <div className="flex h-screen w-full overflow-hidden">
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: 'var(--neon-darker)' }}>
                <Header />
                <main className="flex-1 overflow-auto p-3" style={{ backgroundColor: 'var(--neon-dark)' }}>
                  <Switch>
                    <Route path="/" component={Dashboard} />
                    <Route path="/tasks" component={Tasks} />
                    <Route path="/tasks/:id" component={TaskDetails} />
                    <Route path="/projects" component={ProjectsList} />
                    <Route path="/projects/:id" component={ProjectDetail} />
                    <Route path="/reports" component={Reports} />
                    <Route path="/assistant" component={AIAssistant} />
                    <Route path="/calendar" component={Calendar} />
                    <Route path="/users" component={Users} />
                    <Route path="/whatsapp-settings" component={WhatsAppSettings} />
                    <Route path="/habits" component={Habits} />
                    <Route path="/documentation" component={Documentation} />
                    <Route path="/organigrama" component={Organigrama} />
                    <Route path="/directorio" component={Directorio} />
                    <Route path="/configuracion/directorio" component={ConfiguracionDirectorio} />
                    <Route path="/profile" component={Profile} />
                    <Route path="/settings" component={Settings} />
                    <Route path="/informes" component={Informes} />
                    <Route component={NotFound} />
                  </Switch>
                </main>
              </div>
              <Toaster />
            </div>
          ) : (
            // Si no está autenticado, mostrar la página de login
            <Switch>
              <Route path="/dev-login" component={DevLoginPage} />
              <Route component={AuthPage} />
            </Switch>
          )}
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
