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
- Cuando el usuario solicita enviar un mensaje a un contacto, DEBES utilizar la función send_whatsapp_message
- Si el usuario solo pide ver o listar contactos, utiliza list_whatsapp_contacts
- Si el usuario pide ver conversaciones o mensajes, utiliza get_contact_messages
- Nunca inventes contactos que no estén en la base de datos
- Pide confirmación antes de enviar mensajes sensibles o importantes
- Mantén un tono profesional y amigable en las comunicaciones
- Proporciona detalles sobre el estado de entrega de los mensajes
- Informa sobre errores de manera clara y sugiere soluciones

RECUERDA: Si la solicitud incluye "enviar", "mandar", "mensaje", o similares, tu PRIMERA acción debe ser intentar send_whatsapp_message, NO list_whatsapp_contacts.`;

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
                description: "Nombre del contacto (si se proporciona el nombre sin número, se buscará el contacto por nombre)",
              },
              message: {
                type: "string",
                description: "Mensaje que se enviará al contacto",
              },
            },
            required: ["message"],
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
              contactName: {
                type: "string",
                description: "Nombre del contacto (si se proporciona el nombre sin número, se buscará el contacto por nombre)",
              },
              limit: {
                type: "number",
                description: "Número máximo de mensajes a obtener (opcional, por defecto 10)",
              },
            },
            required: [],
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
    args: { contactPhoneNumber?: string; contactName?: string; message: string },
    userInput: string
  ): Promise<AgentResponse> {
    try {
      let contact = null;
      
      // Verificar si el contacto existe en la base de datos
      if (args.contactPhoneNumber) {
        contact = await storage.getWhatsappContactByPhone(args.contactPhoneNumber);
      } else if (args.contactName) {
        // Si solo tenemos el nombre, buscamos por nombre en los contactos
        const allContacts = await storage.getWhatsappContacts();
        contact = allContacts.find(c => 
          c.name.toLowerCase() === args.contactName?.toLowerCase()
        );
        
        if (!contact) {
          // Si no se encuentra exactamente, intentamos con una búsqueda más flexible
          contact = allContacts.find(c => 
            c.name.toLowerCase().includes(args.contactName?.toLowerCase() || '')
          );
        }
      }

      // Si no se encontró el contacto
      if (!contact) {
        // Obtener todos los contactos para mostrarlos
        const contacts = await storage.getWhatsappContacts();
        const contactList = contacts.map((c) => `- ${c.name} (${c.phoneNumber})`).join("\n");
        
        return {
          action: "response",
          message: `No encontré ningún contacto con ${args.contactPhoneNumber ? `el número ${args.contactPhoneNumber}` : `el nombre ${args.contactName}`}. 
Estos son tus contactos disponibles:

${contactList}

Por favor, intenta de nuevo especificando uno de estos contactos.`
        };
      }

      // Enviar el mensaje utilizando el número de teléfono del contacto que encontramos
      if (!contact.phoneNumber) {
        return {
          action: "response",
          message: "Error: El contacto no tiene un número de teléfono válido."
        };
      }
      const result = await sendWhatsAppMessage(contact.phoneNumber, args.message);

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
          message: `¡Mensaje enviado correctamente a ${contact.name}! El mensaje se está entregando ahora.`,
          parameters: {
            contactName: contact.name,
            contactPhone: contact.phoneNumber,
            message: args.message,
          }
        };
      } else {
        return {
          action: "response",
          message: `Hubo un problema al enviar el mensaje: ${result.error || "Error desconocido"}. Por favor, verifica la configuración de WhatsApp e intenta nuevamente.`
        };
      }
    } catch (error) {
      console.error("Error en handleSendWhatsAppMessage:", error);
      return {
        action: "response",
        message: `Lo siento, ocurrió un error al intentar enviar el mensaje. Detalles: ${error instanceof Error ? error.message : "Error desconocido"}`
      };
    }
  }

  private async handleListWhatsAppContacts(userInput: string): Promise<AgentResponse> {
    try {
      const contacts = await storage.getWhatsappContacts();

      if (contacts.length === 0) {
        return {
          action: "response",
          message: "No tienes contactos de WhatsApp guardados. Para agregar contactos, ve a la sección de Configuración de WhatsApp."
        };
      }

      // Formatear la lista de contactos
      const contactList = contacts.map((contact) => {
        return `- ${contact.name} (${contact.phoneNumber})${contact.notes ? ` - ${contact.notes}` : ""}`;
      }).join("\n");

      return {
        action: "whatsapp_contacts_listed",
        message: `Aquí están tus contactos de WhatsApp:\n\n${contactList}`,
        parameters: {
          contacts: contacts
        }
      };
    } catch (error) {
      console.error("Error en handleListWhatsAppContacts:", error);
      return {
        action: "response",
        message: `Lo siento, ocurrió un error al intentar obtener tus contactos. Detalles: ${error instanceof Error ? error.message : "Error desconocido"}`
      };
    }
  }

  private async handleGetContactMessages(
    args: { contactPhoneNumber?: string; contactName?: string; limit?: number },
    userInput: string
  ): Promise<AgentResponse> {
    try {
      let contact = null;
      
      // Verificar si el contacto existe en la base de datos
      if (args.contactPhoneNumber) {
        contact = await storage.getWhatsappContactByPhone(args.contactPhoneNumber);
      } else if (args.contactName) {
        // Si solo tenemos el nombre, buscamos por nombre en los contactos
        const allContacts = await storage.getWhatsappContacts();
        contact = allContacts.find(c => 
          c.name.toLowerCase() === args.contactName?.toLowerCase()
        );
        
        if (!contact) {
          // Si no se encuentra exactamente, intentamos con una búsqueda más flexible
          contact = allContacts.find(c => 
            c.name.toLowerCase().includes(args.contactName?.toLowerCase() || '')
          );
        }
      }

      // Si no se encontró el contacto
      if (!contact) {
        // Obtener todos los contactos para mostrarlos
        const contacts = await storage.getWhatsappContacts();
        const contactList = contacts.map((c) => `- ${c.name} (${c.phoneNumber})`).join("\n");
        
        return {
          action: "response",
          message: `No encontré ningún contacto con ${args.contactPhoneNumber ? `el número ${args.contactPhoneNumber}` : `el nombre ${args.contactName}`}. 
Estos son tus contactos disponibles:

${contactList}

Por favor, intenta de nuevo especificando uno de estos contactos.`
        };
      }

      // Obtener mensajes para este contacto
      const messages = await storage.getWhatsappMessages(contact.id);

      if (messages.length === 0) {
        return {
          action: "response",
          message: `No hay mensajes intercambiados con ${contact.name} (${contact.phoneNumber}).`
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
        message: `Aquí están los últimos ${limitedMessages.length} mensajes con ${contact.name}:\n\n${formattedMessages}`,
        parameters: {
          contact: contact,
          messages: limitedMessages
        }
      };
    } catch (error) {
      console.error("Error en handleGetContactMessages:", error);
      return {
        action: "response",
        message: `Lo siento, ocurrió un error al intentar obtener los mensajes. Detalles: ${error instanceof Error ? error.message : "Error desconocido"}`
      };
    }
  }
}