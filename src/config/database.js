const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Función para parsear la URL de MySQL de Railway si existe
function createConnectionConfig() {
  // Si estamos en Railway (producción)
  if (process.env.MYSQL_URL) {
    // La URL tiene este formato: mysql://usuario:contraseña@host:puerto/nombrebd
    const url = new URL(process.env.MYSQL_URL);
    return {
      host: url.hostname,
      port: url.port,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1), // Eliminar el '/' inicial
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  } 
  // Si estamos en desarrollo local
  else {
    return {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  }
}

const pool = mysql.createPool(createConnectionConfig());

// Función de prueba de conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};