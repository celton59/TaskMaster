import { Switch, Route } from "wouter";
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
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/dev-login" component={DevLoginPage} />
        <Route path="/">
          {() => (
            <div className="flex h-screen w-full overflow-hidden">
              <Sidebar />
              
              <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: 'var(--neon-darker)' }}>
                <Header />
                
                <main className="flex-1 overflow-auto p-3" style={{ backgroundColor: 'var(--neon-dark)' }}>
                  <Switch>
                    <ProtectedRoute path="/" component={Dashboard} />
                    <ProtectedRoute path="/tasks" component={Tasks} />
                    <ProtectedRoute path="/tasks/:id" component={TaskDetails} />
                    <ProtectedRoute path="/reports" component={Reports} />
                    <ProtectedRoute path="/assistant" component={AIAssistant} />
                    <ProtectedRoute path="/calendar" component={Calendar} />
                    <ProtectedRoute path="/users" component={Users} />
                    <ProtectedRoute path="/whatsapp-settings" component={WhatsAppSettings} />
                    <ProtectedRoute path="/habits" component={Habits} />
                    <Route component={NotFound} />
                  </Switch>
                </main>
              </div>
              
              <Toaster />
            </div>
          )}
        </Route>
      </Switch>
    </>
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
