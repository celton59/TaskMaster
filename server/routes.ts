import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertCategorySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { createTaskFromText, processAgentMessage } from "./openai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Task routes
  apiRouter.get("/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
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
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  
  apiRouter.post("/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  apiRouter.patch("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  apiRouter.delete("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
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
  
  // ChatGPT Agent API - Process message with agent approach
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
  
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}

// Required for middleware import
import express from "express";
