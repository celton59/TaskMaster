import OpenAI from 'openai';
import { SpecializedAgent } from '../base/SpecializedAgent';
import { ConversationHistoryItem } from '../types/common';
import { storage } from '../../storage';
import { TaskAgent } from '../specialized/TaskAgent';

// Inicializar cliente de OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Clase principal que orquesta los diferentes agentes especializados
 */
export class AgentOrchestrator {
  private agents: Map<string, SpecializedAgent>;
  private conversationHistory: ConversationHistoryItem[];
  private lastTaskId: number | null = null;
  
  /**
   * Inicializa el orquestador y registra los agentes disponibles
   */
  constructor() {
    this.agents = new Map();
    this.conversationHistory = [];
    
    // Registrar los agentes especializados
    this.registerAgent('task', new TaskAgent());
    // TODO: A medida que se vayan creando más agentes, agregarlos aquí
    // this.registerAgent('category', new CategoryAgent());
    // this.registerAgent('analytics', new AnalyticsAgent());
    // etc.
  }
  
  /**
   * Registra un nuevo agente en el orquestador
   * @param name Nombre identificador del agente
   * @param agent Instancia del agente especializado
   */
  registerAgent(name: string, agent: SpecializedAgent) {
    this.agents.set(name, agent);
  }
  
  /**
   * Procesa una entrada del usuario y determina qué agente debe manejarla
   * @param userInput Texto de entrada del usuario
   * @returns Respuesta procesada
   */
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
  
  /**
   * Determina qué tipo de agente debe manejar la solicitud del usuario
   */
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
  
  /**
   * Obtiene un contexto específico para el tipo de agente
   */
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
    let contextWithTask: typeof baseContext & { lastTask?: any } = baseContext;
    
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
        
      default:
        // No agregar contexto específico
        break;
    }
    
    // Combinar el contexto base con el específico
    return {
      ...contextWithTask,
      ...specificContext
    };
  }
  
  /**
   * Implementa un enfoque colaborativo cuando no hay un agente claro
   */
  private async collaborativeProcess(userInput: string): Promise<{
    action?: string;
    message: string;
    data?: any;
  }> {
    try {
      // Usar el agente de tareas por defecto para colaboración
      const taskAgent = this.agents.get('task');
      
      if (!taskAgent) {
        return {
          message: "No se pudo inicializar el agente de tareas para colaboración."
        };
      }
      
      // Obtener contexto general
      const generalContext = await this.getContextForAgent('task');
      
      // Procesar la solicitud con el agente de tareas
      const taskResult = await taskAgent.process({
        userInput,
        context: generalContext
      });
      
      // Retornar el resultado
      return {
        action: taskResult.action,
        message: taskResult.response,
        data: taskResult.data
      };
    } catch (error) {
      console.error("Error en collaborativeProcess:", error);
      return {
        message: "Ha ocurrido un error al procesar tu solicitud en modo colaborativo. Por favor, intenta ser más específico."
      };
    }
  }
}

// Crear una instancia del orquestador para ser exportada
export const orchestrator = new AgentOrchestrator();