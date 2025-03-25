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
      text: "¡Hola! Soy tu asistente AI para gestión de tareas. Puedo hacer lo siguiente:\n\n• Crear nuevas tareas\n• Listar tareas existentes\n• Crear y listar categorías\n• Responder preguntas sobre gestión de tareas\n\nCuéntame, ¿en qué puedo ayudarte hoy?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionViewOpen, setActionViewOpen] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [actionData, setActionData] = useState<any>(null);
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
      // Enviar el mensaje a la API del agente
      const response = await apiRequest('/api/ai/agent', 'POST', { 
        message: userMessage.text 
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result = await response.json() as AgentActionData;
      
      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        text: result.message,
        isUser: false,
        timestamp: new Date(),
        action: result.action,
        data: result
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Manejar datos según la acción realizada
      if (result.action === 'createTask' && result.task) {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        setCurrentAction('createTask');
        setActionData(result.task);
      } else if (result.action === 'listTasks' && result.tasks) {
        setCurrentAction('listTasks');
        setActionData(result.tasks);
      } else if (result.action === 'createCategory' && result.category) {
        queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
        setCurrentAction('createCategory');
        setActionData(result.category);
      } else if (result.action === 'listCategories' && result.categories) {
        setCurrentAction('listCategories');
        setActionData(result.categories);
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
              <MessagesSquare className="mr-2" size={24} />
              Asistente para Tareas
            </CardTitle>
            <CardDescription className="text-blue-100">
              Conversación natural para crear nuevas tareas
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto p-4 bg-gray-50">
              {messages.length === 1 && messages[0].isUser === false && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <MessagesSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Asistente de tareas IA</h3>
                  <p className="text-gray-500 max-w-md">
                    Describe tu tarea de forma natural y el asistente la creará para ti.
                    Ejemplo: "Necesito preparar una presentación para el cliente ABC el próximo jueves"
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
                placeholder="Describe tu tarea aquí..."
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