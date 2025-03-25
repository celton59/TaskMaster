import OpenAI from 'openai';
import { storage } from '../storage';
import { InsertTask } from '../../shared/schema';

// Inicializar cliente de OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Definir tipo para las funciones que usamos con OpenAI
type OpenAIFunction = {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
};

// Interfaces para los agentes
interface AgentRequest {
  userInput: string;
  context?: any;
}

interface AgentResponse {
  action?: string;
  response: string;
  data?: any;
  confidence: number;
  metadata?: any;
}

// Orquestador principal que gestiona todos los agentes
export class AgentOrchestrator {
  private agents: Map<string, SpecializedAgent>;
  private conversationHistory: Array<{
    userInput: string;
    agentType: string;
    action?: string;
    response: string;
    timestamp: Date;
  }>;
  private lastTaskId: number | null = null;
  
  constructor() {
    this.agents = new Map();
    this.conversationHistory = [];
    
    // Registrar los agentes especializados
    this.registerAgent('task', new TaskAgent());
    this.registerAgent('category', new CategoryAgent());
    this.registerAgent('analytics', new AnalyticsAgent());
    this.registerAgent('planner', new PlannerAgent());
    this.registerAgent('marketing', new MarketingAgent());
    this.registerAgent('project', new ProjectManagerAgent());
  }
  
  registerAgent(name: string, agent: SpecializedAgent) {
    this.agents.set(name, agent);
  }
  
  async process(userInput: string): Promise<{
    action?: string;
    message: string;
    data?: any;
    agentUsed?: string;
  }> {
    try {
      // 1. Determinar qué agente debe manejar la solicitud
      const { agentType, confidence } = await this.determineAgentType(userInput);
      
      // 2. Si la confianza es baja, usar un enfoque colaborativo
      if (confidence < 0.7) {
        const result = await this.collaborativeProcess(userInput);
        
        // Registrar en el historial
        if (result.action) {
          this.conversationHistory.push({
            userInput,
            agentType: 'collaborative',
            action: result.action,
            response: result.message,
            timestamp: new Date()
          });
          
          // Si la acción es relacionada con una tarea, guardar su ID
          if (result.action === 'createTask' && result.data?.id) {
            this.lastTaskId = result.data.id;
          }
        }
        
        return result;
      }
      
      // 3. Delegar al agente especializado
      const agent = this.agents.get(agentType);
      
      if (!agent) {
        const response = {
          message: "No he podido procesar tu solicitud. Por favor, intenta ser más específico.",
          agentUsed: "orchestrator"
        };
        
        this.conversationHistory.push({
          userInput,
          agentType: 'orchestrator',
          response: response.message,
          timestamp: new Date()
        });
        
        return response;
      }
      
      // 4. Si el usuario pregunta por una tarea o acción reciente, o pide una explicación
      const recentTaskCheck = this.checkForRecentTaskReference(userInput);
      
      // Si se detecta una solicitud de explicación o referencia a acción reciente
      if (recentTaskCheck.hasRecentReference) {
        // Para explicaciones, preferimos usar el último agente usado en vez del detector genérico
        const agentType = recentTaskCheck.suggestedAgentType || 'task';
        const agent = this.agents.get(agentType);
        
        if (agent) {
          // Obtener contexto relevante para el agente
          const context = await this.getContextForAgent(agentType);
          
          // Si hay una última tarea y no es una explicación general, añadirla al contexto
          if (this.lastTaskId !== null) {
            try {
              const lastTask = await storage.getTask(this.lastTaskId);
              if (lastTask) {
                // Añadir la última tarea explícitamente al contexto
                context.lastTask = lastTask;
              }
            } catch (error) {
              console.error("Error al obtener la última tarea:", error);
              // No añadir lastTask al contexto si hay un error
            }
          }
          
          const result = await agent.process({ userInput, context });
          
          // Registrar en el historial
          this.conversationHistory.push({
            userInput,
            agentType,
            action: result.action,
            response: result.response,
            timestamp: new Date()
          });
          
          return {
            action: result.action,
            message: result.response,
            data: result.data,
            agentUsed: agentType
          };
        }
      }
      
      // 5. Procesamiento normal si no se detectó referencia a tarea reciente
      // Obtener contexto relevante para el agente, incluyendo historial de conversación
      const context = await this.getContextForAgent(agentType);
      const result = await agent.process({ userInput, context });
      
      // 6. Registrar en el historial
      this.conversationHistory.push({
        userInput,
        agentType,
        action: result.action,
        response: result.response,
        timestamp: new Date()
      });
      
      // Si la acción es relacionada con una tarea, guardar su ID
      if (result.action === 'createTask' && result.data?.id) {
        this.lastTaskId = result.data.id;
      } else if (result.action === 'updateTask' && result.data?.id) {
        this.lastTaskId = result.data.id;
      } else if ((result.action === 'setDeadlines' || result.action === 'scheduleTasks') && result.data?.id) {
        this.lastTaskId = result.data.id;
      }
      
      return {
        action: result.action,
        message: result.response,
        data: result.data,
        agentUsed: agentType
      };
    } catch (error) {
      console.error("Error en el orquestador:", error);
      
      const response = {
        message: "Ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo.",
        agentUsed: "orchestrator"
      };
      
      this.conversationHistory.push({
        userInput,
        agentType: 'error',
        response: response.message,
        timestamp: new Date()
      });
      
      return response;
    }
  }
  
  /**
   * Verifica si el mensaje del usuario hace referencia a una tarea o acción reciente
   */
  private checkForRecentTaskReference(userInput: string): {
    hasRecentReference: boolean;
    suggestedAgentType?: string;
  } {
    // Patrones para detectar referencias a tareas recientes
    const confirmationPatterns = [
      /se ha (creado|actualizado|guardado|registrado|completado)/i,
      /se la has puesto/i,
      /ya (está|esta|lo has hecho|terminaste)/i,
      /actualiz[a|ó|o]/i,
      /lo has/i,
      /pusiste/i
    ];
    
    // Patrones para detectar peticiones de explicación
    const explanationPatterns = [
      /explica/i,
      /explicame/i,
      /explícame/i,
      /que (has|hiciste|acabas de hacer)/i,
      /qué (has|hiciste|acabas de hacer)/i,
      /por que/i,
      /por qué/i,
      /detalles/i,
      /como funciona/i,
      /cómo funciona/i
    ];
    
    // Patrones para fechas
    const datePatterns = [
      /fecha/i,
      /plazo/i,
      /deadline/i,
      /cuándo/i,
      /cuando/i,
      /para (cuándo|cuando)/i
    ];
    
    // Verificar si hay patrones de confirmación
    const hasConfirmationPattern = confirmationPatterns.some(pattern => 
      pattern.test(userInput)
    );
    
    // Verificar si hay patrones de explicación
    const hasExplanationPattern = explanationPatterns.some(pattern => 
      pattern.test(userInput)
    );
    
    // Verificar si hay patrones de fecha
    const hasDatePattern = datePatterns.some(pattern => 
      pattern.test(userInput)
    );
    
    // Si hay patrones de fecha, sugerir el agente planificador
    if (hasDatePattern) {
      return {
        hasRecentReference: true,
        suggestedAgentType: 'planner'
      };
    }
    
    // Si hay patrones de explicación, debe mantener el último agente usado
    if (hasExplanationPattern && this.conversationHistory.length > 0) {
      // Obtener el último agente que no sea "error"
      const lastAgent = this.conversationHistory
        .filter(h => h.agentType !== 'error')
        .slice(-1)[0]?.agentType || 'task';
      
      console.log(`Detectada solicitud de explicación, usando último agente: ${lastAgent}`);
      
      return {
        hasRecentReference: true,
        suggestedAgentType: lastAgent
      };
    }
    
    // Si hay patrones de confirmación pero no de fecha, probablemente es sobre estado general
    if (hasConfirmationPattern) {
      return {
        hasRecentReference: true,
        suggestedAgentType: 'task'
      };
    }
    
    return {
      hasRecentReference: false
    };
  }
  
  private async determineAgentType(userInput: string): Promise<{
    agentType: string;
    confidence: number;
  }> {
    try {
      // Usar LLM para determinar qué agente debe manejar la solicitud
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Usando el modelo más reciente
        messages: [
          {
            role: "system",
            content: `Determina qué tipo de agente especializado debe manejar la siguiente solicitud.

Opciones disponibles:
- task: Para crear, actualizar, eliminar o consultar tareas específicas. Si la solicitud menciona crear una tarea, actualizar una tarea existente, buscar tareas, o cualquier operación específica relacionada con tareas.
- category: Para gestionar categorías, crear nuevas categorías, asignar tareas a categorías, listar categorías existentes, etc.
- analytics: Para analizar datos, generar informes, estadísticas, ver métricas de tareas completadas, pendientes, etc.
- planner: Para planificación, programación, fechas límite, recordatorios, organización temporal.
- marketing: Para estrategias de marketing digital, planes de contenido, campañas, SEO, redes sociales, email marketing y análisis de métricas digitales.
- project: Para gestión de proyectos, equipos, asignación de recursos, seguimiento de progreso, gestión de fases y ciclos de vida de proyectos.

IMPORTANTE: Si la solicitud no es clara o no se ajusta a ninguna categoría específica, asigna a "task".

Responde con un JSON que contenga:
1. "agentType": El tipo de agente que debe manejar la solicitud (task, category, analytics, planner, marketing, project)
2. "confidence": Valor entre 0 y 1 que indica la confianza en esta decisión
3. "reasoning": Breve explicación del porqué`
          },
          {
            role: "user",
            content: userInput
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content || "";
      try {
        const result = JSON.parse(content);
        console.log("Determinación de agente:", result);
        return {
          agentType: result.agentType,
          confidence: result.confidence
        };
      } catch (e) {
        console.error("Error al parsear respuesta de determinación de agente:", e);
        // Si hay un error al parsear, usar el agente de tareas por defecto
        return {
          agentType: "task",
          confidence: 0.5
        };
      }
    } catch (error) {
      console.error("Error en determineAgentType:", error);
      return {
        agentType: "task",
        confidence: 0.5
      };
    }
  }
  
  private async getContextForAgent(agentType: string, lastTask?: any): Promise<any> {
    // Preparar el historial de conversación reciente (últimas 5 interacciones)
    const recentHistory = this.conversationHistory
      .slice(-5)
      .map(h => ({
        userInput: h.userInput,
        agentType: h.agentType,
        action: h.action,
        response: h.response,
        timestamp: h.timestamp.toISOString()
      }));
    
    // Contexto base común para todos los agentes
    const baseContext = {
      conversationHistory: recentHistory,
      lastTaskId: this.lastTaskId
    };
    
    // Si hay una tarea específica, añadirla al contexto
    type ContextWithTask = typeof baseContext & { lastTask?: any };
    let contextWithTask: ContextWithTask = baseContext;
    
    if (lastTask) {
      contextWithTask = {
        ...baseContext,
        lastTask: lastTask
      };
    }
    
    // Obtener contexto específico según el tipo de agente
    let specificContext = {};
    
    switch (agentType) {
      case "task":
        specificContext = {
          recentTasks: await storage.getTasks(),
          categories: await storage.getCategories()
        };
        break;
        
      case "category":
        specificContext = {
          categories: await storage.getCategories(),
          tasksByCategory: await Promise.all(
            (await storage.getCategories()).map(async category => ({
              categoryId: category.id,
              taskCount: (await storage.getTasksByCategory(category.id)).length
            }))
          )
        };
        break;
        
      case "analytics":
        specificContext = {
          taskStats: await storage.getTaskStats(),
          categories: await storage.getCategories(),
          recentTasks: await storage.getTasks()
        };
        break;
        
      case "planner":
        specificContext = {
          tasks: await storage.getTasks(),
          upcomingDeadlines: (await storage.getTasks())
            .filter(task => task.deadline && new Date(task.deadline) > new Date())
            .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        };
        break;
        
      case "marketing":
        specificContext = {
          tasks: await storage.getTasks(),
          categories: await storage.getCategories(),
          // Incluir tareas relacionadas con marketing
          marketingTasks: (await storage.getTasks())
            .filter(task => {
              const titleIncludesMarketing = task.title.toLowerCase().includes('marketing') || 
                                           task.title.toLowerCase().includes('digital') ||
                                           task.title.toLowerCase().includes('campaña') ||
                                           task.title.toLowerCase().includes('promoción');
              const descriptionIncludesMarketing = task.description && 
                (task.description.toLowerCase().includes('marketing') ||
                 task.description.toLowerCase().includes('digital') ||
                 task.description.toLowerCase().includes('campaña') ||
                 task.description.toLowerCase().includes('promoción'));
              
              return titleIncludesMarketing || descriptionIncludesMarketing;
            })
        };
        break;
        
      case "project":
        specificContext = {
          tasks: await storage.getTasks(),
          categories: await storage.getCategories(),
          // Incluir tareas relacionadas con proyectos
          projectTasks: (await storage.getTasks())
            .filter(task => {
              const titleIncludesProject = task.title.toLowerCase().includes('proyecto') || 
                                         task.title.toLowerCase().includes('project') ||
                                         task.title.toLowerCase().includes('fase');
              const descriptionIncludesProject = task.description && 
                (task.description.toLowerCase().includes('proyecto') ||
                 task.description.toLowerCase().includes('project') ||
                 task.description.toLowerCase().includes('fase'));
              
              return titleIncludesProject || descriptionIncludesProject;
            })
        };
        break;
    }
    
    // Combinar el contexto con tarea con el específico
    return {
      ...contextWithTask,
      ...specificContext
    };
  }
  
  private async collaborativeProcess(userInput: string): Promise<{
    action?: string;
    message: string;
    data?: any;
  }> {
    // Implementación del enfoque colaborativo entre múltiples agentes
    // Esto podría implicar consultar a varios agentes y combinar sus respuestas
    const results = await Promise.all(
      Array.from(this.agents.entries()).map(async ([name, agent]) => {
        try {
          const context = await this.getContextForAgent(name);
          const response = await agent.process({ userInput, context });
          return {
            agentName: name,
            response,
          };
        } catch (e) {
          return {
            agentName: name,
            response: {
              confidence: 0,
              response: "Error procesando la solicitud",
            },
          };
        }
      })
    );
    
    // Seleccionar la respuesta con mayor confianza
    results.sort((a, b) => b.response.confidence - a.response.confidence);
    const bestResponse = results[0];
    
    if (bestResponse.response.confidence < 0.4) {
      // Si ningún agente tiene confianza, usar un enfoque más genérico
      return {
        message: "No estoy seguro de cómo procesar esta solicitud. ¿Podrías ser más específico?",
      };
    }
    
    return {
      action: bestResponse.response.action,
      message: bestResponse.response.response,
      data: bestResponse.response.data,
    };
  }
}

// Interfaz para los agentes especializados
abstract class SpecializedAgent {
  abstract process(request: AgentRequest): Promise<AgentResponse>;
  abstract getFunctions(): Array<OpenAIFunction>;
  
  protected async callModel(systemPrompt: string, userInput: string, context?: any): Promise<string> {
    const contextString = context ? `\nContexto del sistema:\n${JSON.stringify(context, null, 2)}` : '';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Usar el modelo más reciente de OpenAI
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `${contextString}\n\nSolicitud del usuario: ${userInput}`
        }
      ],
      response_format: { type: "json_object" } // Asegurar respuesta en formato JSON
    });
    
    return response.choices[0]?.message?.content || "";
  }
  
  protected async callModelWithFunctions(systemPrompt: string, userInput: string, context?: any): Promise<{
    functionCall?: {
      name: string;
      arguments: any;
    };
    content?: string;
  }> {
    const contextString = context ? `\nContexto del sistema:\n${JSON.stringify(context, null, 2)}` : '';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Usar el modelo más reciente de OpenAI
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `${contextString}\n\nSolicitud del usuario: ${userInput}`
        }
      ],
      functions: this.getFunctions(),
      function_call: "auto"
    });
    
    const message = response.choices[0]?.message;
    
    if (message?.function_call) {
      try {
        const args = JSON.parse(message.function_call.arguments);
        return {
          functionCall: {
            name: message.function_call.name,
            arguments: args
          }
        };
      } catch (error) {
        console.error("Error al parsear argumentos de function call:", error);
        return { content: message.content || "" };
      }
    }
    
    return { content: message?.content || "" };
  }
}

// Implementación del Agente de Tareas
class TaskAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en la gestión de tareas. 
Tu objetivo es crear nuevas tareas, actualizar tareas existentes, eliminar tareas o proporcionar información sobre tareas.

IMPORTANTE: Si el usuario describe algo que suena como una tarea (por ejemplo, "tengo que hacer contabilidad", "necesito preparar una presentación", etc.), SIEMPRE debes interpretar esto como una solicitud para CREAR una nueva tarea, incluso si no lo pide explícitamente. Si el usuario menciona una fecha, SIEMPRE debes incluir esa fecha al crear la tarea.

IMPORTANTE: NUNCA respondas con texto en formato JSON. En su lugar, debes usar las funciones disponibles.

IMPORTANTE: Si el usuario menciona o sugiere una fecha (por ejemplo: "para mañana", "para el viernes", "para el 27 de marzo", etc.), DEBES incluir esa fecha en el campo deadline al crear la tarea. Convierte expresiones de tiempo relativas a fechas absolutas.

IMPORTANTE: Si el usuario solicita eliminar varias tareas (por ejemplo: "borra las tareas 1, 2 y 3" o "elimina las tareas 4-7"), DEBES usar la función deleteTasks con todos los IDs mencionados. Asegúrate de extraer correctamente todos los números de ID, incluso si están en una lista, separados por comas o guiones.

IMPORTANTE: Si el usuario solicita crear varias tareas al mismo tiempo (por ejemplo: "crea 4 tareas: lavar, planchar, cocinar, limpiar"), DEBES usar la función createTasks y añadir cada tarea como un objeto separado en el array 'tasks'. Toma cada elemento de la lista como una tarea independiente.

No intentes responder a chistes, saludos o conversación casual; interpreta todo como un intento de gestionar tareas.`;
  
  getFunctions(): Array<OpenAIFunction> {
    return [
      {
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
      },
      {
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
                    description: "Fecha límite en formato YYYY-MM-DD. INCLUIR SIEMPRE que el usuario mencione una fecha. Convierte expresiones relativas ('mañana', 'el viernes', etc.) a fechas absolutas."
                  }
                },
                required: ["title", "description", "priority"]
              },
              description: "Lista de tareas a crear"
            }
          },
          required: ["tasks"]
        }
      },
      {
        name: "updateTask",
        description: "Actualiza una tarea existente",
        parameters: {
          type: "object",
          properties: {
            taskId: { 
              type: "integer",
              description: "ID de la tarea a actualizar" 
            },
            updates: { 
              type: "object",
              description: "Objeto con los campos a actualizar",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                status: { 
                  type: "string", 
                  enum: ["pending", "in_progress", "review", "completed"] 
                },
                priority: { 
                  type: "string", 
                  enum: ["high", "medium", "low"] 
                },
                categoryId: { type: "integer" },
                deadline: { 
                  type: "string", 
                  format: "date" 
                }
              }
            }
          },
          required: ["taskId", "updates"]
        }
      },
      {
        name: "deleteTasks",
        description: "Elimina una o varias tareas existentes",
        parameters: {
          type: "object",
          properties: {
            taskIds: { 
              type: "array",
              items: {
                type: "integer"
              },
              description: "Lista de IDs de las tareas a eliminar" 
            }
          },
          required: ["taskIds"]
        }
      },
      {
        name: "listTasks",
        description: "Lista las tareas existentes, opcionalmente filtradas",
        parameters: {
          type: "object",
          properties: {
            status: { 
              type: "string", 
              enum: ["pending", "in_progress", "review", "completed"],
              description: "Filtrar por estatus (opcional)" 
            },
            categoryId: { 
              type: "integer",
              description: "Filtrar por categoría (opcional)" 
            }
          }
        }
      },
      {
        name: "respond",
        description: "Responder al usuario sin realizar ninguna acción en el sistema",
        parameters: {
          type: "object",
          properties: {
            message: { 
              type: "string",
              description: "Mensaje para el usuario" 
            }
          },
          required: ["message"]
        }
      }
    ];
  }
  
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Usar el método callModelWithFunctions en lugar de callModel
      const response = await this.callModelWithFunctions(this.systemPrompt, request.userInput, request.context);
      
      // Si no hay una llamada a función, usar el contenido de texto como respuesta
      if (!response.functionCall) {
        return {
          response: response.content || "No pude entender tu solicitud relacionada con tareas.",
          confidence: 0.5
        };
      }
      
      // Procesar la llamada a función
      let data = null;
      let action = response.functionCall.name;
      let userResponse = "";
      
      switch (action) {
        case "createTask": {
          const args = response.functionCall.arguments;
          // Convertir prioridad si es necesario
          let priority = args.priority;
          if (priority === 'alta') priority = 'high';
          else if (priority === 'media') priority = 'medium';
          else if (priority === 'baja') priority = 'low';
          
          const newTask = {
            title: args.title,
            description: args.description,
            status: 'pending',
            priority,
            categoryId: args.categoryId || 1,
            deadline: args.deadline ? new Date(args.deadline) : null,
          };
          
          data = await storage.createTask(newTask);
          userResponse = `He creado la tarea "${args.title}" con prioridad ${args.priority}.`;
          if (args.deadline) {
            userResponse += ` La fecha límite es ${args.deadline}.`;
          }
          break;
        }
        
        case "createTasks": {
          const args = response.functionCall.arguments;
          const createdTasks = [];
          
          // Procesar cada tarea en la lista
          for (const taskData of args.tasks) {
            // Convertir prioridad si es necesario
            let priority = taskData.priority;
            if (priority === 'alta') priority = 'high';
            else if (priority === 'media') priority = 'medium';
            else if (priority === 'baja') priority = 'low';
            
            const newTask = {
              title: taskData.title,
              description: taskData.description,
              status: 'pending',
              priority,
              categoryId: taskData.categoryId || 1,
              deadline: taskData.deadline ? new Date(taskData.deadline) : null,
            };
            
            try {
              const createdTask = await storage.createTask(newTask);
              createdTasks.push(createdTask);
            } catch (error) {
              console.error("Error al crear tarea:", error);
            }
          }
          
          data = createdTasks;
          
          // Generar mensaje de respuesta
          if (createdTasks.length === 1) {
            userResponse = `He creado la tarea "${createdTasks[0].title}".`;
          } else if (createdTasks.length > 1) {
            userResponse = `He creado ${createdTasks.length} tareas: `;
            createdTasks.forEach((task, index) => {
              if (index === createdTasks.length - 1) {
                userResponse += ` y "${task.title}".`;
              } else if (index === 0) {
                userResponse += `"${task.title}"`;
              } else {
                userResponse += `, "${task.title}"`;
              }
            });
          } else {
            userResponse = "No pude crear ninguna tarea. Por favor, intenta nuevamente.";
          }
          
          break;
        }
        
        case "updateTask": {
          const args = response.functionCall.arguments;
          data = await storage.updateTask(args.taskId, args.updates);
          userResponse = `He actualizado la tarea con ID ${args.taskId}.`;
          break;
        }
        
        case "deleteTask": {
          const args = response.functionCall.arguments;
          data = await storage.deleteTask(args.taskId);
          userResponse = `He eliminado la tarea con ID ${args.taskId}.`;
          break;
        }
        
        case "deleteTasks": {
          const args = response.functionCall.arguments;
          let deletedTasks = [];
          let failedTasks = [];
          
          // Procesar cada ID de tarea
          for (const taskId of args.taskIds) {
            try {
              const success = await storage.deleteTask(taskId);
              if (success) {
                deletedTasks.push(taskId);
              } else {
                failedTasks.push(taskId);
              }
            } catch (error) {
              console.error(`Error al eliminar tarea con ID ${taskId}:`, error);
              failedTasks.push(taskId);
            }
          }
          
          // Crear mensaje de respuesta
          if (deletedTasks.length > 0) {
            userResponse = `He eliminado las siguientes tareas: ${deletedTasks.join(', ')}.`;
            if (failedTasks.length > 0) {
              userResponse += ` No pude eliminar las tareas: ${failedTasks.join(', ')}. Puede que ya no existan o haya ocurrido un error.`;
            }
          } else {
            userResponse = `No pude eliminar ninguna de las tareas solicitadas: ${args.taskIds.join(', ')}.`;
          }
          
          data = { deletedTasks, failedTasks };
          break;
        }
        
        case "listTasks": {
          const args = response.functionCall.arguments;
          let tasks = await storage.getTasks();
          
          // Aplicar filtros si se proporcionan
          if (args.status) {
            tasks = tasks.filter(task => task.status === args.status);
          }
          if (args.categoryId) {
            tasks = tasks.filter(task => task.categoryId === args.categoryId);
          }
          
          data = tasks;
          userResponse = "Aquí están las tareas que encontré:";
          if (tasks.length === 0) {
            userResponse = "No encontré tareas con los criterios especificados.";
          } else {
            tasks.slice(0, 5).forEach((task, index) => {
              userResponse += `\n${index + 1}. ${task.title} (ID: ${task.id}) - Prioridad: ${task.priority}, Estado: ${task.status}`;
            });
            
            if (tasks.length > 5) {
              userResponse += `\n...y ${tasks.length - 5} tareas más.`;
            }
          }
          break;
        }
        
        case "respond": {
          const args = response.functionCall.arguments;
          userResponse = args.message;
          break;
        }
        
        default:
          userResponse = "No pude procesar correctamente tu solicitud.";
      }
      
      return {
        action,
        response: userResponse,
        data,
        confidence: 0.9
      };
    } catch (error) {
      console.error("Error en TaskAgent:", error);
      return {
        response: "Ocurrió un error al procesar tu solicitud de tareas.",
        confidence: 0.1
      };
    }
  }
}

// Implementación del Agente de Categorías
class CategoryAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en la gestión de categorías para tareas.
Tu objetivo es crear nuevas categorías, actualizar categorías existentes, eliminar categorías o proporcionar información sobre categorías.

IMPORTANTE: Si el usuario describe algo que suena como una nueva categoría para organizar tareas (por ejemplo, "quiero crear una categoría para mis tareas personales"), debes interpretar esto como una solicitud para CREAR una nueva categoría.

IMPORTANTE: NUNCA respondas con texto en formato JSON. En su lugar, debes usar las funciones disponibles.

Para createCategory, los parámetros deben incluir:
  - name: nombre de la categoría (extráelo de la descripción del usuario)
  - color: color de la categoría (blue, green, red, purple, orange)

Para updateCategory:
  - categoryId: ID de la categoría a actualizar
  - updates: objeto con los campos a actualizar

Para deleteCategory:
  - categoryId: ID de la categoría a eliminar

Para listCategories, no se requieren parámetros adicionales.

Para respond, no requiere parámetros, sólo usa cuando no necesites crear/modificar categorías.

Asegúrate de asignar un color apropiado basado en el contexto. Por ejemplo, tareas financieras podrían usar green, tareas urgentes podrían usar red, etc.`;
  
  getFunctions(): Array<OpenAIFunction> {
    return [
      {
        name: "createCategory",
        description: "Crea una nueva categoría en el sistema",
        parameters: {
          type: "object",
          properties: {
            name: { 
              type: "string",
              description: "Nombre de la categoría (extráelo de la descripción del usuario)"
            },
            color: { 
              type: "string", 
              enum: ["blue", "green", "red", "purple", "orange"],
              description: "Color de la categoría (blue, green, red, purple, orange)"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "updateCategory",
        description: "Actualiza una categoría existente",
        parameters: {
          type: "object",
          properties: {
            categoryId: { 
              type: "integer",
              description: "ID de la categoría a actualizar" 
            },
            updates: { 
              type: "object",
              description: "Objeto con los campos a actualizar",
              properties: {
                name: { type: "string" },
                color: { 
                  type: "string", 
                  enum: ["blue", "green", "red", "purple", "orange"] 
                }
              }
            }
          },
          required: ["categoryId", "updates"]
        }
      },
      {
        name: "deleteCategory",
        description: "Elimina una categoría existente",
        parameters: {
          type: "object",
          properties: {
            categoryId: { 
              type: "integer",
              description: "ID de la categoría a eliminar" 
            }
          },
          required: ["categoryId"]
        }
      },
      {
        name: "listCategories",
        description: "Lista las categorías existentes",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "respond",
        description: "Responder al usuario sin realizar ninguna acción en el sistema",
        parameters: {
          type: "object",
          properties: {
            message: { 
              type: "string",
              description: "Mensaje para el usuario" 
            }
          },
          required: ["message"]
        }
      }
    ];
  }
  
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Usar el método callModelWithFunctions en lugar de callModel
      const response = await this.callModelWithFunctions(this.systemPrompt, request.userInput, request.context);
      
      // Si no hay una llamada a función, usar el contenido de texto como respuesta
      if (!response.functionCall) {
        return {
          response: response.content || "No pude entender tu solicitud relacionada con categorías.",
          confidence: 0.5
        };
      }
      
      // Procesar la llamada a función
      let data = null;
      let action = response.functionCall.name;
      let userResponse = "";
      
      switch (action) {
        case "createCategory": {
          const args = response.functionCall.arguments;
          const newCategory = {
            name: args.name,
            color: args.color || 'blue',
          };
          
          data = await storage.createCategory(newCategory);
          userResponse = `He creado la categoría "${args.name}" con color ${args.color || 'blue'}.`;
          break;
        }
        
        case "updateCategory": {
          const args = response.functionCall.arguments;
          data = await storage.updateCategory(args.categoryId, args.updates);
          userResponse = `He actualizado la categoría con ID ${args.categoryId}.`;
          break;
        }
        
        case "deleteCategory": {
          const args = response.functionCall.arguments;
          data = await storage.deleteCategory(args.categoryId);
          userResponse = `He eliminado la categoría con ID ${args.categoryId}.`;
          break;
        }
        
        case "listCategories": {
          const categories = await storage.getCategories();
          data = categories;
          
          if (categories.length === 0) {
            userResponse = "No encontré categorías en el sistema.";
          } else {
            userResponse = "Aquí están las categorías disponibles:";
            categories.forEach((category, index) => {
              userResponse += `\n${index + 1}. ${category.name} (Color: ${category.color}, ID: ${category.id})`;
            });
          }
          break;
        }
        
        case "respond": {
          const args = response.functionCall.arguments;
          userResponse = args.message;
          break;
        }
        
        default:
          userResponse = "No pude procesar correctamente tu solicitud relacionada con categorías.";
      }
      
      return {
        action,
        response: userResponse,
        data,
        confidence: 0.9
      };
    } catch (error) {
      console.error("Error en CategoryAgent:", error);
      return {
        response: "Ocurrió un error al procesar tu solicitud de categorías.",
        confidence: 0.1
      };
    }
  }
}

// Implementación del Agente de Análisis
class AnalyticsAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en análisis de datos y estadísticas relacionadas con tareas y productividad.
Tu objetivo es proporcionar insights valiosos basados en los datos del sistema.

IMPORTANTE: Si el usuario pide cualquier tipo de análisis, estadísticas, informes o métricas relacionadas con las tareas, debes proporcionar información detallada y útil.

IMPORTANTE: NUNCA respondas con texto en formato JSON. En su lugar, debes usar las funciones disponibles.

Para getTaskStats, no se requieren parámetros adicionales, proporciona estadísticas básicas.

Para analyzeTrends, puedes incluir parámetros opcionales como timeframe (day, week, month).

Para generateReport, puedes incluir parámetros como reportType (summary, detailed, performance).

Para respond, no requiere parámetros, sólo usa cuando ninguna otra acción sea apropiada.

Asegúrate de proporcionar insights valiosos y accionables basados en los datos disponibles.`;
  
  getFunctions(): Array<OpenAIFunction> {
    return [
      {
        name: "getTaskStats",
        description: "Obtener estadísticas básicas de tareas",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "analyzeTrends",
        description: "Analizar tendencias en las tareas",
        parameters: {
          type: "object",
          properties: {
            timeframe: { 
              type: "string", 
              enum: ["day", "week", "month"],
              description: "Período de tiempo para analizar" 
            }
          }
        }
      },
      {
        name: "generateReport",
        description: "Generar un informe detallado",
        parameters: {
          type: "object",
          properties: {
            reportType: { 
              type: "string", 
              enum: ["summary", "detailed", "performance"],
              description: "Tipo de informe a generar" 
            }
          }
        }
      },
      {
        name: "respond",
        description: "Responder al usuario sin realizar ninguna acción en el sistema",
        parameters: {
          type: "object",
          properties: {
            message: { 
              type: "string",
              description: "Mensaje para el usuario" 
            }
          },
          required: ["message"]
        }
      }
    ];
  }
  
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Usar el método callModelWithFunctions en lugar de callModel
      const response = await this.callModelWithFunctions(this.systemPrompt, request.userInput, request.context);
      
      // Si no hay una llamada a función, usar el contenido de texto como respuesta
      if (!response.functionCall) {
        return {
          response: response.content || "No pude entender tu solicitud relacionada con análisis.",
          confidence: 0.5
        };
      }
      
      // Procesar la llamada a función
      let data = null;
      let action = response.functionCall.name;
      let userResponse = "";
      
      switch (action) {
        case "getTaskStats": {
          const taskStats = await storage.getTaskStats();
          data = taskStats;
          
          // Formular una respuesta más detallada con los datos obtenidos
          userResponse = `Aquí están las estadísticas de tus tareas:
- Total de tareas: ${taskStats.total}
- Tareas pendientes: ${taskStats.pending}
- Tareas en progreso: ${taskStats.inProgress}
- Tareas en revisión: ${taskStats.review}
- Tareas completadas: ${taskStats.completed}
- Tasa de finalización: ${((taskStats.completed / taskStats.total) * 100).toFixed(1)}%`;
          break;
        }
        
        case "analyzeTrends": {
          const args = response.functionCall.arguments;
          const timeframe = args.timeframe || 'week';
          
          // Obtener datos para análisis
          const taskStats = await storage.getTaskStats();
          const tasks = await storage.getTasks();
          const categories = await storage.getCategories();
          
          // Crear un análisis básico basado en los datos disponibles
          // En una implementación completa, se haría un análisis más sofisticado
          
          // Agrupar tareas por categoría
          const tasksByCategory: Record<string, number> = {};
          tasks.forEach(task => {
            const categoryName = categories.find(c => c.id === task.categoryId)?.name || 'Sin categoría';
            tasksByCategory[categoryName] = (tasksByCategory[categoryName] || 0) + 1;
          });
          
          // Contar tareas por prioridad
          const tasksByPriority: Record<string, number> = { alta: 0, media: 0, baja: 0 };
          tasks.forEach(task => {
            const priority = task.priority === 'high' ? 'alta' : 
                            (task.priority === 'medium' ? 'media' : 'baja');
            tasksByPriority[priority]++;
          });
          
          data = {
            taskStats,
            tasksByCategory,
            tasksByPriority,
            timeframe
          };
          
          // Generar respuesta basada en el análisis
          userResponse = `Análisis de tendencias (${timeframe}):
          
Distribución por categoría:
${Object.entries(tasksByCategory)
  .map(([category, count]) => `- ${category}: ${count} tareas (${((count / taskStats.total) * 100).toFixed(1)}%)`)
  .join('\n')}

Distribución por prioridad:
- Alta: ${tasksByPriority.alta} tareas
- Media: ${tasksByPriority.media} tareas
- Baja: ${tasksByPriority.baja} tareas

Estado general: ${taskStats.completed} de ${taskStats.total} tareas completadas (${((taskStats.completed / taskStats.total) * 100).toFixed(1)}%)`;
          break;
        }
        
        case "generateReport": {
          const args = response.functionCall.arguments;
          const reportType = args.reportType || 'summary';
          
          // Obtener datos para el informe
          const taskStats = await storage.getTaskStats();
          const tasks = await storage.getTasks();
          const categories = await storage.getCategories();
          
          data = {
            reportType,
            taskStats,
            tasks: tasks.slice(0, 10), // Limitar para evitar respuestas muy largas
            categories
          };
          
          // Generar informe básico
          if (reportType === 'summary') {
            userResponse = `Informe resumido:
            
- Total de tareas: ${taskStats.total}
- Tareas completadas: ${taskStats.completed} (${((taskStats.completed / taskStats.total) * 100).toFixed(1)}%)
- Tareas pendientes: ${taskStats.pending}
- Tareas en progreso: ${taskStats.inProgress}
- Tareas en revisión: ${taskStats.review}

Las categorías con más tareas son:
${categories
  .map(c => ({ 
    name: c.name, 
    count: tasks.filter(t => t.categoryId === c.id).length 
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 3)
  .map(c => `- ${c.name}: ${c.count} tareas`)
  .join('\n')}`;
          } else {
            // Para informes detallados o de rendimiento
            userResponse = `Informe detallado del sistema de tareas:
            
Estadísticas generales:
- Total de tareas: ${taskStats.total}
- Tareas completadas: ${taskStats.completed} (${((taskStats.completed / taskStats.total) * 100).toFixed(1)}%)
- Tareas pendientes: ${taskStats.pending}
- Tareas en progreso: ${taskStats.inProgress}
- Tareas en revisión: ${taskStats.review}

Desglose por categorías:
${categories.map(c => {
  const categoryTasks = tasks.filter(t => t.categoryId === c.id);
  const completed = categoryTasks.filter(t => t.status === 'completed').length;
  const total = categoryTasks.length;
  const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
  
  return `- ${c.name}: ${total} tareas, ${completed} completadas (${completionRate}%)`;
}).join('\n')}

Tareas recientes:
${tasks
  .sort((a, b) => Number(b.id) - Number(a.id))
  .slice(0, 5)
  .map(t => `- ${t.title} (${t.status}, prioridad: ${t.priority})`)
  .join('\n')}`;
          }
          break;
        }
        
        case "respond": {
          const args = response.functionCall.arguments;
          userResponse = args.message;
          break;
        }
        
        default:
          userResponse = "No pude procesar correctamente tu solicitud de análisis.";
      }
      
      return {
        action,
        response: userResponse,
        data,
        confidence: 0.9
      };
    } catch (error) {
      console.error("Error en AnalyticsAgent:", error);
      return {
        response: "Ocurrió un error al analizar los datos solicitados.",
        confidence: 0.1
      };
    }
  }
}

// Implementación del Agente de Planificación
class PlannerAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en planificación y gestión de fechas límite para tareas.
Tu objetivo es ayudar con la programación, recordatorios y organización temporal de las actividades.

IMPORTANTE: Cualquier solicitud relacionada con fechas, plazos, prioridades, o planificación debe ser manejada por ti. 
Si el usuario menciona algo sobre "planificar", "programar", "fechas límite", o temas relacionados, proporciona información detallada.

NUNCA debes responder con JSON en formato texto. En su lugar, debes utilizar las funciones disponibles.

Eres capaz de ejecutar las siguientes funciones según las necesidades del usuario:
1. getUpcomingDeadlines - Para obtener próximas fechas límite en un período específico
2. getPrioritizedTasks - Para obtener tareas ordenadas por prioridad
3. scheduleTasks - Para programar fechas límite para múltiples tareas
4. setDeadlines - Para asignar una fecha límite a una tarea específica
5. respond - Para responder sin realizar ninguna acción específica

Proporciona respuestas detalladas y útiles sobre planificación y organización temporal.`;

  getFunctions(): Array<OpenAIFunction> {
    return [
      {
        name: "scheduleTasks",
        description: "Programa tareas para una fecha específica",
        parameters: {
          type: "object",
          properties: {
            taskIds: { 
              type: "array",
              items: { type: "integer" },
              description: "IDs de las tareas a programar" 
            },
            date: { 
              type: "string", 
              format: "date",
              description: "Fecha propuesta en formato YYYY-MM-DD" 
            }
          },
          required: ["date"]
        }
      },
      {
        name: "setDeadlines",
        description: "Establece la fecha límite para una tarea específica",
        parameters: {
          type: "object",
          properties: {
            taskId: { 
              type: "integer",
              description: "ID de la tarea a la que establecer fecha límite" 
            },
            deadline: { 
              type: "string", 
              format: "date",
              description: "Nueva fecha límite en formato YYYY-MM-DD" 
            }
          },
          required: ["taskId", "deadline"]
        }
      },
      {
        name: "getPrioritizedTasks",
        description: "Obtiene una lista de tareas ordenadas por prioridad",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "getUpcomingDeadlines",
        description: "Obtiene una lista de próximas fechas límite",
        parameters: {
          type: "object",
          properties: {
            timeframe: { 
              type: "string", 
              enum: ["day", "week", "month"],
              description: "Período de tiempo para filtrar las fechas límite" 
            }
          }
        }
      },
      {
        name: "respond",
        description: "Responder al usuario sin realizar ninguna acción en el sistema",
        parameters: {
          type: "object",
          properties: {
            message: { 
              type: "string",
              description: "Mensaje para el usuario" 
            }
          },
          required: ["message"]
        }
      }
    ];
  }
  
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Usar el método callModelWithFunctions en lugar de callModel
      const response = await this.callModelWithFunctions(this.systemPrompt, request.userInput, request.context);
      
      // Si no hay una llamada a función, usar el contenido de texto como respuesta
      if (!response.functionCall) {
        return {
          response: response.content || "No pude entender tu solicitud relacionada con planificación.",
          confidence: 0.5
        };
      }
      
      // Procesar la llamada a función
      let data = null;
      let action = response.functionCall.name;
      let userResponse = "";
      
      switch (action) {
        case "getUpcomingDeadlines": {
          const args = response.functionCall.arguments;
          const timeframe = args.timeframe || 'week';
          
          // Obtener y filtrar tareas con fechas límite
          const tasks = await storage.getTasks();
          const now = new Date();
          const filteredTasks = tasks
            .filter(task => task.deadline && new Date(task.deadline) > now)
            .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
          
          // Limitar el período de tiempo según el parámetro
          let endDate = new Date();
          if (timeframe === 'day') {
            endDate.setDate(now.getDate() + 1);
          } else if (timeframe === 'week') {
            endDate.setDate(now.getDate() + 7);
          } else if (timeframe === 'month') {
            endDate.setMonth(now.getMonth() + 1);
          }
          
          const tasksInTimeframe = filteredTasks.filter(task => 
            task.deadline && new Date(task.deadline) <= endDate
          );
          
          data = tasksInTimeframe;
          
          if (tasksInTimeframe.length === 0) {
            userResponse = `No encontré tareas con fechas límite próximas en el período de ${timeframe}.`;
          } else {
            userResponse = `Próximas fechas límite (${timeframe}):`;
            tasksInTimeframe.forEach((task, index) => {
              const deadlineDate = new Date(task.deadline!);
              const formattedDate = deadlineDate.toLocaleDateString('es-ES', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              });
              
              userResponse += `\n${index + 1}. "${task.title}" - ${formattedDate}`;
            });
          }
          break;
        }
        
        case "getPrioritizedTasks": {
          // Obtener y ordenar tareas por prioridad
          const tasks = await storage.getTasks();
          
          // Ordenar por prioridad: alta > media > baja
          const priorityMap: Record<string, number> = { 
            'alta': 0, 'high': 0,
            'media': 1, 'medium': 1, 
            'baja': 2, 'low': 2 
          };
          
          const sortedTasks = [...tasks].sort((a, b) => {
            const aPriority = priorityMap[a.priority || 'media'] ?? 3;
            const bPriority = priorityMap[b.priority || 'media'] ?? 3;
            
            // Si tienen la misma prioridad, ordenar por deadline
            if (aPriority === bPriority) {
              if (!a.deadline) return 1;
              if (!b.deadline) return -1;
              return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            }
            
            return aPriority - bPriority;
          });
          
          data = sortedTasks;
          
          if (sortedTasks.length === 0) {
            userResponse = "No encontré tareas en el sistema.";
          } else {
            userResponse = "Tareas ordenadas por prioridad:";
            sortedTasks.slice(0, 10).forEach((task, index) => {
              const priority = task.priority === 'high' ? 'Alta' : 
                              (task.priority === 'medium' ? 'Media' : 'Baja');
              
              let deadlineInfo = "Sin fecha límite";
              if (task.deadline) {
                const deadlineDate = new Date(task.deadline);
                deadlineInfo = deadlineDate.toLocaleDateString('es-ES', {
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                });
              }
              
              userResponse += `\n${index + 1}. "${task.title}" - Prioridad: ${priority}, Fecha límite: ${deadlineInfo}`;
            });
            
            if (sortedTasks.length > 10) {
              userResponse += `\n...y ${sortedTasks.length - 10} tareas más.`;
            }
          }
          break;
        }
        
        case "setDeadlines": {
          const args = response.functionCall.arguments;
          const taskId = args.taskId;
          const deadline = args.deadline;
          
          if (!taskId || !deadline) {
            userResponse = "No se proporcionaron los datos necesarios (ID de tarea y fecha límite).";
            break;
          }
          
          // Buscar la tarea y actualizar su fecha límite
          try {
            const deadlineDate = new Date(deadline);
            const task = await storage.getTask(Number(taskId));
            
            if (!task) {
              userResponse = `No encontré una tarea con ID ${taskId}.`;
              break;
            }
            
            const updatedTask = await storage.updateTask(Number(taskId), {
              deadline: deadlineDate
            });
            
            data = updatedTask;
            
            // Formatear la fecha para la respuesta
            const formattedDate = deadlineDate.toLocaleDateString('es-ES', {
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            });
            
            userResponse = `He actualizado la tarea "${task.title}" con una nueva fecha límite: ${formattedDate}.`;
          } catch (error) {
            console.error("Error al actualizar la fecha límite:", error);
            userResponse = "Ocurrió un error al actualizar la fecha límite. Verifica el formato de la fecha (YYYY-MM-DD).";
          }
          break;
        }
        
        case "scheduleTasks": {
          const args = response.functionCall.arguments;
          const date = args.date;
          const taskIds = args.taskIds;
          
          if (!date) {
            userResponse = "No se proporcionó una fecha para la programación.";
            break;
          }
          
          try {
            const scheduledDate = new Date(date);
            const updatedTasks = [];
            
            // Si se proporcionaron IDs de tareas, actualizar cada una
            if (Array.isArray(taskIds) && taskIds.length > 0) {
              for (const id of taskIds) {
                const task = await storage.getTask(Number(id));
                if (task) {
                  const updated = await storage.updateTask(Number(id), {
                    deadline: scheduledDate
                  });
                  if (updated) {
                    updatedTasks.push(updated);
                  }
                }
              }
              
              data = updatedTasks;
              
              // Formatear la fecha para la respuesta
              const formattedDate = scheduledDate.toLocaleDateString('es-ES', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              });
              
              if (updatedTasks.length === 0) {
                userResponse = "No se pudo actualizar ninguna de las tareas especificadas.";
              } else if (updatedTasks.length === 1) {
                userResponse = `He programado la tarea "${updatedTasks[0].title}" para el ${formattedDate}.`;
              } else {
                userResponse = `He programado ${updatedTasks.length} tareas para el ${formattedDate}:`;
                updatedTasks.forEach((task, index) => {
                  userResponse += `\n${index + 1}. ${task.title}`;
                });
              }
            } else {
              // Si no se proporcionaron IDs, crear una nueva tarea
              const newTask: InsertTask = {
                title: "Nueva tarea programada",
                description: "Tarea creada a través del planificador",
                status: 'pendiente',
                priority: 'media',
                categoryId: 1,
                deadline: scheduledDate,
                assignedTo: 1
              };
              
              const createdTask = await storage.createTask(newTask);
              data = createdTask;
              
              // Formatear la fecha para la respuesta
              const formattedDate = scheduledDate.toLocaleDateString('es-ES', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              });
              
              userResponse = `He creado una nueva tarea programada para el ${formattedDate}.`;
            }
          } catch (error) {
            console.error("Error al programar tareas:", error);
            userResponse = "Ocurrió un error al programar las tareas. Verifica el formato de la fecha (YYYY-MM-DD).";
          }
          break;
        }
        
        case "respond": {
          const args = response.functionCall.arguments;
          userResponse = args.message;
          break;
        }
        
        default:
          userResponse = "No pude procesar correctamente tu solicitud de planificación.";
      }
      
      return {
        action,
        response: userResponse,
        data,
        confidence: 0.9
      };
    } catch (error) {
      console.error("Error en PlannerAgent:", error);
      return {
        response: "Ocurrió un error al procesar tu solicitud de planificación.",
        confidence: 0.1
      };
    }
  }
}

// Instancia del orquestador para exportar
// Implementación del Agente de Marketing Digital
class MarketingAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en marketing digital y estrategias de promoción.
Tu objetivo es ayudar con la planificación de campañas de marketing, estrategias de contenido, análisis de métricas, 
SEO, redes sociales, email marketing y todo lo relacionado con la presencia digital.

IMPORTANTE: NUNCA respondas con texto en formato JSON. En su lugar, debes usar las funciones disponibles.

Eres capaz de ejecutar las siguientes funciones según las necesidades del usuario:
1. createMarketingPlan - Para crear un plan de marketing con tareas asociadas
2. suggestContent - Para sugerir ideas de contenido para marketing digital
3. analyzeMetrics - Para análisis de métricas de marketing
4. respond - Para responder preguntas sin realizar acciones específicas

Para createMarketingPlan, incluye:
  - title: título del plan de marketing
  - objective: objetivo principal del plan
  - channels: array de canales (ej. ["email", "social_media", "seo"])
  - timeline: periodo de implementación
  - kpis: métricas para medir el éxito
  - tasks: array de tareas relacionadas que podrían crearse

Para suggestContent, incluye:
  - contentType: tipo de contenido (blog, social, email, etc.)
  - topics: array de temas sugeridos
  - frequency: frecuencia recomendada
  - platforms: plataformas recomendadas

Para analyzeMetrics:
  - insightType: tipo de análisis (conversion, engagement, traffic, etc.)
  - recommendations: array de recomendaciones basadas en los datos
  
Para respond, no requiere parámetros adicionales.`;

  getFunctions(): Array<OpenAIFunction> {
    return [
      {
        name: "createMarketingPlan",
        description: "Crea un plan de marketing digital",
        parameters: {
          type: "object",
          properties: {
            title: { 
              type: "string",
              description: "Título del plan de marketing" 
            },
            objective: { 
              type: "string",
              description: "Objetivo principal del plan" 
            },
            channels: { 
              type: "array",
              items: { type: "string" },
              description: "Array de canales (ej. ['email', 'social_media', 'seo'])" 
            },
            timeline: { 
              type: "string",
              description: "Periodo de implementación (ej. '3 meses', 'Q2 2025')" 
            },
            kpis: { 
              type: "array",
              items: { type: "string" },
              description: "Métricas para medir el éxito del plan" 
            },
            tasks: { 
              type: "array",
              items: { 
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["alta", "media", "baja"] },
                  deadline: { type: "string", format: "date" }
                },
                required: ["title"]
              },
              description: "Array de tareas relacionadas que podrían crearse" 
            }
          },
          required: ["title", "objective"]
        }
      },
      {
        name: "suggestContent",
        description: "Sugiere ideas de contenido para marketing digital",
        parameters: {
          type: "object",
          properties: {
            contentType: { 
              type: "string",
              enum: ["blog", "social", "email", "video", "podcast", "infographic"],
              description: "Tipo de contenido a sugerir" 
            },
            topics: { 
              type: "array",
              items: { type: "string" },
              description: "Array de temas sugeridos" 
            },
            frequency: { 
              type: "string",
              description: "Frecuencia recomendada (ej. 'semanal', 'quincenal')" 
            },
            platforms: { 
              type: "array",
              items: { type: "string" },
              description: "Plataformas recomendadas para publicar contenido" 
            }
          },
          required: ["contentType", "topics"]
        }
      },
      {
        name: "analyzeMetrics",
        description: "Analiza métricas de marketing digital",
        parameters: {
          type: "object",
          properties: {
            insightType: { 
              type: "string",
              enum: ["conversion", "engagement", "traffic", "branding"],
              description: "Tipo de análisis a realizar" 
            },
            recommendations: { 
              type: "array",
              items: { type: "string" },
              description: "Array de recomendaciones basadas en los datos" 
            }
          },
          required: ["insightType", "recommendations"]
        }
      },
      {
        name: "respond",
        description: "Responder al usuario sin realizar ninguna acción específica",
        parameters: {
          type: "object",
          properties: {
            message: { 
              type: "string",
              description: "Mensaje para el usuario" 
            }
          },
          required: ["message"]
        }
      }
    ];
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Usar el método callModelWithFunctions en lugar de callModel
      const response = await this.callModelWithFunctions(this.systemPrompt, request.userInput, request.context);
      
      // Si no hay una llamada a función, usar el contenido de texto como respuesta
      if (!response.functionCall) {
        return {
          response: response.content || "No pude entender tu solicitud relacionada con marketing.",
          confidence: 0.5
        };
      }
      
      // Procesar la llamada a función
      let data = null;
      let action = response.functionCall.name;
      let userResponse = "";
      
      switch (action) {
        case "createMarketingPlan": {
          const args = response.functionCall.arguments;
          const { title, objective, tasks } = args;
          
          if (Array.isArray(tasks) && tasks.length > 0) {
            const createdTasks = [];
            
            // Intentar primero encontrar una categoría de Marketing
            const categories = await storage.getCategories();
            let marketingCategoryId = categories.find(c => 
              c.name.toLowerCase().includes('marketing') || 
              c.name.toLowerCase().includes('digital')
            )?.id || 1; // Si no existe, usar categoría por defecto (1)
            
            for (const taskInfo of tasks) {
              try {
                // Crear la nueva tarea relacionada con el plan de marketing
                const newTask: InsertTask = {
                  title: taskInfo.title || `Tarea de marketing: ${title}`,
                  description: taskInfo.description || '',
                  status: 'pendiente',
                  priority: taskInfo.priority || 'media',
                  categoryId: marketingCategoryId,
                  deadline: taskInfo.deadline ? new Date(taskInfo.deadline) : null,
                  assignedTo: 1 // Por defecto, asignar al usuario 1
                };
                
                const createdTask = await storage.createTask(newTask);
                createdTasks.push(createdTask);
              } catch (error) {
                console.error("Error al crear tarea de marketing:", error);
                // Continuar con la siguiente tarea
              }
            }
            
            data = { 
              marketingPlan: { title, objective, tasks },
              createdTasks 
            };
            
            if (createdTasks.length === 0) {
              userResponse = `He registrado el plan de marketing "${title}" pero no se pudieron crear las tareas asociadas.`;
            } else if (createdTasks.length < tasks.length) {
              userResponse = `He creado un plan de marketing "${title}" con ${createdTasks.length} de ${tasks.length} tareas asociadas. Algunas tareas no pudieron ser creadas.`;
            } else {
              userResponse = `He creado un plan de marketing "${title}" con ${createdTasks.length} tareas asociadas:`;
              createdTasks.forEach((task, index) => {
                userResponse += `\n${index + 1}. ${task.title}`;
                if (task.deadline) {
                  const fecha = new Date(task.deadline);
                  userResponse += ` - Fecha límite: ${fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`;
                }
              });
            }
          } else {
            data = { marketingPlan: { title, objective } };
            userResponse = `He registrado el plan de marketing "${title}" con objetivo: ${objective}.`;
          }
          break;
        }
        
        case "suggestContent": {
          const args = response.functionCall.arguments;
          const { contentType, topics, frequency, platforms } = args;
          
          data = {
            contentSuggestion: args
          };
          
          userResponse = `Aquí tienes mis sugerencias de contenido (${contentType}):`;
          
          if (Array.isArray(topics) && topics.length > 0) {
            userResponse += `\n\nTemas recomendados:`;
            topics.forEach((topic, i) => {
              userResponse += `\n${i+1}. ${topic}`;
            });
          }
          
          if (frequency) {
            userResponse += `\n\nFrecuencia recomendada: ${frequency}`;
          }
          
          if (Array.isArray(platforms) && platforms.length > 0) {
            userResponse += `\n\nPlataformas sugeridas: ${platforms.join(', ')}`;
          }
          break;
        }
        
        case "analyzeMetrics": {
          const args = response.functionCall.arguments;
          const { insightType, recommendations } = args;
          
          data = {
            metrics: args
          };
          
          userResponse = `Análisis de métricas (${insightType}):`;
          
          if (Array.isArray(recommendations) && recommendations.length > 0) {
            userResponse += `\n\nRecomendaciones:`;
            recommendations.forEach((rec, i) => {
              userResponse += `\n${i+1}. ${rec}`;
            });
          }
          break;
        }
        
        case "respond": {
          const args = response.functionCall.arguments;
          userResponse = args.message;
          break;
        }
        
        default:
          userResponse = "No pude procesar correctamente tu solicitud de marketing.";
      }
      
      return {
        action,
        response: userResponse,
        data,
        confidence: 0.9
      };
    } catch (error) {
      console.error("Error en MarketingAgent:", error);
      return {
        response: "Ha ocurrido un error en el sistema de marketing. Por favor, intenta más tarde.",
        confidence: 0.1
      };
    }
  }
}

// Implementación del Agente de Gestión de Proyectos y Equipos
class ProjectManagerAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en gestión de proyectos y equipos.
Tu objetivo es ayudar con la planificación de proyectos, organización de equipos, seguimiento de progreso,
asignación de recursos, gestión de riesgos y todo lo relacionado con la dirección de proyectos y personas.

IMPORTANTE: NUNCA respondas con texto en formato JSON. En su lugar, debes usar las funciones disponibles.

Eres capaz de ejecutar las siguientes funciones según las necesidades del usuario:
1. createProject - Para crear un nuevo proyecto con sus tareas asociadas
2. assignResources - Para asignar recursos a tareas específicas
3. trackProgress - Para realizar seguimiento del progreso de un proyecto
4. manageRisks - Para gestionar los riesgos asociados a un proyecto
5. respond - Para responder sin realizar acciones específicas

Para createProject, incluye:
  - title: título del proyecto
  - objective: objetivo principal
  - startDate: fecha de inicio
  - endDate: fecha de fin estimada
  - phases: array de fases del proyecto
  - tasks: array de tareas principales a crear

Para assignResources, incluye:
  - resources: array de recursos (personas, equipos)
  - assignments: array de asignaciones (recurso, tarea, tiempo)
  - constraints: limitaciones a considerar

Para trackProgress:
  - projectId: identificador del proyecto
  - status: estado actual (on-track, delayed, at-risk)
  - completionRate: porcentaje de avance
  - issues: array de problemas o bloqueos
  - recommendations: recomendaciones para mejorar

Para manageRisks:
  - risks: array de riesgos identificados
  - mitigationStrategies: estrategias para mitigar cada riesgo
  - contingencyPlans: planes de contingencia
  
Para respond, no requiere parámetros adicionales.`;

  getFunctions(): Array<OpenAIFunction> {
    return [
      {
        name: "createProject",
        description: "Crea un nuevo proyecto con sus tareas asociadas",
        parameters: {
          type: "object",
          properties: {
            title: { 
              type: "string",
              description: "Título del proyecto" 
            },
            objective: { 
              type: "string",
              description: "Objetivo principal del proyecto" 
            },
            startDate: { 
              type: "string",
              format: "date",
              description: "Fecha de inicio del proyecto en formato YYYY-MM-DD" 
            },
            endDate: { 
              type: "string",
              format: "date",
              description: "Fecha estimada de finalización del proyecto en formato YYYY-MM-DD" 
            },
            phases: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  startDate: { type: "string", format: "date" },
                  endDate: { type: "string", format: "date" }
                },
                required: ["name"]
              },
              description: "Fases del proyecto" 
            },
            tasks: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["alta", "media", "baja"] },
                  deadline: { type: "string", format: "date" }
                },
                required: ["title"]
              },
              description: "Tareas principales a crear para el proyecto" 
            }
          },
          required: ["title", "objective"]
        }
      },
      {
        name: "assignResources",
        description: "Asigna recursos a tareas específicas",
        parameters: {
          type: "object",
          properties: {
            resources: { 
              type: "array",
              items: { type: "string" },
              description: "Recursos disponibles (personas, equipos)" 
            },
            assignments: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  resource: { type: "string" },
                  taskId: { type: "integer" },
                  timeAllocation: { type: "string" }
                },
                required: ["resource", "taskId"]
              },
              description: "Asignaciones de recursos a tareas específicas"
            },
            constraints: { 
              type: "array",
              items: { type: "string" },
              description: "Limitaciones a considerar en la asignación de recursos" 
            }
          },
          required: ["resources", "assignments"]
        }
      },
      {
        name: "trackProgress",
        description: "Realiza seguimiento del progreso de un proyecto",
        parameters: {
          type: "object",
          properties: {
            projectId: { 
              type: "integer",
              description: "Identificador del proyecto"
            },
            status: { 
              type: "string",
              enum: ["on-track", "delayed", "at-risk"],
              description: "Estado actual del proyecto" 
            },
            completionRate: { 
              type: "number",
              minimum: 0,
              maximum: 100,
              description: "Porcentaje de avance del proyecto" 
            },
            issues: { 
              type: "array",
              items: { type: "string" },
              description: "Problemas o bloqueos identificados" 
            },
            recommendations: { 
              type: "array",
              items: { type: "string" },
              description: "Recomendaciones para mejorar el progreso" 
            }
          },
          required: ["status", "completionRate"]
        }
      },
      {
        name: "manageRisks",
        description: "Gestiona los riesgos asociados a un proyecto",
        parameters: {
          type: "object",
          properties: {
            risks: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  impact: { type: "string", enum: ["alto", "medio", "bajo"] },
                  probability: { type: "string", enum: ["alta", "media", "baja"] }
                },
                required: ["description"]
              },
              description: "Riesgos identificados para el proyecto" 
            },
            mitigationStrategies: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  riskIndex: { type: "integer" },
                  strategy: { type: "string" }
                },
                required: ["riskIndex", "strategy"]
              },
              description: "Estrategias para mitigar cada riesgo identificado" 
            },
            contingencyPlans: { 
              type: "array",
              items: { type: "string" },
              description: "Planes de contingencia generales" 
            }
          },
          required: ["risks"]
        }
      },
      {
        name: "respond",
        description: "Responder al usuario sin realizar ninguna acción específica",
        parameters: {
          type: "object",
          properties: {
            message: { 
              type: "string",
              description: "Mensaje para el usuario" 
            }
          },
          required: ["message"]
        }
      }
    ];
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Usar el método callModelWithFunctions en lugar de callModel
      const response = await this.callModelWithFunctions(this.systemPrompt, request.userInput, request.context);
      
      // Si no hay una llamada a función, usar el contenido de texto como respuesta
      if (!response.functionCall) {
        return {
          response: response.content || "No pude entender tu solicitud relacionada con gestión de proyectos.",
          confidence: 0.5
        };
      }
      
      // Procesar la llamada a función
      let data = null;
      let action = response.functionCall.name;
      let userResponse = "";
      
      switch (action) {
        case "createProject": {
          const args = response.functionCall.arguments;
          const { title, objective, tasks, phases } = args;
          
          if (Array.isArray(tasks) && tasks.length > 0) {
            const createdTasks = [];
            
            // Intentar primero encontrar una categoría de Proyectos
            const categories = await storage.getCategories();
            let projectCategoryId = categories.find(c => 
              c.name.toLowerCase().includes('proyecto') || 
              c.name.toLowerCase().includes('project')
            )?.id || 1; // Si no existe, usar categoría por defecto (1)
            
            for (const taskInfo of tasks) {
              try {
                // Crear la nueva tarea relacionada con el proyecto
                const newTask: InsertTask = {
                  title: taskInfo.title || `Tarea de proyecto: ${title}`,
                  description: taskInfo.description || '',
                  status: 'pendiente',
                  priority: taskInfo.priority || 'alta',
                  categoryId: projectCategoryId,
                  deadline: taskInfo.deadline ? new Date(taskInfo.deadline) : null,
                  assignedTo: 1 // Por defecto, asignar al usuario 1
                };
                
                const createdTask = await storage.createTask(newTask);
                createdTasks.push(createdTask);
              } catch (error) {
                console.error("Error al crear tarea de proyecto:", error);
                // Continuar con la siguiente tarea
              }
            }
            
            data = { 
              project: { title, objective, tasks },
              createdTasks 
            };
            
            if (createdTasks.length === 0) {
              userResponse = `He registrado el proyecto "${title}" pero no se pudieron crear las tareas asociadas.`;
            } else if (createdTasks.length < tasks.length) {
              userResponse = `He creado el proyecto "${title}" con ${createdTasks.length} de ${tasks.length} tareas asociadas. Algunas tareas no pudieron ser creadas.`;
            } else {
              userResponse = `He creado el proyecto "${title}" con ${createdTasks.length} tareas asociadas:`;
              createdTasks.forEach((task, index) => {
                userResponse += `\n${index + 1}. ${task.title}`;
                if (task.deadline) {
                  const fecha = new Date(task.deadline);
                  userResponse += ` - Fecha límite: ${fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`;
                }
              });
            }
          } else if (Array.isArray(phases)) {
            // Si hay fases pero no tareas específicas, podemos crear tareas para cada fase
            const createdTasks = [];
            const categories = await storage.getCategories();
            let projectCategoryId = categories.find(c => 
              c.name.toLowerCase().includes('proyecto') || 
              c.name.toLowerCase().includes('project')
            )?.id || 1;
            
            for (const phase of phases) {
              try {
                const newTask: InsertTask = {
                  title: `${phase.name || 'Fase'}: ${title}`,
                  description: phase.description || `Fase del proyecto ${title}`,
                  status: 'pendiente',
                  priority: 'alta',
                  categoryId: projectCategoryId,
                  deadline: phase.endDate ? new Date(phase.endDate) : null,
                  assignedTo: 1,
                };
                
                const createdTask = await storage.createTask(newTask);
                createdTasks.push(createdTask);
              } catch (error) {
                console.error("Error al crear tarea de fase:", error);
              }
            }
            
            data = { 
              project: { title, objective, phases },
              createdTasks 
            };
            
            if (createdTasks.length === 0) {
              userResponse = `He registrado el proyecto "${title}" pero no se pudieron crear las tareas de fases.`;
            } else if (createdTasks.length < phases.length) {
              userResponse = `He creado el proyecto "${title}" con ${createdTasks.length} de ${phases.length} fases como tareas. Algunas fases no pudieron ser creadas.`;
            } else {
              userResponse = `He creado el proyecto "${title}" con ${createdTasks.length} fases como tareas:`;
              createdTasks.forEach((task, index) => {
                userResponse += `\n${index + 1}. ${task.title}`;
                if (task.deadline) {
                  const fecha = new Date(task.deadline);
                  userResponse += ` - Fecha límite: ${fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`;
                }
              });
            }
          } else {
            data = { project: { title, objective } };
            userResponse = `He registrado el proyecto "${title}" con objetivo: ${objective}.`;
          }
          break;
        }
        
        case "assignResources": {
          const args = response.functionCall.arguments;
          const { resources, assignments } = args;
          
          data = { resourceAssignment: args };
          
          userResponse = `He registrado la asignación de recursos:`;
          
          if (Array.isArray(assignments) && assignments.length > 0) {
            assignments.forEach((assignment, i) => {
              userResponse += `\n${i+1}. ${assignment.resource} asignado a la tarea ${assignment.taskId}`;
              if (assignment.timeAllocation) {
                userResponse += ` (${assignment.timeAllocation})`;
              }
            });
          }
          break;
        }
        
        case "trackProgress": {
          const args = response.functionCall.arguments;
          const { status, completionRate, issues } = args;
          
          data = { progressTracking: args };
          
          let statusText = "";
          if (status === "on-track") statusText = "en curso normal";
          else if (status === "delayed") statusText = "con retraso";
          else if (status === "at-risk") statusText = "en riesgo";
          
          userResponse = `Seguimiento de proyecto actualizado: ${statusText}, ${completionRate}% completado.`;
          
          if (Array.isArray(issues) && issues.length > 0) {
            userResponse += `\n\nProblemas identificados:`;
            issues.forEach((issue, i) => {
              userResponse += `\n${i+1}. ${issue}`;
            });
          }
          break;
        }
        
        case "manageRisks": {
          const args = response.functionCall.arguments;
          const { risks, mitigationStrategies, contingencyPlans } = args;
          
          data = { riskManagement: args };
          
          userResponse = `Gestión de riesgos registrada con ${risks.length} riesgos identificados:`;
          
          if (Array.isArray(risks) && risks.length > 0) {
            risks.forEach((risk, i) => {
              const impact = risk.impact ? `, impacto ${risk.impact}` : '';
              const probability = risk.probability ? `, probabilidad ${risk.probability}` : '';
              userResponse += `\n${i+1}. ${risk.description}${impact}${probability}`;
              
              // Buscar estrategia de mitigación para este riesgo
              if (Array.isArray(mitigationStrategies)) {
                const strategy = mitigationStrategies.find(s => s.riskIndex === i);
                if (strategy) {
                  userResponse += `\n   Estrategia: ${strategy.strategy}`;
                }
              }
            });
          }
          
          if (Array.isArray(contingencyPlans) && contingencyPlans.length > 0) {
            userResponse += `\n\nPlanes de contingencia:`;
            contingencyPlans.forEach((plan, i) => {
              userResponse += `\n${i+1}. ${plan}`;
            });
          }
          break;
        }
        
        case "respond": {
          const args = response.functionCall.arguments;
          userResponse = args.message;
          break;
        }
        
        default:
          userResponse = "No pude procesar correctamente tu solicitud de gestión de proyectos.";
      }
      
      return {
        action,
        response: userResponse,
        data,
        confidence: 0.9
      };
    } catch (error) {
      console.error("Error en ProjectManagerAgent:", error);
      return {
        response: "Ha ocurrido un error en el sistema de gestión de proyectos. Por favor, intenta más tarde.",
        confidence: 0.1
      };
    }
  }
}

export const orchestrator = new AgentOrchestrator();