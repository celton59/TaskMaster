import { useState } from "react";
import { useLocation } from "wouter";
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
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

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

  // Manejar envío del formulario de login
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al iniciar sesión");
      }
      
      // Login exitoso, redirigir al dashboard
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar envío del formulario de registro
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrarse");
      }
      
      // Registro exitoso, redirigir al dashboard
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error al registrarse",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
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
          <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[#00E1FF]/30 to-transparent animate-pulse-slow"></div>
          <div className="absolute top-6 h-[1px] w-full bg-gradient-to-r from-transparent via-[#00E1FF]/20 to-transparent animate-pulse-slower"></div>
          <div className="absolute top-12 h-[1px] w-full bg-gradient-to-r from-transparent via-[#00E1FF]/10 to-transparent animate-pulse-slowest"></div>
        </div>
        
        {/* Futuristic grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00E1FF05_1px,transparent_1px),linear-gradient(to_bottom,#00E1FF05_1px,transparent_1px)] bg-[size:40px_40px] z-10"></div>
        
        {/* Content with neon effect */}
        <div className="relative z-20 max-w-xl space-y-8 p-12">
          <div className="space-y-3">
            <h1 className="text-6xl font-bold text-white">
              Task Manager{" "}
              <span className="text-[#00E1FF] drop-shadow-[0_0_8px_rgba(0,225,255,0.8)]">Inteligente</span>
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-[#00E1FF] to-transparent rounded-full shadow-[0_0_8px_rgba(0,225,255,0.6)]"></div>
          </div>
          
          <p className="text-xl text-[#CFF4FC]">
            Una plataforma avanzada para gestionar tus tareas con la ayuda de inteligencia artificial.
            Organiza tu trabajo, hábitos personales y mejora tu productividad.
          </p>
          
          <ul className="space-y-5">
            <li className="flex items-center text-white">
              <span className="mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-[#00E1FF]/20 border border-[#00E1FF]/30 text-[#00E1FF] shadow-[0_0_8px_rgba(0,225,255,0.4)]">✓</span> 
              <span className="text-lg">Sistema <span className="text-[#00E1FF]">multi-agente</span> con IA</span>
            </li>
            <li className="flex items-center text-white">
              <span className="mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-[#00E1FF]/20 border border-[#00E1FF]/30 text-[#00E1FF] shadow-[0_0_8px_rgba(0,225,255,0.4)]">✓</span> 
              <span className="text-lg">Integración con <span className="text-[#00E1FF]">WhatsApp</span></span>
            </li>
            <li className="flex items-center text-white">
              <span className="mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-[#00E1FF]/20 border border-[#00E1FF]/30 text-[#00E1FF] shadow-[0_0_8px_rgba(0,225,255,0.4)]">✓</span> 
              <span className="text-lg">Seguimiento de <span className="text-[#00E1FF]">hábitos</span></span>
            </li>
            <li className="flex items-center text-white">
              <span className="mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-[#00E1FF]/20 border border-[#00E1FF]/30 text-[#00E1FF] shadow-[0_0_8px_rgba(0,225,255,0.4)]">✓</span> 
              <span className="text-lg">Estadísticas <span className="text-[#00E1FF]">detalladas</span></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}