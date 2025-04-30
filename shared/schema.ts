import { pgTable, text, serial, integer, timestamp, boolean, json, date, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  avatar: text("avatar"),
  name: text("name"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

// Proyectos estilo Notion
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("blue"),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  status: text("status").notNull().default("active"), // active, completed, archived
  ownerId: integer("owner_id").references(() => users.id),
});

// Definimos las relaciones después de definir todas las tablas
// Las relaciones se crearán más abajo

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  priority: text("priority"),
  categoryId: integer("category_id"),
  projectId: integer("project_id").references(() => projects.id),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  assignedTo: integer("assigned_to"),
  order: integer("order").default(0), // para ordenar tareas dentro del proyecto
  startDate: timestamp("start_date"), // para la línea de tiempo
  completedAt: timestamp("completed_at"), // para calcular duración real
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  avatar: true,
});

export const insertCategorySchema = createInsertSchema(categories);

// Crear un esquema personalizado para validar fechas
const dateSchema = z.union([
  z.date(),
  z.string().transform((str) => {
    try {
      const date = new Date(str);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch (e) {
      return null;
    }
  }).nullable(),
  z.null()
]);

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    deadline: dateSchema.optional(),
    startDate: dateSchema.optional(),
    completedAt: dateSchema.optional(),
  });

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Status and priority enums
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  REVIEW: "review",
  COMPLETED: "completed",
} as const;

export const TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// Category colors
export const CategoryColors = {
  BLUE: "blue",
  PURPLE: "purple",
  ORANGE: "orange",
  GREEN: "green",
  RED: "red",
} as const;

// WhatsApp contactos
export const whatsappContacts = pgTable("whatsapp_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  active: boolean("active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  lastMessageAt: timestamp("last_message_at"),
});

// WhatsApp mensajes
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(), 
  contactId: integer("contact_id").notNull().references(() => whatsappContacts.id),
  messageContent: text("message_content").notNull(),
  direction: text("direction").notNull(), // "incoming" o "outgoing"
  status: text("status").notNull().default("sent"), // "sent", "delivered", "read", "failed"
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  metadata: json("metadata"),
});

// Insert schemas para WhatsApp
export const insertWhatsappContactSchema = createInsertSchema(whatsappContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
});

export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).omit({
  id: true,
  sentAt: true,
  updatedAt: true,
});

// Types para WhatsApp
export type InsertWhatsappContact = z.infer<typeof insertWhatsappContactSchema>;
export type WhatsappContact = typeof whatsappContacts.$inferSelect;

export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;

// Enums para WhatsApp
export const MessageDirection = {
  INCOMING: "incoming",
  OUTGOING: "outgoing",
} as const;

export const MessageStatus = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  FAILED: "failed",
} as const;

// Hábitos
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // "daily", "weekday", "weekend"
  iconName: text("icon_name"), // Nombre del icono para usar de Lucide
  color: text("color").notNull().default("blue"),
  isActive: boolean("is_active").notNull().default(true),
  startDate: date("start_date").notNull().defaultNow(),
  userId: integer("user_id"), // Para cuando se implementen usuarios
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Registros de hábitos completados
export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id),
  completedDate: date("completed_date").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas para Hábitos
export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({
  id: true,
  createdAt: true,
});

// Types para Hábitos
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;

// Enums para Hábitos
export const HabitFrequency = {
  DAILY: "daily",
  WEEKDAY: "weekday",
  WEEKEND: "weekend",
} as const;

export const HabitColors = {
  BLUE: "blue",
  PURPLE: "purple",
  PINK: "pink",
  GREEN: "green",
  YELLOW: "yellow",
  RED: "red",
  ORANGE: "orange",
  CYAN: "cyan",
} as const;

// Definición de estados de proyecto
export const ProjectStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

// Relaciones entre tablas (definidas después de todas las tablas)
export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));
