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
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

// Fondo extremadamente visible con alto contraste y gradientes CSS puro
function SimpleBackground() {
  return (
    <>
      {/* Gradiente radial de fondo */}
      <div 
        className="fixed inset-0 -z-30" 
        style={{
          background: 'radial-gradient(circle at center, #061621 0%, #000000 100%)',
        }}
      />

      {/* Overlay brillante neón cyan */}
      <div 
        className="fixed inset-0 -z-29" 
        style={{
          background: 'linear-gradient(135deg, rgba(0, 225, 255, 0.2) 0%, transparent 80%)',
        }}
      />

      {/* Overlay brillante neón púrpura */}
      <div 
        className="fixed inset-0 -z-28" 
        style={{
          background: 'linear-gradient(45deg, rgba(187, 0, 255, 0.2) 0%, transparent 80%)',
        }}
      />

      {/* CUADRÍCULA GIGANTE DE ALTA VISIBILIDAD */}
      <div 
        className="fixed inset-0 -z-25" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 225, 255, 1) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(0, 225, 255, 1) 1px, transparent 1px)
          `,
          backgroundSize: '150px 150px',
          opacity: 0.3
        }}
      />

      {/* Círculos neón GIGANTES con alta visibilidad */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        {/* CÍRCULO CENTRAL ENORME CYAN */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full border-8 border-cyan-400 left-1/2 top-1/2" 
          style={{ 
            transform: 'translate(-50%, -50%)', 
            boxShadow: '0 0 100px 20px #00e1ff', 
            opacity: 0.5 
          }} 
        />
        
        {/* Dot gigante central */}
        <div 
          className="absolute w-[50px] h-[50px] rounded-full bg-cyan-500 left-1/2 top-1/2" 
          style={{ 
            transform: 'translate(-50%, -50%)', 
            boxShadow: '0 0 50px 30px #00e1ff', 
            opacity: 0.9 
          }} 
        />
      </div>

      {/* Líneas horizontales ENORMES y BRILLANTES */}
      <div className="fixed inset-0 -z-15 overflow-hidden">
        <div className="absolute w-full h-[10px] bg-cyan-400 top-[30%]" style={{ boxShadow: '0 0 30px 10px #00e1ff', opacity: 0.7 }} />
        <div className="absolute w-full h-[10px] bg-purple-500 top-[70%]" style={{ boxShadow: '0 0 30px 10px #bb00ff', opacity: 0.7 }} />
      </div>

      {/* Líneas verticales ENORMES y BRILLANTES */}
      <div className="fixed inset-0 -z-15 overflow-hidden">
        <div className="absolute h-full w-[10px] bg-green-400 left-[30%]" style={{ boxShadow: '0 0 30px 10px #00ff9d', opacity: 0.7 }} />
        <div className="absolute h-full w-[10px] bg-pink-500 left-[70%]" style={{ boxShadow: '0 0 30px 10px #ff00aa', opacity: 0.7 }} />
      </div>
      
      {/* ¡PUNTOS ENORMES EN CADA ESQUINA! */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Esquina superior izquierda */}
        <div className="absolute w-[100px] h-[100px] rounded-full bg-yellow-400 top-[100px] left-[100px]" 
          style={{ boxShadow: '0 0 50px 25px #ffea00', opacity: 0.9 }} />
          
        {/* Esquina superior derecha */}
        <div className="absolute w-[100px] h-[100px] rounded-full bg-purple-400 top-[100px] right-[100px]" 
          style={{ boxShadow: '0 0 50px 25px #bb00ff', opacity: 0.9 }} />
          
        {/* Esquina inferior izquierda */}
        <div className="absolute w-[100px] h-[100px] rounded-full bg-green-400 bottom-[100px] left-[100px]" 
          style={{ boxShadow: '0 0 50px 25px #00ff9d', opacity: 0.9 }} />
          
        {/* Esquina inferior derecha */}
        <div className="absolute w-[100px] h-[100px] rounded-full bg-pink-400 bottom-[100px] right-[100px]" 
          style={{ boxShadow: '0 0 50px 25px #ff00aa', opacity: 0.9 }} />
      </div>
    </>
  );
}

function Router() {
  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* Fondo simple y visible */}
      <SimpleBackground />
      
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden bg-neon-darker/80 backdrop-blur-sm">
        <Header />
        
        <main className="flex-1 overflow-auto bg-neon-dark/80 backdrop-blur-sm p-3">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/tasks/:id" component={TaskDetails} />
            <Route path="/reports" component={Reports} />
            <Route path="/assistant" component={AIAssistant} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/users" component={Users} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
