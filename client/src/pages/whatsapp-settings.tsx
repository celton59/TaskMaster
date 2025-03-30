import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Loader2, 
  PhoneCall, 
  MessageCircle, 
  Users, 
  Plus, 
  Pencil, 
  Trash2 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function WhatsAppSettings() {
  // Estados para mensajes de prueba
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("¡Hola! Este es un mensaje de prueba desde Aitorin.");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedTab, setSelectedTab] = useState("general");
  
  // Estados para contactos
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Definir los tipos para las respuestas de la API
  interface TwilioStatusResponse {
    status: 'success' | 'error';
    message: string;
    configured?: boolean;
    phoneConfigured?: boolean;
    phoneNumber?: string;
  }
  
  interface WhatsAppContact {
    id: number;
    name: string;
    phoneNumber: string;
    active: boolean;
    notes: string | null;
    createdAt: string;
    updatedAt: string | null;
    lastMessageAt: string | null;
  }
  
  // Consultar los contactos de WhatsApp
  const { data: contacts, isLoading: isLoadingContacts, refetch: refetchContacts } = useQuery<WhatsAppContact[]>({
    queryKey: ["/api/whatsapp/contacts"],
    refetchOnWindowFocus: false,
  });
  
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
  
  // Mutación para crear un nuevo contacto
  const createContactMutation = useMutation({
    mutationFn: async (contactData: { name: string, phoneNumber: string, notes: string | null }) => {
      return await apiRequest("/api/whatsapp/contacts", "POST", contactData);
    },
    onSuccess: () => {
      // Actualizar la lista de contactos
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/contacts"] });
      // Limpiar el formulario
      setContactName("");
      setContactPhone("");
      setContactNotes("");
      setIsContactDialogOpen(false);
      
      toast({
        title: "Contacto creado",
        description: "El contacto ha sido creado correctamente",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Error al crear contacto:", error);
      toast({
        title: "Error al crear contacto",
        description: error?.message || "No se pudo crear el contacto, intenta nuevamente",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para actualizar un contacto
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: { name?: string, phoneNumber?: string, notes?: string | null, active?: boolean } }) => {
      return await apiRequest(`/api/whatsapp/contacts/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      // Actualizar la lista de contactos
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/contacts"] });
      // Limpiar el formulario
      setContactName("");
      setContactPhone("");
      setContactNotes("");
      setEditingContactId(null);
      setIsContactDialogOpen(false);
      
      toast({
        title: "Contacto actualizado",
        description: "El contacto ha sido actualizado correctamente",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Error al actualizar contacto:", error);
      toast({
        title: "Error al actualizar contacto",
        description: error?.message || "No se pudo actualizar el contacto, intenta nuevamente",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para eliminar un contacto
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/whatsapp/contacts/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      // Actualizar la lista de contactos
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/contacts"] });
      
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Error al eliminar contacto:", error);
      toast({
        title: "Error al eliminar contacto",
        description: error?.message || "No se pudo eliminar el contacto, intenta nuevamente",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });
  
  // Función para abrir el formulario de nuevo contacto
  const handleAddContact = () => {
    setContactName("");
    setContactPhone("");
    setContactNotes("");
    setEditingContactId(null);
    setIsContactDialogOpen(true);
  };
  
  // Función para abrir el formulario de edición de contacto
  const handleEditContact = (contact: WhatsAppContact) => {
    setContactName(contact.name);
    setContactPhone(contact.phoneNumber);
    setContactNotes(contact.notes || "");
    setEditingContactId(contact.id);
    setIsContactDialogOpen(true);
  };
  
  // Función para eliminar un contacto
  const handleDeleteContact = async (id: number) => {
    setIsDeleting(true);
    await deleteContactMutation.mutateAsync(id);
  };
  
  // Función para guardar un contacto (nuevo o actualizado)
  const handleSaveContact = async () => {
    // Validar los campos requeridos
    if (!contactName || !contactPhone) {
      toast({
        title: "Campos requeridos",
        description: "El nombre y número de teléfono son obligatorios",
        variant: "destructive",
      });
      return;
    }
    
    // Validar formato del número de teléfono
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(contactPhone)) {
      toast({
        title: "Formato de teléfono incorrecto",
        description: "El número debe tener el formato +[código de país][número] (ej: +34612345678)",
        variant: "destructive",
      });
      return;
    }
    
    // Crear o actualizar contacto
    if (editingContactId === null) {
      // Crear nuevo contacto
      await createContactMutation.mutateAsync({
        name: contactName,
        phoneNumber: contactPhone,
        notes: contactNotes || null,
      });
    } else {
      // Actualizar contacto existente
      await updateContactMutation.mutateAsync({
        id: editingContactId,
        data: {
          name: contactName,
          phoneNumber: contactPhone,
          notes: contactNotes || null,
        }
      });
    }
  };
  
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
        <TabsList className="w-full grid grid-cols-4 mb-6 bg-neon-medium/30 border border-neon-accent/20">
          <TabsTrigger value="general" className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent">
            General
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent">
            Contactos
          </TabsTrigger>
          <TabsTrigger value="test" className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent">
            Pruebas
          </TabsTrigger>
          <TabsTrigger value="webhook" className="data-[state=active]:bg-neon-accent/20 data-[state=active]:text-neon-accent">
            Webhook
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts" className="space-y-6">
          <Card className="border-neon-accent/20 bg-neon-dark shadow-lg">
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle className="text-neon-text"><span className="neon-text">Contactos de WhatsApp</span></CardTitle>
                <CardDescription>
                  Gestiona los contactos para enviar mensajes de WhatsApp
                </CardDescription>
              </div>
              
              <Button
                onClick={handleAddContact}
                className="bg-neon-accent/90 text-neon-dark hover:bg-neon-accent border border-neon-accent/70 neon-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir contacto
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingContacts ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-neon-accent" />
                  <span className="ml-2 text-neon-text/80">Cargando contactos...</span>
                </div>
              ) : contacts && contacts.length > 0 ? (
                <div className="rounded-md border border-neon-accent/20 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-neon-medium/20">
                      <TableRow className="hover:bg-neon-medium/30 border-neon-accent/10">
                        <TableHead className="text-neon-text/90 font-medium">Nombre</TableHead>
                        <TableHead className="text-neon-text/90 font-medium">Teléfono</TableHead>
                        <TableHead className="text-neon-text/90 font-medium">Estado</TableHead>
                        <TableHead className="text-neon-text/90 font-medium">Última actividad</TableHead>
                        <TableHead className="text-neon-text/90 font-medium text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id} className="hover:bg-neon-medium/10 border-neon-accent/10">
                          <TableCell className="font-medium text-neon-text">{contact.name}</TableCell>
                          <TableCell className="text-neon-text/90">{contact.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge 
                              className={`${contact.active ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-600/20 text-slate-400 border-slate-500/50'}`}
                            >
                              {contact.active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-neon-text/80 text-sm">
                            {contact.lastMessageAt ? new Date(contact.lastMessageAt).toLocaleString('es-ES', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Nunca'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditContact(contact)}
                                className="h-8 w-8 text-neon-accent hover:text-neon-accent/80 hover:bg-neon-medium/20"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteContact(contact.id)}
                                disabled={isDeleting}
                                className="h-8 w-8 text-rose-400 hover:text-rose-400/80 hover:bg-rose-500/10"
                              >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-neon-accent/20 rounded-lg bg-neon-medium/5">
                  <Users className="h-12 w-12 mx-auto text-neon-accent/30" />
                  <h3 className="mt-4 text-lg font-medium text-neon-text">No hay contactos</h3>
                  <p className="mt-1 text-neon-text/70">
                    Añade tu primer contacto para comenzar a enviar mensajes
                  </p>
                  <Button
                    onClick={handleAddContact}
                    className="mt-4 bg-neon-accent/90 text-neon-dark hover:bg-neon-accent border border-neon-accent/70 neon-button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir contacto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Modal de contacto */}
          <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogContent className="bg-neon-dark border-neon-accent/30 text-neon-text">
              <DialogHeader>
                <DialogTitle className="neon-text">
                  {editingContactId ? 'Editar contacto' : 'Nuevo contacto'}
                </DialogTitle>
                <DialogDescription>
                  {editingContactId 
                    ? 'Modifica los datos del contacto para actualizar la información.' 
                    : 'Añade un nuevo contacto para enviar mensajes de WhatsApp.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-neon-text/90">Nombre</Label>
                  <Input
                    id="contact-name"
                    placeholder="Nombre del contacto"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="bg-neon-darker border-neon-accent/20 text-neon-text placeholder:text-neon-text/50 focus:border-neon-accent/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="text-neon-text/90">Número de teléfono</Label>
                  <Input
                    id="contact-phone"
                    placeholder="+34612345678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="bg-neon-darker border-neon-accent/20 text-neon-text placeholder:text-neon-text/50 focus:border-neon-accent/50"
                  />
                  <p className="text-xs text-neon-text/60">
                    Formato internacional: +[código de país][número]
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-notes" className="text-neon-text/90">Notas</Label>
                  <Textarea
                    id="contact-notes"
                    placeholder="Información adicional del contacto"
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    className="bg-neon-darker border-neon-accent/20 text-neon-text placeholder:text-neon-text/50 focus:border-neon-accent/50 min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsContactDialogOpen(false)}
                  className="border-neon-accent/20 text-neon-text hover:bg-neon-medium/20"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveContact}
                  disabled={createContactMutation.isPending || updateContactMutation.isPending}
                  className="bg-neon-accent/90 text-neon-dark hover:bg-neon-accent border border-neon-accent/70 neon-button"
                >
                  {(createContactMutation.isPending || updateContactMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingContactId ? 'Actualizar' : 'Guardar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
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