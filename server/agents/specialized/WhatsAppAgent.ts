import { SpecializedAgent } from '../base/SpecializedAgent';
import { AgentRequest, AgentResponse, OpenAITool } from '../types/common';
import { sendWhatsAppMessage } from '../../services/whatsapp-service';

/**
 * Agente especializado en la gestión de comunicaciones por WhatsApp
 */
export class WhatsAppAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en la comunicación por WhatsApp.
Tu objetivo es gestionar las comunicaciones con los usuarios a través de WhatsApp, proporcionar información
relevante sobre tareas y ayudar a los usuarios a interactuar con el sistema de gestión de tareas.

Debes tener en cuenta las limitaciones del formato de WhatsApp:
- Los mensajes deben ser concisos y claros
- No puedes usar formatos complejos de texto como tablas o código
- Debes usar emojis y listas para mejorar la legibilidad

Utiliza un tono profesional pero cercano, adaptando la formalidad según el contexto del mensaje del usuario.`;

  /**
   * Devuelve las funciones que este agente puede ejecutar
   */
  getFunctions(): Array<OpenAITool> {
    return [
      {
        type: "function",
        function: {
          name: "enviarMensajeWhatsApp",
          description: "Envía un mensaje de WhatsApp a un número de teléfono específico",
          parameters: {
            type: "object",
            properties: {
              numero: {
                type: "string",
                description: "Número de teléfono del destinatario en formato E.164 (ejemplo: +34600000000)"
              },
              mensaje: {
                type: "string",
                description: "Contenido del mensaje a enviar"
              }
            },
            required: ["numero", "mensaje"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "responderUsuarioWhatsApp",
          description: "Genera una respuesta para enviar al usuario por WhatsApp",
          parameters: {
            type: "object",
            properties: {
              mensaje: {
                type: "string",
                description: "Contenido del mensaje a enviar como respuesta"
              }
            },
            required: ["mensaje"]
          }
        }
      }
    ];
  }

  /**
   * Procesa una solicitud dirigida a este agente
   */
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Analiza la solicitud usando el modelo con funciones
      const modelResponse = await this.callModelWithFunctions(
        this.systemPrompt,
        request.userInput,
        request.context
      );

      // Si hay una llamada a función, procesarla
      if (modelResponse.functionCall) {
        const { name, arguments: args } = modelResponse.functionCall;

        switch (name) {
          case "enviarMensajeWhatsApp":
            try {
              await sendWhatsAppMessage(args.numero, args.mensaje);
              return {
                action: "enviar_whatsapp",
                response: `✅ Mensaje enviado correctamente a ${args.numero}:\n"${args.mensaje}"`,
                data: { numero: args.numero, mensaje: args.mensaje },
                confidence: 0.9
              };
            } catch (error: any) {
              console.error("Error al enviar mensaje de WhatsApp:", error);
              return {
                action: "error_whatsapp",
                response: `❌ Error al enviar el mensaje de WhatsApp: ${error.message || 'Error desconocido'}`,
                confidence: 0.5
              };
            }

          case "responderUsuarioWhatsApp":
            return {
              action: "respuesta_whatsapp",
              response: args.mensaje,
              data: { mensaje: args.mensaje },
              confidence: 0.9
            };

          default:
            return {
              action: "desconocida",
              response: "No reconozco esa acción relacionada con WhatsApp.",
              confidence: 0.3
            };
        }
      }

      // Si no hay llamada a función, devolver el contenido como respuesta
      return {
        action: "respuesta_general",
        response: modelResponse.content || "No pude procesar tu solicitud relacionada con WhatsApp.",
        confidence: 0.7
      };
    } catch (error: any) {
      console.error("Error en WhatsAppAgent:", error);
      return {
        action: "error",
        response: `Ocurrió un error al procesar tu solicitud: ${error.message || 'Error desconocido'}`,
        confidence: 0.1
      };
    }
  }
}