import { OpenAITool } from '../types/common';

/**
 * Definición de las herramientas disponibles para el agente de tareas
 */
export const taskTools: OpenAITool[] = [
  {
    type: "function",
    function: {
      name: "createTask",
      description: "Crea una nueva tarea en el sistema",
      parameters: {
        type: "object",
        properties: {
          title: { 
            type: "string",
            description: "Título de la tarea (extráelo de la descripción del usuario)"
          },
          description: { 
            type: "string",
            description: "Descripción detallada (elabora basado en la solicitud)"
          },
          priority: { 
            type: "string", 
            enum: ["alta", "media", "baja"],
            description: "Prioridad de la tarea (deduce la prioridad apropiada)"
          },
          categoryId: { 
            type: "integer",
            description: "ID de la categoría (opcional, usa 1 por defecto)" 
          },
          deadline: { 
            type: "string", 
            format: "date",
            description: "Fecha límite en formato YYYY-MM-DD. INCLUIR SIEMPRE que el usuario mencione una fecha. Convierte expresiones relativas ('mañana', 'el viernes', etc.) a fechas absolutas."
          }
        },
        required: ["title", "description", "priority"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createTasks",
      description: "Crea múltiples tareas en el sistema de una sola vez",
      parameters: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { 
                  type: "string",
                  description: "Título de la tarea (extráelo de la descripción del usuario)"
                },
                description: { 
                  type: "string",
                  description: "Descripción detallada (elabora basado en la solicitud)"
                },
                priority: { 
                  type: "string", 
                  enum: ["alta", "media", "baja"],
                  description: "Prioridad de la tarea (deduce la prioridad apropiada)"
                },
                categoryId: { 
                  type: "integer",
                  description: "ID de la categoría (opcional, usa 1 por defecto)" 
                },
                deadline: { 
                  type: "string", 
                  format: "date",
                  description: "Fecha límite en formato YYYY-MM-DD (opcional). Incluir si el usuario menciona fechas."
                }
              },
              required: ["title", "description", "priority"]
            }
          }
        },
        required: ["tasks"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "updateTask",
      description: "Actualiza una tarea existente",
      parameters: {
        type: "object",
        properties: {
          id: { 
            type: "integer",
            description: "ID de la tarea a actualizar"
          },
          title: { 
            type: "string",
            description: "Nuevo título de la tarea (opcional)"
          },
          description: { 
            type: "string",
            description: "Nueva descripción (opcional)"
          },
          status: { 
            type: "string", 
            enum: ["pendiente", "en_progreso", "revision", "completada"],
            description: "Nuevo estado (opcional)"
          },
          priority: { 
            type: "string", 
            enum: ["alta", "media", "baja"],
            description: "Nueva prioridad (opcional)"
          },
          categoryId: { 
            type: "integer",
            description: "ID de la nueva categoría (opcional)" 
          },
          deadline: { 
            type: "string", 
            format: "date",
            description: "Nueva fecha límite en formato YYYY-MM-DD (opcional)"
          }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "deleteTask",
      description: "Elimina una tarea existente",
      parameters: {
        type: "object",
        properties: {
          id: { 
            type: "integer",
            description: "ID de la tarea a eliminar"
          }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "deleteTasks",
      description: "Elimina múltiples tareas existentes",
      parameters: {
        type: "object",
        properties: {
          ids: { 
            type: "array",
            items: {
              type: "integer"
            },
            description: "Lista de IDs de las tareas a eliminar"
          }
        },
        required: ["ids"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTasks",
      description: "Obtiene la lista de tareas (filtrada opcionalmente)",
      parameters: {
        type: "object",
        properties: {
          status: { 
            type: "string", 
            enum: ["pendiente", "en_progreso", "revision", "completada"],
            description: "Filtrar por estado (opcional)"
          },
          categoryId: { 
            type: "integer",
            description: "Filtrar por categoría (opcional)" 
          }
        }
      }
    }
  }
];