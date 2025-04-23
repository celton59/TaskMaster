import { pool } from './server/db';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Función para hashear contraseñas
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  try {
    // Datos del usuario
    const username = 'test';
    const password = 'test123';
    const email = 'test@example.com';
    const name = 'Test User';
    
    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);
    console.log('Password hash:', hashedPassword);
    
    // Eliminar usuario existente si existe
    await pool.query('DELETE FROM users WHERE username = $1', [username]);
    
    // Crear el usuario
    const result = await pool.query(
      'INSERT INTO users (username, password, email, name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, name',
      [username, hashedPassword, email, name]
    );
    
    console.log('Usuario creado:', result.rows[0]);
    console.log('\nPuedes iniciar sesión con:');
    console.log('Usuario:', username);
    console.log('Contraseña:', password);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();