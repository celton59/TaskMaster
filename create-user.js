const { Pool } = require('pg');
const crypto = require('crypto');

// Función para hashear contraseñas
async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    // Generar un salt aleatorio
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hashear la contraseña con el salt
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
}

async function main() {
  // Conexión a la base de datos
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Datos del usuario
    const username = 'prueba';
    const password = 'prueba123';
    const email = 'prueba@example.com';
    const name = 'Usuario de Prueba';
    
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