import twilio from 'twilio';

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Verifica si Twilio está correctamente configurado
 * @returns Objeto con el estado de la configuración
 */
export async function checkTwilioConfig(): Promise<{
  configured: boolean;
  phoneConfigured: boolean;
  phoneNumber?: string;
  error?: string;
}> {
  try {
    // Verificar que todas las variables de entorno necesarias están configuradas
    if (!accountSid || !authToken) {
      return {
        configured: false,
        phoneConfigured: false,
        error: "Faltan credenciales de Twilio (SID o Token)",
      };
    }

    if (!twilioPhoneNumber) {
      return {
        configured: true,
        phoneConfigured: false,
        error: "Falta número de WhatsApp",
      };
    }

    // Intentar crear una instancia de Twilio para verificar las credenciales
    const client = twilio(accountSid, authToken);
    
    // Si todo está bien, devolver el estado positivo
    return {
      configured: true,
      phoneConfigured: true,
      phoneNumber: twilioPhoneNumber,
    };
  } catch (error) {
    console.error("Error verificando configuración de Twilio:", error);
    return {
      configured: false,
      phoneConfigured: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Envía un mensaje de WhatsApp a través de Twilio
 * @param to Número de teléfono de destino (formato E.164)
 * @param message Contenido del mensaje
 * @returns Objeto con el resultado del envío
 */
export async function sendWhatsAppMessage(to: string, message: string): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    // Verificar que Twilio está configurado
    const config = await checkTwilioConfig();
    if (!config.configured || !config.phoneConfigured) {
      return {
        success: false,
        error: "Twilio no está correctamente configurado",
      };
    }

    // Crear cliente Twilio
    const client = twilio(accountSid!, authToken!);

    // Formatear número de destino para WhatsApp
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const formattedFrom = twilioPhoneNumber!.startsWith("whatsapp:") ? twilioPhoneNumber! : `whatsapp:${twilioPhoneNumber!}`;

    // Enviar mensaje
    const twilioMessage = await client.messages.create({
      body: message,
      from: formattedFrom,
      to: formattedTo,
    });

    return {
      success: true,
      messageId: twilioMessage.sid,
    };
  } catch (error) {
    console.error("Error enviando mensaje de WhatsApp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Envía un mensaje de prueba para verificar la configuración
 * @param to Número de teléfono de destino
 * @param message Mensaje de prueba
 * @returns Resultado del envío
 */
export async function sendTestWhatsAppMessage(to: string, message: string): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  return await sendWhatsAppMessage(to, message);
}

/**
 * Procesa un webhook entrante de Twilio para mensajes de WhatsApp
 * @param body Datos del webhook
 * @returns Objeto con el resultado del procesamiento
 */
export async function processIncomingWebhook(body: any): Promise<{
  success: boolean;
  messageId?: string;
  from?: string;
  body?: string;
  error?: string;
}> {
  try {
    // Verificar que el webhook contiene la información necesaria
    if (!body.From || !body.Body) {
      return {
        success: false,
        error: "Webhook incompleto: faltan campos requeridos",
      };
    }

    // Extraer información del mensaje
    const from = body.From.replace("whatsapp:", "");
    const messageBody = body.Body;
    const messageId = body.MessageSid || body.SmsSid;

    // Importamos las utilidades necesarias para guardar el mensaje
    const { storage } = await import("../storage");
    const { MessageDirection } = await import("../../shared/schema");

    try {
      // Buscar el contacto por número de teléfono
      const contact = await storage.getWhatsappContactByPhone(from);

      // Si no existe el contacto, lo creamos
      let contactId: number;
      if (!contact) {
        // Crear un nuevo contacto con el número de teléfono
        const newContact = await storage.createWhatsappContact({
          name: `Contacto ${from}`, // Nombre genérico basado en el número
          phoneNumber: from,
          active: true,
          notes: "Contacto creado automáticamente desde un mensaje entrante"
        });
        contactId = newContact.id;
      } else {
        contactId = contact.id;
      }

      // Guardar el mensaje en la base de datos
      const message = await storage.createWhatsappMessage({
        contactId,
        messageContent: messageBody,
        direction: MessageDirection.INCOMING,
        status: "received",
        metadata: { messageId, source: "webhook" }
      });

      console.log(`Mensaje de WhatsApp guardado: ${messageId}`);

      return {
        success: true,
        messageId,
        from,
        body: messageBody,
      };
    } catch (error) {
      console.error("Error al guardar mensaje de WhatsApp:", error);
      // Aún devolvemos éxito para responder al webhook de Twilio correctamente
      return {
        success: true,
        messageId,
        from,
        body: messageBody,
        error: error instanceof Error ? error.message : "Error al guardar mensaje"
      };
    }
  } catch (error) {
    console.error("Error procesando webhook de WhatsApp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}