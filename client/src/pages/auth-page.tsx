import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Esquema de validación para el login
const loginSchema = z.object({
  username: z.string().min(1, { message: "El nombre de usuario es requerido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

// Esquema de validación para el registro
const registerSchema = z.object({
  username: z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  email: z.string().email({ message: "El correo electrónico no es válido" }).optional().or(z.literal("")),
  name: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulario de login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Formulario de registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      name: "",
    },
  });
  
  // Manejar envío del formulario de login directamente
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al iniciar sesión");
      }
      
      const userData = await response.json();
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema de gestión de tareas",
      });
      
      // Recargar la página para actualizar el estado de autenticación
      window.location.href = "/";
      
    } catch (error: any) {
      console.error("Error de login:", error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar envío del formulario de registro
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrarse");
      }
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
      
      // Recargar la página para actualizar el estado de autenticación
      window.location.href = "/";
      
    } catch (error: any) {
      console.error("Error de registro:", error);
      toast({
        title: "Error al registrarse",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--neon-darker)' }}>
      {/* Panel izquierdo - Formulario */}
      <div className="flex flex-col justify-center w-full max-w-md p-8 space-y-8 relative">
        {/* Efecto de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E1FF]/5 to-[#00E1FF]/2 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_rgba(0,225,255,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>
        
        {/* Contenido del formulario */}
        <div className="z-10 space-y-3 text-center">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-[#00E1FF] drop-shadow-[0_0_8px_rgba(0,225,255,0.8)] neon-text">Task Manager</span>
          </h1>
          <p className="text-[#CFF4FC] opacity-80">
            Sistema de gestión de tareas inteligente
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full z-10" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full bg-[#132237] border border-[#00E1FF]/20 shadow-[0_0_15px_rgba(0,225,255,0.15)]">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-[#00E1FF]/10 data-[state=active]:text-[#00E1FF] data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.3)] transition-all duration-300"
            >
              Iniciar sesión
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-[#00E1FF]/10 data-[state=active]:text-[#00E1FF] data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.3)] transition-all duration-300"
            >
              Registrarse
            </TabsTrigger>
          </TabsList>

          {/* Formulario de login */}
          <TabsContent value="login" className="space-y-4 pt-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#CFF4FC] font-medium">Usuario</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingresa tu nombre de usuario"
                          {...field}
                          disabled={isSubmitting}
                          className="bg-[#132237] border-[#00E1FF]/30 focus:border-[#00E1FF] focus:ring-1 focus:ring-[#00E1FF]/50 shadow-[0_0_5px_rgba(0,225,255,0.2)] transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#CFF4FC] font-medium">Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          {...field}
                          disabled={isSubmitting}
                          className="bg-[#132237] border-[#00E1FF]/30 focus:border-[#00E1FF] focus:ring-1 focus:ring-[#00E1FF]/50 shadow-[0_0_5px_rgba(0,225,255,0.2)] transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#00E1FF]/90 hover:bg-[#00E1FF] text-[#0D1321] hover:text-[#0D1321] font-medium shadow-[0_0_15px_rgba(0,225,255,0.5)] hover:shadow-[0_0_20px_rgba(0,225,255,0.7)] transition-all duration-300 mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
                

              </form>
            </Form>
          </TabsContent>

          {/* Formulario de registro */}
          <TabsContent value="register" className="space-y-4 pt-6">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#CFF4FC] font-medium">Usuario</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Elige un nombre de usuario"
                          {...field}
                          disabled={isSubmitting}
                          className="bg-[#132237] border-[#00E1FF]/30 focus:border-[#00E1FF] focus:ring-1 focus:ring-[#00E1FF]/50 shadow-[0_0_5px_rgba(0,225,255,0.2)] transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#CFF4FC] font-medium">Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Crea una contraseña"
                          {...field}
                          disabled={isSubmitting}
                          className="bg-[#132237] border-[#00E1FF]/30 focus:border-[#00E1FF] focus:ring-1 focus:ring-[#00E1FF]/50 shadow-[0_0_5px_rgba(0,225,255,0.2)] transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#CFF4FC] font-medium">Correo (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Correo electrónico"
                          {...field}
                          disabled={isSubmitting}
                          className="bg-[#132237] border-[#00E1FF]/30 focus:border-[#00E1FF] focus:ring-1 focus:ring-[#00E1FF]/50 shadow-[0_0_5px_rgba(0,225,255,0.2)] transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#CFF4FC] font-medium">Nombre (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tu nombre completo"
                          {...field}
                          disabled={isSubmitting}
                          className="bg-[#132237] border-[#00E1FF]/30 focus:border-[#00E1FF] focus:ring-1 focus:ring-[#00E1FF]/50 shadow-[0_0_5px_rgba(0,225,255,0.2)] transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#00E1FF]/90 hover:bg-[#00E1FF] text-[#0D1321] hover:text-[#0D1321] font-medium shadow-[0_0_15px_rgba(0,225,255,0.5)] hover:shadow-[0_0_20px_rgba(0,225,255,0.7)] transition-all duration-300 mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrarse"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>

      {/* Panel derecho - Hero */}
      <div className="hidden lg:flex flex-col justify-center w-full relative overflow-hidden">
        {/* Background with gradients and effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1321] to-[#102436] z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(0,225,255,0.25)_0%,rgba(0,0,0,0)_60%)] z-0"></div>
        
        {/* Animation lines */}
        <div className="absolute bottom-0 left-0 w-full h-40 overflow-hidden z-10">
          <div className="grid-lines"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 px-12 max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 text-white">
            <span className="text-[#00E1FF] drop-shadow-[0_0_10px_rgba(0,225,255,0.9)] neon-text">Potencia</span> tu productividad
          </h2>
          
          <p className="text-[#CFF4FC] text-xl mb-8 opacity-90">
            Un sistema inteligente para gestionar tus tareas, integrado con WhatsApp y asistentes IA
          </p>
          
          <ul className="space-y-5">
            <li className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-[#00E1FF]/20 border border-[#00E1FF]/40 flex items-center justify-center mr-4 mt-1 shadow-[0_0_10px_rgba(0,225,255,0.3)]">
                <svg className="w-4 h-4 text-[#00E1FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-[#00E1FF] text-lg font-medium mb-1">
                  Gestión inteligente de tareas
                </h3>
                <p className="text-[#CFF4FC]/80">
                  Sistema de priorización y análisis para maximizar tu productividad
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-[#00E1FF]/20 border border-[#00E1FF]/40 flex items-center justify-center mr-4 mt-1 shadow-[0_0_10px_rgba(0,225,255,0.3)]">
                <svg className="w-4 h-4 text-[#00E1FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-[#00E1FF] text-lg font-medium mb-1">
                  Integración con WhatsApp
                </h3>
                <p className="text-[#CFF4FC]/80">
                  Recibe notificaciones y administra tareas desde tu aplicación de mensajería
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-[#00E1FF]/20 border border-[#00E1FF]/40 flex items-center justify-center mr-4 mt-1 shadow-[0_0_10px_rgba(0,225,255,0.3)]">
                <svg className="w-4 h-4 text-[#00E1FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-[#00E1FF] text-lg font-medium mb-1">
                  Asistente IA avanzado
                </h3>
                <p className="text-[#CFF4FC]/80">
                  Sistema multi-agente inteligente que te ayuda a gestionar mejor tu trabajo
                </p>
              </div>
            </li>
          </ul>
        </div>
        
        {/* Visual elements */}
        <div className="absolute right-[-20%] top-1/2 transform -translate-y-1/2 w-[70%] h-[70%] opacity-30 z-5">
          <div className="neon-circle"></div>
        </div>
      </div>
    </div>
  );
}