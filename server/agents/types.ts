/**
 * Interfaz para la solicitud que se envía al agente
 */
export interface AgentRequest {
  input: string;
  userInput?: string; // Campo para mantener compatibilidad con el código existente
  userId?: number;
  context?: any;
}

/**
 * Interfaz para la respuesta que devuelve el agente
 */
export interface AgentResponse {
  action: string;
  message: string;
  response?: string; // Campo de compatibilidad, debe ser igual a message
  data?: any;        // Campo de compatibilidad, debe ser igual a parameters
  parameters?: any;
  thought?: string;
  confidence?: number; // Para respuestas que incluyen confianza
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