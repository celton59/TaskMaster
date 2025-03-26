import { OpenAITool } from '../types/common';

/**
 * Definición de las herramientas disponibles para el agente de planificación
 */
export const plannerTools: OpenAITool[] = [
  {
    type: "function",
    function: {
      name: "getUpcomingDeadlines",
      description: "Obtiene las tareas con fechas límite próximas en un período específico",
      parameters: {
        type: "object",
        properties: {
          daysAhead: {
            type: "integer",
            description: "Número de días hacia adelante para buscar"
          },
          limit: {
            type: "integer",
            description: "Número máximo de tareas a retornar"
          }
        },
        required: ["daysAhead"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getPrioritizedTasks",
      description: "Obtiene las tareas ordenadas por prioridad",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Filtrar por estado: pendiente, en_progreso, revision, completada",
            enum: ["pendiente", "en_progreso", "revision", "completada"]
          },
          limit: {
            type: "integer",
            description: "Número máximo de tareas a retornar"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "setDeadlines",
      description: "Actualiza las fechas límite de una tarea existente",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "ID de la tarea a actualizar"
          },
          deadline: {
            type: "string",
            description: "Nueva fecha límite para la tarea en formato ISO (YYYY-MM-DD)"
          }
        },
        required: ["id", "deadline"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "scheduleTasks",
      description: "Programa múltiples tareas distribuyéndolas en un rango de fechas",
      parameters: {
        type: "object",
        properties: {
          taskIds: {
            type: "array",
            description: "Lista de IDs de las tareas a programar",
            items: {
              type: "integer"
            }
          },
          startDate: {
            type: "string",
            description: "Fecha de inicio del período en formato ISO (YYYY-MM-DD)"
          },
          endDate: {
            type: "string",
            description: "Fecha final del período en formato ISO (YYYY-MM-DD)"
          },
          distributeEvenly: {
            type: "boolean",
            description: "Si es true, distribuye las tareas uniformemente en el período. Si es false, las tareas se programan según su prioridad"
          }
        },
        required: ["taskIds", "startDate", "endDate"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTasksByDate",
      description: "Obtiene las tareas programadas para una fecha específica",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Fecha para buscar tareas en formato ISO (YYYY-MM-DD)"
          }
        },
        required: ["date"]
      }
    }
  }
];