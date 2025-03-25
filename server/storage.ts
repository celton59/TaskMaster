import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  categories, type Category, type InsertCategory,
  TaskStatus 
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private categories: Map<number, Category>;
  private userCurrentId: number;
  private taskCurrentId: number;
  private categoryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.categories = new Map();
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.categoryCurrentId = 1;
    
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
    const user: User = { ...insertUser, id };
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
      createdAt: now 
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
}

export const storage = new MemStorage();
