import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertCategorySchema,
  insertHabitSchema,
  insertHabitLogSchema,
  insertProjectSchema,
  HabitFrequency 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { createTaskFromText, processAgentMessage } from "./openai-service";
import { processUserMessage } from "./agents/agent-service";
import { processIncomingWebhook, checkTwilioConfig, sendWhatsAppMessage } from "./services/whatsapp-service";
import { orchestrator } from "./agents/orchestrator";
import { setupAuth, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar autenticación
  setupAuth(app);
  
  // API routes
  const apiRouter = express.Router();
  
  // Task routes
  apiRouter.get("/tasks", async (req, res) => {
    try {
      console.log("Obteniendo todas las tareas...");
      const tasks = await storage.getTasks();
      console.log("Tareas obtenidas:", tasks.length);
      res.json(tasks);
    } catch (error) {
      console.error("ERROR al obtener tareas:", error);
      res.status(500).json({ message: "Failed to fetch tasks", error: String(error) });
    }
  });
  
  apiRouter.get("/tasks/stats", async (req, res) => {
    try {
      const stats = await storage.getTaskStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task statistics" });
    }
  });
  
  apiRouter.get("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Obteniendo tarea específica con ID: ${id}`);
      const task = await storage.getTask(id);
      
      if (!task) {
        console.log(`No se encontró la tarea con ID: ${id}`);
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Asegurar que el resultado sea un objeto y no un array
      if (Array.isArray(task)) {
        console.log(`La tarea con ID ${id} se obtuvo como array, convirtiendo a objeto...`);
        if (task.length > 0) {
          res.json(task[0]);
        } else {
          return res.status(404).json({ message: "Task not found" });
        }
      } else {
        console.log(`Enviando tarea con ID: ${id}`);
        res.json(task);
      }
    } catch (error) {
      console.error(`Error al obtener tarea con ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  
  apiRouter.post("/tasks", async (req, res) => {
    try {
      console.log("Recibiendo datos para crear tarea:", req.body);
      
      // Convertir el string ISO de fecha a objeto Date para el deadline
      let taskData = { ...req.body };
      if (taskData.deadline && typeof taskData.deadline === 'string') {
        try {
          // Parsear la fecha y convertirla a un formato que acepte la BD
          const date = new Date(taskData.deadline);
          if (!isNaN(date.getTime())) {
            taskData.deadline = date;
          } else {
            taskData.deadline = null;
          }
        } catch (e) {
          console.error("Error al convertir fecha deadline:", e);
          taskData.deadline = null;
        }
      }
      
      // Validar datos
      const validatedTaskData = insertTaskSchema.parse(taskData);
      console.log("Datos validados para crear tarea:", validatedTaskData);
      
      // Crear tarea
      const task = await storage.createTask(validatedTaskData);
      console.log("Tarea creada correctamente:", task);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error al crear tarea:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create task", error: String(error) });
    }
  });
  
  apiRouter.patch("/tasks/:id", async (req, res) => {
    try {
      console.log("Recibiendo datos para actualizar tarea:", req.body);
      const id = parseInt(req.params.id);
      
      // Convertir el string ISO de fecha a objeto Date para el deadline
      let taskData = { ...req.body };
      if (taskData.deadline && typeof taskData.deadline === 'string') {
        try {
          // Parsear la fecha y convertirla a un formato que acepte la BD
          const date = new Date(taskData.deadline);
          if (!isNaN(date.getTime())) {
            taskData.deadline = date;
          } else {
            taskData.deadline = null;
          }
        } catch (e) {
          console.error("Error al convertir fecha deadline:", e);
          taskData.deadline = null;
        }
      }
      
      // Manejar otras fechas como startDate y completedAt
      if (taskData.startDate && typeof taskData.startDate === 'string') {
        try {
          const date = new Date(taskData.startDate);
          if (!isNaN(date.getTime())) {
            taskData.startDate = date;
          } else {
            taskData.startDate = null;
          }
        } catch (e) {
          taskData.startDate = null;
        }
      }
      
      if (taskData.completedAt && typeof taskData.completedAt === 'string') {
        try {
          const date = new Date(taskData.completedAt);
          if (!isNaN(date.getTime())) {
            taskData.completedAt = date;
          } else {
            taskData.completedAt = null;
          }
        } catch (e) {
          taskData.completedAt = null;
        }
      }
      
      // Validar datos
      const validatedTaskData = insertTaskSchema.partial().parse(taskData);
      console.log("Datos validados para actualizar tarea:", validatedTaskData);
      
      const updatedTask = await storage.updateTask(id, validatedTaskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      console.log("Tarea actualizada correctamente:", updatedTask);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update task", error: String(error) });
    }
  });
  
  apiRouter.delete("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Recibida solicitud para eliminar tarea ID: ${id}`);
      
      if (isNaN(id)) {
        console.error(`ID de tarea inválido: ${req.params.id}`);
        return res.status(400).json({ message: "ID de tarea inválido" });
      }
      
      const success = await storage.deleteTask(id);
      
      if (!success) {
        console.error(`Tarea no encontrada con ID: ${id}`);
        return res.status(404).json({ message: "Tarea no encontrada" });
      }
      
      console.log(`Tarea eliminada correctamente con ID: ${id}`);
      res.status(200).json({ message: "Tarea eliminada correctamente" });
    } catch (error) {
      console.error(`Error al eliminar tarea ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Error al eliminar la tarea", error: String(error) });
    }
  });
  
  // Category routes
  apiRouter.get("/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  apiRouter.get("/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  
  apiRouter.post("/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  apiRouter.patch("/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      
      const updatedCategory = await storage.updateCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  apiRouter.delete("/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // Get tasks by category
  apiRouter.get("/categories/:id/tasks", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const tasks = await storage.getTasksByCategory(categoryId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks by category" });
    }
  });
  
  // Get tasks by status
  apiRouter.get("/tasks/status/:status", async (req, res) => {
    try {
      const status = req.params.status;
      const tasks = await storage.getTasksByStatus(status);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks by status" });
    }
  });
  
  // ChatGPT integration - Create task from text (legacy method)
  apiRouter.post("/ai/create-task", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Texto requerido para crear la tarea" });
      }
      
      const result = await createTaskFromText(text);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.status(201).json({ 
        message: result.message,
        task: result.task 
      });
    } catch (error) {
      console.error("Error en ChatGPT:", error);
      res.status(500).json({ message: "Error al procesar la solicitud con ChatGPT" });
    }
  });
  
  // ChatGPT Agent API - Process message with agent approach (legacy)
  apiRouter.post("/ai/agent", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Se requiere un mensaje para el asistente" });
      }
      
      // Process with the agent approach
      const result = await processAgentMessage(message);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      // Return different response formats based on the action
      if (result.action === 'createTask') {
        // Añadir logging detallado para debugging
        console.log("Tarea creada por el asistente:", result.result);
        
        res.status(201).json({
          action: result.action,
          message: result.message,
          task: result.result
        });
      } else if (result.action === 'createCategory') {
        res.status(201).json({
          action: result.action,
          message: result.message,
          category: result.result
        });
      } else if (result.action === 'listTasks') {
        res.status(200).json({
          action: result.action,
          message: result.message,
          tasks: result.result
        });
      } else if (result.action === 'listCategories') {
        res.status(200).json({
          action: result.action,
          message: result.message,
          categories: result.result
        });
      } else {
        // For 'respond' action or any other action
        res.status(200).json({
          action: result.action,
          message: result.message
        });
      }
    } catch (error) {
      console.error("Error en el agente de IA:", error);
      res.status(500).json({ message: "Error al procesar la solicitud con el agente de IA" });
    }
  });
  
  // Sistema Orquestado de Múltiples Agentes
  apiRouter.post("/ai/orchestrator", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Se requiere un mensaje para el asistente" });
      }
      
      // Procesar con el sistema orquestado
      const result = await processUserMessage(message);
      
      // Si la acción es crear tarea o categoría, usar 201 Created
      if (result.action === 'createTask' || result.action === 'createCategory') {
        res.status(201).json(result);
      } else {
        // Para cualquier otra acción, usar 200 OK
        res.status(200).json(result);
      }
    } catch (error) {
      console.error("Error en el sistema orquestado de agentes:", error);
      res.status(500).json({ 
        action: 'error',
        message: "Error al procesar la solicitud con el sistema orquestado" 
      });
    }
  });

  // Rutas de Proyectos
  apiRouter.get("/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      res.status(500).json({ message: "Error al obtener proyectos" });
    }
  });

  apiRouter.get("/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error al obtener proyecto:", error);
      res.status(500).json({ message: "Error al obtener proyecto" });
    }
  });

  apiRouter.post("/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al crear proyecto:", error);
      res.status(500).json({ message: "Error al crear proyecto" });
    }
  });

  apiRouter.patch("/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      
      const updatedProject = await storage.updateProject(id, projectData);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error al actualizar proyecto:", error);
      res.status(500).json({ message: "Error al actualizar proyecto" });
    }
  });

  apiRouter.delete("/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      res.status(500).json({ message: "Error al eliminar proyecto" });
    }
  });

  apiRouter.get("/projects/:id/tasks", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const tasks = await storage.getTasksByProject(projectId);
      res.json(tasks);
    } catch (error) {
      console.error("Error al obtener tareas del proyecto:", error);
      res.status(500).json({ message: "Error al obtener tareas del proyecto" });
    }
  });

  apiRouter.get("/projects/:id/with-tasks", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const projectWithTasks = await storage.getProjectWithTasks(projectId);
      res.json(projectWithTasks);
    } catch (error) {
      console.error("Error al obtener proyecto con tareas:", error);
      res.status(500).json({ message: "Error al obtener proyecto con tareas" });
    }
  });

  apiRouter.get("/projects/:id/progress", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const progress = await storage.getProjectProgress(projectId);
      res.json(progress);
    } catch (error) {
      console.error("Error al obtener progreso del proyecto:", error);
      res.status(500).json({ message: "Error al obtener progreso del proyecto" });
    }
  });
  
  // Rutas de WhatsApp
  apiRouter.get("/whatsapp/status", async (req, res) => {
    try {
      const status = await checkTwilioConfig();
      res.json(status);
    } catch (error) {
      console.error("Error al verificar la configuración de Twilio:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al verificar la configuración de Twilio" 
      });
    }
  });
  
  // Rutas para contactos de WhatsApp
  apiRouter.get("/whatsapp/contacts", async (req, res) => {
    try {
      const contacts = await storage.getWhatsappContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error al obtener contactos de WhatsApp:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al obtener contactos de WhatsApp" 
      });
    }
  });
  
  apiRouter.get("/whatsapp/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getWhatsappContact(id);
      
      if (!contact) {
        return res.status(404).json({ 
          status: 'error',
          message: "Contacto no encontrado" 
        });
      }
      
      res.json(contact);
    } catch (error) {
      console.error("Error al obtener contacto de WhatsApp:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al obtener contacto de WhatsApp" 
      });
    }
  });
  
  apiRouter.post("/whatsapp/contacts", async (req, res) => {
    try {
      const { name, phoneNumber, notes } = req.body;
      
      if (!name || !phoneNumber) {
        return res.status(400).json({ 
          status: 'error',
          message: "Se requiere nombre y número de teléfono" 
        });
      }
      
      // Validar formato del número de teléfono (E.164)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ 
          status: 'error',
          message: "El número debe estar en formato E.164 (ej: +34600000000)" 
        });
      }
      
      // Verificar si ya existe un contacto con ese número
      const existingContact = await storage.getWhatsappContactByPhone(phoneNumber);
      if (existingContact) {
        return res.status(400).json({ 
          status: 'error',
          message: "Ya existe un contacto con ese número de teléfono" 
        });
      }
      
      const newContact = await storage.createWhatsappContact({
        name,
        phoneNumber,
        notes: notes || null,
        active: true
      });
      
      res.status(201).json({ 
        status: 'success',
        message: "Contacto creado correctamente",
        contact: newContact
      });
    } catch (error) {
      console.error("Error al crear contacto de WhatsApp:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al crear contacto de WhatsApp" 
      });
    }
  });
  
  apiRouter.patch("/whatsapp/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, phoneNumber, notes, active } = req.body;
      
      // Si se incluye phoneNumber, validar formato
      if (phoneNumber) {
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
          return res.status(400).json({ 
            status: 'error',
            message: "El número debe estar en formato E.164 (ej: +34600000000)" 
          });
        }
        
        // Verificar si ya existe otro contacto con ese número
        const existingContact = await storage.getWhatsappContactByPhone(phoneNumber);
        if (existingContact && existingContact.id !== id) {
          return res.status(400).json({ 
            status: 'error',
            message: "Ya existe otro contacto con ese número de teléfono" 
          });
        }
      }
      
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (notes !== undefined) updateData.notes = notes;
      if (active !== undefined) updateData.active = active;

      
      const updatedContact = await storage.updateWhatsappContact(id, updateData);
      
      if (!updatedContact) {
        return res.status(404).json({ 
          status: 'error',
          message: "Contacto no encontrado" 
        });
      }
      
      res.json({ 
        status: 'success',
        message: "Contacto actualizado correctamente",
        contact: updatedContact
      });
    } catch (error) {
      console.error("Error al actualizar contacto de WhatsApp:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al actualizar contacto de WhatsApp" 
      });
    }
  });
  
  apiRouter.delete("/whatsapp/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWhatsappContact(id);
      
      if (!success) {
        return res.status(404).json({ 
          status: 'error',
          message: "Contacto no encontrado" 
        });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar contacto de WhatsApp:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al eliminar contacto de WhatsApp" 
      });
    }
  });
  
  // Enviar mensaje de prueba por WhatsApp
  apiRouter.post("/whatsapp/send-test", async (req, res) => {
    try {
      const { to, message } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ 
          status: 'error',
          message: "Se requiere un número de teléfono y un mensaje" 
        });
      }
      
      // Validar formato del número de teléfono (E.164)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(to)) {
        return res.status(400).json({ 
          status: 'error',
          message: "El número debe estar en formato E.164 (ej: +34600000000)" 
        });
      }
      
      await sendWhatsAppMessage(to, message);
      
      res.json({ 
        status: 'success',
        message: "Mensaje enviado correctamente" 
      });
    } catch (error: any) {
      console.error("Error al enviar mensaje de WhatsApp:", error);
      res.status(500).json({ 
        status: 'error',
        message: `Error al enviar mensaje: ${error.message || 'Error desconocido'}` 
      });
    }
  });

  // Webhook para Twilio WhatsApp
  app.post("/webhooks/whatsapp", express.urlencoded({ extended: false }), async (req, res) => {
    try {
      console.log("⚡ Webhook de WhatsApp recibido:", JSON.stringify(req.body, null, 2));
      const result = await processIncomingWebhook(req.body);
      if (result.success) {
        console.log("✅ Mensaje de WhatsApp procesado correctamente:", result.messageId || "");
        // Enviar respuesta TwiML para confirmar recepción
        res.set('Content-Type', 'text/xml');
        res.send('<Response></Response>');
      } else {
        console.error("❌ Error en el webhook:", result.error);
        res.status(400).json({ 
          status: 'error',
          message: result.error || "Error al procesar webhook" 
        });
      }
    } catch (error) {
      console.error("Error al procesar webhook de WhatsApp:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al procesar webhook de WhatsApp" 
      });
    }
  });

  // Rutas para hábitos
  apiRouter.get("/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error) {
      console.error("Error al obtener hábitos:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al obtener hábitos" 
      });
    }
  });

  apiRouter.get("/habits/stats", async (req, res) => {
    try {
      const habitId = req.query.habitId ? parseInt(req.query.habitId as string) : undefined;
      const stats = await storage.getHabitStats(habitId);
      res.json(stats);
    } catch (error) {
      console.error("Error al obtener estadísticas de hábitos:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al obtener estadísticas de hábitos" 
      });
    }
  });

  apiRouter.get("/habits/frequency/:frequency", async (req, res) => {
    try {
      const { frequency } = req.params;
      
      // Validar que la frecuencia sea válida
      if (!Object.values(HabitFrequency).includes(frequency as any)) {
        return res.status(400).json({ 
          status: 'error',
          message: "Frecuencia no válida. Debe ser 'daily', 'weekday' o 'weekend'" 
        });
      }
      
      const habits = await storage.getHabitsByFrequency(frequency);
      res.json(habits);
    } catch (error) {
      console.error("Error al obtener hábitos por frecuencia:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al obtener hábitos por frecuencia" 
      });
    }
  });

  apiRouter.get("/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habit = await storage.getHabit(id);
      
      if (!habit) {
        return res.status(404).json({ 
          status: 'error',
          message: "Hábito no encontrado" 
        });
      }
      
      res.json(habit);
    } catch (error) {
      console.error("Error al obtener hábito:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al obtener hábito" 
      });
    }
  });

  apiRouter.post("/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(habitData);
      res.status(201).json({
        status: 'success',
        message: "Hábito creado correctamente",
        habit
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          status: 'error',
          message: validationError.message 
        });
      }
      console.error("Error al crear hábito:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al crear hábito" 
      });
    }
  });

  apiRouter.patch("/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habitData = insertHabitSchema.partial().parse(req.body);
      
      const updatedHabit = await storage.updateHabit(id, habitData);
      
      if (!updatedHabit) {
        return res.status(404).json({ 
          status: 'error',
          message: "Hábito no encontrado" 
        });
      }
      
      res.json({
        status: 'success',
        message: "Hábito actualizado correctamente",
        habit: updatedHabit
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          status: 'error',
          message: validationError.message 
        });
      }
      console.error("Error al actualizar hábito:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al actualizar hábito" 
      });
    }
  });

  apiRouter.delete("/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHabit(id);
      
      if (!success) {
        return res.status(404).json({ 
          status: 'error',
          message: "Hábito no encontrado" 
        });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar hábito:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al eliminar hábito" 
      });
    }
  });

  // Rutas para registros de hábitos (logs)
  apiRouter.get("/habit-logs", async (req, res) => {
    try {
      const habitId = req.query.habitId ? parseInt(req.query.habitId as string) : undefined;
      const logs = await storage.getHabitLogs(habitId);
      res.json(logs);
    } catch (error) {
      console.error("Error al obtener registros de hábitos:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al obtener registros de hábitos" 
      });
    }
  });

  apiRouter.get("/habit-logs/date-range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          status: 'error',
          message: "Se requieren fechas de inicio y fin" 
        });
      }
      
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
          status: 'error',
          message: "Formato de fecha no válido" 
        });
      }
      
      const logs = await storage.getHabitLogsByDateRange(start, end);
      res.json(logs);
    } catch (error) {
      console.error("Error al obtener registros por rango de fechas:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al obtener registros por rango de fechas" 
      });
    }
  });

  apiRouter.post("/habit-logs", async (req, res) => {
    try {
      const logData = insertHabitLogSchema.parse(req.body);
      
      // Verificar que el hábito existe
      const habit = await storage.getHabit(logData.habitId);
      if (!habit) {
        return res.status(404).json({ 
          status: 'error',
          message: "El hábito no existe" 
        });
      }
      
      // Verificar si ya existe un log para este hábito en esta fecha
      // Asegurarse de que completedDate sea string antes de convertirlo a Date
      const dateStr = typeof logData.completedDate === 'string' ? logData.completedDate : new Date().toISOString().split('T')[0];
      const completedDate = new Date(dateStr);
      
      console.log("Buscando log para habitId:", logData.habitId, "fecha:", dateStr);
      const existingLog = await storage.getHabitLogByDate(logData.habitId, completedDate);
      console.log("Log encontrado:", existingLog ? "Sí" : "No");
      
      if (existingLog) {
        // Si ya existe un log para esta fecha, lo eliminamos (descompletar)
        console.log("Descompletando hábito, eliminando log ID:", existingLog.id);
        await storage.deleteHabitLog(existingLog.id);
        return res.status(200).json({
          status: 'success',
          message: "Hábito descompletado correctamente",
          completed: false
        });
      }
      
      // Si no existe, creamos un nuevo log (completar)
      console.log("Completando hábito, creando nuevo log");
      const log = await storage.createHabitLog(logData);
      console.log("Log creado:", log);
      res.status(201).json({
        status: 'success',
        message: "Hábito completado correctamente",
        log,
        completed: true
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          status: 'error',
          message: validationError.message 
        });
      }
      console.error("Error al crear registro de hábito:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al crear registro de hábito" 
      });
    }
  });

  apiRouter.delete("/habit-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHabitLog(id);
      
      if (!success) {
        return res.status(404).json({ 
          status: 'error',
          message: "Registro de hábito no encontrado" 
        });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar registro de hábito:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error al eliminar registro de hábito" 
      });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
