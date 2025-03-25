import OpenAI from 'openai';
import { SpecializedAgent } from '../base/SpecializedAgent';
import { ConversationHistoryItem } from '../types/common';
import { storage } from '../../storage';
import { TaskAgent } from '../specialized/TaskAgent';

// Inicializar cliente de OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tipos de agentes disponibles
export type AgentType = 'task' | 'category' | 'analytics' | 'planner' | 'marketing' | 'project';

// Palabras clave para detectar intenciones del usuario
interface IntentKeywords {
  task: string[];
  category: string[];
  analytics: string[];
  planner: string[];
  marketing: string[];
  project: string[];
}

// Resultado de la determinación del agente
interface AgentDetermination {
  agentType: AgentType;
  confidence: number;
  reasoning?: string;
}

// Referencia a tarea reciente
interface RecentTaskReference {
  hasRecentReference: boolean;
  suggestedAgentType?: AgentType;
}

/**
 * Clase principal que orquesta los diferentes agentes especializados
 */
export class AgentOrchestrator {
  private agents: Map<AgentType, SpecializedAgent>;
  private conversationHistory: ConversationHistoryItem[];
  private lastTaskId: number | null = null;
  private readonly intentKeywords: IntentKeywords;
  
  /**
   * Inicializa el orquestador y registra los agentes disponibles
   */
  constructor() {
    this.agents = new Map();
    this.conversationHistory = [];
    
    // Palabras clave para detección rápida de intenciones (complementa al LLM)
    this.intentKeywords = {
      task: ['tarea', 'tareas', 'crear', 'actualizar', 'eliminar', 'pendiente', 'completada', 'progreso'],
      category: ['categoría', 'categorías', 'etiqueta', 'clasificar', 'agrupar'],
      analytics: ['estadística', 'reporte', 'análisis', 'gráfico', 'tendencia', 'métricas', 'productividad'],
      planner: ['planificar', 'calendario', 'fecha', 'plazo', 'deadline', 'recordatorio', 'agenda'],
      marketing: ['marketing', 'publicidad', 'campaña', 'redes sociales', 'promoción', 'digital', 'contenido'],
      project: ['proyecto', 'equipo', 'sprint', 'hito', 'milestone', 'colaboración', 'asignar', 'colaborador']
    };
    
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
  registerAgent(name: AgentType, agent: SpecializedAgent) {
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
      console.log("Procesando usuario input:", userInput);
      
      // 1. Verificar si el usuario hace referencia a una tarea o acción reciente
      const recentTaskCheck = this.checkForRecentTaskReference(userInput);
      
      // Si se detecta una referencia a la conversación reciente
      if (recentTaskCheck.hasRecentReference && recentTaskCheck.suggestedAgentType) {
        console.log("Detectada referencia a conversación reciente, usando agente:", recentTaskCheck.suggestedAgentType);
        
        // Usar el agente sugerido para procesar la solicitud contextual
        return await this.processWithAgent(
          recentTaskCheck.suggestedAgentType, 
          userInput,
          true // Este es un procesamiento contextual
        );
      }
      
      // 2. Determinación preliminar basada en palabras clave
      const keywordMatch = this.matchIntentKeywords(userInput);
      
      // 3. Determinación avanzada usando el modelo de lenguaje (si es necesario)
      let finalDetermination: AgentDetermination;
      
      if (keywordMatch.confidence > 0.8) {
        // Si hay una coincidencia de palabras clave con alta confianza, usarla
        finalDetermination = keywordMatch;
        console.log("Usando determinación por palabras clave:", finalDetermination);
      } else {
        // Si no hay una coincidencia clara, usar el LLM para una determinación más precisa
        finalDetermination = await this.determineAgentType(userInput);
        console.log("Usando determinación por LLM:", finalDetermination);
      }
      
      // 4. Procesamiento colaborativo si la confianza es baja
      if (finalDetermination.confidence < 0.7) {
        console.log("Confianza baja, usando enfoque colaborativo");
        return await this.collaborativeProcess(userInput);
      }
      
      // 5. Procesamiento normal con el agente seleccionado
      return await this.processWithAgent(finalDetermination.agentType, userInput);
      
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
   * Procesa un mensaje con un agente específico
   * @param agentType Tipo de agente a utilizar
   * @param userInput Entrada del usuario
   * @param isContextualProcessing Si es un procesamiento contextual (referencia a conversación reciente)
   * @returns Respuesta procesada
   */
  private async processWithAgent(
    agentType: AgentType,
    userInput: string,
    isContextualProcessing: boolean = false
  ): Promise<{
    action?: string;
    message: string;
    data?: any;
    agentUsed?: string;
  }> {
    const agent = this.agents.get(agentType);
    
    if (!agent) {
      const response = {
        message: `No tengo un agente ${agentType} disponible. Por favor, intenta con otro tipo de solicitud.`,
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
    
    // Obtener contexto para el agente
    const context = await this.getContextForAgent(agentType);
    
    // Si es un procesamiento contextual y hay una última tarea, incluirla explícitamente
    if (isContextualProcessing && this.lastTaskId !== null) {
      try {
        const lastTask = await storage.getTask(this.lastTaskId);
        if (lastTask) {
          context.lastTask = lastTask;
        }
      } catch (error) {
        console.error("Error al obtener la última tarea para contexto:", error);
      }
    }
    
    // Procesar con el agente
    const result = await agent.process({ userInput, context });
    
    // Registrar en el historial
    this.conversationHistory.push({
      userInput,
      agentType,
      action: result.action,
      response: result.response,
      timestamp: new Date()
    });
    
    // Actualizar lastTaskId si corresponde
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
  }
  
  /**
   * Busca coincidencias con palabras clave para determinar la intención
   * @param userInput Texto del usuario
   * @returns Agente determinado y nivel de confianza
   */
  private matchIntentKeywords(userInput: string): AgentDetermination {
    const normalizedInput = userInput.toLowerCase();
    const matches: Record<AgentType, number> = {
      task: 0,
      category: 0,
      analytics: 0,
      planner: 0,
      marketing: 0,
      project: 0
    };
    
    // Contar coincidencias para cada tipo de agente
    Object.entries(this.intentKeywords).forEach(([agentType, keywords]) => {
      keywords.forEach(keyword => {
        if (normalizedInput.includes(keyword.toLowerCase())) {
          matches[agentType as AgentType]++;
        }
      });
    });
    
    // Determinar el agente con más coincidencias
    let bestMatch: AgentType = 'task'; // Valor por defecto
    let maxMatches = 0;
    
    Object.entries(matches).forEach(([agentType, count]) => {
      if (count > maxMatches) {
        maxMatches = count;
        bestMatch = agentType as AgentType;
      }
    });
    
    // Calcular confianza (0-1) basada en número de coincidencias
    const totalKeywords = Object.values(this.intentKeywords).flat().length;
    const confidence = Math.min(0.5 + (maxMatches / 5), 1); // Fórmula simple para la confianza
    
    return {
      agentType: bestMatch,
      confidence: maxMatches > 0 ? confidence : 0.5,
      reasoning: `Coincidencias por palabras clave: ${maxMatches}`
    };
  }
  
  /**
   * Verifica si el mensaje del usuario hace referencia a una tarea o acción reciente
   */
  private checkForRecentTaskReference(userInput: string): RecentTaskReference {
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
      const lastHistoryItem = this.conversationHistory
        .filter(h => h.agentType !== 'error')
        .slice(-1)[0];
      
      if (lastHistoryItem && this.isValidAgentType(lastHistoryItem.agentType)) {
        console.log(`Detectada solicitud de explicación, usando último agente: ${lastHistoryItem.agentType}`);
        
        return {
          hasRecentReference: true,
          suggestedAgentType: lastHistoryItem.agentType as AgentType
        };
      }
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
   * Verifica si un tipo de agente es válido
   * @param agentType Tipo de agente a verificar
   * @returns true si es válido, false en caso contrario
   */
  private isValidAgentType(agentType: string): agentType is AgentType {
    return ['task', 'category', 'analytics', 'planner', 'marketing', 'project'].includes(agentType);
  }
  
  /**
   * Determina qué tipo de agente debe manejar la solicitud del usuario utilizando un LLM
   */
  private async determineAgentType(userInput: string): Promise<AgentDetermination> {
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
        console.log("Determinación de agente por LLM:", result);
        return {
          agentType: result.agentType as AgentType,
          confidence: result.confidence,
          reasoning: result.reasoning
        };
      } catch (e) {
        console.error("Error al parsear respuesta de determinación de agente:", e);
        // Si hay un error al parsear, usar el agente de tareas por defecto
        return {
          agentType: "task",
          confidence: 0.5,
          reasoning: "Fallback por error de parseo"
        };
      }
    } catch (error) {
      console.error("Error en determineAgentType:", error);
      return {
        agentType: "task",
        confidence: 0.5,
        reasoning: "Fallback por error de API"
      };
    }
  }
  
  /**
   * Obtiene un contexto específico para el tipo de agente
   */
  private async getContextForAgent(agentType: AgentType): Promise<any> {
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
    
    // Obtener contexto específico según el tipo de agente
    let specificContext = {};
    
    switch (agentType) {
      case "task":
        specificContext = await this.getTaskAgentContext();
        break;
        
      case "category":
        specificContext = await this.getCategoryAgentContext();
        break;
        
      case "analytics":
        specificContext = await this.getAnalyticsAgentContext();
        break;
        
      case "planner":
        specificContext = await this.getPlannerAgentContext();
        break;
        
      case "marketing":
        specificContext = await this.getMarketingAgentContext();
        break;
        
      case "project":
        specificContext = await this.getProjectAgentContext();
        break;
        
      default:
        // No agregar contexto específico
        break;
    }
    
    // Combinar el contexto base con el específico
    return {
      ...baseContext,
      ...specificContext
    };
  }
  
  /**
   * Obtiene contexto específico para el agente de tareas
   */
  private async getTaskAgentContext(): Promise<any> {
    return {
      recentTasks: await storage.getTasks(),
      categories: await storage.getCategories()
    };
  }
  
  /**
   * Obtiene contexto específico para el agente de categorías
   */
  private async getCategoryAgentContext(): Promise<any> {
    const categories = await storage.getCategories();
    const tasksByCategory = await Promise.all(
      categories.map(async category => ({
        categoryId: category.id,
        taskCount: (await storage.getTasksByCategory(category.id)).length
      }))
    );
    
    return {
      categories,
      tasksByCategory
    };
  }
  
  /**
   * Obtiene contexto específico para el agente de análisis
   */
  private async getAnalyticsAgentContext(): Promise<any> {
    return {
      taskStats: await storage.getTaskStats(),
      categories: await storage.getCategories(),
      recentTasks: await storage.getTasks()
    };
  }
  
  /**
   * Obtiene contexto específico para el agente planificador
   */
  private async getPlannerAgentContext(): Promise<any> {
    const tasks = await storage.getTasks();
    const upcomingDeadlines = tasks
      .filter(task => task.deadline && new Date(task.deadline) > new Date())
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
    
    return {
      tasks,
      upcomingDeadlines
    };
  }
  
  /**
   * Obtiene contexto específico para el agente de marketing
   */
  private async getMarketingAgentContext(): Promise<any> {
    const tasks = await storage.getTasks();
    // Incluir tareas relacionadas con marketing
    const marketingKeywords = ['marketing', 'digital', 'campaña', 'promoción', 'publicidad', 'redes sociales', 'contenido'];
    
    const marketingTasks = tasks.filter(task => {
      const titleMatch = marketingKeywords.some(keyword => 
        task.title.toLowerCase().includes(keyword)
      );
      
      const descriptionMatch = task.description && marketingKeywords.some(keyword => 
        task.description!.toLowerCase().includes(keyword)
      );
      
      return titleMatch || descriptionMatch;
    });
    
    return {
      tasks,
      categories: await storage.getCategories(),
      marketingTasks
    };
  }
  
  /**
   * Obtiene contexto específico para el agente de proyectos
   */
  private async getProjectAgentContext(): Promise<any> {
    const tasks = await storage.getTasks();
    // Incluir tareas relacionadas con proyectos
    const projectKeywords = ['proyecto', 'project', 'fase', 'etapa', 'hito', 'milestone', 'sprint', 'equipo', 'colaboración'];
    
    const projectTasks = tasks.filter(task => {
      const titleMatch = projectKeywords.some(keyword => 
        task.title.toLowerCase().includes(keyword)
      );
      
      const descriptionMatch = task.description && projectKeywords.some(keyword => 
        task.description!.toLowerCase().includes(keyword)
      );
      
      return titleMatch || descriptionMatch;
    });
    
    return {
      tasks,
      categories: await storage.getCategories(),
      projectTasks
    };
  }
  
  /**
   * Implementa un enfoque colaborativo cuando no hay un agente claro
   */
  private async collaborativeProcess(userInput: string): Promise<{
    action?: string;
    message: string;
    data?: any;
    agentUsed?: string;
  }> {
    try {
      // Usar el agente de tareas por defecto para colaboración
      const taskAgent = this.agents.get('task');
      
      if (!taskAgent) {
        return {
          message: "No se pudo inicializar el agente de tareas para colaboración.",
          agentUsed: "orchestrator"
        };
      }
      
      // Obtener contexto general
      const generalContext = await this.getContextForAgent('task');
      
      // Procesar la solicitud con el agente de tareas
      const taskResult = await taskAgent.process({
        userInput,
        context: generalContext
      });
      
      // Registrar en el historial
      this.conversationHistory.push({
        userInput,
        agentType: 'collaborative',
        action: taskResult.action,
        response: taskResult.response,
        timestamp: new Date()
      });
      
      // Si la acción es relacionada con una tarea, guardar su ID
      if (taskResult.action === 'createTask' && taskResult.data?.id) {
        this.lastTaskId = taskResult.data.id;
      }
      
      // Retornar el resultado
      return {
        action: taskResult.action,
        message: taskResult.response,
        data: taskResult.data,
        agentUsed: "collaborative"
      };
    } catch (error) {
      console.error("Error en collaborativeProcess:", error);
      return {
        message: "Ha ocurrido un error al procesar tu solicitud en modo colaborativo. Por favor, intenta ser más específico.",
        agentUsed: "error"
      };
    }
  }
}

// Crear una instancia del orquestador para ser exportada
export const orchestrator = new AgentOrchestrator();