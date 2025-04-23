import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Función para hashear contraseñas
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Función para comparar contraseñas
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Configuración de la autenticación
export function setupAuth(app: Express) {
  // Configurar el almacenamiento de sesiones en PostgreSQL
  const PostgresStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    store: new PostgresStore({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || "a1gu3nc0n7r4s3ña53cr3t4",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana
    }
  };

  // Configurar sesiones y passport
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configurar estrategia local (usuario y contraseña)
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }
        
        const isValid = await comparePasswords(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Serialización/deserialización de usuario para sesiones
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Rutas de autenticación
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, name } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Nombre de usuario y contraseña son requeridos" });
      }
      
      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
      }
      
      // Crear el usuario con contraseña hasheada
      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: email || null,
        name: name || null,
        avatar: null,
      });
      
      // Iniciar sesión automáticamente después del registro
      req.login(user, (err) => {
        if (err) return next(err);
        // No devolvemos la contraseña al cliente
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenciales inválidas" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // No devolvemos la contraseña al cliente
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Sesión cerrada correctamente" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    // No devolvemos la contraseña al cliente
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  // Middleware para proteger rutas
  app.use("/api/*", (req, res, next) => {
    // Rutas públicas que no requieren autenticación
    const publicRoutes = [
      "/api/login",
      "/api/register",
      "/api/logout",
      "/api/user",
      "/api/whatsapp/webhook" // Webhook de Twilio no requiere autenticación
    ];
    
    // Si es una ruta pública o el usuario está autenticado, permitir acceso
    if (publicRoutes.includes(req.path) || req.isAuthenticated()) {
      return next();
    }
    
    // De lo contrario, denegar acceso
    res.status(401).json({ message: "No autorizado. Iniciar sesión para acceder." });
  });
}

// Función de ayuda para proteger rutas individuales
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "No autorizado" });
}