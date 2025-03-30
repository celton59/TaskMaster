import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Send, Loader2, PhoneCall, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function WhatsAppSettings() {
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("¡Hola! Este es un mensaje de prueba desde Aitorin.");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedTab, setSelectedTab] = useState("general");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Definir el tipo para la respuesta de la API de estado de Twilio
  interface TwilioStatusResponse {
    status: 'success' | 'error';
    message: string;
    configured?: boolean;
    phoneConfigured?: boolean;
    phoneNumber?: string;
  }
  
  // Consultar el estado de la configuración de Twilio
  const { data: twilioStatus, isLoading: isLoadingStatus, refetch: refetchTwilioStatus } = useQuery<TwilioStatusResponse>({
    queryKey: ["/api/whatsapp/status"],
    refetchOnWindowFocus: false,
  });
  
  // Verificar la configuración cuando se carga el componente
  useEffect(() => {
    checkTwilioStatus();
  }, []);
  
  // Función para verificar el estado de Twilio
  async function checkTwilioStatus() {
    try {
      await refetchTwilioStatus();
    } catch (error) {
      console.error("Error al verificar el estado de Twilio:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo verificar la configuración de Twilio",
        variant: "destructive",
      });
    }
  }
  
  // Función para enviar un mensaje de prueba
  async function sendTestMessage() {
    if (!testPhoneNumber) {
      toast({
        title: "Número de teléfono requerido",
        description: "Por favor, ingresa un número de teléfono válido para enviar el mensaje de prueba",
        variant: "destructive",
      });
      return;
    }
    
    // Validar formato del número de teléfono (debe ser formato E.164: +[código de país][número])
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(testPhoneNumber)) {
      toast({
        title: "Formato de teléfono incorrecto",
        description: "El número debe tener el formato +[código de país][número] (ej: +34612345678)",
        variant: "destructive",
      });
      return;
    }
    
    // Enviar mensaje de prueba
    setSendingMessage(true);
    try {
      await apiRequest(
        "/api/whatsapp/send-test", 
        "POST", 
        {
          to: testPhoneNumber,
          message: testMessage,
        }
      );
      
      toast({
        title: "Mensaje enviado",
        description: "El mensaje de prueba se ha enviado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al enviar mensaje de prueba:", error);
      toast({
        title: "Error al enviar mensaje",
        description: "No se pudo enviar el mensaje de prueba. Verifica la configuración de Twilio y el número de destino.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold neon-text text-neon-text">Configuración de WhatsApp</h1>
          <p className="text-neon-text/80 mt-1">
            Gestiona la integración con WhatsApp para comunicarte con tus clientes.
          </p>
        </div>
        
        {twilioStatus && (
          <Badge 
            className={`px-3 py-1.5 ${twilioStatus.configured ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500/50' : 'bg-amber-600/30 text-amber-400 border-amber-500/50'} text-xs`}
          >
            {twilioStatus.configured ? (
              <span className="flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Twilio configurado
              </span>
            ) : (
              <span className="flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                Twilio no configurado
              </span>
            )}
          </Badge>
        )}
      </div>
      
      <Tabs defaultValue="general" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full grid grid-cols-3 mb-6 bg-neon-medium/30 border border-neon-accent/20">
          <TabsTrigger value="general" className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent">
            General
          </TabsTrigger>
          <TabsTrigger value="test" className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent">
            Pruebas
          </TabsTrigger>
          <TabsTrigger value="webhook" className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent">
            Webhook
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card className="border-neon-accent/20 bg-neon-dark shadow-lg">
            <CardHeader>
              <CardTitle className="text-neon-text"><span className="neon-text">Estado de la Integración</span></CardTitle>
              <CardDescription>
                Estado actual de la integración con Twilio para WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingStatus ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-neon-accent" />
                  <span className="ml-2 text-neon-text/80">Verificando configuración...</span>
                </div>
              ) : twilioStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neon-darker/60 border border-neon-accent/10">
                    <div className="flex items-center">
                      <PhoneCall className="h-5 w-5 text-neon-accent/80 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-neon-text">Twilio Account</p>
                        <p className="text-xs text-neon-text/70">
                          {twilioStatus.configured ? 
                            `Cuenta configurada` : 
                            "Cuenta no configurada"}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`${twilioStatus.configured ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' : 'bg-amber-600/20 text-amber-400 border-amber-500/50'}`}
                    >
                      {twilioStatus.configured ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neon-darker/60 border border-neon-accent/10">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-neon-accent/80 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-neon-text">Número de WhatsApp</p>
                        <p className="text-xs text-neon-text/70">
                          {twilioStatus.phoneConfigured ? 
                            twilioStatus.phoneNumber : 
                            "Número no configurado"}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`${twilioStatus.phoneConfigured ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' : 'bg-amber-600/20 text-amber-400 border-amber-500/50'}`}
                    >
                      {twilioStatus.phoneConfigured ? "Configurado" : "No configurado"}
                    </Badge>
                  </div>
                  
                  {!twilioStatus.configured && (
                    <Alert className="bg-amber-600/10 border-amber-500/20 text-amber-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Configuración incompleta</AlertTitle>
                      <AlertDescription>
                        Para usar WhatsApp, necesitas configurar las credenciales de Twilio. Asegúrate de que las variables de entorno TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_PHONE_NUMBER estén configuradas.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert className="bg-rose-600/10 border-rose-500/20 text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error de conexión</AlertTitle>
                  <AlertDescription>
                    No se pudo obtener el estado de la configuración de Twilio. Verifica la conexión y vuelve a intentarlo.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-neon-accent/10 pt-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-reconnect" checked={true} />
                <Label htmlFor="auto-reconnect" className="text-sm text-neon-text/80">Reconexión automática</Label>
              </div>
              <Button 
                onClick={checkTwilioStatus} 
                disabled={isLoadingStatus} 
                className="bg-neon-medium text-neon-text hover:bg-neon-medium/80 border border-neon-accent/30"
              >
                {isLoadingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar conexión
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="test" className="space-y-6">
          <Card className="border-neon-accent/20 bg-neon-dark shadow-lg">
            <CardHeader>
              <CardTitle className="text-neon-text"><span className="neon-text">Enviar mensaje de prueba</span></CardTitle>
              <CardDescription>
                Envía un mensaje de prueba a un número de WhatsApp para verificar la integración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!twilioStatus?.configured ? (
                <Alert className="bg-amber-600/10 border-amber-500/20 text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuración incompleta</AlertTitle>
                  <AlertDescription>
                    Para enviar mensajes de prueba, primero debes configurar las credenciales de Twilio.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-neon-text/90">Número de teléfono</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+34612345678"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      className="bg-neon-darker border-neon-accent/20 text-neon-text placeholder:text-neon-text/50 focus:border-neon-accent/50"
                    />
                    <p className="text-xs text-neon-text/60">
                      Ingresa el número en formato internacional: +[código de país][número]
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-neon-text/90">Mensaje</Label>
                    <textarea
                      id="message"
                      placeholder="Escribe el mensaje aquí..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-md bg-neon-darker border border-neon-accent/20 text-neon-text placeholder:text-neon-text/50 focus:border-neon-accent/50 focus:outline-none focus:ring-1 focus:ring-neon-accent/30"
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="border-t border-neon-accent/10 pt-4">
              <Button 
                className="ml-auto bg-neon-accent/90 text-neon-dark hover:bg-neon-accent border border-neon-accent/70 neon-button"
                onClick={sendTestMessage}
                disabled={sendingMessage || !twilioStatus?.configured}
              >
                {sendingMessage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje de prueba
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhook" className="space-y-6">
          <Card className="border-neon-accent/20 bg-neon-dark shadow-lg">
            <CardHeader>
              <CardTitle className="text-neon-text"><span className="neon-text">Configuración de Webhook</span></CardTitle>
              <CardDescription>
                Configura el endpoint de webhook para recibir mensajes entrantes de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Alert className="bg-neon-medium/10 border-neon-accent/20 text-neon-text">
                  <AlertTitle className="text-neon-accent">URL del Webhook</AlertTitle>
                  <AlertDescription>
                    <p className="text-sm mb-2">
                      Configura la siguiente URL en tu panel de Twilio para recibir mensajes entrantes:
                    </p>
                    <div className="p-2 rounded bg-neon-darker border border-neon-accent/10 font-mono text-xs overflow-x-auto">
                      https://tu-dominio.com/webhooks/whatsapp
                    </div>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label className="text-neon-text/90">Método HTTP</Label>
                  <div className="p-2 rounded bg-neon-darker border border-neon-accent/10 font-mono text-sm text-neon-text/90">
                    POST
                  </div>
                </div>
                
                <Alert className="bg-blue-600/10 border-blue-500/20 text-blue-400">
                  <AlertTitle>Configuración en Twilio</AlertTitle>
                  <AlertDescription>
                    <p className="text-sm">
                      Para configurar el webhook en Twilio:
                    </p>
                    <ol className="list-decimal list-inside text-xs space-y-1 mt-2">
                      <li>Accede a tu panel de Twilio</li>
                      <li>Ve a la sección "Messaging" ➝ "Settings" ➝ "WhatsApp Sandbox Settings"</li>
                      <li>Configura la URL del webhook en "WHEN A MESSAGE COMES IN"</li>
                      <li>Selecciona el método "HTTP POST"</li>
                      <li>Guarda los cambios</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}