// add-avatar-migration.js - Script para añadir el campo avatar a la tabla auth_user
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createConnectionConfig() {
  // Si estamos en Railway (producción)
  if (process.env.MYSQL_URL) {
    try {
      const url = new URL(process.env.MYSQL_URL);
      return {
        host: url.hostname,
        port: url.port,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1), // Eliminar el '/' inicial
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0
      };
    } catch (error) {
      console.error('Error al parsear MYSQL_URL:', error.message);
      process.exit(1);
    }
  }
  // Si estamos en desarrollo local
  else {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'educcorp_educs',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    };
  }
}

async function addAvatarField() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    const config = createConnectionConfig();
    connection = await mysql.createConnection(config);
    
    // Primero comprobamos si la columna ya existe
    console.log('Verificando si el campo avatar ya existe en la tabla auth_user...');
    const [columns] = await connection.query('SHOW COLUMNS FROM auth_user LIKE "avatar"');
    
    if (columns.length === 0) {
      // La columna no existe, la añadimos
      console.log('El campo avatar no existe. Añadiéndolo a la tabla...');
      await connection.query(`
        ALTER TABLE auth_user
        ADD COLUMN avatar VARCHAR(1000) DEFAULT '/assets/images/logoBN.png'
      `);
      console.log('Campo avatar añadido correctamente a la tabla auth_user.');
    } else {
      console.log('El campo avatar ya existe en la tabla auth_user. No se requieren cambios.');
    }
    
    console.log('Migración completada con éxito.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    if (connection) {
      console.log('Cerrando conexión a la base de datos...');
      await connection.end();
    }
    process.exit(0);
  }
}

// Ejecutar la migración
addAvatarField(); 