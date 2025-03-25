import OpenAI from 'openai';
import { storage } from '../storage';

// Inicializar cliente de OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  
  constructor() {
    this.agents = new Map();
    
    // Registrar los agentes especializados
    this.registerAgent('task', new TaskAgent());
    this.registerAgent('category', new CategoryAgent());
    this.registerAgent('analytics', new AnalyticsAgent());
    this.registerAgent('planner', new PlannerAgent());
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
        return await this.collaborativeProcess(userInput);
      }
      
      // 3. Delegar al agente especializado
      const agent = this.agents.get(agentType);
      
      if (!agent) {
        return {
          message: "No he podido procesar tu solicitud. Por favor, intenta ser más específico.",
          agentUsed: "orchestrator"
        };
      }
      
      // Obtener contexto relevante para el agente
      const context = await this.getContextForAgent(agentType);
      const result = await agent.process({ userInput, context });
      
      return {
        action: result.action,
        message: result.response,
        data: result.data,
        agentUsed: agentType
      };
    } catch (error) {
      console.error("Error en el orquestador:", error);
      return {
        message: "Ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo.",
        agentUsed: "orchestrator"
      };
    }
  }
  
  private async determineAgentType(userInput: string): Promise<{
    agentType: string;
    confidence: number;
  }> {
    // Usar LLM para determinar qué agente debe manejar la solicitud
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Usando el modelo más reciente
      messages: [
        {
          role: "system",
          content: `Determina qué tipo de agente especializado debe manejar la siguiente solicitud.
          Opciones disponibles:
          - task: Para crear, actualizar, eliminar o consultar tareas específicas
          - category: Para gestionar categorías, asignar tareas a categorías
          - analytics: Para analizar datos, generar informes, estadísticas
          - planner: Para planificación, programación, fechas límite, recordatorios
          
          Responde con un JSON que contenga:
          1. "agentType": El tipo de agente que debe manejar la solicitud
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
      return {
        agentType: result.agentType,
        confidence: result.confidence
      };
    } catch (e) {
      // Si hay un error al parsear, usar el agente de tareas por defecto
      return {
        agentType: "task",
        confidence: 0.5
      };
    }
  }
  
  private async getContextForAgent(agentType: string): Promise<any> {
    // Obtener contexto relevante según el tipo de agente
    switch (agentType) {
      case "task":
        return {
          recentTasks: await storage.getTasks(),
          categories: await storage.getCategories()
        };
      case "category":
        return {
          categories: await storage.getCategories(),
          tasksByCategory: await Promise.all(
            (await storage.getCategories()).map(async category => ({
              categoryId: category.id,
              taskCount: (await storage.getTasksByCategory(category.id)).length
            }))
          )
        };
      case "analytics":
        return {
          taskStats: await storage.getTaskStats(),
          categories: await storage.getCategories(),
          recentTasks: await storage.getTasks()
        };
      case "planner":
        return {
          tasks: await storage.getTasks(),
          upcomingDeadlines: (await storage.getTasks())
            .filter(task => task.deadline && new Date(task.deadline) > new Date())
            .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        };
      default:
        return {};
    }
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
      ]
    });
    
    return response.choices[0]?.message?.content || "";
  }
}

// Implementación del Agente de Tareas
class TaskAgent extends SpecializedAgent {
  private systemPrompt = `Eres un agente especializado en la gestión de tareas. 
  Puedes crear nuevas tareas, actualizar tareas existentes, eliminar tareas o proporcionar información sobre tareas.
  
  Debes responder en formato JSON con la siguiente estructura:
  {
    "action": "createTask | updateTask | deleteTask | listTasks",
    "parameters": { (parámetros específicos para la acción) },
    "response": "Mensaje para el usuario",
    "confidence": (valor entre 0 y 1),
    "reasoning": "Tu razonamiento interno"
  }
  
  Para createTask, los parámetros deben incluir:
    - title: título de la tarea
    - description: descripción detallada
    - priority: 'high', 'medium', o 'low'
    - categoryId: ID de la categoría (opcional)
    - deadline: fecha límite (opcional)
  
  Para updateTask:
    - taskId: ID de la tarea a actualizar
    - updates: objeto con los campos a actualizar
  
  Para deleteTask:
    - taskId: ID de la tarea a eliminar
  
  Para listTasks, puedes incluir filtros opcionales.`;
  
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      const responseContent = await this.callModel(this.systemPrompt, request.userInput, request.context);
      
      try {
        const parsedResponse = JSON.parse(responseContent);
        // Implementar la lógica para ejecutar la acción
        let data = null;
        
        if (parsedResponse.action === "createTask" && parsedResponse.parameters) {
          // Convertir prioridad si es necesario
          let priority = parsedResponse.parameters.priority;
          if (priority === 'alta') priority = 'high';
          else if (priority === 'media') priority = 'medium';
          else if (priority === 'baja') priority = 'low';
          
          const newTask = {
            title: parsedResponse.parameters.title,
            description: parsedResponse.parameters.description,
            status: 'pending',
            priority,
            categoryId: parsedResponse.parameters.categoryId || 1,
            deadline: parsedResponse.parameters.deadline ? new Date(parsedResponse.parameters.deadline) : null,
          };
          
          data = await storage.createTask(newTask);
        } else if (parsedResponse.action === "updateTask" && parsedResponse.parameters) {
          data = await storage.updateTask(
            parsedResponse.parameters.taskId,
            parsedResponse.parameters.updates
          );
        } else if (parsedResponse.action === "deleteTask" && parsedResponse.parameters) {
          data = await storage.deleteTask(parsedResponse.parameters.taskId);
        } else if (parsedResponse.action === "listTasks") {
          data = await storage.getTasks();
        }
        
        return {
          action: parsedResponse.action,
          response: parsedResponse.response,
          data,
          confidence: parsedResponse.confidence || 0.8
        };
      } catch (e) {
        // Si no podemos parsear la respuesta JSON
        return {
          response: "No pude procesar correctamente la solicitud relacionada con tareas. Por favor, intenta de nuevo.",
          confidence: 0.3
        };
      }
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
  Puedes crear nuevas categorías, actualizar categorías existentes, eliminar categorías o proporcionar información sobre categorías.
  
  Debes responder en formato JSON con la siguiente estructura:
  {
    "action": "createCategory | updateCategory | deleteCategory | listCategories",
    "parameters": { (parámetros específicos para la acción) },
    "response": "Mensaje para el usuario",
    "confidence": (valor entre 0 y 1),
    "reasoning": "Tu razonamiento interno"
  }
  
  Para createCategory, los parámetros deben incluir:
    - name: nombre de la categoría
    - color: color de la categoría (blue, green, red, purple, orange)
  
  Para updateCategory:
    - categoryId: ID de la categoría a actualizar
    - updates: objeto con los campos a actualizar
  
  Para deleteCategory:
    - categoryId: ID de la categoría a eliminar
  
  Para listCategories, no se requieren parámetros adicionales.`;
  
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      const responseContent = await this.callModel(this.systemPrompt, request.userInput, request.context);
      
      try {
        const parsedResponse = JSON.parse(responseContent);
        let data = null;
        
        if (parsedResponse.action === "createCategory" && parsedResponse.parameters) {
          const newCategory = {
            name: parsedResponse.parameters.name,
            color: parsedResponse.parameters.color || 'blue',
          };
          
          data = await storage.createCategory(newCategory);
        } else if (parsedResponse.action === "updateCategory" && parsedResponse.parameters) {
          data = await storage.updateCategory(
            parsedResponse.parameters.categoryId,
            parsedResponse.parameters.updates
          );
        } else if (parsedResponse.action === "deleteCategory" && parsedResponse.parameters) {
          data = await storage.deleteCategory(parsedResponse.parameters.categoryId);
        } else if (parsedResponse.action === "listCategories") {
          data = await storage.getCategories();
        }
        
        return {
          action: parsedResponse.action,
          response: parsedResponse.response,
          data,
          confidence: parsedResponse.confidence || 0.8
        };
      } catch (e) {
        return {
          response: "No pude procesar correctamente la solicitud relacionada con categorías. Por favor, intenta de nuevo.",
          confidence: 0.3
        };
      }
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
  
  Debes responder en formato JSON con la siguiente estructura:
  {
    "action": "getTaskStats | analyzeTrends | generateReport",
    "parameters": { (parámetros específicos para la acción) },
    "response": "Mensaje para el usuario con análisis detallado",
    "confidence": (valor entre 0 y 1),
    "reasoning": "Tu razonamiento interno"
  }`;
  
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      const responseContent = await this.callModel(this.systemPrompt, request.userInput, request.context);
      
      try {
        const parsedResponse = JSON.parse(responseContent);
        let data = null;
        
        if (parsedResponse.action === "getTaskStats") {
          data = await storage.getTaskStats();
        } else if (parsedResponse.action === "analyzeTrends" || parsedResponse.action === "generateReport") {
          // En una implementación completa, aquí se realizarían análisis más detallados
          data = {
            taskStats: await storage.getTaskStats(),
            tasks: await storage.getTasks(),
            categories: await storage.getCategories(),
          };
        }
        
        return {
          action: parsedResponse.action,
          response: parsedResponse.response,
          data,
          confidence: parsedResponse.confidence || 0.8
        };
      } catch (e) {
        return {
          response: "No pude generar el análisis solicitado. Por favor, intenta con una solicitud más específica.",
          confidence: 0.3
        };
      }
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
  
  Debes responder en formato JSON con la siguiente estructura:
  {
    "action": "scheduleTasks | setDeadlines | getPrioritizedTasks | getUpcomingDeadlines",
    "parameters": { (parámetros específicos para la acción) },
    "response": "Mensaje para el usuario con planificación detallada",
    "confidence": (valor entre 0 y 1),
    "reasoning": "Tu razonamiento interno"
  }`;
  
  async process(request: AgentRequest): Promise<AgentResponse> {
    try {
      const responseContent = await this.callModel(this.systemPrompt, request.userInput, request.context);
      
      try {
        const parsedResponse = JSON.parse(responseContent);
        let data = null;
        
        if (parsedResponse.action === "getUpcomingDeadlines") {
          const tasks = await storage.getTasks();
          data = tasks
            .filter(task => task.deadline && new Date(task.deadline) > new Date())
            .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
        } else if (parsedResponse.action === "getPrioritizedTasks") {
          const tasks = await storage.getTasks();
          // Ordenar por prioridad: high > medium > low
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          data = tasks.sort((a, b) => {
            const aPriority = a.priority ? (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) : 3;
            const bPriority = b.priority ? (priorityOrder[b.priority as keyof typeof priorityOrder] || 3) : 3;
            return aPriority - bPriority;
          });
        }
        
        return {
          action: parsedResponse.action,
          response: parsedResponse.response,
          data,
          confidence: parsedResponse.confidence || 0.8
        };
      } catch (e) {
        return {
          response: "No pude procesar correctamente la solicitud de planificación. Por favor, sé más específico.",
          confidence: 0.3
        };
      }
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
export const orchestrator = new AgentOrchestrator();