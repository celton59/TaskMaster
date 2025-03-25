import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessagesSquare, SendIcon, Loader2 } from 'lucide-react';
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
      text: "¡Hola! Soy tu asistente para crear tareas. Puedes decirme qué tarea necesitas crear y yo la crearé por ti. Por ejemplo: 'Necesito entregar el informe de ventas para el viernes'.",
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
      // Enviar el mensaje a la API
      const response = await apiRequest('/api/ai/create-task', 'POST', { 
        text: userMessage.text 
      });
      
      const result = await response.json();
      
      // Crear mensaje de respuesta
      let responseText = '';
      
      if (result.task) {
        const task = result.task;
        responseText = `✅ ¡Tarea creada exitosamente!\n\n**${task.title}**\n\nPrioridad: ${task.priority}\nEstado: ${task.status}\n${task.categoryId ? `Categoría: ${task.categoryId}` : ''}`;
        
        // Invalidar la caché para que se actualice la lista de tareas
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      } else {
        responseText = `❌ No pude crear la tarea: ${result.message || 'Error desconocido'}`;
      }
      
      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        text: responseText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
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
      // Desplazar hacia abajo para mostrar el último mensaje
      setTimeout(scrollToBottom, 100);
    }
  };

  // Convertir texto con formato simple a HTML
  const formatMessage = (text: string) => {
    // Convertir saltos de línea a <br>
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Convertir texto entre ** a negrita
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
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
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`inline-block rounded-lg px-4 py-2 max-w-[85%] ${
                      message.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                      className="text-left whitespace-pre-wrap"
                    />
                    <div className={`text-xs mt-1 ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
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