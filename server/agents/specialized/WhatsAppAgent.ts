import { storage } from "../../storage";
import { MessageDirection } from "../../../shared/schema";
import { sendWhatsAppMessage } from "../../services/whatsapp-service";
import { SpecializedAgent } from "./base-agent";
import type { AgentRequest, AgentResponse, OpenAITool } from "../types";

/**
 * Agente especializado en la gestión de mensajes de WhatsApp
 */
export class WhatsAppAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en gestionar mensajes de WhatsApp.
Tu objetivo es ayudar al usuario a enviar mensajes a sus contactos, consultar conversaciones y gestionar la comunicación por WhatsApp.
Responde de manera clara, precisa y profesional. Antes de enviar mensajes, verifica que el contacto existe en la base de datos.

IMPORTANTE:
- Nunca inventes contactos que no estén en la base de datos
- Pide confirmación antes de enviar mensajes sensibles o importantes
- Mantén un tono profesional y amigable en las comunicaciones
- Proporciona detalles sobre el estado de entrega de los mensajes
- Informa sobre errores de manera clara y sugiere soluciones`;

  getFunctions(): Array<OpenAITool> {
    return [
      {
        type: "function",
        function: {
          name: "send_whatsapp_message",
          description: "Envía un mensaje de WhatsApp a un contacto específico",
          parameters: {
            type: "object",
            properties: {
              contactPhoneNumber: {
                type: "string",
                description: "Número de teléfono del contacto en formato internacional (ej: +34612345678)",
              },
              contactName: {
                type: "string",
                description: "Nombre del contacto (opcional, si se proporciona se verifica contra la base de datos)",
              },
              message: {
                type: "string",
                description: "Mensaje que se enviará al contacto",
              },
            },
            required: ["contactPhoneNumber", "message"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "list_whatsapp_contacts",
          description: "Obtiene la lista de contactos de WhatsApp disponibles",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_contact_messages",
          description: "Obtiene el historial de mensajes con un contacto específico",
          parameters: {
            type: "object",
            properties: {
              contactPhoneNumber: {
                type: "string",
                description: "Número de teléfono del contacto en formato internacional (ej: +34612345678)",
              },
              limit: {
                type: "number",
                description: "Número máximo de mensajes a obtener (opcional, por defecto 10)",
              },
            },
            required: ["contactPhoneNumber"],
          },
        },
      },
    ];
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    const response = await this.callModelWithFunctions(this.systemPrompt, request.input, request.context);

    if (response.functionCall) {
      const functionName = response.functionCall.name;
      const args = response.functionCall.arguments;

      switch (functionName) {
        case "send_whatsapp_message":
          return await this.handleSendWhatsAppMessage(args, request.input);
        case "list_whatsapp_contacts":
          return await this.handleListWhatsAppContacts(request.input);
        case "get_contact_messages":
          return await this.handleGetContactMessages(args, request.input);
        default:
          return {
            action: "response",
            message: "No se reconoce la función solicitada. Por favor, intenta con una acción diferente."
          };
      }
    }

    return {
      action: "response",
      message: response.content || "Lo siento, no pude procesar tu solicitud. Por favor, intenta nuevamente."
    };
  }

  private async handleSendWhatsAppMessage(
    args: { contactPhoneNumber: string; contactName?: string; message: string },
    userInput: string
  ): Promise<AgentResponse> {
    try {
      // Verificar si el contacto existe en la base de datos
      const contact = await storage.getWhatsappContactByPhone(args.contactPhoneNumber);

      if (!contact) {
        return {
          action: "response",
          response: `No encontré ningún contacto con el número ${args.contactPhoneNumber}. ¿Quieres añadirlo a tu lista de contactos primero?`,
          confidence: 1.0
        };
      }

      // Si se proporcionó un nombre, verificar que coincida
      if (args.contactName && contact.name.toLowerCase() !== args.contactName.toLowerCase()) {
        return {
          action: "response",
          response: `El nombre proporcionado (${args.contactName}) no coincide con el contacto registrado (${contact.name}). ¿Quieres continuar con el envío al contacto ${contact.name}?`,
          confidence: 1.0
        };
      }

      // Enviar el mensaje
      const result = await sendWhatsAppMessage(args.contactPhoneNumber, args.message);

      if (result.success) {
        // Registrar el mensaje en la base de datos
        await storage.createWhatsappMessage({
          contactId: contact.id,
          messageContent: args.message,
          direction: MessageDirection.OUTGOING,
          status: "sent",
          metadata: { sentVia: "agent" },
        });

        return {
          action: "whatsapp_message_sent",
          response: `¡Mensaje enviado correctamente a ${contact.name}! El mensaje se está entregando ahora.`,
          data: {
            contactName: contact.name,
            contactPhone: contact.phoneNumber,
            message: args.message,
          },
          confidence: 1.0
        };
      } else {
        return {
          action: "response",
          response: `Hubo un problema al enviar el mensaje: ${result.error || "Error desconocido"}. Por favor, verifica la configuración de WhatsApp e intenta nuevamente.`,
          confidence: 1.0
        };
      }
    } catch (error) {
      console.error("Error en handleSendWhatsAppMessage:", error);
      return {
        action: "response",
        response: `Lo siento, ocurrió un error al intentar enviar el mensaje. Detalles: ${error instanceof Error ? error.message : "Error desconocido"}`,
        confidence: 1.0
      };
    }
  }

  private async handleListWhatsAppContacts(userInput: string): Promise<AgentResponse> {
    try {
      const contacts = await storage.getWhatsappContacts();

      if (contacts.length === 0) {
        return {
          action: "response",
          response: "No tienes contactos de WhatsApp guardados. Para agregar contactos, ve a la sección de Configuración de WhatsApp.",
          confidence: 1.0
        };
      }

      // Formatear la lista de contactos
      const contactList = contacts.map((contact) => {
        return `- ${contact.name} (${contact.phoneNumber})${contact.notes ? ` - ${contact.notes}` : ""}`;
      }).join("\n");

      return {
        action: "whatsapp_contacts_listed",
        response: `Aquí están tus contactos de WhatsApp:\n\n${contactList}`,
        data: {
          contacts: contacts,
        },
        confidence: 1.0
      };
    } catch (error) {
      console.error("Error en handleListWhatsAppContacts:", error);
      return {
        action: "response",
        response: `Lo siento, ocurrió un error al intentar obtener tus contactos. Detalles: ${error instanceof Error ? error.message : "Error desconocido"}`,
        confidence: 1.0
      };
    }
  }

  private async handleGetContactMessages(
    args: { contactPhoneNumber: string; limit?: number },
    userInput: string
  ): Promise<AgentResponse> {
    try {
      // Verificar si el contacto existe
      const contact = await storage.getWhatsappContactByPhone(args.contactPhoneNumber);

      if (!contact) {
        return {
          action: "response",
          response: `No encontré ningún contacto con el número ${args.contactPhoneNumber}.`,
          confidence: 1.0
        };
      }

      // Obtener mensajes para este contacto
      const messages = await storage.getWhatsappMessages(contact.id);

      if (messages.length === 0) {
        return {
          action: "response",
          response: `No hay mensajes intercambiados con ${contact.name} (${contact.phoneNumber}).`,
          confidence: 1.0
        };
      }

      // Limitar la cantidad de mensajes si es necesario
      const limit = args.limit || 10;
      const limitedMessages = messages.slice(0, limit);

      // Formatear los mensajes
      const formattedMessages = limitedMessages
        .map((msg) => {
          const direction = msg.direction === MessageDirection.INCOMING ? "Recibido" : "Enviado";
          const date = new Date(msg.sentAt).toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return `- [${date}] ${direction}: "${msg.messageContent}"`;
        })
        .join("\n");

      return {
        action: "whatsapp_messages_retrieved",
        response: `Aquí están los últimos ${limitedMessages.length} mensajes con ${contact.name}:\n\n${formattedMessages}`,
        data: {
          contact: contact,
          messages: limitedMessages,
        },
        confidence: 1.0
      };
    } catch (error) {
      console.error("Error en handleGetContactMessages:", error);
      return {
        action: "response",
        response: `Lo siento, ocurrió un error al intentar obtener los mensajes. Detalles: ${error instanceof Error ? error.message : "Error desconocido"}`,
        confidence: 1.0
      };
    }
  }
}