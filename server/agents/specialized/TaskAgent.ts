import { SpecializedAgent } from '../base/SpecializedAgent';
import { AgentRequest, AgentResponse, OpenAITool } from '../types/common';
import { taskTools } from '../tools/TaskTools';
import { storage } from '../../storage';
import { InsertTask } from '@shared/schema';
import { mapPriority } from '../utils/priority';

/**
 * Agente especializado en la gestión de tareas.
 * Responsable de crear, actualizar, eliminar y obtener información sobre tareas.
 */
export class TaskAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en la gestión de tareas. 
Tu objetivo es ayudar a los usuarios a organizar sus tareas de manera eficiente.

Tienes acceso a herramientas para crear, actualizar, eliminar y consultar tareas.
Usa estas herramientas para responder a las solicitudes del usuario de manera efectiva.

Siempre responde en español y de forma amigable. Evita repetir el texto enviado por el usuario.

Al crear una tarea:
- Si el usuario no especifica un estado, usa "pendiente" por defecto.
- Si el usuario no especifica una prioridad, usa "media" por defecto.
- Si el usuario menciona una fecha límite, asegúrate de formatearla correctamente (YYYY-MM-DD).
- Si el usuario menciona una categoría, busca su ID en el contexto proporcionado.

Formato de respuesta: 
Siempre proporciona una confirmación clara de la acción realizada y los detalles relevantes.

Tu respuesta debe estar en formato JSON con los siguientes campos:
- "response": Tu mensaje para el usuario
- "action": La acción realizada (createTask, updateTask, deleteTask, etc.)
- "data": Datos relevantes de la acción (la tarea creada/actualizada/eliminada, lista de tareas, etc.)
- "confidence": Un valor entre 0 y 1 que indica tu confianza en la respuesta`;

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
          case "createTask": {
            // Formatear la fecha límite si existe
            let deadline = args.deadline ? new Date(args.deadline) : null;
            
            // Crear la nueva tarea
            const newTask: InsertTask = {
              title: args.title,
              description: args.description || null,
              status: args.status || 'pendiente',
              priority: args.priority || 'media',
              categoryId: args.categoryId || null,
              deadline: deadline,
              assignedTo: args.assignedTo || null
            };
            
            const createdTask = await storage.createTask(newTask);
            result = {
              action: 'createTask',
              response: `He creado la tarea "${createdTask.title}" correctamente.`,
              data: createdTask,
              confidence: 0.9
            };
            break;
          }
          
          case "updateTask": {
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
            
            // Preparar los datos para actualizar
            const updateData: Partial<InsertTask> = {};
            if (args.title !== undefined) updateData.title = args.title;
            if (args.description !== undefined) updateData.description = args.description;
            if (args.status !== undefined) updateData.status = args.status;
            if (args.priority !== undefined) updateData.priority = args.priority;
            if (args.categoryId !== undefined) updateData.categoryId = args.categoryId;
            if (args.deadline !== undefined) updateData.deadline = args.deadline ? new Date(args.deadline) : null;
            if (args.assignedTo !== undefined) updateData.assignedTo = args.assignedTo;
            
            // Actualizar la tarea
            const updatedTask = await storage.updateTask(args.id, updateData);
            
            result = {
              action: 'updateTask',
              response: `He actualizado la tarea "${updatedTask?.title}" correctamente.`,
              data: updatedTask,
              confidence: 0.9
            };
            break;
          }
          
          case "deleteTask": {
            // Verificar que la tarea existe
            const existingTask = await storage.getTask(args.id);
            
            if (!existingTask) {
              result = {
                action: 'error',
                response: `No pude encontrar una tarea con el ID ${args.id}. Por favor, verifica el ID e intenta de nuevo.`,
                confidence: 0.8
              };
              break;
            }
            
            // Eliminar la tarea
            const deleted = await storage.deleteTask(args.id);
            
            result = {
              action: 'deleteTask',
              response: deleted 
                ? `He eliminado la tarea "${existingTask.title}" correctamente.` 
                : `No pude eliminar la tarea. Por favor, intenta de nuevo.`,
              data: existingTask,
              confidence: 0.9
            };
            break;
          }
          
          case "getTask": {
            // Obtener la tarea por ID
            const task = await storage.getTask(args.id);
            
            if (!task) {
              result = {
                action: 'error',
                response: `No pude encontrar una tarea con el ID ${args.id}. Por favor, verifica el ID e intenta de nuevo.`,
                confidence: 0.8
              };
              break;
            }
            
            result = {
              action: 'getTask',
              response: `Aquí tienes los detalles de la tarea "${task.title}".`,
              data: task,
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
          
          case "createTasks": {
            const createdTasks = [];
            
            // Procesar cada tarea en la lista
            for (const taskData of args.tasks) {
              // Formatear la fecha límite si existe
              let deadline = taskData.deadline ? new Date(taskData.deadline) : null;
              
              // Crear la nueva tarea
              const newTask: InsertTask = {
                title: taskData.title,
                description: taskData.description || null,
                status: taskData.status || 'pendiente',
                priority: taskData.priority || 'media',
                categoryId: taskData.categoryId || null,
                deadline: deadline,
                assignedTo: taskData.assignedTo || null
              };
              
              const createdTask = await storage.createTask(newTask);
              createdTasks.push(createdTask);
            }
            
            result = {
              action: 'createTasks',
              response: `He creado ${createdTasks.length} tareas correctamente.`,
              data: createdTasks,
              confidence: 0.9
            };
            break;
          }
          
          case "deleteTasks": {
            const deletedTasks = [];
            const failedIds = [];
            
            // Procesar cada ID en la lista
            for (const id of args.ids) {
              // Verificar que la tarea existe
              const existingTask = await storage.getTask(id);
              
              if (existingTask) {
                // Eliminar la tarea
                const deleted = await storage.deleteTask(id);
                
                if (deleted) {
                  deletedTasks.push(existingTask);
                } else {
                  failedIds.push(id);
                }
              } else {
                failedIds.push(id);
              }
            }
            
            result = {
              action: 'deleteTasks',
              response: failedIds.length === 0
                ? `He eliminado ${deletedTasks.length} tareas correctamente.`
                : `He eliminado ${deletedTasks.length} tareas, pero no pude eliminar ${failedIds.length} tareas (IDs: ${failedIds.join(', ')}).`,
              data: {
                deletedTasks,
                failedIds
              },
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
      console.error("Error en TaskAgent.process:", error);
      return {
        action: 'error',
        response: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo.",
        confidence: 0.5
      };
    }
  }
}