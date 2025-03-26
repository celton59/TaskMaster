import { SpecializedAgent } from '../base/SpecializedAgent';
import { AgentRequest, AgentResponse, OpenAITool } from '../types/common';
import { plannerTools } from '../tools/PlannerTools';
import { storage } from '../../storage';
import { InsertTask } from '@shared/schema';

/**
 * Agente especializado en planificación y gestión de fechas límite.
 * Responsable de programar tareas, establecer fechas límite y proporcionar
 * información sobre plazos próximos.
 */
export class PlannerAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en planificación y gestión de fechas límite para tareas.
Tu objetivo es ayudar con la programación, recordatorios y organización temporal de las actividades.

IMPORTANTE: Si el usuario solicita establecer múltiples tareas con fechas escalonadas o distribuidas en un rango de tiempo,
asegúrate de usar la función 'scheduleTasks' que distribuye automáticamente las tareas entre la fecha inicial y final.

Cuando un usuario solicita distribuir tareas entre dos fechas, siempre:
1. Obtén todas las tareas con listTasks() si necesitas sus IDs
2. Identifica las tareas involucradas y sus IDs
3. Usa scheduleTasks() para distribuirlas equitativamente entre las fechas indicadas

Siempre responde en español y de forma amigable. Evita repetir el texto enviado por el usuario.

Formato de respuesta: 
Siempre proporciona una confirmación clara de la acción realizada y los detalles relevantes.

Tu respuesta debe estar en formato JSON con los siguientes campos:
- "response": Tu mensaje para el usuario
- "action": La acción realizada (getUpcomingDeadlines, setDeadlines, scheduleTasks, etc.)
- "data": Datos relevantes de la acción (las tareas programadas, tareas con fechas límite próximas, etc.)
- "confidence": Un valor entre 0 y 1 que indica tu confianza en la respuesta`;

  /**
   * Obtiene las herramientas disponibles para este agente
   */
  getFunctions(): Array<OpenAITool> {
    return [
      ...plannerTools,
      // También usamos algunas herramientas del agente de tareas para operaciones básicas
      {
        type: "function",
        function: {
          name: "listTasks",
          description: "Lista todas las tareas o filtra por estado",
          parameters: {
            type: "object",
            properties: {
              status: {
                type: "string",
                description: "Filtrar por estado: pendiente, en_progreso, revision, completada",
                enum: ["pendiente", "en_progreso", "revision", "completada"]
              },
              categoryId: {
                type: "integer",
                description: "Filtrar por categoría"
              }
            }
          }
        }
      }
    ];
  }

  /**
   * Procesa una solicitud del usuario relacionada con planificación
   * @param request Solicitud del usuario
   * @returns Respuesta procesada
   */
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Llamar al modelo con funciones
      const modelResponse = await this.callModelWithFunctions(
        this.systemPrompt,
        request.userInput,
        request.context
      );
      
      // Si el modelo decidió llamar a una función
      if (modelResponse.functionCall) {
        const { name, arguments: args } = modelResponse.functionCall;
        
        let result;
        switch (name) {
          case "getUpcomingDeadlines": {
            // Obtener todas las tareas
            const allTasks = await storage.getTasks();
            
            // Calcular la fecha límite
            const today = new Date();
            const limitDate = new Date();
            limitDate.setDate(today.getDate() + args.daysAhead);
            
            // Filtrar tareas con fechas límite dentro del rango
            let upcomingTasks = allTasks.filter(task => {
              if (!task.deadline) return false;
              
              const taskDeadline = new Date(task.deadline);
              return taskDeadline >= today && taskDeadline <= limitDate;
            });
            
            // Ordenar por fecha más cercana
            upcomingTasks.sort((a, b) => {
              return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
            });
            
            // Limitar el número de tareas si se especifica
            if (args.limit && upcomingTasks.length > args.limit) {
              upcomingTasks = upcomingTasks.slice(0, args.limit);
            }
            
            result = {
              action: 'getUpcomingDeadlines',
              response: upcomingTasks.length > 0
                ? `Encontré ${upcomingTasks.length} tareas con fechas límite en los próximos ${args.daysAhead} días.`
                : `No encontré tareas con fechas límite en los próximos ${args.daysAhead} días.`,
              data: upcomingTasks,
              confidence: 0.9
            };
            break;
          }
          
          case "getPrioritizedTasks": {
            // Obtener tareas
            let tasks = args.status
              ? await storage.getTasksByStatus(args.status)
              : await storage.getTasks();
            
            // Ordenar por prioridad (alta > media > baja)
            tasks.sort((a, b) => {
              const priorityValue = {
                'alta': 3,
                'media': 2,
                'baja': 1
              };
              return (priorityValue[b.priority as keyof typeof priorityValue] || 0) - 
                     (priorityValue[a.priority as keyof typeof priorityValue] || 0);
            });
            
            // Limitar el número de tareas si se especifica
            if (args.limit && tasks.length > args.limit) {
              tasks = tasks.slice(0, args.limit);
            }
            
            result = {
              action: 'getPrioritizedTasks',
              response: `Aquí tienes ${tasks.length} tareas ordenadas por prioridad.`,
              data: tasks,
              confidence: 0.9
            };
            break;
          }
          
          case "setDeadlines": {
            // Obtener la tarea existente
            const existingTask = await storage.getTask(args.id);
            
            if (!existingTask) {
              result = {
                action: 'error',
                response: `No pude encontrar una tarea con el ID ${args.id}. Por favor, verifica el ID e intenta de nuevo.`,
                confidence: 0.8
              };
              break;
            }
            
            // Formatear la fecha límite
            const deadline = new Date(args.deadline);
            
            // Actualizar la tarea
            const updatedTask = await storage.updateTask(args.id, { deadline });
            
            result = {
              action: 'setDeadlines',
              response: `He actualizado la tarea "${updatedTask?.title}" con la nueva fecha límite: ${deadline.toLocaleDateString()}.`,
              data: updatedTask,
              confidence: 0.9
            };
            break;
          }
          
          case "scheduleTasks": {
            const updatedTasks = [];
            const failedIds = [];
            
            // Obtener las fechas de inicio y fin
            const startDate = new Date(args.startDate);
            const endDate = new Date(args.endDate);
            
            // Verificar que las fechas sean válidas
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              result = {
                action: 'error',
                response: 'Las fechas proporcionadas no son válidas. Por favor, usa el formato YYYY-MM-DD.',
                confidence: 0.8
              };
              break;
            }
            
            // Verificar que la fecha de inicio sea anterior a la fecha de fin
            if (startDate > endDate) {
              result = {
                action: 'error',
                response: 'La fecha de inicio debe ser anterior a la fecha de fin.',
                confidence: 0.8
              };
              break;
            }
            
            // Obtener el número de días entre las fechas
            const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            
            // Si no hay suficientes días para distribuir las tareas
            if (daysDiff < args.taskIds.length - 1 && args.distributeEvenly !== false) {
              result = {
                action: 'error',
                response: `No hay suficientes días (${daysDiff + 1}) para distribuir las ${args.taskIds.length} tareas de manera uniforme. Por favor, amplía el rango de fechas.`,
                confidence: 0.8
              };
              break;
            }
            
            // Si se especifica distribuir uniformemente
            if (args.distributeEvenly !== false) {
              // Calcular el intervalo entre tareas
              const interval = args.taskIds.length <= 1 ? 0 : daysDiff / (args.taskIds.length - 1);
              
              // Programar cada tarea
              for (let i = 0; i < args.taskIds.length; i++) {
                const taskId = args.taskIds[i];
                
                // Verificar que la tarea existe
                const existingTask = await storage.getTask(taskId);
                
                if (!existingTask) {
                  failedIds.push(taskId);
                  continue;
                }
                
                // Calcular la fecha para esta tarea
                const taskDate = new Date(startDate.getTime());
                taskDate.setDate(startDate.getDate() + Math.round(i * interval));
                
                // Actualizar la tarea
                const updatedTask = await storage.updateTask(taskId, { deadline: taskDate });
                
                if (updatedTask) {
                  updatedTasks.push(updatedTask);
                } else {
                  failedIds.push(taskId);
                }
              }
            } else {
              // Distribuir según prioridad - las de alta prioridad primero, luego media, luego baja
              // Obtener todas las tareas
              const tasksToSchedule = [];
              for (const id of args.taskIds) {
                const task = await storage.getTask(id);
                if (task) {
                  tasksToSchedule.push(task);
                } else {
                  failedIds.push(id);
                }
              }
              
              // Ordenar por prioridad
              tasksToSchedule.sort((a, b) => {
                const priorityValue = {
                  'alta': 3,
                  'media': 2,
                  'baja': 1
                };
                return (priorityValue[b.priority as keyof typeof priorityValue] || 0) - 
                      (priorityValue[a.priority as keyof typeof priorityValue] || 0);
              });
              
              // Distribuir en el período
              const interval = tasksToSchedule.length <= 1 ? 0 : daysDiff / (tasksToSchedule.length - 1);
              
              for (let i = 0; i < tasksToSchedule.length; i++) {
                const task = tasksToSchedule[i];
                
                // Calcular la fecha para esta tarea
                const taskDate = new Date(startDate.getTime());
                taskDate.setDate(startDate.getDate() + Math.round(i * interval));
                
                // Actualizar la tarea
                const updatedTask = await storage.updateTask(task.id, { deadline: taskDate });
                
                if (updatedTask) {
                  updatedTasks.push(updatedTask);
                } else {
                  failedIds.push(task.id);
                }
              }
            }
            
            result = {
              action: 'scheduleTasks',
              response: failedIds.length === 0
                ? `He programado ${updatedTasks.length} tareas entre el ${startDate.toLocaleDateString()} y el ${endDate.toLocaleDateString()}.`
                : `He programado ${updatedTasks.length} tareas, pero no pude programar ${failedIds.length} tareas (IDs: ${failedIds.join(', ')}).`,
              data: {
                scheduledTasks: updatedTasks,
                failedIds,
                startDate,
                endDate
              },
              confidence: 0.9
            };
            break;
          }
          
          case "getTasksByDate": {
            // Obtener todas las tareas
            const allTasks = await storage.getTasks();
            
            // Convertir la fecha a objeto Date
            const targetDate = new Date(args.date);
            
            // Filtrar tareas para la fecha específica
            const tasksForDate = allTasks.filter(task => {
              if (!task.deadline) return false;
              
              const taskDeadline = new Date(task.deadline);
              return taskDeadline.getFullYear() === targetDate.getFullYear() &&
                    taskDeadline.getMonth() === targetDate.getMonth() &&
                    taskDeadline.getDate() === targetDate.getDate();
            });
            
            result = {
              action: 'getTasksByDate',
              response: tasksForDate.length > 0
                ? `Encontré ${tasksForDate.length} tareas programadas para el ${targetDate.toLocaleDateString()}.`
                : `No encontré tareas programadas para el ${targetDate.toLocaleDateString()}.`,
              data: tasksForDate,
              confidence: 0.9
            };
            break;
          }
          
          case "listTasks": {
            let tasks;
            
            // Filtrar por estado si se especifica
            if (args.status) {
              tasks = await storage.getTasksByStatus(args.status);
            } 
            // Filtrar por categoría si se especifica
            else if (args.categoryId) {
              tasks = await storage.getTasksByCategory(args.categoryId);
            } 
            // Si no hay filtros, obtener todas las tareas
            else {
              tasks = await storage.getTasks();
            }
            
            result = {
              action: 'listTasks',
              response: `He encontrado ${tasks.length} tareas.`,
              data: tasks,
              confidence: 0.9
            };
            break;
          }
          
          default:
            // Si la función no está implementada
            result = {
              action: 'error',
              response: `Lo siento, no puedo ejecutar la función "${name}". Esta funcionalidad aún no está implementada.`,
              confidence: 0.5
            };
        }
        
        return result;
      }
      
      // Si el modelo no llamó a una función, devolver su respuesta como texto
      try {
        // Intentar parsear la respuesta como JSON
        const jsonResponse = JSON.parse(modelResponse.content || "{}");
        
        return {
          action: jsonResponse.action || 'respond',
          response: jsonResponse.response || modelResponse.content || "No he podido procesar tu solicitud.",
          data: jsonResponse.data,
          confidence: jsonResponse.confidence || 0.7
        };
      } catch (e) {
        // Si no se puede parsear como JSON, devolver la respuesta como texto
        return {
          action: 'respond',
          response: modelResponse.content || "No he podido procesar tu solicitud.",
          confidence: 0.6
        };
      }
    } catch (error) {
      console.error("Error en PlannerAgent.process:", error);
      return {
        action: 'error',
        response: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo.",
        confidence: 0.5
      };
    }
  }
}