import OpenAI from 'openai';
import { AgentRequest, AgentResponse, FunctionCallResult, OpenAITool } from '../types/common';

// Inicializar cliente de OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Clase abstracta que define la estructura básica para todos los agentes especializados
 */
export abstract class SpecializedAgent {
  /**
   * Método principal para procesar solicitudes del usuario
   * @param request La solicitud del usuario y su contexto
   * @returns Respuesta del agente
   */
  abstract process(request: AgentRequest): Promise<AgentResponse>;
  
  /**
   * Obtiene las herramientas (tools) que este agente puede utilizar
   * @returns Lista de herramientas disponibles
   */
  abstract getFunctions(): Array<OpenAITool>;
  
  /**
   * Realiza una llamada simple al modelo para obtener una respuesta en texto
   * @param systemPrompt Instrucciones para el modelo
   * @param userInput Entrada del usuario
   * @param context Contexto adicional opcional
   * @returns Respuesta del modelo como texto
   */
  protected async callModel(systemPrompt: string, userInput: string, context?: any): Promise<string> {
    const contextString = context ? `\nContexto del sistema:\n${JSON.stringify(context, null, 2)}` : '';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Usar el modelo más reciente de OpenAI
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `${contextString}\n\nSolicitud del usuario: ${userInput}`
        }
      ],
      response_format: { type: "json_object" } // Asegurar respuesta en formato JSON
    });
    
    return response.choices[0]?.message?.content || "";
  }
  
  /**
   * Realiza una llamada al modelo con capacidad de invocar herramientas (tools)
   * @param systemPrompt Instrucciones para el modelo
   * @param userInput Entrada del usuario
   * @param context Contexto adicional opcional
   * @returns Resultado que puede incluir una llamada a función o texto
   */
  protected async callModelWithFunctions(systemPrompt: string, userInput: string, context?: any): Promise<FunctionCallResult> {
    const contextString = context ? `\nContexto del sistema:\n${JSON.stringify(context, null, 2)}` : '';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Usar el modelo más reciente de OpenAI
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `${contextString}\n\nSolicitud del usuario: ${userInput}`
        }
      ],
      tools: this.getFunctions(), // Usar tools en lugar de functions
      tool_choice: "auto" // Reemplaza function_call
    });
    
    const message = response.choices[0]?.message;
    
    if (message?.tool_calls && message.tool_calls.length > 0) {
      try {
        // Usamos el primer tool_call (podríamos manejar múltiples en el futuro)
        const toolCall = message.tool_calls[0];
        // Solo procesamos llamadas a funciones por ahora
        if (toolCall.type === "function") {
          const args = JSON.parse(toolCall.function.arguments);
          return {
            functionCall: {
              name: toolCall.function.name,
              arguments: args
            }
          };
        }
      } catch (error) {
        console.error("Error al parsear argumentos de tool call:", error);
        return { content: message.content || "" };
      }
    }
    
    return { content: message?.content || "" };
  }
}