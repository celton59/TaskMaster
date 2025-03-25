import OpenAI from 'openai';
import { storage } from './storage';
import { InsertTask, InsertCategory } from '@shared/schema';

// Inicializar cliente de OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TaskExtraction {
  title: string;
  description: string;
  priority: 'alta' | 'media' | 'baja';
  categoryId?: number | null;
  deadline?: Date | null;
}

interface AgentResponse {
  action: string;
  parameters?: any;
  thought?: string;
  message: string;
}

// Definición del sistema para el agente
const SYSTEM_PROMPT = `Eres un asistente inteligente especializado en gestión de tareas.
Tienes la capacidad de realizar diferentes acciones según lo que el usuario te pida.

CAPACIDADES:
1. Crear nuevas tareas
2. Listar tareas existentes
3. Listar categorías
4. Crear nuevas categorías
5. Responder preguntas sobre gestión de tareas

FORMATO DE RESPUESTA:
Debes responder en formato JSON con la siguiente estructura:
{
  "thought": "Aquí debes razonar internamente sobre lo que el usuario quiere y la mejor manera de responder (esto no se mostrará al usuario)",
  "action": "La acción a realizar (createTask, listTasks, listCategories, createCategory, respond)",
  "parameters": {
    // Parámetros específicos según la acción seleccionada
  },
  "message": "El mensaje que quieres mostrarle al usuario"
}

ACCIONES DISPONIBLES:

1. createTask: Crear una nueva tarea
   Parámetros requeridos:
   - title: Título corto y descriptivo de la tarea
   - description: Descripción detallada de la tarea
   - priority: Prioridad de la tarea (alta, media, baja)
   Parámetros opcionales:
   - categoryId: ID de la categoría (1: Trabajo, 2: Personal, 3: Hogar)
   - deadline: Fecha límite en formato ISO

2. listTasks: Listar tareas existentes
   No requiere parámetros

3. listCategories: Listar categorías disponibles
   No requiere parámetros

4. createCategory: Crear una nueva categoría
   Parámetros requeridos:
   - name: Nombre de la categoría
   - color: Color de la categoría (blue, green, red, purple, orange)

5. respond: Simplemente responder al usuario sin realizar acciones
   No requiere parámetros

EJEMPLOS DE CATEGORÍAS EXISTENTES:
- ID: 1, Nombre: Trabajo, Color: blue
- ID: 2, Nombre: Personal, Color: green
- ID: 3, Nombre: Hogar, Color: orange

Asegúrate de que tu respuesta JSON sea válida y contenga todos los campos necesarios para la acción seleccionada.`;

// Función para procesar un mensaje con el enfoque de agente
export async function processAgentMessage(input: string): Promise<{
  success: boolean;
  action?: string;
  result?: any;
  message: string;
  thought?: string;
}> {
  try {
    // Obtener información actual para el contexto del agente
    const tasks = await storage.getTasks();
    const categories = await storage.getCategories();
    
    const tasksInfo = tasks.length > 0 
      ? `Tareas existentes (mostrando máximo 5): 
        ${tasks.slice(0, 5).map(t => `- "${t.title}" (ID: ${t.id}, Estado: ${t.status}, Prioridad: ${t.priority})`).join('\n        ')}`
      : "No hay tareas existentes.";
    
    const categoriesInfo = categories.length > 0
      ? `Categorías existentes: 
        ${categories.map(c => `- "${c.name}" (ID: ${c.id}, Color: ${c.color})`).join('\n        ')}`
      : "No hay categorías definidas.";
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Contexto del sistema:
${tasksInfo}
${categoriesInfo}

Solicitud del usuario: ${input}`
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      console.error("No se obtuvo respuesta de OpenAI");
      return {
        success: false,
        message: "No se pudo procesar la solicitud con el asistente de IA"
      };
    }

    try {
      // Extraer el JSON de la respuesta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const agentResponse = JSON.parse(jsonStr) as AgentResponse;
      
      // Implementar las acciones del agente
      let result = null;
      
      if (agentResponse.action === 'createTask') {
        // Extraer y validar los parámetros para crear una tarea
        const params = agentResponse.parameters || {};
        
        if (!params.title || !params.description || !params.priority) {
          return {
            success: false,
            message: "No se pudo crear la tarea: faltan parámetros obligatorios",
            thought: agentResponse.thought
          };
        }
        
        // Validar prioridad
        if (!['alta', 'media', 'baja'].includes(params.priority)) {
          params.priority = 'media';
        }
        
        // Preparar la tarea para su creación
        const newTask: InsertTask = {
          title: params.title,
          description: params.description,
          status: 'pendiente',
          priority: params.priority,
          categoryId: params.categoryId || 1,
          deadline: params.deadline ? new Date(params.deadline) : null,
        };
        
        // Crear la tarea en la base de datos
        result = await storage.createTask(newTask);
        
      } else if (agentResponse.action === 'listTasks') {
        // Listar tareas existentes
        result = await storage.getTasks();
        
      } else if (agentResponse.action === 'listCategories') {
        // Listar categorías existentes
        result = await storage.getCategories();
        
      } else if (agentResponse.action === 'createCategory') {
        // Extraer y validar los parámetros para crear una categoría
        const params = agentResponse.parameters || {};
        
        if (!params.name || !params.color) {
          return {
            success: false,
            message: "No se pudo crear la categoría: faltan parámetros obligatorios",
            thought: agentResponse.thought
          };
        }
        
        // Validar color
        if (!['blue', 'green', 'red', 'purple', 'orange'].includes(params.color)) {
          params.color = 'blue';
        }
        
        // Preparar la categoría para su creación
        const newCategory: InsertCategory = {
          name: params.name,
          color: params.color
        };
        
        // Crear la categoría en la base de datos
        result = await storage.createCategory(newCategory);
      }
      
      return {
        success: true,
        action: agentResponse.action,
        result,
        message: agentResponse.message,
        thought: agentResponse.thought
      };
      
    } catch (jsonError) {
      console.error("Error al procesar la respuesta JSON:", jsonError);
      console.error("Respuesta recibida:", content);
      return {
        success: false,
        message: "Error al interpretar la respuesta del asistente"
      };
    }
  } catch (error) {
    console.error("Error al comunicarse con OpenAI:", error);
    return {
      success: false,
      message: "Error de comunicación con el asistente de IA: " + (error instanceof Error ? error.message : String(error))
    };
  }
}

// Mantenemos las funciones anteriores para compatibilidad
export async function extractTaskFromText(input: string): Promise<TaskExtraction | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un asistente especializado en extraer información para crear tareas de gestión de proyectos.
                    Tu objetivo es analizar el texto del usuario y extraer la información relevante para crear una tarea.
                    Debes responder ÚNICAMENTE con un objeto JSON con la siguiente estructura:
                    {
                      "title": "Título corto y descriptivo de la tarea",
                      "description": "Descripción detallada de la tarea",
                      "priority": "alta/media/baja",
                      "categoryId": número o null (si no se especifica),
                      "deadline": fecha en formato ISO o null (si no se especifica)
                    }
                    No incluyas explicaciones ni texto adicional, solo el objeto JSON.
                    Las categorías disponibles son: 1 (Trabajo), 2 (Personal), 3 (Hogar).
                    Si no se menciona la categoría, deja categoryId como null.`
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      console.error("No se obtuvo respuesta de OpenAI");
      return null;
    }

    // Extraer el JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    try {
      const parsedTask = JSON.parse(jsonStr) as TaskExtraction;
      
      // Validación básica de la tarea extraída
      if (!parsedTask.title || typeof parsedTask.title !== 'string') {
        throw new Error("La tarea debe tener un título");
      }
      
      // Validar y formatear la fecha si existe
      if (parsedTask.deadline && typeof parsedTask.deadline === 'string') {
        parsedTask.deadline = new Date(parsedTask.deadline);
        // Verificar si es una fecha válida
        if (isNaN(parsedTask.deadline.getTime())) {
          parsedTask.deadline = null;
        }
      }

      return parsedTask;
    } catch (jsonError) {
      console.error("Error al procesar la respuesta JSON:", jsonError);
      console.error("Respuesta recibida:", content);
      return null;
    }
  } catch (error) {
    console.error("Error al comunicarse con OpenAI:", error);
    return null;
  }
}

export async function createTaskFromExtraction(extraction: TaskExtraction): Promise<any> {
  try {
    const newTask: InsertTask = {
      title: extraction.title,
      description: extraction.description,
      status: 'pendiente',
      priority: extraction.priority || 'media',
      categoryId: extraction.categoryId || 1, // Por defecto, categoría 1 (Trabajo)
      deadline: extraction.deadline ? extraction.deadline : null,
    };

    const createdTask = await storage.createTask(newTask);
    return createdTask;
  } catch (error) {
    console.error("Error al crear la tarea:", error);
    throw error;
  }
}

export async function createTaskFromText(input: string): Promise<{
  success: boolean;
  task?: any;
  message?: string;
}> {
  try {
    const extraction = await extractTaskFromText(input);
    
    if (!extraction) {
      return {
        success: false,
        message: "No se pudo extraer la información de la tarea a partir del texto proporcionado"
      };
    }
    
    const task = await createTaskFromExtraction(extraction);
    
    return {
      success: true,
      task,
      message: "Tarea creada exitosamente"
    };
  } catch (error) {
    console.error("Error en el proceso completo:", error);
    return {
      success: false,
      message: "Error al crear la tarea: " + (error instanceof Error ? error.message : String(error))
    };
  }
}