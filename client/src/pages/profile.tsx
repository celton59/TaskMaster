import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Key, Save, Shield, Clock, Calendar, RefreshCw } from "lucide-react";

// Esquema de validación para la actualización del perfil
const profileFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("El correo electrónico no es válido").optional(),
  avatar: z.string().optional(),
});

// Esquema para cambio de contraseña
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirma la nueva contraseña"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Formulario de perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
    },
  });
  
  // Formulario de contraseña
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Actualizar perfil
  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      // Simulando actualización - reemplazar con llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Perfil actualizado",
        description: "Los cambios en tu perfil se han guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Cambiar contraseña
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      // Simulando actualización - reemplazar con llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente",
      });
      
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la contraseña",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-neon-accent" />
        <span className="ml-2 text-neon-text">Cargando perfil...</span>
      </div>
    );
  }
  
  // Iniciales para el avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };
  
  const userInitials = getInitials(user.name || user.username);
  
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-neon-text mb-6 font-mono flex items-center">
        <User className="mr-2 text-neon-accent h-6 w-6" />
        Mi Perfil
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda - Información del usuario */}
        <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.1)] overflow-hidden animate-card-glow md:col-span-1">
          <CardHeader className="bg-gradient-to-r from-neon-darker via-neon-medium/20 to-neon-dark bg-[length:200%_100%] animate-flow-gradient border-b border-neon-accent/30">
            <CardTitle className="text-neon-accent [text-shadow:0_0_10px_rgba(0,225,255,0.5)] font-mono">
              Información
            </CardTitle>
            <CardDescription>
              Tus datos de usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <div className="mb-6 relative group">
              <Avatar className="h-24 w-24 border-4 border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.3)]">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="bg-neon-medium/30 text-neon-accent text-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-neon-text mb-1">{user.name || user.username}</h2>
            <p className="text-neon-text/70 text-sm">{user.email}</p>
            
            <div className="mt-4">
              <Badge className="bg-neon-accent/20 text-neon-accent border border-neon-accent/30 shadow-[0_0_8px_rgba(0,225,255,0.2)]">
                Administrador
              </Badge>
            </div>
            
            <Separator className="my-6 bg-neon-accent/20" />
            
            <div className="w-full space-y-4">
              <div className="flex items-start">
                <div className="mr-3 h-8 w-8 rounded-full bg-neon-medium/30 border border-neon-accent/30 flex items-center justify-center text-neon-accent/80">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-neon-text/70">Miembro desde</p>
                  <p className="text-sm text-neon-text">Abril 2025</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 h-8 w-8 rounded-full bg-neon-medium/30 border border-neon-accent/30 flex items-center justify-center text-neon-accent/80">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-neon-text/70">Última sesión</p>
                  <p className="text-sm text-neon-text">Hoy, 14:30</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 h-8 w-8 rounded-full bg-neon-medium/30 border border-neon-accent/30 flex items-center justify-center text-neon-accent/80">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-neon-text/70">Rol</p>
                  <p className="text-sm text-neon-text">Administrador</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Columna derecha - Formularios de edición */}
        <div className="md:col-span-2 space-y-6">
          {/* Tabs para diferentes secciones */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="bg-neon-medium/10 border border-neon-accent/30 p-1 rounded-lg w-full grid grid-cols-2">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-neon-darker data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.2)]"
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-neon-darker data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.2)]"
              >
                <Key className="mr-2 h-4 w-4" />
                Seguridad
              </TabsTrigger>
            </TabsList>
            
            {/* Contenido de Perfil */}
            <TabsContent value="profile">
              <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.1)]">
                <CardHeader className="border-b border-neon-accent/30">
                  <CardTitle className="text-neon-text">Editar Perfil</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neon-text">Nombre</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-neon-text/50" />
                                <Input 
                                  placeholder="Nombre completo" 
                                  className="pl-10 bg-neon-medium/10 border-neon-accent/30 text-neon-text focus:border-neon-accent focus:shadow-[0_0_8px_rgba(0,225,255,0.3)]" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neon-text">Correo electrónico</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neon-text/50" />
                                <Input 
                                  placeholder="tu@email.com" 
                                  className="pl-10 bg-neon-medium/10 border-neon-accent/30 text-neon-text focus:border-neon-accent focus:shadow-[0_0_8px_rgba(0,225,255,0.3)]" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-neon-text/60">
                              Este correo se usará para notificaciones.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto bg-neon-accent hover:bg-neon-accent/90 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
                        disabled={isUpdating}
                      >
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isUpdating ? "Guardando..." : "Guardar cambios"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Contenido de Seguridad */}
            <TabsContent value="security">
              <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.1)]">
                <CardHeader className="border-b border-neon-accent/30">
                  <CardTitle className="text-neon-text">Cambiar contraseña</CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña de acceso
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neon-text">Contraseña actual</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-neon-text/50" />
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10 bg-neon-medium/10 border-neon-accent/30 text-neon-text focus:border-neon-accent focus:shadow-[0_0_8px_rgba(0,225,255,0.3)]" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neon-text">Nueva contraseña</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-neon-text/50" />
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10 bg-neon-medium/10 border-neon-accent/30 text-neon-text focus:border-neon-accent focus:shadow-[0_0_8px_rgba(0,225,255,0.3)]" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-neon-text/60">
                              Mínimo 6 caracteres
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neon-text">Confirmar contraseña</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-neon-text/50" />
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10 bg-neon-medium/10 border-neon-accent/30 text-neon-text focus:border-neon-accent focus:shadow-[0_0_8px_rgba(0,225,255,0.3)]" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto bg-neon-accent hover:bg-neon-accent/90 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isChangingPassword ? "Actualizando..." : "Actualizar contraseña"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}