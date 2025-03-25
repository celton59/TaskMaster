import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessagesSquare, SendIcon, Loader2, Bot } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "¡Hola! Soy tu asistente AI con sistema orquestado multi-agente para gestión de tareas. Tengo varios agentes especializados trabajando juntos:\n\n• Agente de Tareas: experto en crear y gestionar tareas\n• Agente de Categorías: especializado en organización por categorías\n• Agente de Análisis: para estadísticas e informes detallados\n• Agente de Planificación: para programación y fechas límite\n\nSimplemente dime lo que necesitas, y el agente más adecuado se encargará. ¿En qué puedo ayudarte hoy?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Efecto para hacer scroll al fondo cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
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
      
      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        text: result.message || "Recibí tu mensaje pero no pude procesarlo adecuadamente.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      console.log("Respuesta del agente:", result);
      
      // Invalidar consultas si se creó una tarea o categoría
      if (result.action === 'createTask') {
        // Invalidar la caché para asegurar que la nueva tarea aparezca
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        // Además invalidar las estadísticas
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats'] });
        
        toast({
          title: "Tarea creada",
          description: "La tarea se ha creado correctamente",
          variant: "default"
        });
      } else if (result.action === 'createCategory') {
        queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
        
        toast({
          title: "Categoría creada",
          description: "La categoría se ha creado correctamente",
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
                    Ejemplo: "Analiza mis tareas pendientes y priorízalas según fechas límite"
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
    </div>
  );
}