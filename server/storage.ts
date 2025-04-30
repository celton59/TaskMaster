import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  categories, type Category, type InsertCategory,
  projects, type Project, type InsertProject,
  whatsappContacts, type WhatsappContact, type InsertWhatsappContact,
  whatsappMessages, type WhatsappMessage, type InsertWhatsappMessage,
  habits, type Habit, type InsertHabit,
  habitLogs, type HabitLog, type InsertHabitLog,
  TaskStatus, MessageDirection, MessageStatus, HabitFrequency, ProjectStatus
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
  
  // Project methods
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getProjectWithTasks(id: number): Promise<{ project: Project; tasks: Task[] }>;
  getProjectProgress(id: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    percentage: number;
  }>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getTasksByCategory(categoryId: number): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
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
  
  // Habit methods
  getHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  getHabitsByFrequency(frequency: string): Promise<Habit[]>; 
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Habit log methods
  getHabitLogs(habitId?: number): Promise<HabitLog[]>;
  getHabitLogsByDateRange(startDate: Date, endDate: Date): Promise<HabitLog[]>;
  getHabitLogByDate(habitId: number, date: Date): Promise<HabitLog | undefined>;
  createHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  deleteHabitLog(id: number): Promise<boolean>;
  getHabitStats(habitId?: number): Promise<{
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    streakData: Record<number, number>; // habitId -> streak count
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private categories: Map<number, Category>;
  private projects: Map<number, Project>;
  private whatsappContacts: Map<number, WhatsappContact>;
  private whatsappMessages: Map<number, WhatsappMessage>;
  private habits: Map<number, Habit>;
  private habitLogs: Map<number, HabitLog>;
  private userCurrentId: number;
  private taskCurrentId: number;
  private categoryCurrentId: number;
  private projectCurrentId: number;
  private whatsappContactCurrentId: number;
  private whatsappMessageCurrentId: number;
  private habitCurrentId: number;
  private habitLogCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.categories = new Map();
    this.projects = new Map();
    this.whatsappContacts = new Map();
    this.whatsappMessages = new Map();
    this.habits = new Map();
    this.habitLogs = new Map();
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.categoryCurrentId = 1;
    this.projectCurrentId = 1;
    this.whatsappContactCurrentId = 1;
    this.whatsappMessageCurrentId = 1;
    this.habitCurrentId = 1;
    this.habitLogCurrentId = 1;
    
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
      title: task.title,
      status: task.status || TaskStatus.PENDING,
      description: task.description || null,
      priority: task.priority || null,
      categoryId: task.categoryId || null,
      projectId: task.projectId || null,
      deadline: task.deadline || null,
      assignedTo: task.assignedTo || null,
      order: task.order || 0,
      startDate: task.startDate || null,
      completedAt: task.completedAt || null
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
  
  // Projects methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectCurrentId++;
    const now = new Date();
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
      status: project.status || ProjectStatus.ACTIVE,
      color: project.color || 'blue',
      description: project.description || null,
      startDate: project.startDate || null,
      dueDate: project.dueDate || null,
      ownerId: project.ownerId || null
    };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...project,
      updatedAt: new Date()
    };
    this.projects.set(id, updated);
    return updated;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId
    );
  }
  
  async getProjectWithTasks(id: number): Promise<{ project: Project; tasks: Task[] }> {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    const tasks = await this.getTasksByProject(id);
    
    return {
      project,
      tasks
    };
  }
  
  async getProjectProgress(id: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    percentage: number;
  }> {
    const tasks = await this.getTasksByProject(id);
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      percentage
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

  // Habit methods
  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }
  
  async getHabitsByFrequency(frequency: string): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(
      (habit) => habit.frequency === frequency
    );
  }
  
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const id = this.habitCurrentId++;
    const now = new Date();
    const newHabit: Habit = { 
      ...habit, 
      id,
      color: habit.color || 'blue', // Asegurar que color siempre tenga un valor
      createdAt: now,
      updatedAt: null,
      startDate: habit.startDate || now.toISOString().split('T')[0], // Asegurar que startDate siempre tenga un valor
      description: habit.description || null,
      iconName: habit.iconName || null,
      userId: habit.userId || null,
      isActive: habit.isActive !== undefined ? habit.isActive : true
    };
    this.habits.set(id, newHabit);
    return newHabit;
  }
  
  async updateHabit(
    id: number,
    habit: Partial<InsertHabit>
  ): Promise<Habit | undefined> {
    const existing = this.habits.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...habit,
      updatedAt: new Date() 
    };
    this.habits.set(id, updated);
    return updated;
  }
  
  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }
  
  // Habit log methods
  async getHabitLogs(habitId?: number): Promise<HabitLog[]> {
    const logs = Array.from(this.habitLogs.values());
    if (habitId) {
      return logs.filter(log => log.habitId === habitId);
    }
    return logs;
  }
  
  async getHabitLogsByDateRange(startDate: Date, endDate: Date): Promise<HabitLog[]> {
    return Array.from(this.habitLogs.values()).filter(
      (log) => {
        const logDate = new Date(log.completedDate);
        return logDate >= startDate && logDate <= endDate;
      }
    );
  }
  
  async getHabitLogByDate(habitId: number, date: Date): Promise<HabitLog | undefined> {
    const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    return Array.from(this.habitLogs.values()).find(
      (log) => {
        return log.habitId === habitId && 
               log.completedDate === dateStr;
      }
    );
  }
  
  async createHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    const id = this.habitLogCurrentId++;
    const now = new Date();
    const completedDate = log.completedDate || now.toISOString().split('T')[0]; // Asegurar que completedDate siempre tenga un valor
    const newLog: HabitLog = {
      ...log,
      id,
      completedDate, // Asignar siempre un valor válido
      createdAt: now,
      notes: log.notes || null
    };
    this.habitLogs.set(id, newLog);
    return newLog;
  }
  
  async deleteHabitLog(id: number): Promise<boolean> {
    return this.habitLogs.delete(id);
  }
  
  async getHabitStats(habitId?: number): Promise<{
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    streakData: Record<number, number>;
  }> {
    const habits = Array.from(this.habits.values());
    const logs = Array.from(this.habitLogs.values());
    
    // Filtrar por habitId si se proporciona
    const filteredHabits = habitId ? habits.filter(h => h.id === habitId) : habits;
    
    // Obtener logs de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayLogs = logs.filter(log => {
      const logDate = new Date(log.completedDate);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && 
        (habitId ? log.habitId === habitId : true);
    });
    
    // Calcular racha para cada hábito
    const streakData: Record<number, number> = {};
    
    filteredHabits.forEach(habit => {
      // Obtener todos los logs para este hábito
      const habitLogs = logs.filter(log => log.habitId === habit.id);
      
      // Ordenar logs por fecha
      habitLogs.sort((a, b) => 
        new Date(a.completedDate).getTime() - new Date(b.completedDate).getTime()
      );
      
      // Calcular racha
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // Retroceder día a día y verificar si existe un log
      while (true) {
        const dateToCheck = new Date(currentDate);
        dateToCheck.setHours(0, 0, 0, 0);
        
        const hasLogForDate = habitLogs.some(log => {
          const logDate = new Date(log.completedDate);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === dateToCheck.getTime();
        });
        
        if (hasLogForDate) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      streakData[habit.id] = streak;
    });
    
    return {
      totalHabits: filteredHabits.length,
      activeHabits: filteredHabits.filter(h => h.isActive).length,
      completedToday: todayLogs.length,
      streakData
    };
  }
}

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, gte, lte, and } from 'drizzle-orm';

// Implementación de almacenamiento PostgreSQL
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  
  constructor() {
    // Configurar la conexión a PostgreSQL usando variables de entorno
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql, { 
      schema: { 
        users, tasks, categories, projects,
        whatsappContacts, whatsappMessages,
        habits, habitLogs
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
    // La base de datos usa camelCase igual que en TypeScript, así que podríamos usar
    // el ORM directamente, pero para ser consistentes con los otros métodos, 
    // seguimos usando SQL crudo
    const result = await this.db.execute(`SELECT * FROM tasks`);
    return result.rows as Task[];
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const result = await this.db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }
  
  async getTasksByStatus(status: string): Promise<Task[]> {
    return await this.db.select().from(tasks).where(eq(tasks.status, status));
  }
  
  async getTasksByCategory(categoryId: number): Promise<Task[]> {
    // Ahora sabemos que la base de datos usa camelCase igual que en TypeScript
    // Usamos SQL crudo con el nombre correcto de la columna
    const result = await this.db.execute(
      `SELECT * FROM tasks WHERE "categoryId" = $1`,
      [categoryId]
    );
    return result.rows as Task[];
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    try {
      console.log("Creando tarea con datos:", task);
      
      // Vamos a hacer una inserción manual con SQL crudo para controlar exactamente las columnas
      const result = await this.db.execute(
        `INSERT INTO tasks (
          title, description, status, priority, "categoryId", 
          deadline, "assignedTo", "createdAt"
        ) VALUES (
          $1, $2, $3, $4, $5, 
          $6, $7, $8
        ) RETURNING *`,
        [
          task.title,
          task.description,
          task.status || 'pending',
          task.priority,
          task.categoryId || null,
          task.deadline,
          task.assignedTo || null,
          new Date() // createdAt
        ]
      );
      
      console.log("Tarea creada con éxito:", result.rows[0]);
      return result.rows[0] as Task;
    } catch (error) {
      console.error("Error al crear tarea:", error);
      throw error;
    }
  }
  
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await this.db.update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }
  
  async deleteTask(id: number): Promise<boolean> {
    try {
      // Aseguramos que el id es un número
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      
      // Realizamos la eliminación y devolvemos el resultado
      const result = await this.db.delete(tasks).where(eq(tasks.id, numericId)).returning();
      console.log(`Tarea eliminada (ID: ${id}):`, result);
      return result.length > 0;
    } catch (error) {
      console.error(`Error al eliminar tarea (ID: ${id}):`, error);
      return false;
    }
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
  
  // Project methods
  async getProjects(): Promise<Project[]> {
    return await this.db.select().from(projects);
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const result = await this.db.insert(projects).values({
      ...project,
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await this.db.update(projects)
      .set({
        ...project,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }
  
  async deleteProject(id: number): Promise<boolean> {
    const result = await this.db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }
  
  async getProjectWithTasks(id: number): Promise<{ project: Project; tasks: Task[] }> {
    const project = await this.getProject(id);
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    const projectTasks = await this.getTasksByProject(id);
    
    return {
      project,
      tasks: projectTasks
    };
  }
  
  async getProjectProgress(id: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    percentage: number;
  }> {
    const projectTasks = await this.getTasksByProject(id);
    
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      percentage
    };
  }
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    // Como la columna projectId no existe en la tabla, devolvemos un array vacío
    console.log(`getTasksByProject: la columna 'projectId' no existe en la tabla tasks`);
    return [];
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

  // Habit methods
  async getHabits(): Promise<Habit[]> {
    return await this.db.select().from(habits);
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    const result = await this.db.select().from(habits).where(eq(habits.id, id));
    return result[0];
  }
  
  async getHabitsByFrequency(frequency: string): Promise<Habit[]> {
    return await this.db.select().from(habits).where(eq(habits.frequency, frequency));
  }
  
  async createHabit(habit: InsertHabit): Promise<Habit> {
    // Asegurar valores predeterminados
    const habitToCreate = {
      ...habit,
      color: habit.color || 'blue',
      startDate: habit.startDate || new Date().toISOString().split('T')[0]
    };
    const result = await this.db.insert(habits).values(habitToCreate).returning();
    return result[0];
  }
  
  async updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const result = await this.db.update(habits)
      .set({
        ...habit,
        updatedAt: new Date()
      })
      .where(eq(habits.id, id))
      .returning();
    return result[0];
  }
  
  async deleteHabit(id: number): Promise<boolean> {
    const result = await this.db.delete(habits).where(eq(habits.id, id)).returning();
    return result.length > 0;
  }
  
  // Habit log methods
  async getHabitLogs(habitId?: number): Promise<HabitLog[]> {
    if (habitId) {
      return await this.db.select().from(habitLogs).where(eq(habitLogs.habitId, habitId));
    }
    return await this.db.select().from(habitLogs);
  }
  
  async getHabitLogsByDateRange(startDate: Date, endDate: Date): Promise<HabitLog[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return await this.db.select()
      .from(habitLogs)
      .where(
        and(
          gte(habitLogs.completedDate, startDateStr),
          lte(habitLogs.completedDate, endDateStr)
        )
      );
  }

  async getHabitLogByDate(habitId: number, date: Date): Promise<HabitLog | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    
    const result = await this.db.select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habitId),
          eq(habitLogs.completedDate, dateStr)
        )
      );
    
    return result[0];
  }
  
  async createHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    // Asegurar valores predeterminados
    const logToCreate = {
      ...log,
      completedDate: log.completedDate || new Date().toISOString().split('T')[0]
    };
    const result = await this.db.insert(habitLogs).values(logToCreate).returning();
    return result[0];
  }
  
  async deleteHabitLog(id: number): Promise<boolean> {
    const result = await this.db.delete(habitLogs).where(eq(habitLogs.id, id)).returning();
    return result.length > 0;
  }
  
  async getHabitStats(habitId?: number): Promise<{
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    streakData: Record<number, number>;
  }> {
    // Obtener hábitos
    let habitsToProcess = await this.getHabits();
    if (habitId) {
      habitsToProcess = habitsToProcess.filter(h => h.id === habitId);
    }
    
    // Obtener todos los logs
    const allLogs = await this.getHabitLogs();
    
    // Filtrar logs de hoy
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = allLogs.filter(log => 
      log.completedDate === today && 
      (habitId ? log.habitId === habitId : true)
    );
    
    // Calcular racha para cada hábito
    const streakData: Record<number, number> = {};
    
    for (const habit of habitsToProcess) {
      // Obtener logs para este hábito
      const habitLogs = allLogs.filter(log => log.habitId === habit.id);
      
      // Ordenar logs por fecha
      habitLogs.sort((a, b) => 
        new Date(a.completedDate).getTime() - new Date(b.completedDate).getTime()
      );
      
      // Calcular racha
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // Retroceder día a día y verificar si existe un log
      while (true) {
        const dateToCheck = currentDate.toISOString().split('T')[0];
        
        const hasLogForDate = habitLogs.some(log => 
          log.completedDate === dateToCheck
        );
        
        if (hasLogForDate) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      streakData[habit.id] = streak;
    }
    
    return {
      totalHabits: habitsToProcess.length,
      activeHabits: habitsToProcess.filter(h => h.isActive).length,
      completedToday: todayLogs.length,
      streakData
    };
  }
}

// Exportamos la implementación PostgreSQL como la instancia de almacenamiento predeterminada
export const storage = new PostgresStorage();
