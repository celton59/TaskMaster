const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const { Client } = require('pg');

const scryptAsync = promisify(scrypt);

// Función para hashear contraseñas
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createTestUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL');

    // Hashear la contraseña 'test123'
    const hashedPassword = await hashPassword('test123');
    console.log('Contraseña hasheada:', hashedPassword);

    // Insertar el usuario de prueba
    const res = await client.query(
      'INSERT INTO users (username, password, email, name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, name',
      ['testuser', hashedPassword, 'test@example.com', 'Usuario de Prueba']
    );

    console.log('Usuario creado:', res.rows[0]);
  } catch (err) {
    console.error('Error al crear el usuario:', err);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

createTestUser();