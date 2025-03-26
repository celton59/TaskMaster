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
  text: "¡Hola! Soy tu asistente AI con sistema orquestado multi-agente para gestión de tareas. Tengo varios agentes especializados trabajando juntos:\n\n• Agente de Tareas: experto en crear y gestionar tareas\n• Agente de Categorías: especializado en organización por categorías\n• Agente de Análisis: para estadísticas e informes detallados\n• Agente de Planificación: para programación y fechas límite\n• Agente de Marketing Digital: especialista en estrategias digitales, campañas y contenido\n• Agente de Gestión de Proyectos: experto en planificación y gestión de equipos\n\nSimplemente dime lo que necesitas, y el agente más adecuado se encargará. ¿En qué puedo ayudarte hoy?",
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
    
    // Resaltar elementos de listas
    formattedText = formattedText.replace(/•(.*?)(?=<br>|$)/g, '<span class="text-blue-600 font-medium">•$1</span>');
    
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
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Nuevo Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryDialog(true)}
              className="flex items-center gap-1"
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
              className="flex items-center gap-1"
              disabled={messages.length <= 1}
            >
              <Archive className="h-4 w-4" />
              Guardar Chat
            </Button>
          </div>
        </div>
      
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-2xl">
              <Bot className="mr-2" size={24} />
              Sistema Multi-Agente Orquestado
            </CardTitle>
            <CardDescription className="text-blue-100">
              Inteligencia artificial avanzada para gestión completa de tareas
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto p-4 bg-gray-50">
              {messages.length === 1 && messages[0].isUser === false && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema Multi-Agente IA</h3>
                  <p className="text-gray-500 max-w-md">
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
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                      className="text-left whitespace-pre-wrap text-sm"
                    />
                    <div className={`text-xs mt-2 ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center text-left mb-4">
                  <div className="inline-block rounded-lg px-4 py-3 bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-gray-700">Procesando tu solicitud...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <CardFooter className="p-4 bg-white border-t">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Textarea
                placeholder="Escribe tu solicitud para el sistema multi-agente..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[60px]"
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
                className="px-6"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Historial de Conversaciones</DialogTitle>
            <DialogDescription>
              Selecciona una conversación anterior para cargarla
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            {savedChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay conversaciones guardadas
              </div>
            ) : (
              <div className="space-y-2">
                {savedChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className={`p-3 rounded-md border cursor-pointer transition-colors hover:bg-gray-100 
                      ${chat.id === currentChatId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{chat.title}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(chat.createdAt).toLocaleDateString()} - 
                          {chat.messages.length - 1} mensaje(s)
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-500"
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
                      <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                        <span className="text-blue-600 font-medium">Tú:</span> {chat.messages.find(m => m.isUser)?.text.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-between mt-2">
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Cerrar
            </Button>
            <Button variant="destructive" onClick={() => {
              localStorage.removeItem('aiAssistantChats');
              setSavedChats([]);
              toast({
                title: "Historial borrado",
                description: "Se han eliminado todas las conversaciones",
                variant: "default"
              });
            }} disabled={savedChats.length === 0}>
              Borrar todo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}