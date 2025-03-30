import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessagesSquare, SendIcon, Loader2, Bot, Plus, Archive, History } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  title: string;
}

// Función para cargar chats guardados del localStorage
function loadSavedChats(): ChatSession[] {
  const savedChats = localStorage.getItem('aiAssistantChats');
  if (savedChats) {
    try {
      // Asegurarse de que las fechas se carguen correctamente
      const parsedChats = JSON.parse(savedChats, (key, value) => {
        if (key === 'timestamp' || key === 'createdAt') {
          return new Date(value);
        }
        return value;
      });
      
      // Verificar que los datos tengan la estructura correcta
      const validChats = parsedChats.filter((chat: any) => 
        chat && chat.id && Array.isArray(chat.messages) && chat.createdAt && chat.title
      );
      
      console.log('Chats cargados:', validChats.length);
      return validChats;
    } catch (e) {
      console.error('Error al cargar los chats guardados:', e);
      return [];
    }
  }
  return [];
}

const DEFAULT_WELCOME_MESSAGE: Message = {
  text: "**¡Bienvenido al Sistema de Gestión con IA Avanzada!**\n\nSoy tu asistente con inteligencia artificial orquestada multi-agente para optimizar tu productividad. Cuento con un equipo de especialistas virtuales trabajando juntos:\n\n• Agente de Tareas: experto en crear y gestionar tareas\n• Agente de Categorías: especializado en organización por categorías\n• Agente de Análisis: para estadísticas e informes detallados\n• Agente de Planificación: para programación y fechas límite\n• Agente de Marketing Digital: especialista en estrategias digitales, campañas y contenido\n• Agente de Gestión de Proyectos: experto en planificación y gestión de equipos\n\nSimplemente dime lo que necesitas, y el agente más adecuado se activará automáticamente para ayudarte. Puedes pedirme cosas como:\n\n• Crear una tarea urgente para mañana\n• Organizar mis tareas por prioridad\n• Generar un informe mensual de productividad\n• Desarrollar una estrategia de marketing para mi proyecto\n\n**¿En qué puedo ayudarte hoy?**",
  isUser: false,
  timestamp: new Date()
};

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    // Generar un nuevo ID único para esta sesión
    return new Date().getTime().toString();
  });
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [savedChats, setSavedChats] = useState<ChatSession[]>(loadSavedChats);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Función para guardar el chat actual
  const saveCurrentChat = () => {
    if (messages.length <= 1) {
      // No guardar chats vacíos o solo con mensaje de bienvenida
      return;
    }
    
    // Generar un título basado en los primeros mensajes
    let title = "Conversación";
    const userMessages = messages.filter(m => m.isUser);
    if (userMessages.length > 0) {
      // Usar el primer mensaje del usuario como título (truncado)
      title = userMessages[0].text.substring(0, 30);
      if (userMessages[0].text.length > 30) title += "...";
    }
    
    // Crear objeto de sesión de chat
    const chatSession: ChatSession = {
      id: currentChatId,
      messages: messages,
      createdAt: new Date(),
      title
    };
    
    // Añadir a la lista de chats guardados
    const updatedChats = [chatSession, ...savedChats.filter(chat => chat.id !== currentChatId)];
    setSavedChats(updatedChats);
    
    // Guardar en localStorage
    localStorage.setItem('aiAssistantChats', JSON.stringify(updatedChats));
    
    toast({
      title: "Chat guardado",
      description: "La conversación ha sido guardada correctamente",
      variant: "default"
    });
  };
  
  // Función para crear un nuevo chat
  const startNewChat = () => {
    // Guardar el chat actual primero si tiene mensajes
    if (messages.length > 1) {
      saveCurrentChat();
    }
    
    // Generar nuevo ID y resetear mensajes
    const newChatId = new Date().getTime().toString();
    setCurrentChatId(newChatId);
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    
    toast({
      title: "Nuevo chat",
      description: "Se ha iniciado una nueva conversación",
      variant: "default"
    });
  };
  
  // Función para cargar un chat guardado
  const loadChat = (chatId: string) => {
    const chat = savedChats.find(c => c.id === chatId);
    if (chat) {
      // Asegurarnos de que los timestamp sean objetos Date
      const processedMessages = chat.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }));
      
      console.log('Cargando chat:', chat.id, 'con', processedMessages.length, 'mensajes');
      
      setCurrentChatId(chat.id);
      setMessages(processedMessages);
      setShowHistoryDialog(false);
      
      toast({
        title: "Chat cargado",
        description: "La conversación ha sido restaurada",
        variant: "default"
      });
    } else {
      console.error('No se encontró el chat con ID:', chatId);
    }
  };
  
  // Función para eliminar un chat guardado
  const deleteChat = (chatId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    const updatedChats = savedChats.filter(chat => chat.id !== chatId);
    setSavedChats(updatedChats);
    
    // Actualizar localStorage
    localStorage.setItem('aiAssistantChats', JSON.stringify(updatedChats));
    
    toast({
      title: "Chat eliminado",
      description: "La conversación ha sido eliminada",
      variant: "default"
    });
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Efecto para hacer scroll al fondo cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Efecto para guardar el chat automáticamente cuando cambian los mensajes
  useEffect(() => {
    if (messages.length > 1) {
      // Solo guardar después de que haya al menos una interacción
      const autoSaveTimeout = setTimeout(() => {
        saveCurrentChat();
      }, 2000); // Guardar 2 segundos después de la última actualización
      
      return () => clearTimeout(autoSaveTimeout);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Agregar el mensaje del usuario
    const userMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Enviar el mensaje al sistema orquestado de agentes
      const response = await fetch('/api/ai/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Construir el mensaje del asistente con información adicional cuando sea relevante
      let messageText = result.message || "Recibí tu mensaje pero no pude procesarlo adecuadamente.";
      
      // Añadir detalles adicionales según la acción, especialmente para explicaciones
      if (input.toLowerCase().includes("que hiciste") || 
          input.toLowerCase().includes("qué hiciste") || 
          input.toLowerCase().includes("explica") || 
          input.toLowerCase().includes("explicame") || 
          input.toLowerCase().includes("explícame")) {
        
        // Añadir detalles según la acción previa
        if (result.action === 'createMarketingPlan' && result.data?.marketingPlan) {
          const plan = result.data.marketingPlan;
          messageText += `\n\nDetalles del plan de marketing creado:\n`;
          messageText += `• Título: ${plan.title}\n`;
          messageText += `• Objetivo: ${plan.objective}\n`;
          
          if (plan.channels && plan.channels.length > 0) {
            messageText += `• Canales: ${plan.channels.join(', ')}\n`;
          }
          
          if (plan.timeline) {
            messageText += `• Plazo: ${plan.timeline}\n`;
          }
          
          if (plan.kpis && plan.kpis.length > 0) {
            messageText += `• KPIs: ${plan.kpis.join(', ')}\n`;
          }
          
          if (plan.tasks && plan.tasks.length > 0) {
            messageText += `\nTareas creadas para este plan:\n`;
            plan.tasks.forEach((task: string, index: number) => {
              messageText += `${index + 1}. ${task}\n`;
            });
          }
          
          if (result.data.createdTasks && result.data.createdTasks.length > 0) {
            messageText += `\n**Se han creado ${result.data.createdTasks.length} tareas en el sistema para implementar este plan.**`;
          }
        }
      }
      
      const assistantMessage: Message = {
        text: messageText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      console.log("Respuesta del agente:", result);
      
      // Invalidar consultas basadas en la acción realizada
      if (result.action === 'createTask' || result.action === 'createTasks') {
        // Invalidar la caché para asegurar que la nueva tarea aparezca
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        // Además invalidar las estadísticas
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
        
        toast({
          title: result.action === 'createTask' ? "Tarea creada" : "Tareas creadas",
          description: result.action === 'createTask' 
            ? "La tarea se ha creado correctamente" 
            : `Se han creado ${result.data?.length || 'múltiples'} tareas correctamente`,
          variant: "default"
        });
      } else if (result.action === 'updateTask' || result.action === 'setDeadlines') {
        // Invalidar la caché cuando se actualiza una tarea
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
        
        toast({
          title: "Tarea actualizada",
          description: "La tarea se ha actualizado correctamente",
          variant: "default"
        });
      } else if (result.action === 'scheduleTasks') {
        // Invalidar la caché cuando se programan múltiples tareas
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
        
        toast({
          title: "Tareas programadas",
          description: `Se han programado ${result.data?.scheduledTasks?.length || 'múltiples'} tareas en el período especificado`,
          variant: "default"
        });
      } else if (result.action === 'deleteTask' || result.action === 'deleteTasks') {
        // Invalidar la caché cuando se elimina una tarea o varias tareas
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
        
        toast({
          title: result.action === 'deleteTask' ? "Tarea eliminada" : "Tareas eliminadas",
          description: result.action === 'deleteTask' 
            ? "La tarea se ha eliminado correctamente" 
            : `Se han eliminado ${result.data?.deletedTasks?.length || 'múltiples'} tareas correctamente`,
          variant: "default"
        });
      } else if (result.action === 'createCategory') {
        queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
        
        toast({
          title: "Categoría creada",
          description: "La categoría se ha creado correctamente",
          variant: "default"
        });
      } else if (result.action === 'updateCategory' || result.action === 'deleteCategory') {
        queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
        
        toast({
          title: result.action === 'updateCategory' ? "Categoría actualizada" : "Categoría eliminada",
          description: result.action === 'updateCategory' ? "La categoría se ha actualizado correctamente" : "La categoría se ha eliminado correctamente",
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Error al comunicarse con el asistente:', error);
      
      // Mensaje de error
      const errorMessage: Message = {
        text: '❌ Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "No pudimos procesar tu solicitud",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Convertir texto con formato simple a HTML
  const formatMessage = (text: string) => {
    // Convertir saltos de línea a <br>
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Convertir texto entre ** a negrita
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Colorear cada tipo de agente con un color neón diferente
    formattedText = formattedText.replace(/• Agente de Tareas:(.*?)(?=<br>|$)/g, 
      '<span class="flex items-center my-2 pl-1 py-1 rounded-md bg-neon-medium/10 border-l-2 border-neon-accent"><span class="text-neon-accent mr-1">•</span><span class="font-medium text-neon-accent whitespace-nowrap">Agente de Tareas:</span><span class="pl-1">$1</span></span>');
    
    formattedText = formattedText.replace(/• Agente de Categorías:(.*?)(?=<br>|$)/g, 
      '<span class="flex items-center my-2 pl-1 py-1 rounded-md bg-neon-purple/10 border-l-2 border-neon-purple"><span class="text-neon-purple mr-1">•</span><span class="font-medium text-neon-purple whitespace-nowrap">Agente de Categorías:</span><span class="pl-1">$1</span></span>');
      
    formattedText = formattedText.replace(/• Agente de Análisis:(.*?)(?=<br>|$)/g, 
      '<span class="flex items-center my-2 pl-1 py-1 rounded-md bg-neon-green/10 border-l-2 border-neon-green"><span class="text-neon-green mr-1">•</span><span class="font-medium text-neon-green whitespace-nowrap">Agente de Análisis:</span><span class="pl-1">$1</span></span>');
      
    formattedText = formattedText.replace(/• Agente de Planificación:(.*?)(?=<br>|$)/g, 
      '<span class="flex items-center my-2 pl-1 py-1 rounded-md bg-neon-yellow/10 border-l-2 border-neon-yellow"><span class="text-neon-yellow mr-1">•</span><span class="font-medium text-neon-yellow whitespace-nowrap">Agente de Planificación:</span><span class="pl-1">$1</span></span>');
      
    formattedText = formattedText.replace(/• Agente de Marketing Digital:(.*?)(?=<br>|$)/g, 
      '<span class="flex items-start my-2 pl-1 py-1 rounded-md bg-neon-orange/10 border-l-2 border-neon-orange"><span class="text-neon-orange mr-1">•</span><span class="font-medium text-neon-orange whitespace-nowrap">Agente de Marketing Digital:</span><span class="pl-1">$1</span></span>');
      
    formattedText = formattedText.replace(/• Agente de Gestión de Proyectos:(.*?)(?=<br>|$)/g, 
      '<span class="flex items-start my-2 pl-1 py-1 rounded-md bg-neon-red/10 border-l-2 border-neon-red"><span class="text-neon-red mr-1">•</span><span class="font-medium text-neon-red whitespace-nowrap">Agente de Gestión de Proyectos:</span><span class="pl-1">$1</span></span>');
    
    // Colorear los ejemplos de uso en el mensaje de bienvenida
    formattedText = formattedText.replace(/• Crear una tarea urgente para mañana/g,
      '<span class="flex items-center my-2 pl-1 py-1 rounded-md bg-neon-accent/5 border-l-2 border-neon-accent/60"><span class="text-neon-accent mr-1">•</span><span class="text-neon-accent">Crear una tarea urgente para mañana</span></span>');
      
    formattedText = formattedText.replace(/• Organizar mis tareas por prioridad/g,
      '<span class="flex items-center my-2 pl-1 py-1 rounded-md bg-neon-purple/5 border-l-2 border-neon-purple/60"><span class="text-neon-purple mr-1">•</span><span class="text-neon-purple">Organizar mis tareas por prioridad</span></span>');
      
    formattedText = formattedText.replace(/• Generar un informe mensual de productividad/g,
      '<span class="flex items-center my-2 pl-1 py-1 rounded-md bg-neon-green/5 border-l-2 border-neon-green/60"><span class="text-neon-green mr-1">•</span><span class="text-neon-green">Generar un informe mensual de productividad</span></span>');
      
    formattedText = formattedText.replace(/• Desarrollar una estrategia de marketing para mi proyecto/g,
      '<span class="flex items-center my-2 pl-1 py-1 rounded-md bg-neon-orange/5 border-l-2 border-neon-orange/60"><span class="text-neon-orange mr-1">•</span><span class="text-neon-orange">Desarrollar una estrategia de marketing para mi proyecto</span></span>');
    
    // Para los elementos de lista generales que no sean agentes específicos ni ejemplos (ya procesados)
    formattedText = formattedText.replace(/• ([^<]*?)(?=<br>|$)/g, function(match, p1) {
      // Si ya contiene "Agente de" o es uno de los ejemplos específicos, no lo reemplazamos
      if (match.includes("Agente de") || 
          match.includes("Crear una tarea") ||
          match.includes("Organizar mis tareas") ||
          match.includes("Generar un informe") ||
          match.includes("Desarrollar una estrategia")) return match;
      return `<span class="flex items-center my-2 pl-1"><span class="text-neon-accent mr-1">•</span> ${p1}</span>`;
    });
    
    return formattedText;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        {/* Botones de acción */}
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startNewChat}
              className="flex items-center gap-1 border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20 shadow-[0_0_8px_rgba(0,225,255,0.15)]"
            >
              <Plus className="h-4 w-4" />
              Nuevo Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryDialog(true)}
              className="flex items-center gap-1 border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20 shadow-[0_0_8px_rgba(0,225,255,0.15)]"
            >
              <History className="h-4 w-4" />
              Historial
            </Button>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={saveCurrentChat}
              className="flex items-center gap-1 border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20 shadow-[0_0_8px_rgba(0,225,255,0.15)]"
              disabled={messages.length <= 1}
            >
              <Archive className="h-4 w-4" />
              Guardar Chat
            </Button>
          </div>
        </div>
      
        <Card className="bg-neon-darker border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)] rounded-xl">
          <CardHeader className="bg-gradient-to-r from-neon-darker to-neon-medium border-b border-neon-accent/30 rounded-t-xl">
            <CardTitle className="flex items-center text-2xl neon-text">
              <Bot className="mr-2" size={24} />
              Sistema Multi-Agente Orquestado
            </CardTitle>
            <CardDescription className="text-neon-text/70">
              Inteligencia artificial avanzada para gestión completa de tareas
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto p-4 bg-gradient-to-b from-neon-darker to-[#071a28]">
              {messages.length === 1 && messages[0].isUser === false && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 bg-neon-medium/30 rounded-full flex items-center justify-center mb-4 border border-neon-accent/40 shadow-[0_0_15px_rgba(0,225,255,0.3)]">
                    <Bot className="h-8 w-8 text-neon-accent" />
                  </div>
                  <h3 className="text-lg font-medium neon-text mb-2">Sistema Multi-Agente IA</h3>
                  <p className="text-neon-text/80 max-w-md">
                    El sistema inteligente orquestará automáticamente múltiples agentes especializados según tu necesidad.
                    Ahora con expertos en marketing digital y gestión de proyectos.
                    Ejemplo: "Analiza mis tareas pendientes y priorízalas según fechas límite" o "Desarrolla una estrategia de marketing para mi proyecto"
                  </p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`inline-block rounded-lg px-4 py-3 max-w-[85%] ${
                      message.isUser 
                        ? 'bg-gradient-to-r from-neon-medium to-neon-accent/30 text-neon-text border border-neon-accent/60 shadow-[0_0_10px_rgba(0,225,255,0.25)]' 
                        : 'bg-neon-darker/90 border border-neon-accent/20 shadow-[0_0_15px_rgba(0,225,255,0.15)]'
                    }`}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                      className="text-left whitespace-pre-wrap text-sm"
                    />
                    <div className={`text-xs mt-2 ${message.isUser ? 'text-neon-accent/70' : 'text-neon-accent/50'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center text-left mb-4">
                  <div className="inline-block rounded-lg px-4 py-3 bg-neon-darker/90 border border-neon-accent/30 shadow-[0_0_15px_rgba(0,225,255,0.15)]">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 text-neon-accent animate-spin" />
                      <span className="text-sm text-neon-text">Procesando tu solicitud...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <CardFooter className="p-4 bg-neon-darker border-t border-neon-accent/20">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Textarea
                placeholder="Escribe tu solicitud para el sistema multi-agente..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[60px] bg-neon-medium/20 border-neon-accent/30 text-neon-text placeholder:text-neon-text/50 focus-visible:ring-neon-accent/50"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
                      handleSubmit(e);
                    }
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="px-6 neon-button"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
      
      {/* Modal de historial de chat */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-md bg-neon-darker border-neon-accent/30 shadow-[0_0_20px_rgba(0,225,255,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-neon-text neon-text">Historial de Conversaciones</DialogTitle>
            <DialogDescription className="text-neon-text/70">
              Selecciona una conversación anterior para cargarla
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            {savedChats.length === 0 ? (
              <div className="text-center py-8 text-neon-text/50">
                No hay conversaciones guardadas
              </div>
            ) : (
              <div className="space-y-2">
                {savedChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className={`p-3 rounded-md border cursor-pointer transition-colors hover:bg-neon-medium/10 
                      ${chat.id === currentChatId 
                        ? 'bg-neon-medium/20 border-neon-accent/40 shadow-[0_0_8px_rgba(0,225,255,0.25)]' 
                        : 'bg-neon-darker/80 border-neon-accent/20'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-neon-text truncate">{chat.title}</h4>
                        <p className="text-xs text-neon-text/60">
                          {new Date(chat.createdAt).toLocaleDateString()} - 
                          {chat.messages.length - 1} mensaje(s)
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-neon-red/10 hover:text-neon-red"
                        onClick={(e) => deleteChat(chat.id, e)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>
                    
                    {/* Previsualización del primer mensaje */}
                    {chat.messages.length > 1 && (
                      <div className="mt-2 text-xs text-neon-text/70 line-clamp-2">
                        <span className="text-neon-accent font-medium">Tú:</span> {chat.messages.find(m => m.isUser)?.text.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-between mt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowHistoryDialog(false)}
              className="border-neon-accent/30 text-neon-accent hover:bg-neon-medium/20 shadow-[0_0_8px_rgba(0,225,255,0.15)]"
            >
              Cerrar
            </Button>
            <Button 
              variant="outline"
              className="border-neon-red/30 text-neon-red hover:bg-neon-red/10 shadow-[0_0_8px_rgba(255,45,109,0.15)]"
              onClick={() => {
                localStorage.removeItem('aiAssistantChats');
                setSavedChats([]);
                toast({
                  title: "Historial borrado",
                  description: "Se han eliminado todas las conversaciones",
                  variant: "default"
                });
              }} 
              disabled={savedChats.length === 0}
            >
              Borrar todo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}