import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { users, categories, tasks, projects, TaskStatus, ProjectStatus } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script para inicializar la base de datos
 * - Crea las tablas si no existen
 * - Inserta datos de ejemplo si las tablas están vacías
 */
async function main() {
  console.log("Iniciando configuración de la base de datos...");
  
  // Configurar la conexión
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  try {
    console.log("Verificando si las tablas existen...");
    
    // Intentar seleccionar registros para ver si las tablas existen
    try {
      await db.select().from(users).limit(1);
      await db.select().from(categories).limit(1);
      await db.select().from(tasks).limit(1);
      await db.select().from(projects).limit(1);
      console.log("Las tablas ya existen en la base de datos");
    } catch (error) {
      console.log("Las tablas no existen. Creando tablas...");
      
      // Crear las tablas usando los esquemas de drizzle una por una
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          name TEXT,
          avatar TEXT
        );
      `);
      
      await db.execute(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          color TEXT NOT NULL
        );
      `);
      
      await db.execute(`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT NOT NULL DEFAULT 'blue',
          start_date TIMESTAMP,
          due_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'active',
          owner_id INTEGER REFERENCES users(id)
        );
      `);
      
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          priority TEXT,
          category_id INTEGER REFERENCES categories(id),
          project_id INTEGER REFERENCES projects(id),
          deadline TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          assigned_to INTEGER REFERENCES users(id),
          "order" INTEGER DEFAULT 0,
          start_date TIMESTAMP,
          completed_at TIMESTAMP
        );
      `);
      
      console.log("Tablas creadas exitosamente");
    }
    
    // Verificar si hay datos en las tablas
    const categoriesCount = await db.select({ count: count() }).from(categories);
    if (categoriesCount[0].count === 0) {
      console.log("Insertando categorías por defecto...");
      await db.insert(categories).values([
        { name: "Trabajo", color: "blue" },
        { name: "Personal", color: "purple" },
        { name: "Proyectos", color: "orange" },
        { name: "Ideas", color: "green" }
      ]);
    }
    
    const usersCount = await db.select({ count: count() }).from(users);
    if (usersCount[0].count === 0) {
      console.log("Insertando usuario por defecto...");
      await db.insert(users).values({
        username: "admin",
        password: "admin",
        name: "Administrator",
        email: "admin@example.com",
        avatar: ""
      });
    }
    
    const projectsCount = await db.select({ count: count() }).from(projects);
    if (projectsCount[0].count === 0) {
      console.log("Insertando proyectos de ejemplo...");
      
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextQuarter = new Date(today);
      nextQuarter.setMonth(nextQuarter.getMonth() + 3);
      
      await db.insert(projects).values([
        {
          name: "Lanzamiento del nuevo sitio web",
          description: "Diseño y desarrollo del nuevo sitio web corporativo",
          color: "blue",
          start_date: today,
          due_date: nextMonth,
          status: ProjectStatus.ACTIVE,
          owner_id: 1,
          created_at: today
        },
        {
          name: "Campaña de marketing Q2",
          description: "Planificación y ejecución de la campaña de marketing para el segundo trimestre",
          color: "purple",
          start_date: today,
          due_date: nextQuarter,
          status: ProjectStatus.ACTIVE,
          owner_id: 1,
          created_at: today
        }
      ]);
    }
      
    const tasksCount = await db.select({ count: count() }).from(tasks);
    if (tasksCount[0].count === 0) {
      console.log("Insertando tareas de ejemplo...");
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      await db.insert(tasks).values([
        {
          title: "Completar informe trimestral",
          description: "Recopilar y analizar los datos del último trimestre para el informe ejecutivo.",
          status: TaskStatus.PENDING,
          priority: "alta",
          category_id: 1,
          deadline: nextWeek,
          assigned_to: 1,
          order: 0,
          start_date: today,
          completed_at: null,
          created_at: today
        },
        {
          title: "Preparar presentación de ventas",
          description: "Elaborar diapositivas para la reunión de ventas del próximo mes.",
          status: TaskStatus.IN_PROGRESS,
          priority: "media",
          category_id: 1,
          deadline: tomorrow,
          assigned_to: 1,
          order: 1,
          start_date: today,
          completed_at: null,
          created_at: today
        },
        {
          title: "Revisar correos electrónicos",
          description: "Responder a correos pendientes y organizar bandeja de entrada.",
          status: TaskStatus.COMPLETED,
          priority: "baja",
          category_id: 1,
          deadline: today,
          assigned_to: 1,
          order: 2,
          start_date: today,
          completed_at: today,
          created_at: today
        }
      ]);
    }
    
    console.log("La base de datos se ha inicializado correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
}

// Importar la función count para los conteos
import { count } from 'drizzle-orm';

// Ejecutar la función principal
main()
  .catch(err => {
    console.error("Error en el script principal:", err);
    process.exit(1);
  })
  .finally(() => {
    console.log("Script finalizado");
    process.exit(0);
  });