import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  Laptop,
  Palette,
  Globe,
  Shield,
  Lock,
  BellOff,
  Mail,
  MessageSquare,
  Eye,
  EyeOff,
  Smartphone,
  Loader2,
  Save,
  Clock,
  Download,
} from "lucide-react";

// Esquema para configuración de notificaciones
const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  taskReminders: z.boolean().default(true),
  projectUpdates: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

// Esquema para configuración de apariencia
const appearanceFormSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).default("dark"),
  accentColor: z.enum(["blue", "purple", "green", "pink", "yellow"]).default("blue"),
  fontSize: z.number().min(80).max(120).default(100),
  animations: z.boolean().default(true),
  compactMode: z.boolean().default(false),
});

// Esquema para configuración de privacidad
const privacyFormSchema = z.object({
  showOnlineStatus: z.boolean().default(true),
  showLastSeen: z.boolean().default(true),
  showReadReceipts: z.boolean().default(true),
  showTypingIndicator: z.boolean().default(true),
  autoDownloadMedia: z.enum(["always", "wifi", "never"]).default("wifi"),
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z.number().min(15).max(240).default(60),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;
type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;
type PrivacyFormValues = z.infer<typeof privacyFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Formulario de notificaciones
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      taskReminders: true,
      projectUpdates: true,
      marketingEmails: false,
    },
  });
  
  // Formulario de apariencia
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "dark",
      accentColor: "blue",
      fontSize: 100,
      animations: true,
      compactMode: false,
    },
  });
  
  // Formulario de privacidad
  const privacyForm = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacyFormSchema),
    defaultValues: {
      showOnlineStatus: true,
      showLastSeen: true,
      showReadReceipts: true,
      showTypingIndicator: true,
      autoDownloadMedia: "wifi",
      twoFactorAuth: false,
      sessionTimeout: 60,
    },
  });
  
  // Guardar configuración de notificaciones
  const onNotificationsSave = (values: NotificationsFormValues) => {
    setIsProcessing(true);
    // Simulamos la operación
    setTimeout(() => {
      console.log("Configuración de notificaciones guardada:", values);
      toast({
        title: "Configuración guardada",
        description: "Las preferencias de notificaciones se han actualizado correctamente.",
      });
      setIsProcessing(false);
    }, 800);
  };
  
  // Guardar configuración de apariencia
  const onAppearanceSave = (values: AppearanceFormValues) => {
    setIsProcessing(true);
    // Simulamos la operación
    setTimeout(() => {
      console.log("Configuración de apariencia guardada:", values);
      toast({
        title: "Configuración guardada",
        description: "Las preferencias de apariencia se han actualizado correctamente.",
      });
      setIsProcessing(false);
    }, 800);
  };
  
  // Guardar configuración de privacidad
  const onPrivacySave = (values: PrivacyFormValues) => {
    setIsProcessing(true);
    // Simulamos la operación
    setTimeout(() => {
      console.log("Configuración de privacidad guardada:", values);
      toast({
        title: "Configuración guardada",
        description: "Las preferencias de privacidad se han actualizado correctamente.",
      });
      setIsProcessing(false);
    }, 800);
  };
  
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-neon-text mb-6 font-mono flex items-center">
        <SettingsIcon className="mr-2 text-neon-accent h-6 w-6" />
        Configuración
      </h1>
      
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="bg-neon-medium/10 border border-neon-accent/30 p-1 rounded-lg w-full grid grid-cols-3">
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-neon-darker data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.2)]"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger 
            value="appearance" 
            className="data-[state=active]:bg-neon-darker data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.2)]"
          >
            <Palette className="mr-2 h-4 w-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger 
            value="privacy" 
            className="data-[state=active]:bg-neon-darker data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.2)]"
          >
            <Shield className="mr-2 h-4 w-4" />
            Privacidad
          </TabsTrigger>
        </TabsList>
        
        {/* Sección de notificaciones */}
        <TabsContent value="notifications">
          <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.1)] animate-card-glow">
            <CardHeader className="bg-gradient-to-r from-neon-darker via-neon-medium/20 to-neon-dark bg-[length:200%_100%] animate-flow-gradient border-b border-neon-accent/30">
              <CardTitle className="text-neon-accent [text-shadow:0_0_10px_rgba(0,225,255,0.5)] font-mono">
                Preferencias de notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo quieres recibir alertas y actualizaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSave)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={notificationsForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-neon-accent/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,225,255,0.05)]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-neon-text flex items-center cursor-pointer">
                              <Mail className="mr-2 h-5 w-5 text-neon-accent/70" />
                              Notificaciones por correo
                            </FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Recibe actualizaciones y resúmenes por email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-accent data-[state=checked]:shadow-[0_0_8px_rgba(0,225,255,0.4)]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-neon-accent/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,225,255,0.05)]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-neon-text flex items-center cursor-pointer">
                              <Bell className="mr-2 h-5 w-5 text-neon-accent/70" />
                              Notificaciones push
                            </FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Recibe alertas en tiempo real en tu navegador
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-accent data-[state=checked]:shadow-[0_0_8px_rgba(0,225,255,0.4)]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-neon-accent/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,225,255,0.05)]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-neon-text flex items-center cursor-pointer">
                              <Smartphone className="mr-2 h-5 w-5 text-neon-accent/70" />
                              Notificaciones SMS
                            </FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Recibe alertas importantes por mensaje de texto
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-accent data-[state=checked]:shadow-[0_0_8px_rgba(0,225,255,0.4)]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Separator className="my-4 bg-neon-accent/20" />
                    
                    <h3 className="text-lg font-medium text-neon-text mb-3">Tipos de notificaciones</h3>
                    
                    <FormField
                      control={notificationsForm.control}
                      name="taskReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border border-neon-accent/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,225,255,0.05)]">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-accent data-[state=checked]:border-neon-accent/70"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-neon-text">Recordatorios de tareas</FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Recibe avisos sobre plazos y tareas pendientes
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="projectUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border border-neon-accent/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,225,255,0.05)]">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-accent data-[state=checked]:border-neon-accent/70"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-neon-text">Actualizaciones de proyectos</FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Recibe actualizaciones sobre cambios en proyectos
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border border-neon-accent/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,225,255,0.05)]">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-accent data-[state=checked]:border-neon-accent/70"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-neon-text">Correos de marketing</FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Recibe información sobre nuevas características y actualizaciones
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-neon-accent hover:bg-neon-accent/90 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
                    disabled={isProcessing}
                  >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProcessing ? "Guardando..." : "Guardar preferencias"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sección de apariencia */}
        <TabsContent value="appearance">
          <Card className="bg-neon-darker border-neon-purple/30 shadow-[0_0_15px_rgba(187,0,255,0.1)] animate-card-glow">
            <CardHeader className="bg-gradient-to-r from-neon-darker via-neon-purple/20 to-neon-dark bg-[length:200%_100%] animate-flow-gradient border-b border-neon-purple/30">
              <CardTitle className="text-neon-purple [text-shadow:0_0_10px_rgba(187,0,255,0.5)] font-mono">
                Personalización visual
              </CardTitle>
              <CardDescription>
                Adapta la apariencia de la aplicación a tus preferencias
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...appearanceForm}>
                <form onSubmit={appearanceForm.handleSubmit(onAppearanceSave)} className="space-y-6">
                  <FormField
                    control={appearanceForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neon-text">Tema</FormLabel>
                        <div className="flex flex-col space-y-1.5">
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className={`flex flex-col items-center space-y-2 ${field.value === 'dark' ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className={`w-full h-16 border-neon-purple/30 bg-gray-950 hover:bg-gray-900 hover:border-neon-purple hover:shadow-[0_0_12px_rgba(187,0,255,0.3)] active:scale-95 transition-all ${field.value === 'dark' && 'border-neon-purple shadow-[0_0_12px_rgba(187,0,255,0.3)]'}`}
                                onClick={() => field.onChange('dark')}
                              >
                                <Moon className="h-6 w-6 text-neon-purple" />
                              </Button>
                              <FormLabel className="text-neon-text text-sm font-normal cursor-pointer">Oscuro</FormLabel>
                            </div>
                            
                            <div className={`flex flex-col items-center space-y-2 ${field.value === 'light' ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className={`w-full h-16 border-neon-purple/30 bg-gray-50 hover:bg-white hover:border-neon-purple hover:shadow-[0_0_12px_rgba(187,0,255,0.3)] active:scale-95 transition-all ${field.value === 'light' && 'border-neon-purple shadow-[0_0_12px_rgba(187,0,255,0.3)]'}`}
                                onClick={() => field.onChange('light')}
                              >
                                <Sun className="h-6 w-6 text-neon-purple" />
                              </Button>
                              <FormLabel className="text-neon-text text-sm font-normal cursor-pointer">Claro</FormLabel>
                            </div>
                            
                            <div className={`flex flex-col items-center space-y-2 ${field.value === 'system' ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className={`w-full h-16 border-neon-purple/30 bg-gradient-to-r from-gray-50 to-gray-950 hover:border-neon-purple hover:shadow-[0_0_12px_rgba(187,0,255,0.3)] active:scale-95 transition-all ${field.value === 'system' && 'border-neon-purple shadow-[0_0_12px_rgba(187,0,255,0.3)]'}`}
                                onClick={() => field.onChange('system')}
                              >
                                <Laptop className="h-6 w-6 text-neon-purple" />
                              </Button>
                              <FormLabel className="text-neon-text text-sm font-normal cursor-pointer">Sistema</FormLabel>
                            </div>
                          </div>
                        </div>
                        <FormDescription className="text-neon-text/60 text-center pt-2">
                          Selecciona el modo que más te guste
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <Separator className="my-4 bg-neon-purple/20" />
                  
                  <FormField
                    control={appearanceForm.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neon-text">Color primario</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-neon-purple/30 bg-neon-medium/10 text-neon-text focus:border-neon-purple focus:shadow-[0_0_8px_rgba(187,0,255,0.3)]">
                              <SelectValue placeholder="Selecciona un color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-neon-darker border-neon-purple/30 text-neon-text">
                            <SelectItem value="blue" className="focus:bg-neon-medium/30 focus:text-neon-accent">
                              <div className="flex items-center">
                                <span className="h-4 w-4 rounded-full bg-neon-accent mr-2 shadow-[0_0_8px_rgba(0,225,255,0.5)]"></span>
                                Azul
                              </div>
                            </SelectItem>
                            <SelectItem value="purple" className="focus:bg-neon-medium/30 focus:text-neon-purple">
                              <div className="flex items-center">
                                <span className="h-4 w-4 rounded-full bg-neon-purple mr-2 shadow-[0_0_8px_rgba(187,0,255,0.5)]"></span>
                                Púrpura
                              </div>
                            </SelectItem>
                            <SelectItem value="green" className="focus:bg-neon-medium/30 focus:text-neon-green">
                              <div className="flex items-center">
                                <span className="h-4 w-4 rounded-full bg-neon-green mr-2 shadow-[0_0_8px_rgba(0,255,157,0.5)]"></span>
                                Verde
                              </div>
                            </SelectItem>
                            <SelectItem value="pink" className="focus:bg-neon-medium/30 focus:text-pink-500">
                              <div className="flex items-center">
                                <span className="h-4 w-4 rounded-full bg-pink-500 mr-2 shadow-[0_0_8px_rgba(255,0,187,0.5)]"></span>
                                Rosa
                              </div>
                            </SelectItem>
                            <SelectItem value="yellow" className="focus:bg-neon-medium/30 focus:text-neon-yellow">
                              <div className="flex items-center">
                                <span className="h-4 w-4 rounded-full bg-neon-yellow mr-2 shadow-[0_0_8px_rgba(255,234,0,0.5)]"></span>
                                Amarillo
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-neon-text/60">
                          Este color se utilizará para resaltar elementos y crear efectos neón
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appearanceForm.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neon-text">Tamaño de fuente</FormLabel>
                        <div className="flex flex-col space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neon-text/70">Pequeño</span>
                            <span className="text-xl text-neon-text/70">Grande</span>
                          </div>
                          <FormControl>
                            <Slider
                              defaultValue={[field.value]}
                              min={80}
                              max={120}
                              step={5}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="[&>.slider-thumb]:bg-neon-purple [&>.slider-track]:bg-neon-purple/30 [&>.slider-range]:bg-neon-purple"
                            />
                          </FormControl>
                          <div className="pt-2 text-center text-neon-text/70 text-sm">
                            {field.value}%
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={appearanceForm.control}
                      name="animations"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-neon-purple/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(187,0,255,0.05)]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-neon-text">Animaciones</FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Efectos visuales y transiciones
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-purple data-[state=checked]:shadow-[0_0_8px_rgba(187,0,255,0.4)]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={appearanceForm.control}
                      name="compactMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-neon-purple/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(187,0,255,0.05)]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-neon-text">Modo compacto</FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Menos espaciado, más contenido
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-purple data-[state=checked]:shadow-[0_0_8px_rgba(187,0,255,0.4)]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-neon-purple hover:bg-neon-purple/90 text-neon-dark shadow-[0_0_15px_rgba(187,0,255,0.3)]"
                    disabled={isProcessing}
                  >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProcessing ? "Guardando..." : "Guardar preferencias"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sección de privacidad */}
        <TabsContent value="privacy">
          <Card className="bg-neon-darker border-neon-green/30 shadow-[0_0_15px_rgba(0,255,157,0.1)] animate-card-glow">
            <CardHeader className="bg-gradient-to-r from-neon-darker via-neon-green/20 to-neon-dark bg-[length:200%_100%] animate-flow-gradient border-b border-neon-green/30">
              <CardTitle className="text-neon-green [text-shadow:0_0_10px_rgba(0,255,157,0.5)] font-mono">
                Privacidad y seguridad
              </CardTitle>
              <CardDescription>
                Configura opciones para proteger tu cuenta y datos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...privacyForm}>
                <form onSubmit={privacyForm.handleSubmit(onPrivacySave)} className="space-y-6">
                  <h3 className="text-lg font-medium text-neon-text mb-3">Visibilidad</h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={privacyForm.control}
                      name="showOnlineStatus"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-neon-green/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,255,157,0.05)]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-neon-text flex items-center cursor-pointer">
                              <Eye className="mr-2 h-5 w-5 text-neon-green/70" />
                              Mostrar estado en línea
                            </FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Permite que otros vean cuando estás conectado
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-green data-[state=checked]:shadow-[0_0_8px_rgba(0,255,157,0.4)]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={privacyForm.control}
                      name="showLastSeen"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-neon-green/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,255,157,0.05)]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-neon-text flex items-center cursor-pointer">
                              <Clock className="mr-2 h-5 w-5 text-neon-green/70" />
                              Mostrar última conexión
                            </FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Permite que otros vean cuándo fue tu última actividad
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-green data-[state=checked]:shadow-[0_0_8px_rgba(0,255,157,0.4)]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={privacyForm.control}
                      name="showReadReceipts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-neon-green/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,255,157,0.05)]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-neon-text flex items-center cursor-pointer">
                              <MessageSquare className="mr-2 h-5 w-5 text-neon-green/70" />
                              Confirmar lectura
                            </FormLabel>
                            <FormDescription className="text-neon-text/60">
                              Mostrar cuando has leído mensajes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-neon-green data-[state=checked]:shadow-[0_0_8px_rgba(0,255,157,0.4)]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-4 bg-neon-green/20" />
                  
                  <h3 className="text-lg font-medium text-neon-text mb-3">Seguridad</h3>
                  
                  <FormField
                    control={privacyForm.control}
                    name="twoFactorAuth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border border-neon-green/20 rounded-lg bg-neon-medium/5 shadow-[0_0_8px_rgba(0,255,157,0.05)]">
                        <div className="space-y-0.5">
                          <FormLabel className="text-neon-text flex items-center cursor-pointer">
                            <Lock className="mr-2 h-5 w-5 text-neon-green/70" />
                            Autenticación de dos factores
                          </FormLabel>
                          <FormDescription className="text-neon-text/60">
                            Añade una capa extra de seguridad a tu cuenta
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-neon-green data-[state=checked]:shadow-[0_0_8px_rgba(0,255,157,0.4)]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={privacyForm.control}
                    name="autoDownloadMedia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neon-text flex items-center">
                          <Download className="mr-2 h-5 w-5 text-neon-green/70" />
                          Descarga automática de medios
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-neon-green/30 bg-neon-medium/10 text-neon-text focus:border-neon-green focus:shadow-[0_0_8px_rgba(0,255,157,0.3)]">
                              <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-neon-darker border-neon-green/30 text-neon-text">
                            <SelectItem value="always" className="focus:bg-neon-medium/30 focus:text-neon-green">Siempre</SelectItem>
                            <SelectItem value="wifi" className="focus:bg-neon-medium/30 focus:text-neon-green">Solo con WiFi</SelectItem>
                            <SelectItem value="never" className="focus:bg-neon-medium/30 focus:text-neon-green">Nunca</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-neon-text/60">
                          Controla cuándo se descargan automáticamente imágenes y archivos
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={privacyForm.control}
                    name="sessionTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neon-text flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-neon-green/70" />
                          Tiempo de inactividad
                        </FormLabel>
                        <div className="flex flex-col space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neon-text/70">15 min</span>
                            <span className="text-sm text-neon-text/70">240 min</span>
                          </div>
                          <FormControl>
                            <Slider
                              defaultValue={[field.value]}
                              min={15}
                              max={240}
                              step={15}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="[&>.slider-thumb]:bg-neon-green [&>.slider-track]:bg-neon-green/30 [&>.slider-range]:bg-neon-green"
                            />
                          </FormControl>
                          <div className="pt-2 text-center text-neon-text/70 text-sm">
                            {field.value} minutos
                          </div>
                        </div>
                        <FormDescription className="text-neon-text/60">
                          Tiempo después del cual se cerrará automáticamente tu sesión por inactividad
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="bg-neon-green hover:bg-neon-green/90 text-neon-dark shadow-[0_0_15px_rgba(0,255,157,0.3)]"
                    disabled={isProcessing}
                  >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProcessing ? "Guardando..." : "Guardar preferencias"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}