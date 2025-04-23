// Script para crear un usuario administrador
import pg from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const { Pool } = pg;

const scryptAsync = promisify(scrypt);

// Conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Función para hashear contraseñas
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

// Función principal
async function main() {
  try {
    console.log('Creando usuario administrador...');
    
    // Verificar si ya existe un usuario admin
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['admin']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('El usuario admin ya existe. Actualizando contraseña...');
      
      // Hashear la nueva contraseña
      const hashedPassword = await hashPassword('admin123');
      
      // Actualizar la contraseña
      await pool.query(
        'UPDATE users SET password = $1 WHERE username = $2',
        [hashedPassword, 'admin']
      );
      
      console.log('Contraseña actualizada con éxito.');
    } else {
      console.log('Creando nuevo usuario admin...');
      
      // Hashear la contraseña
      const hashedPassword = await hashPassword('admin123');
      
      // Insertar el usuario
      await pool.query(
        'INSERT INTO users (username, password, email, name) VALUES ($1, $2, $3, $4)',
        ['admin', hashedPassword, 'admin@example.com', 'Administrador']
      );
      
      console.log('Usuario admin creado con éxito.');
    }
    
    console.log('Datos de acceso:');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');
    
  } catch (error) {
    console.error('Error al crear/actualizar usuario admin:', error);
  } finally {
    // Cerrar la conexión
    await pool.end();
  }
}

// Ejecutar la función principal
main();