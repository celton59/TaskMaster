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
    // Datos del usuario administrador (CREDENCIALES SIMPLES PARA TESTING)
    const username = 'admin';
    const password = 'admin123';
    const email = 'admin@example.com';
    const name = 'Administrador del Sistema';
    
    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);
    console.log('Password hash:', hashedPassword);
    
    // Eliminar usuario existente si existe
    await pool.query('DELETE FROM users WHERE username = $1', [username]);
    
    // Crear el usuario administrador con campos limpios y claros
    const result = await pool.query(
      'INSERT INTO users (username, password, email, name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, name',
      [username, hashedPassword, email, name]
    );
    
    console.log('Administrador creado:', result.rows[0]);
    console.log('\nPuedes iniciar sesión con:');
    console.log('Usuario:', username);
    console.log('Contraseña:', password);
    
    // Insertar datos de ejemplo en las categorías si la tabla está vacía
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    
    if (parseInt(categoryCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO categories (name, color, user_id) VALUES
        ('Trabajo', 'blue', $1),
        ('Personal', 'green', $1),
        ('Proyectos', 'purple', $1),
        ('Urgente', 'red', $1)
      `, [result.rows[0].id]);
      
      console.log('\nCategorías de ejemplo creadas');
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();