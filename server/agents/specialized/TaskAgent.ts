import { SpecializedAgent } from '../base/SpecializedAgent';
import { AgentRequest, AgentResponse, OpenAITool } from '../types/common';
import { taskTools } from '../tools/TaskTools';
import { mapPriority } from '../utils/priority';
import { storage } from '../../storage';
import { InsertTask } from '../../../shared/schema';

/**
 * Agente especializado en la gestión de tareas.
 * Responsable de crear, actualizar, eliminar y obtener información sobre tareas.
 */
export class TaskAgent extends SpecializedAgent {
  // Definición del prompt para este agente
  private systemPrompt = `Eres un agente especializado en la gestión de tareas. 
Tu objetivo es crear nuevas tareas, actualizar tareas existentes, eliminar tareas o proporcionar información sobre tareas.

IMPORTANTE: Si el usuario describe algo que suena como una tarea (por ejemplo, "tengo que hacer contabilidad", "necesito preparar una presentación", etc.), SIEMPRE debes interpretar esto como una solicitud para CREAR una nueva tarea, incluso si no lo pide explícitamente. Si el usuario menciona una fecha, SIEMPRE debes incluir esa fecha al crear la tarea.

IMPORTANTE: NUNCA respondas con texto en formato JSON. En su lugar, debes usar las funciones disponibles.

IMPORTANTE: Si el usuario menciona o sugiere una fecha (por ejemplo: "para mañana", "para el viernes", "para el 27 de marzo", etc.), DEBES incluir esa fecha en el campo deadline al crear la tarea. Convierte expresiones de tiempo relativas a fechas absolutas.

IMPORTANTE: Si el usuario solicita eliminar varias tareas (por ejemplo: "borra las tareas 1, 2 y 3" o "elimina las tareas 4-7"), DEBES usar la función deleteTasks con todos los IDs mencionados. Asegúrate de extraer correctamente todos los números de ID, incluso si están en una lista, separados por comas o guiones.

IMPORTANTE: Si el usuario solicita crear varias tareas al mismo tiempo (por ejemplo: "crea 4 tareas: lavar, planchar, cocinar, limpiar"), DEBES usar la función createTasks y añadir cada tarea como un objeto separado en el array 'tasks'. Toma cada elemento de la lista como una tarea independiente.

No intentes responder a chistes, saludos o conversación casual; interpreta todo como un intento de gestionar tareas.`;

  /**
   * Obtiene las herramientas disponibles para este agente
   */
  getFunctions(): Array<OpenAITool> {
    return taskTools;
  }

  /**
   * Procesa una solicitud del usuario relacionada con tareas
   * @param request Solicitud del usuario
   * @returns Respuesta procesada
   */
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Obtener la solicitud del usuario y el contexto
      const { userInput, context } = request;
      
      // Llamar al modelo con las funciones definidas
      const result = await this.callModelWithFunctions(this.systemPrompt, userInput, context);
      
      // Si no hay una llamada a función, simplemente devolver el contenido como respuesta
      if (!result.functionCall) {
        return {
          response: result.content || "No he podido procesar tu solicitud correctamente. ¿Podrías reformularla?",
          confidence: 0.7
        };
      }
      
      // Procesar la llamada a función según el nombre de la función
      const { name, arguments: args } = result.functionCall;
      
      switch (name) {
        case "createTask": {
          // Crear una nueva tarea
          const { title, description, priority, categoryId = 1, deadline = null } = args;
          
          // Mapear la prioridad al formato esperado por el backend
          const priorityMapped = mapPriority(priority);
          
          // Crear objeto de tarea para insertar
          const newTask: InsertTask = {
            title,
            description,
            status: "pendiente",
            priority: priorityMapped,
            categoryId,
            deadline: deadline ? new Date(deadline) : null,
            userId: 1
          };
          
          // Guardar en la base de datos
          const createdTask = await storage.createTask(newTask);
          
          return {
            action: "createTask",
            response: `¡Perfecto! He creado la tarea "${title}" con prioridad ${priority}${deadline ? ` y fecha límite ${deadline}` : ''}.`,
            data: createdTask,
            confidence: 0.9
          };
        }
        
        case "createTasks": {
          // Crear múltiples tareas
          const { tasks } = args;
          
          // Procesar todas las tareas
          const createdTasks = await Promise.all(tasks.map(async (taskData: any) => {
            const { title, description, priority, categoryId = 1, deadline = null } = taskData;
            
            // Mapear la prioridad al formato esperado por el backend
            const priorityMapped = mapPriority(priority);
            
            // Crear objeto de tarea para insertar
            const newTask: InsertTask = {
              title,
              description,
              status: "pendiente",
              priority: priorityMapped,
              categoryId,
              deadline: deadline ? new Date(deadline) : null,
              userId: 1
            };
            
            // Guardar en la base de datos
            return await storage.createTask(newTask);
          }));
          
          // Crear mensaje de respuesta
          const taskTitles = createdTasks.map(task => `"${task.title}"`).join(", ");
          
          return {
            action: "createTasks",
            response: `¡Perfecto! He creado ${createdTasks.length} tareas: ${taskTitles}.`,
            data: createdTasks,
            confidence: 0.9
          };
        }
        
        case "updateTask": {
          // Actualizar una tarea existente
          const { id, ...updates } = args;
          
          // Verificar que la tarea existe
          const existingTask = await storage.getTask(id);
          
          if (!existingTask) {
            return {
              response: `No he podido encontrar una tarea con el ID ${id}. Por favor, verifica el número e intenta de nuevo.`,
              confidence: 0.8
            };
          }
          
          // Si hay un cambio de prioridad, mapearla
          let updatedProps: any = { ...updates };
          if (updates.priority) {
            updatedProps.priority = mapPriority(updates.priority);
          }
          
          // Si hay un cambio de fecha límite, formatearla
          if (updates.deadline) {
            updatedProps.deadline = new Date(updates.deadline);
          }
          
          // Actualizar la tarea
          const updatedTask = await storage.updateTask(id, updatedProps);
          
          return {
            action: "updateTask",
            response: `He actualizado la tarea "${existingTask.title}" con los nuevos datos.`,
            data: updatedTask,
            confidence: 0.9
          };
        }
        
        case "deleteTask": {
          // Eliminar una tarea
          const { id } = args;
          
          // Verificar que la tarea existe
          const existingTask = await storage.getTask(id);
          
          if (!existingTask) {
            return {
              response: `No he podido encontrar una tarea con el ID ${id}. Por favor, verifica el número e intenta de nuevo.`,
              confidence: 0.8
            };
          }
          
          // Eliminar la tarea
          await storage.deleteTask(id);
          
          return {
            action: "deleteTask",
            response: `He eliminado la tarea "${existingTask.title}" correctamente.`,
            data: { id },
            confidence: 0.9
          };
        }
        
        case "deleteTasks": {
          // Eliminar múltiples tareas
          const { ids } = args;
          
          // Verificar que todas las tareas existen
          const existingTasks = await Promise.all(
            ids.map(async (id: number) => await storage.getTask(id))
          );
          
          const notFoundIds = ids.filter((id: number, index: number) => !existingTasks[index]);
          
          if (notFoundIds.length > 0) {
            return {
              response: `No he podido encontrar las tareas con IDs: ${notFoundIds.join(", ")}. Por favor, verifica los números e intenta de nuevo.`,
              confidence: 0.8
            };
          }
          
          // Eliminar las tareas
          await Promise.all(ids.map(async (id: number) => await storage.deleteTask(id)));
          
          // Crear mensaje de respuesta
          const taskTitles = existingTasks
            .filter(Boolean)
            .map(task => `"${task.title}"`)
            .join(", ");
          
          return {
            action: "deleteTasks",
            response: `He eliminado ${ids.length} tareas: ${taskTitles}.`,
            data: { ids },
            confidence: 0.9
          };
        }
        
        case "getTasks": {
          // Obtener lista de tareas (con posibles filtros)
          const { status, categoryId } = args;
          
          let tasks;
          
          if (status) {
            tasks = await storage.getTasksByStatus(status);
          } else if (categoryId) {
            tasks = await storage.getTasksByCategory(categoryId);
          } else {
            tasks = await storage.getTasks();
          }
          
          // Si no hay tareas, dar mensaje apropiado
          if (tasks.length === 0) {
            const noTasksMessage = status 
              ? `No hay tareas con estado "${status}"`
              : categoryId 
                ? `No hay tareas en la categoría con ID ${categoryId}`
                : "No hay tareas en el sistema";
                
            return {
              response: noTasksMessage,
              data: { tasks: [] },
              confidence: 0.9
            };
          }
          
          // Crear mensaje de respuesta
          const taskSummary = tasks.map(task => 
            `- [${task.id}] ${task.title} (${task.status}, prioridad: ${task.priority}${task.deadline ? `, fecha límite: ${new Date(task.deadline).toLocaleDateString()}` : ''})`
          ).join("\n");
          
          return {
            response: `Aquí están las tareas que encontré:\n\n${taskSummary}`,
            data: { tasks },
            confidence: 0.9
          };
        }
        
        default:
          return {
            response: "No he reconocido esa acción. ¿Puedo ayudarte a crear, actualizar o borrar alguna tarea?",
            confidence: 0.7
          };
      }
    } catch (error) {
      console.error("Error en TaskAgent:", error);
      return {
        response: "Ha ocurrido un error al procesar tu solicitud relacionada con tareas. Por favor, intenta de nuevo.",
        confidence: 0.5
      };
    }
  }
}