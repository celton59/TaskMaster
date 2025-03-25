import OpenAI from 'openai';
import { storage } from './storage';
import { InsertTask } from '@shared/schema';

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

// Función para extraer una tarea a partir de una instrucción de texto
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

// Función para crear una tarea a partir de la extracción
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

// Función para procesar el texto y crear una tarea directamente
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