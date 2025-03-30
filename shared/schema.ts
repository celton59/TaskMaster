import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  priority: text("priority"),
  categoryId: integer("categoryId"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  assignedTo: integer("assignedTo"),
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

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

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
