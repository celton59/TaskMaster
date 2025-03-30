import { orchestrator } from './orchestrator';
import { storage } from '../storage';
import { Task, Category } from '@shared/schema';

// Tipos de respuesta para la API
export interface AgentApiResponse {
  action: string;
  message: string;
  [key: string]: any; // Para permitir datos adicionales según la acción
}

/**
 * Procesa un mensaje de usuario y devuelve una respuesta generada por el sistema de agentes
 */
export async function processUserMessage(message: string): Promise<AgentApiResponse> {
  try {
    console.log(`Procesando mensaje de usuario: "${message}"`);
    
    // Usar el orquestador para determinar qué agente debe responder
    const orchestratorResponse = await orchestrator.process(message);
    
    console.log(`Respuesta del orquestrador:`, orchestratorResponse);
    
    // Adaptar la respuesta del orquestador a la estructura de respuesta de la API
    const apiResponse: AgentApiResponse = {
      action: orchestratorResponse.action || 'respond',
      message: orchestratorResponse.message,
    };
    
    // Si hay parámetros, copiarlos a la respuesta
    if (orchestratorResponse.parameters) {
      apiResponse.parameters = orchestratorResponse.parameters;
    }
    
    // Si hay datos, copiarlos también (compatibilidad con implementación anterior)
    if (orchestratorResponse.data) {
      apiResponse.data = orchestratorResponse.data;
    }
    
    // Añadir datos específicos según la acción
    if (orchestratorResponse.action) {
      // Acciones relacionadas con tareas
      if (orchestratorResponse.action === 'createTask' && orchestratorResponse.data) {
        apiResponse.task = orchestratorResponse.data;
      } else if (orchestratorResponse.action === 'createTasks' && orchestratorResponse.data) {
        apiResponse.tasks = orchestratorResponse.data;
      } else if (orchestratorResponse.action === 'listTasks' && orchestratorResponse.data) {
        apiResponse.tasks = orchestratorResponse.data;
      } else if (orchestratorResponse.action === 'updateTask' && orchestratorResponse.data) {
        apiResponse.task = orchestratorResponse.data;
      }
      
      // Acciones relacionadas con categorías
      if (orchestratorResponse.action === 'createCategory' && orchestratorResponse.data) {
        apiResponse.category = orchestratorResponse.data;
      } else if (orchestratorResponse.action === 'listCategories' && orchestratorResponse.data) {
        apiResponse.categories = orchestratorResponse.data;
      }
      
      // Acciones relacionadas con análisis
      if (orchestratorResponse.action === 'getTaskStats' && orchestratorResponse.data) {
        apiResponse.stats = orchestratorResponse.data;
      } else if (orchestratorResponse.action === 'analyzeTrends' && orchestratorResponse.data) {
        apiResponse.analysis = orchestratorResponse.data;
      } else if (orchestratorResponse.action === 'generateReport' && orchestratorResponse.data) {
        apiResponse.report = orchestratorResponse.data;
      }
      
      // Acciones relacionadas con planificación
      if (orchestratorResponse.action === 'getUpcomingDeadlines' && orchestratorResponse.data) {
        apiResponse.deadlines = orchestratorResponse.data;
      } else if (orchestratorResponse.action === 'getPrioritizedTasks' && orchestratorResponse.data) {
        apiResponse.prioritizedTasks = orchestratorResponse.data;
      } else if ((orchestratorResponse.action === 'setDeadlines' || orchestratorResponse.action === 'scheduleTasks') && orchestratorResponse.data) {
        apiResponse.updatedTask = orchestratorResponse.data;
        
        // Invalidar las consultas de tareas en el cliente
        console.log('Tarea actualizada con nueva fecha límite:', orchestratorResponse.data);
      }
      
      // Acciones relacionadas con WhatsApp
      if (orchestratorResponse.action === 'whatsapp_message_sent' && orchestratorResponse.parameters) {
        apiResponse.whatsapp = {
          sent: true,
          to: orchestratorResponse.parameters.contactName,
          phoneNumber: orchestratorResponse.parameters.contactPhone,
          message: orchestratorResponse.parameters.message
        };
      } else if (orchestratorResponse.action === 'whatsapp_contacts_listed' && orchestratorResponse.parameters) {
        apiResponse.whatsapp = {
          contacts: orchestratorResponse.parameters.contacts
        };
      } else if (orchestratorResponse.action === 'whatsapp_messages_retrieved' && orchestratorResponse.parameters) {
        apiResponse.whatsapp = {
          contact: orchestratorResponse.parameters.contact,
          messages: orchestratorResponse.parameters.messages
        };
      }
      
      // Si hay datos pero no se han añadido específicamente
      if (orchestratorResponse.data && !Object.keys(apiResponse).includes('data')) {
        apiResponse.data = orchestratorResponse.data;
      }
    }
    
    // Información de depuración (en modo de desarrollo)
    if (process.env.NODE_ENV === 'development') {
      apiResponse.debug = {
        agentUsed: orchestratorResponse.agentUsed
      };
    }
    
    return apiResponse;
  } catch (error) {
    console.error("Error en agent-service:", error);
    return {
      action: 'error',
      message: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.'
    };
  }
}