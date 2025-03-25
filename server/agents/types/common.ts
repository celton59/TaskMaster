/**
 * Definiciones de tipos comunes para el sistema de agentes
 */

// Definir tipo para las herramientas que usamos con OpenAI
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

// Interfaces para los agentes
export interface AgentRequest {
  userInput: string;
  context?: any;
}

export interface AgentResponse {
  action?: string;
  response: string;
  data?: any;
  confidence: number;
  metadata?: any;
}

export interface ConversationHistoryItem {
  userInput: string;
  agentType: string;
  action?: string;
  response: string;
  timestamp: Date;
}

export interface FunctionCallResult {
  functionCall?: {
    name: string;
    arguments: any;
  };
  content?: string;
}