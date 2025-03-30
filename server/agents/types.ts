/**
 * Interfaz para la solicitud que se envía al agente
 */
export interface AgentRequest {
  input: string;
  userId?: number;
  context?: any;
}

/**
 * Interfaz para la respuesta que devuelve el agente
 */
export interface AgentResponse {
  action: string;
  message: string;
  parameters?: any;
  thought?: string;
}

/**
 * Tipo para las herramientas de OpenAI
 */
export interface OpenAITool {
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
}