/**
 * Definiciones de tipos comunes para el sistema de agentes
 */

/**
 * Estructura de una herramienta (tool) para OpenAI
 */
export type OpenAITool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  };
};

/**
 * Solicitud a un agente
 */
export interface AgentRequest {
  userInput: string;
  context?: any;
}

/**
 * Respuesta de un agente
 */
export interface AgentResponse {
  action?: string;
  response: string;
  data?: any;
  confidence: number;
  metadata?: any;
}

/**
 * Elemento del historial de conversación
 */
export interface ConversationHistoryItem {
  userInput: string;
  agentType: string;
  action?: string;
  response: string;
  timestamp: Date;
}

/**
 * Resultado de una llamada a función o tool
 */
export interface FunctionCallResult {
  functionCall?: {
    name: string;
    arguments: any;
  };
  content?: string;
}