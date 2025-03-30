import twilio from 'twilio';
import { AgentOrchestrator } from '../agents/orchestrator';
import { Request, Response } from 'express';

// Verifica que las variables de entorno estén configuradas
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.error('Error: Se requieren las credenciales de Twilio (TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN)');
}

// Inicializa el cliente de Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Envía un mensaje de WhatsApp a través de Twilio
 * @param to Número de teléfono de destino (con formato E.164, ej: +34600000000)
 * @param message Mensaje a enviar
 */
export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  try {
    // Verifica que el número de teléfono de Twilio esté configurado
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('No se ha configurado TWILIO_PHONE_NUMBER');
    }

    // Envía el mensaje usando el API de Twilio para WhatsApp
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`
    });

    console.log(`Mensaje enviado a ${to}`);
  } catch (error) {
    console.error('Error al enviar mensaje de WhatsApp:', error);
    throw error;
  }
}

/**
 * Maneja los webhooks entrantes de Twilio para WhatsApp
 * @param req Request HTTP
 * @param res Response HTTP
 * @param orchestrator Orquestador de agentes
 */
export async function handleWhatsAppWebhook(req: Request, res: Response, orchestrator: AgentOrchestrator): Promise<void> {
  try {
    const twimlResponse = new twilio.twiml.MessagingResponse();
    
    // Obtiene el mensaje y el número de teléfono del remitente
    const incomingMessage = req.body.Body;
    const from = req.body.From.replace('whatsapp:', '');
    
    console.log(`Mensaje recibido de ${from}: ${incomingMessage}`);
    
    if (!incomingMessage) {
      twimlResponse.message('No se recibió ningún mensaje.');
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twimlResponse.toString());
      return;
    }

    // Procesa el mensaje con el orquestador de agentes
    const response = await orchestrator.process(incomingMessage);
    
    // Envía la respuesta generada por el agente
    twimlResponse.message(response.message);
    
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twimlResponse.toString());
  } catch (error) {
    console.error('Error al procesar webhook de WhatsApp:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}

/**
 * Verifica el estado de la configuración de Twilio
 */
export async function checkTwilioConfiguration(): Promise<{ 
  status: 'success' | 'error',
  message: string,
  configured?: boolean,
  phoneConfigured?: boolean,
  phoneNumber?: string
}> {
  try {
    const hasTwilioCredentials = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    const hasPhoneNumber = !!process.env.TWILIO_PHONE_NUMBER;
    
    if (!hasTwilioCredentials || !hasPhoneNumber) {
      return {
        status: 'success',
        message: 'Faltan algunas credenciales de Twilio',
        configured: hasTwilioCredentials,
        phoneConfigured: hasPhoneNumber,
        phoneNumber: hasPhoneNumber ? process.env.TWILIO_PHONE_NUMBER : undefined
      };
    }

    try {
      // Intenta obtener la información de la cuenta para verificar las credenciales
      // En este punto ya sabemos que TWILIO_ACCOUNT_SID existe gracias a la verificación anterior
      const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
      const account = await twilioClient.api.accounts(accountSid).fetch();
      
      return {
        status: 'success',
        message: `Configuración de Twilio verificada. Cuenta: ${account.friendlyName}`,
        configured: true,
        phoneConfigured: true,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
      };
    } catch (credentialError: any) {
      // Las credenciales no son válidas
      return {
        status: 'error',
        message: `Error de autenticación de Twilio: ${credentialError.message || 'Error desconocido'}`,
        configured: false,
        phoneConfigured: hasPhoneNumber,
        phoneNumber: hasPhoneNumber ? process.env.TWILIO_PHONE_NUMBER : undefined
      };
    }
  } catch (error: any) {
    console.error('Error al verificar la configuración de Twilio:', error);
    return {
      status: 'error',
      message: `Error al verificar la configuración de Twilio: ${error.message || 'Error desconocido'}`,
      configured: false,
      phoneConfigured: false
    };
  }
}