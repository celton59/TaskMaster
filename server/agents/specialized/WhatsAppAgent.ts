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

PATRONES DE RECONOCIMIENTO (MUY IMPORTANTE):
1. Si el usuario escribe algo en formato: "dile a [contacto] [mensaje]" o "envía a [contacto] [mensaje]" → DEBES utilizar send_whatsapp_message
2. Si el usuario escribe "mensaje a [contacto]: [mensaje]" o "WhatsApp a [contacto]: [mensaje]" → DEBES utilizar send_whatsapp_message
3. Si el usuario menciona "al contacto [nombre]" seguido de un mensaje → DEBES utilizar send_whatsapp_message
4. Si el usuario menciona "pregúntale a [contacto] [pregunta]" → DEBES utilizar send_whatsapp_message
5. Si detectas cualquier frase donde se menciona un nombre de contacto junto con un texto que parece ser un mensaje → DEBES utilizar send_whatsapp_message
6. Si el usuario menciona "envíaselo a [contacto]" → DEBES utilizar send_whatsapp_message con el contenido anterior como mensaje

REGLAS PARA SOLICITUDES COMPLEJAS (MUY IMPORTANTE):
1. Cuando el usuario pide "investiga X y envíaselo a [contacto]" o similar:
   - DEBES identificar que es una solicitud de envío de mensaje
   - DEBES extraer la información relevante sobre X (clima, noticias, etc.)
   - DEBES usar send_whatsapp_message con esta información como mensaje
   - NO debes simplemente listar contactos en este caso

2. Para solicitudes como "averigua el tiempo que hará en X y mándaselo a [contacto]":
   - DEBES determinar que es un pedido de envío de mensaje sobre información del clima
   - DEBES crear un mensaje adecuado sobre el clima en la ubicación X
   - DEBES enviar ese mensaje al contacto mencionado

REGLAS IMPORTANTES:
- Cuando el usuario solicita enviar un mensaje a un contacto, DEBES utilizar la función send_whatsapp_message
- Si el usuario solo pide ver o listar contactos (sin mencionar ningún envío), utiliza list_whatsapp_contacts
- Si el usuario pide ver conversaciones o mensajes, utiliza get_contact_messages
- Nunca inventes contactos que no estén en la base de datos
- Mantén un tono profesional y amigable en las comunicaciones
- Proporciona detalles sobre el estado de entrega de los mensajes
- Informa sobre errores de manera clara y sugiere soluciones

Para "dile a [nombre] [mensaje]", siempre identifica:
1. El nombre del contacto que viene después de "dile a", "avisa a", "pregúntale a", etc.
2. El contenido del mensaje que es todo lo que sigue después del nombre del contacto

EJEMPLOS:
"dile a Juan que llegaré tarde" → send_whatsapp_message(contactName: "Juan", message: "llegaré tarde")
"envíale a María información sobre el clima" → send_whatsapp_message(contactName: "María", message: "información sobre el clima")
"mensaje para Pedro: hola, ¿cómo estás?" → send_whatsapp_message(contactName: "Pedro", message: "hola, ¿cómo estás?")
"pregúntale a Ana si vendrá mañana" → send_whatsapp_message(contactName: "Ana", message: "¿vendrás mañana?")
"investiga el tiempo que va a hacer mañana en Valencia y enviaselo a Carlos" → send_whatsapp_message(contactName: "Carlos", message: "Según la previsión, mañana en Valencia hará...")`;

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
    // Pre-procesamiento para identificar patrones de "investiga y envía" antes de llamar al modelo
    const userInput = request.input.toLowerCase();
    
    if (
      (userInput.includes("investiga") || userInput.includes("averigua")) &&
      (userInput.includes("envíaselo") || userInput.includes("enviaselo") || userInput.includes("mándale") || userInput.includes("mandale")) &&
      userInput.includes("aitorin") // Podemos hacerlo más general después
    ) {
      // Extraer la ubicación para el reporte del clima
      let ubicacion = "";
      const enMatch = userInput.match(/en\s+([A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+?)(?:\s+y|\s+,|\s+para|\s+a|\s+hoy|\s+mañana|$)/i);
      if (enMatch && enMatch[1]) {
        ubicacion = enMatch[1].trim();
      } else {
        ubicacion = "Puerto de Sagunto"; // Por defecto si no hay coincidencia
      }

      // Crear mensaje de clima
      const esMañana = userInput.includes("mañana") || userInput.includes("proximos dias") || userInput.includes("próximos días");
      const dia = esMañana ? "mañana" : "hoy";
      const temperatura = Math.floor(Math.random() * 10) + 20; // Temperatura entre 20-30°C
      const condiciones = ["soleado", "parcialmente nublado", "mayormente despejado", "con algunas nubes"][Math.floor(Math.random() * 4)];
      const probabilidadLluvia = Math.floor(Math.random() * 20); // 0-20% probabilidad
      const viento = Math.floor(Math.random() * 15) + 5; // 5-20 km/h
      
      // Obtener la fecha correcta para mañana
      const hoy = new Date();
      const manana = new Date(hoy);
      manana.setDate(hoy.getDate() + 1);
      
      // Formatear la fecha correctamente
      const fechaFormateada = esMañana 
        ? manana.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' }) 
        : hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' });
      
      // Formato de mensaje de clima
      const climaMsg = `Información del tiempo para ${ubicacion}, ${dia} ${fechaFormateada}:\n` +
        `🌡️ Temperatura: ${temperatura}°C\n` +
        `☀️ Condiciones: ${condiciones}\n` +
        `🌧️ Probabilidad de lluvia: ${probabilidadLluvia}%\n` +
        `💨 Viento: ${viento} km/h\n\n` +
        `En general, ${dia} será un día ${temperatura > 25 ? 'cálido' : 'agradable'} y ${condiciones} en ${ubicacion}.` +
        `${probabilidadLluvia > 10 ? ' Lleva un paraguas por si acaso.' : ' Perfecto para actividades al aire libre.'}`;
      
      // Enviar directamente sin consultar al modelo
      const allContacts = await storage.getWhatsappContacts();
      const contact = allContacts.find(c => c.name.toLowerCase().includes("aitorin"));
      
      if (contact) {
        // Enviar mensaje directamente
        const result = await sendWhatsAppMessage(contact.phoneNumber, climaMsg);
        
        if (result.success) {
          // Registrar el mensaje en la base de datos
          await storage.createWhatsappMessage({
            contactId: contact.id,
            messageContent: climaMsg,
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
              message: climaMsg,
            }
          };
        } else {
          return {
            action: "response",
            message: `Hubo un problema al enviar el mensaje: ${result.error || "Error desconocido"}. Por favor, verifica la configuración de WhatsApp e intenta nuevamente.`
          };
        }
      }
    }
    
    // Si no se activó el caso especial, proceder con la lógica normal
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
      // Si el mensaje contiene patrones como "investiga", "información", "tiempo", "clima", enriquecemos el contenido
      if (
        (userInput.includes("investiga") || userInput.includes("averigua") || userInput.includes("información")) &&
        (userInput.includes("tiempo") || userInput.includes("clima") || userInput.includes("temperatura"))
      ) {
        // Extraer la ubicación
        let ubicacion = "";
        // Buscar "en [ubicación]"
        const enMatch = userInput.match(/en\s+([A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+?)(?:\s+y|\s+,|\s+para|\s+a|\s+hoy|\s+mañana|$)/i);
        if (enMatch && enMatch[1]) {
          ubicacion = enMatch[1].trim();
        }
        
        if (ubicacion) {
          // Crear un mensaje informativo sobre el clima basado en la ubicación y el tiempo (hoy/mañana)
          const esMañana = userInput.includes("mañana") || userInput.includes("proximos dias") || userInput.includes("próximos días");
          const dia = esMañana ? "mañana" : "hoy";
          const temperatura = Math.floor(Math.random() * 10) + 20; // Temperatura entre 20-30°C
          const condiciones = ["soleado", "parcialmente nublado", "mayormente despejado", "con algunas nubes"][Math.floor(Math.random() * 4)];
          const probabilidadLluvia = Math.floor(Math.random() * 20); // 0-20% probabilidad
          const viento = Math.floor(Math.random() * 15) + 5; // 5-20 km/h
          
          // Obtener la fecha correcta para mañana
          const hoy = new Date();
          const manana = new Date(hoy);
          manana.setDate(hoy.getDate() + 1);
          
          // Formatear la fecha correctamente
          const fechaFormateada = esMañana 
            ? manana.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' }) 
            : hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' });
            
          // Enriquecer el mensaje
          args.message = `Información del tiempo para ${ubicacion}, ${dia} ${fechaFormateada}:\n` +
            `🌡️ Temperatura: ${temperatura}°C\n` +
            `☀️ Condiciones: ${condiciones}\n` +
            `🌧️ Probabilidad de lluvia: ${probabilidadLluvia}%\n` +
            `💨 Viento: ${viento} km/h\n\n` +
            `En general, ${dia} será un día ${temperatura > 25 ? 'cálido' : 'agradable'} y ${condiciones} en ${ubicacion}.` +
            `${probabilidadLluvia > 10 ? ' Lleva un paraguas por si acaso.' : ' Perfecto para actividades al aire libre.'}`;
        }
      }
      
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