import OpenAI from 'openai';
import type { AgentRequest, AgentResponse, OpenAITool } from '../types';

// Inicializar cliente de OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Clase base para todos los agentes especializados
 */
export abstract class SpecializedAgent {
  abstract process(request: AgentRequest): Promise<AgentResponse>;
  abstract getFunctions(): Array<OpenAITool>;
  
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
  
  protected async callModelWithFunctions(systemPrompt: string, userInput: string, context?: any): Promise<{
    functionCall?: {
      name: string;
      arguments: any;
    };
    content?: string;
  }> {
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