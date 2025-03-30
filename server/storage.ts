import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  categories, type Category, type InsertCategory,
  whatsappContacts, type WhatsappContact, type InsertWhatsappContact,
  whatsappMessages, type WhatsappMessage, type InsertWhatsappMessage,
  TaskStatus, MessageDirection, MessageStatus
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getTasksByCategory(categoryId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTaskStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    review: number;
    completed: number;
  }>;
  
  // WhatsApp contact methods
  getWhatsappContacts(): Promise<WhatsappContact[]>;
  getWhatsappContact(id: number): Promise<WhatsappContact | undefined>;
  getWhatsappContactByPhone(phoneNumber: string): Promise<WhatsappContact | undefined>;
  createWhatsappContact(contact: InsertWhatsappContact): Promise<WhatsappContact>;
  updateWhatsappContact(id: number, contact: Partial<InsertWhatsappContact>): Promise<WhatsappContact | undefined>;
  deleteWhatsappContact(id: number): Promise<boolean>;
  
  // WhatsApp message methods
  getWhatsappMessages(contactId?: number): Promise<WhatsappMessage[]>;
  getWhatsappMessage(id: number): Promise<WhatsappMessage | undefined>;
  createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage>;
  updateWhatsappMessageStatus(id: number, status: string): Promise<WhatsappMessage | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private categories: Map<number, Category>;
  private whatsappContacts: Map<number, WhatsappContact>;
  private whatsappMessages: Map<number, WhatsappMessage>;
  private userCurrentId: number;
  private taskCurrentId: number;
  private categoryCurrentId: number;
  private whatsappContactCurrentId: number;
  private whatsappMessageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.categories = new Map();
    this.whatsappContacts = new Map();
    this.whatsappMessages = new Map();
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.categoryCurrentId = 1;
    this.whatsappContactCurrentId = 1;
    this.whatsappMessageCurrentId = 1;
    
    // Adding default categories
    this.createCategory({ name: "Trabajo", color: "blue" });
    this.createCategory({ name: "Personal", color: "purple" });
    this.createCategory({ name: "Proyectos", color: "orange" });
    this.createCategory({ name: "Ideas", color: "green" });
    
    // Adding default user
    this.createUser({
      username: "admin",
      password: "admin",
      name: "Administrator",
      email: "admin@example.com",
      avatar: "",
    });
    
    // Adding sample tasks
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    this.createTask({
      title: "Completar informe trimestral",
      description: "Recopilar y analizar los datos del último trimestre para el informe ejecutivo.",
      status: TaskStatus.PENDING,
      priority: "high",
      categoryId: 1,
      deadline: nextWeek,
      assignedTo: 1,
    });
    
    this.createTask({
      title: "Preparar presentación de ventas",
      description: "Elaborar diapositivas para la reunión de ventas del próximo mes.",
      status: TaskStatus.IN_PROGRESS,
      priority: "medium",
      categoryId: 1,
      deadline: tomorrow,
      assignedTo: 1,
    });
    
    this.createTask({
      title: "Revisar correos electrónicos",
      description: "Responder a correos pendientes y organizar bandeja de entrada.",
      status: TaskStatus.COMPLETED,
      priority: "low",
      categoryId: 1,
      deadline: today,
      assignedTo: 1,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      name: insertUser.name || null,
      avatar: insertUser.avatar || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(
    id: number, 
    category: Partial<InsertCategory>
  ): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === status
    );
  }
  
  async getTasksByCategory(categoryId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.categoryId === categoryId
    );
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const now = new Date();
    const newTask: Task = { 
      ...task, 
      id,
      createdAt: now,
      status: task.status || TaskStatus.PENDING,
      description: task.description || null,
      priority: task.priority || null,
      categoryId: task.categoryId || null,
      deadline: task.deadline || null,
      assignedTo: task.assignedTo || null
    };
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async updateTask(
    id: number,
    task: Partial<InsertTask>
  ): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...task };
    this.tasks.set(id, updated);
    return updated;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  async getTaskStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    review: number;
    completed: number;
  }> {
    const tasks = Array.from(this.tasks.values());
    
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
      review: tasks.filter(task => task.status === TaskStatus.REVIEW).length,
      completed: tasks.filter(task => task.status === TaskStatus.COMPLETED).length
    };
  }
  
  // WhatsApp contact methods
  async getWhatsappContacts(): Promise<WhatsappContact[]> {
    return Array.from(this.whatsappContacts.values());
  }
  
  async getWhatsappContact(id: number): Promise<WhatsappContact | undefined> {
    return this.whatsappContacts.get(id);
  }
  
  async getWhatsappContactByPhone(phoneNumber: string): Promise<WhatsappContact | undefined> {
    return Array.from(this.whatsappContacts.values()).find(
      (contact) => contact.phoneNumber === phoneNumber
    );
  }
  
  async createWhatsappContact(contact: InsertWhatsappContact): Promise<WhatsappContact> {
    const id = this.whatsappContactCurrentId++;
    const now = new Date();
    const newContact: WhatsappContact = {
      ...contact,
      id,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: null,
      active: contact.active !== undefined ? contact.active : true,
      notes: contact.notes || null
    };
    this.whatsappContacts.set(id, newContact);
    return newContact;
  }
  
  async updateWhatsappContact(
    id: number,
    contact: Partial<InsertWhatsappContact>
  ): Promise<WhatsappContact | undefined> {
    const existing = this.whatsappContacts.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...contact,
      updatedAt: new Date()
    };
    this.whatsappContacts.set(id, updated);
    return updated;
  }
  
  async deleteWhatsappContact(id: number): Promise<boolean> {
    return this.whatsappContacts.delete(id);
  }
  
  // WhatsApp message methods
  async getWhatsappMessages(contactId?: number): Promise<WhatsappMessage[]> {
    const messages = Array.from(this.whatsappMessages.values());
    if (contactId) {
      return messages.filter(message => message.contactId === contactId);
    }
    return messages;
  }
  
  async getWhatsappMessage(id: number): Promise<WhatsappMessage | undefined> {
    return this.whatsappMessages.get(id);
  }
  
  async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const id = this.whatsappMessageCurrentId++;
    const now = new Date();
    const newMessage: WhatsappMessage = {
      ...message,
      id,
      sentAt: now,
      updatedAt: null,
      status: message.status || MessageStatus.SENT,
      metadata: message.metadata || null
    };
    this.whatsappMessages.set(id, newMessage);
    return newMessage;
  }
  
  async updateWhatsappMessageStatus(id: number, status: string): Promise<WhatsappMessage | undefined> {
    const existing = this.whatsappMessages.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      status,
      updatedAt: new Date()
    };
    this.whatsappMessages.set(id, updated);
    return updated;
  }
}

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';

// Implementación de almacenamiento PostgreSQL
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  
  constructor() {
    // Configurar la conexión a PostgreSQL usando variables de entorno
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql, { 
      schema: { 
        users, tasks, categories, 
        whatsappContacts, whatsappMessages 
      } 
    });
    console.log("Conexión a base de datos PostgreSQL establecida");
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }
  
  async getCategories(): Promise<Category[]> {
    return await this.db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(category).returning();
    return result[0];
  }
  
  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await this.db.update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const result = await this.db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }
  
  async getTasks(): Promise<Task[]> {
    return await this.db.select().from(tasks);
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const result = await this.db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }
  
  async getTasksByStatus(status: string): Promise<Task[]> {
    return await this.db.select().from(tasks).where(eq(tasks.status, status));
  }
  
  async getTasksByCategory(categoryId: number): Promise<Task[]> {
    return await this.db.select().from(tasks).where(eq(tasks.categoryId, categoryId));
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const result = await this.db.insert(tasks).values(task).returning();
    return result[0];
  }
  
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await this.db.update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }
  
  async deleteTask(id: number): Promise<boolean> {
    const result = await this.db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }
  
  async getTaskStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    review: number;
    completed: number;
  }> {
    const allTasks = await this.getTasks();
    const pending = allTasks.filter(t => t.status === TaskStatus.PENDING).length;
    const inProgress = allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const review = allTasks.filter(t => t.status === TaskStatus.REVIEW).length;
    const completed = allTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    
    return {
      total: allTasks.length,
      pending,
      inProgress,
      review,
      completed
    };
  }
  
  // WhatsApp contact methods
  async getWhatsappContacts(): Promise<WhatsappContact[]> {
    return await this.db.select().from(whatsappContacts);
  }
  
  async getWhatsappContact(id: number): Promise<WhatsappContact | undefined> {
    const result = await this.db.select().from(whatsappContacts).where(eq(whatsappContacts.id, id));
    return result[0];
  }
  
  async getWhatsappContactByPhone(phoneNumber: string): Promise<WhatsappContact | undefined> {
    const result = await this.db.select().from(whatsappContacts).where(eq(whatsappContacts.phoneNumber, phoneNumber));
    return result[0];
  }
  
  async createWhatsappContact(contact: InsertWhatsappContact): Promise<WhatsappContact> {
    const result = await this.db.insert(whatsappContacts).values(contact).returning();
    return result[0];
  }
  
  async updateWhatsappContact(id: number, contact: Partial<InsertWhatsappContact>): Promise<WhatsappContact | undefined> {
    const result = await this.db.update(whatsappContacts)
      .set(contact)
      .where(eq(whatsappContacts.id, id))
      .returning();
    return result[0];
  }
  
  async deleteWhatsappContact(id: number): Promise<boolean> {
    const result = await this.db.delete(whatsappContacts).where(eq(whatsappContacts.id, id)).returning();
    return result.length > 0;
  }
  
  // WhatsApp message methods
  async getWhatsappMessages(contactId?: number): Promise<WhatsappMessage[]> {
    if (contactId) {
      return await this.db.select().from(whatsappMessages).where(eq(whatsappMessages.contactId, contactId));
    }
    return await this.db.select().from(whatsappMessages);
  }
  
  async getWhatsappMessage(id: number): Promise<WhatsappMessage | undefined> {
    const result = await this.db.select().from(whatsappMessages).where(eq(whatsappMessages.id, id));
    return result[0];
  }
  
  async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const result = await this.db.insert(whatsappMessages).values(message).returning();
    return result[0];
  }
  
  async updateWhatsappMessageStatus(id: number, status: string): Promise<WhatsappMessage | undefined> {
    const result = await this.db.update(whatsappMessages)
      .set({ status, updatedAt: new Date() })
      .where(eq(whatsappMessages.id, id))
      .returning();
    return result[0];
  }
}

// Exportamos la implementación PostgreSQL como la instancia de almacenamiento predeterminada
export const storage = new PostgresStorage();
