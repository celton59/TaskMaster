import { OpenAITool } from '../types/common';

/**
 * Definición de las herramientas disponibles para el agente de tareas
 */
export const taskTools: OpenAITool[] = [
  {
    type: "function",
    function: {
      name: "createTask",
      description: "Crea una nueva tarea con los detalles proporcionados",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Título de la tarea"
          },
          description: {
            type: "string",
            description: "Descripción detallada de la tarea"
          },
          status: {
            type: "string",
            description: "Estado de la tarea: pendiente, en_progreso, revision, completada",
            enum: ["pendiente", "en_progreso", "revision", "completada"]
          },
          priority: {
            type: "string",
            description: "Prioridad de la tarea: alta, media, baja",
            enum: ["alta", "media", "baja"]
          },
          categoryId: {
            type: "integer",
            description: "ID de la categoría a la que pertenece la tarea"
          },
          deadline: {
            type: "string",
            description: "Fecha límite para completar la tarea en formato ISO (YYYY-MM-DD)"
          },
          assignedTo: {
            type: "integer",
            description: "ID del usuario asignado a la tarea"
          }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "updateTask",
      description: "Actualiza una tarea existente con los nuevos datos proporcionados",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "ID de la tarea a actualizar"
          },
          title: {
            type: "string",
            description: "Nuevo título de la tarea"
          },
          description: {
            type: "string",
            description: "Nueva descripción detallada de la tarea"
          },
          status: {
            type: "string",
            description: "Nuevo estado de la tarea: pendiente, en_progreso, revision, completada",
            enum: ["pendiente", "en_progreso", "revision", "completada"]
          },
          priority: {
            type: "string",
            description: "Nueva prioridad de la tarea: alta, media, baja",
            enum: ["alta", "media", "baja"]
          },
          categoryId: {
            type: "integer",
            description: "Nuevo ID de la categoría a la que pertenece la tarea"
          },
          deadline: {
            type: "string",
            description: "Nueva fecha límite para completar la tarea en formato ISO (YYYY-MM-DD)"
          },
          assignedTo: {
            type: "integer",
            description: "Nuevo ID del usuario asignado a la tarea"
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
      name: "getTask",
      description: "Obtiene los detalles de una tarea específica",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "ID de la tarea a consultar"
          }
        },
        required: ["id"]
      }
    }
  },
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
  },
  {
    type: "function",
    function: {
      name: "createTasks",
      description: "Crea múltiples tareas a partir de una lista",
      parameters: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            description: "Lista de tareas a crear",
            items: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Título de la tarea"
                },
                description: {
                  type: "string",
                  description: "Descripción detallada de la tarea"
                },
                status: {
                  type: "string",
                  description: "Estado de la tarea: pendiente, en_progreso, revision, completada",
                  enum: ["pendiente", "en_progreso", "revision", "completada"]
                },
                priority: {
                  type: "string",
                  description: "Prioridad de la tarea: alta, media, baja",
                  enum: ["alta", "media", "baja"]
                },
                categoryId: {
                  type: "integer",
                  description: "ID de la categoría a la que pertenece la tarea"
                },
                deadline: {
                  type: "string",
                  description: "Fecha límite para completar la tarea en formato ISO (YYYY-MM-DD)"
                }
              },
              required: ["title"]
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
      name: "deleteTasks",
      description: "Elimina múltiples tareas a partir de una lista de IDs",
      parameters: {
        type: "object",
        properties: {
          ids: {
            type: "array",
            description: "Lista de IDs de tareas a eliminar",
            items: {
              type: "integer"
            }
          }
        },
        required: ["ids"]
      }
    }
  }
];