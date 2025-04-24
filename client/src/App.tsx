import { Switch, Route, Redirect, useLocation } from "wouter";
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
import AuthPage from "@/pages/auth-page";
import DevLoginPage from "@/pages/dev-login";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Componente que aplica layout general a las rutas autenticadas
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: 'var(--neon-darker)' }}>
        <Header />
        <main className="flex-1 overflow-auto p-3" style={{ backgroundColor: 'var(--neon-dark)' }}>
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

// Componente que verifica autenticación
function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Si no está cargando y no hay usuario, redirigir a login
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Mientras está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E1FF]" />
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (la redirección ocurrirá vía useEffect)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E1FF]" />
      </div>
    );
  }

  // Si hay usuario, renderizar contenido
  return <>{children}</>;
}

// Componente que gestiona la página de login
function LoginCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Si hay usuario, redirigir al dashboard
    if (!isLoading && user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  // Mientras carga, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E1FF]" />
      </div>
    );
  }

  // Si no hay usuario o está cargando, mostrar componente de login
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Rutas públicas */}
      <Route path="/auth">
        {() => (
          <LoginCheck>
            <AuthPage />
          </LoginCheck>
        )}
      </Route>
      
      <Route path="/dev-login" component={DevLoginPage} />

      {/* Rutas protegidas */}
      <Route path="/">
        {() => (
          <AuthCheck>
            <AppLayout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/tasks" component={Tasks} />
                <Route path="/tasks/:id" component={TaskDetails} />
                <Route path="/reports" component={Reports} />
                <Route path="/assistant" component={AIAssistant} />
                <Route path="/calendar" component={Calendar} />
                <Route path="/users" component={Users} />
                <Route path="/whatsapp-settings" component={WhatsAppSettings} />
                <Route path="/habits" component={Habits} />
                <Route component={NotFound} />
              </Switch>
            </AppLayout>
          </AuthCheck>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
